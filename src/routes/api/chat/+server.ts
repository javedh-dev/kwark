import { LLM_API_KEY, LLM_BASE_URL, LLM_MODEL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { messages, model } = await request.json();

		if (!messages || !Array.isArray(messages)) {
			throw error(400, 'Invalid messages format');
		}

		const apiKey = LLM_API_KEY || '';
		const baseUrl = LLM_BASE_URL || 'https://api.openai.com/v1';
		const llmModel = model || LLM_MODEL || 'gpt-oss-20b';

		const response = await fetch(`${baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: llmModel,
				messages,
				stream: true
			})
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
									const content = parsed.choices?.[0]?.delta?.content;
									if (content) {
										// Use JSON.stringify to preserve newlines and special characters
										controller.enqueue(
											new TextEncoder().encode(`data: ${JSON.stringify(content)}\n\n`)
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
