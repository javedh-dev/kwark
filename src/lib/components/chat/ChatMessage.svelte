<script lang="ts">
	import { marked } from 'marked';
	import type { Message } from '$lib/stores/chatStore.svelte';
	import { onMount } from 'svelte';

	interface Props {
		message: Message;
		isStreaming?: boolean;
	}

	let { message, isStreaming = false }: Props = $props();

	// Fallback model map - should match server-side MODEL_LABELS
	const fallbackModelMap: Record<string, string> = {};

	let modelMap = $state<Record<string, string>>(fallbackModelMap);

	// Fetch models from API and build the map
	onMount(async () => {
		try {
			const response = await fetch('/api/models');
			if (response.ok) {
				const data = await response.json();
				const newModelMap: Record<string, string> = {};
				data.forEach((model: { value: string; label: string }) => {
					newModelMap[model.value] = model.label;
				});
				modelMap = newModelMap;
			}
		} catch (error) {
			console.error('Failed to fetch models:', error);
			// Use fallback model map on error
		}
	});

	// Convert model ID to friendly label
	function getModelLabel(model: string): string {
		return modelMap[model] || model;
	}
</script>

<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
	<div
		class="max-w-[85%] rounded-xl {message.role === 'user'
			? 'bg-secondary/40 px-4 py-1.5'
			: 'px-0.5 py-1'}"
	>
		{#if message.role === 'user'}
			<p class="prose text-base leading-7 whitespace-pre-wrap text-gray-900 dark:text-gray-50">
				{message.content}
			</p>
		{:else}
			{#if message.model}
				<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
					<span>{getModelLabel(message.model)}</span>
					{#if isStreaming && message.thinking && !message.content}
						<span class="inline-flex gap-0.5">
							<span class="animate-bounce" style="animation-delay: 0ms;">.</span>
							<span class="animate-bounce" style="animation-delay: 150ms;">.</span>
							<span class="animate-bounce" style="animation-delay: 300ms;">.</span>
						</span>
					{/if}
				</div>
			{/if}
			{#if message.thinking}
				<details class="group mb-3">
					<summary
						class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
					>
						<svg
							class="h-4 w-4 transition-transform group-open:rotate-90"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span class="font-medium">Reasoning</span>
					</summary>
					<div
						class="prose-sm prose mt-2 max-w-none border-l-2 border-muted pl-4 text-sm text-muted-foreground dark:prose-invert"
					>
						{@html marked(message.thinking)}
					</div>
				</details>
			{/if}
			<div class="prose-md prose max-w-none text-base dark:prose-invert">
				{@html marked(message.content)}
			</div>
		{/if}
	</div>
</div>
