import { LLM_API_KEY, LLM_BASE_URL, LLM_MODEL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { messages, model, temperature, customAttributes, systemPrompt } = await request.json();

		if (!messages || !Array.isArray(messages)) {
			throw error(400, 'Invalid messages format');
		}

		const apiKey = LLM_API_KEY || '';
		const baseUrl = LLM_BASE_URL || 'https://api.openai.com/v1';
		const llmModel = model || LLM_MODEL || '';

		// Prepend system prompt if provided
		const finalMessages = systemPrompt
			? [{ role: 'system', content: systemPrompt }, ...messages]
			: messages;

		// Convert numeric string parameters to numbers
		const numericParams = [
			'temperature',
			'max_tokens',
			'top_p',
			'top_k',
			'min_p',
			'frequency_penalty',
			'presence_penalty',
			'repeat_penalty',
			'seed',
			'stream_delta_chunk_size',
			'mirostat_tau',
			'repeat_last_n',
			'tfs_z'
		];

		const booleanParams = ['use_mmap', 'use_mlock', 'stream_chat_response'];

		const processedAttributes: Record<string, any> = {};
		if (customAttributes) {
			Object.entries(customAttributes).forEach(([key, value]) => {
				if (numericParams.includes(key)) {
					const num = parseFloat(value as string);
					if (!isNaN(num)) {
						processedAttributes[key] = num;
					}
				} else if (booleanParams.includes(key)) {
					// Convert string boolean values to actual booleans
					if (value === 'true' || value === '1') {
						processedAttributes[key] = true;
					} else if (value === 'false' || value === '0') {
						processedAttributes[key] = false;
					} else {
						processedAttributes[key] = value;
					}
				} else {
					processedAttributes[key] = value;
				}
			});
		}

		// Merge custom attributes into the body
		const body = {
			model: llmModel,
			messages: finalMessages,
			stream: true,
			temperature: temperature ?? 0.7,
			...processedAttributes
		};

		// Log the request body for debugging (remove in production)
		console.log('LLM Request Body:', JSON.stringify(body, null, 2));

		const response = await fetch(`${baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('LLM API Error:', errorData);
			throw error(response.status, `LLM API error: ${response.statusText}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw error(500, 'No response body');
		}

		const stream = new ReadableStream({
			async start(controller) {
				const decoder = new TextDecoder();
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						const chunk = decoder.decode(value);
						const lines = chunk.split('\n').filter((line) => line.trim() !== '');

						for (const line of lines) {
							if (line.startsWith('data: ')) {
								const data = line.slice(6);
								if (data === '[DONE]') {
									controller.close();
									return;
								}

								try {
									const parsed = JSON.parse(data);
									const delta = parsed.choices?.[0]?.delta;
									
									// Handle regular content
									const content = delta?.content;
									if (content) {
										controller.enqueue(
											new TextEncoder().encode(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`)
										);
									}
									
									// Handle reasoning/thinking content (for models like o1, deepseek-reasoner, etc.)
									const reasoning = delta?.reasoning_content;
									if (reasoning) {
										controller.enqueue(
											new TextEncoder().encode(`data: ${JSON.stringify({ type: 'thinking', data: reasoning })}\n\n`)
										);
									}
								} catch (e) {
									console.error('Error parsing SSE data:', e);
								}
							}
						}
					}
				} catch (err) {
					controller.error(err);
				} finally {
					reader.releaseLock();
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (err) {
		console.error('Chat API error:', err);
		throw error(500, 'Internal server error');
	}
};
