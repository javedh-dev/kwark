<script lang="ts">
	import { marked } from 'marked';
	import type { Message } from '$lib/stores/chatStore.svelte';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();

	// Convert model ID to friendly label
	function getModelLabel(model: string): string {
		const modelMap: Record<string, string> = {
			'openrouter/openai/gpt-oss-20b:free': 'GPT OSS 20B',
			'openrouter/openai/gpt-4o-mini': 'GPT-4o Mini',
			'openrouter/openai/gpt-4o': 'GPT-4o',
			'openrouter/openai/gpt-4-turbo': 'GPT-4 Turbo',
			'openrouter/openai/gpt-3.5-turbo': 'GPT-3.5 Turbo'
		};
		return modelMap[model] || model;
	}
</script>

<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
	<div
		class="max-w-[85%] rounded-xl {message.role === 'user'
			? 'bg-secondary px-4 py-1.5'
			: 'px-0.5 py-1'}"
	>
		{#if message.role === 'user'}
			<p class="prose text-sm leading-7 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
				{message.content}
			</p>
		{:else}
			{#if message.model}
				<div class="mb-1 text-xs text-muted-foreground">
					{getModelLabel(message.model)}
				</div>
			{/if}
			<div
				class="prose-md prose max-w-none text-sm
				dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900
				dark:prose-headings:text-gray-100 prose-p:leading-7 prose-p:text-gray-800
				dark:prose-p:text-gray-200 prose-a:text-blue-600
				prose-a:no-underline hover:prose-a:underline
				dark:prose-a:text-blue-400 prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-700 dark:prose-blockquote:border-l-gray-600
				dark:prose-blockquote:text-gray-300 prose-strong:font-semibold
				prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:rounded prose-code:bg-gray-100
				prose-code:px-1.5 prose-code:py-0.5 prose-code:font-medium
				prose-code:text-pink-600 prose-code:before:content-['']
				prose-code:after:content-[''] dark:prose-code:bg-gray-800
				dark:prose-code:text-pink-400 prose-table:ms-2"
			>
				{@html marked(message.content)}
			</div>
		{/if}
	</div>
</div>
