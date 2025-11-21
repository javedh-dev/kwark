<script lang="ts">
	import { marked } from 'marked';
	import type { Message } from '$lib/stores/chatStore.svelte';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();
</script>

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
				class="prose-md prose max-w-none dark:prose-invert
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
