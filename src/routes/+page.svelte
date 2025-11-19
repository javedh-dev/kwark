<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { ArrowUp, Paperclip, Wrench } from '@lucide/svelte';
	import { Diamonds } from 'svelte-loading-spinners';
	import { marked } from 'marked';
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import python from 'highlight.js/lib/languages/python';
	import bash from 'highlight.js/lib/languages/bash';
	import json from 'highlight.js/lib/languages/json';
	import css from 'highlight.js/lib/languages/css';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import 'highlight.js/styles/github-dark.css';

	// Register languages
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('html', xml);
	hljs.registerLanguage('xml', xml);

	interface Message {
		id: number;
		role: 'user' | 'assistant';
		content: string;
	}

	// Configure marked for better rendering
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	// Custom renderer for code blocks with syntax highlighting
	const renderer = new marked.Renderer();
	renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				const highlighted = hljs.highlight(text, { language: lang }).value;
				return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
			} catch (err) {
				console.error('Highlight error:', err);
			}
		}
		const highlighted = hljs.highlightAuto(text).value;
		return `<pre><code class="hljs">${highlighted}</code></pre>`;
	};

	marked.use({ renderer });

	let messages = $state<Message[]>([]);
	let input = $state('');
	let isLoading = $state(false);

	async function sendMessage() {
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		input = '';

		messages = [...messages, { id: messages.length + 1, role: 'user', content: userMessage }];
		isLoading = true;

		const assistantMessageId = messages.length + 1;
		messages = [...messages, { id: assistantMessageId, role: 'assistant', content: '' }];

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages: messages
						.filter((m) => m.id !== assistantMessageId)
						.map((m) => ({ role: m.role, content: m.content }))
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('No response body');
			}

			let accumulatedContent = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const content = JSON.parse(line.slice(6));
							accumulatedContent += content;

							messages = messages.map((m) =>
								m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
							);
						} catch (e) {
							// Skip invalid JSON
							console.error('Error parsing streamed content:', e);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error sending message:', error);
			messages = messages.map((m) =>
				m.id === assistantMessageId
					? { ...m, content: 'Sorry, there was an error processing your request.' }
					: m
			);
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="flex h-screen flex-col bg-white dark:bg-gray-900">
	<!-- Header -->
	<header
		class="flex flex-row items-center gap-2 border-0 border-gray-200 px-4 py-3 dark:border-gray-800"
	>
		<img src="nanochat.svg" alt="" class="h-6 w-6" />
		<h1 class="text-start text-xl font-medium text-gray-900 dark:text-gray-100">NanoChat</h1>
	</header>

	<!-- Messages Area -->
	<ScrollArea class="flex-1">
		<div class="mx-auto max-w-3xl">
			{#if messages.length === 0}
				<div class="flex h-full items-center justify-center px-4 py-20">
					<div class="text-center">
						<h2 class="mb-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
							How can I help you today?
						</h2>
					</div>
				</div>
			{:else}
				<div class="space-y-4 px-4 py-6">
					{#each messages as message (message.id)}
						<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
							<div
								class="max-w-[85%] rounded-2xl {message.role === 'user'
									? 'bg-secondary px-4 py-2'
									: 'px-1 py-2'}"
							>
								{#if message.role === 'user'}
									<p class="prose leading-7 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
										{message.content}
									</p>
								{:else}
									<div
										class="prose prose-md max-w-none dark:prose-invert
										prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
										prose-p:leading-7 prose-p:text-gray-800 dark:prose-p:text-gray-200
										prose-a:text-blue-600 prose-a:no-underline
										hover:prose-a:underline dark:prose-a:text-blue-400
										prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-700 dark:prose-blockquote:border-l-gray-600 dark:prose-blockquote:text-gray-300
										prose-strong:font-semibold prose-strong:text-gray-900
										dark:prose-strong:text-gray-100 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5
										prose-code:py-0.5 prose-code:font-medium prose-code:text-pink-600
										prose-code:before:content-[''] prose-code:after:content-['']
										dark:prose-code:bg-gray-800 dark:prose-code:text-pink-400
										prose-table:ms-2"
									>
										{@html marked(message.content)}
									</div>
								{/if}
							</div>
						</div>
					{/each}
					{#if isLoading}
						<div class="group relative -mx-4 flex gap-4 px-4 py-6 dark:bg-gray-800/50">
							<div class="flex shrink-0 items-center justify-center gap-2 rounded-full">
								<span class="rounded-full bg-gray-200 p-2 text-sm font-medium dark:bg-gray-800"
									>AI</span
								>
								<Diamonds size="30" unit="px" duration="3s" color="black" />
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</ScrollArea>

	<!-- Input Area -->
	<div class="border-0 border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mx-auto max-w-3xl">
			<form onsubmit={sendMessage}>
				<div
					class="flex w-full flex-col rounded-3xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
				>
					<Textarea
						bind:value={input}
						onkeydown={handleKeydown}
						placeholder="Message ChatGPT..."
						class="resize-none border-none px-6 pt-4 pb-0 shadow-none focus-visible:ring-0"
						disabled={isLoading}
					/>
					<div class="flex items-center justify-between px-4 pb-4">
						<div>
							<Button type="button" size="sm" variant="outline" class="rounded-4xl" disabled>
								<Paperclip class="h-5 w-5" /> Attach
							</Button>
							<Button type="button" size="sm" variant="outline" class="rounded-4xl" disabled>
								<Wrench class="h-5 w-5" /> Tools
							</Button>
						</div>
						<Button
							type="submit"
							size="icon"
							disabled={!input.trim() || isLoading}
							class="h-9 w-9 rounded-full"
						>
							<ArrowUp class="h-5 w-5" />
						</Button>
					</div>
				</div>
			</form>
			<p class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
				LLMs can make mistakes. Check important info.
			</p>
		</div>
	</div>
</div>
