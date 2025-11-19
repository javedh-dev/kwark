<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { ArrowUp, Paperclip, Wrench } from '@lucide/svelte';
	import { Diamonds } from 'svelte-loading-spinners';

	interface Message {
		id: number;
		role: 'user' | 'assistant';
		content: string;
	}

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
						const content = line.slice(6);
						accumulatedContent += content;

						messages = messages.map((m) =>
							m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
						);
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
								class="max-w-[80%] rounded-2xl px-4 py-2 {message.role === 'user'
									? 'bg-secondary'
									: 'bg-transparent'}"
							>
								<p class="whitespace-pre-wrap">
									{message.content}
								</p>
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
