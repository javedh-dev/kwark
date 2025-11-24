<script lang="ts">
	import { marked } from 'marked';
	import type { Message } from '$lib/stores/chatStore.svelte';
	import { onMount } from 'svelte';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();

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
				<div class="mb-1 text-xs text-muted-foreground">
					{getModelLabel(message.model)}
				</div>
			{/if}
			<div class="prose-md prose max-w-none text-base dark:prose-invert">
				{@html marked(message.content)}
			</div>
		{/if}
	</div>
</div>
