<script>
	import { Hexagon } from '@lucide/svelte';
	import { useChat } from '$lib/hooks/useChat.svelte';
	import { onMount } from 'svelte';

	// Fallback models if API fails
	const fallbackModels = [
		{ value: 'openai/gpt-oss-20b:free', label: 'GPT OSS 20B' },
		{ value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
		{ value: 'openai/gpt-4o', label: 'GPT-4o' },
		{ value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
		{ value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
	];

	let models = $state(fallbackModels);

	// Fetch models from API
	onMount(async () => {
		try {
			const response = await fetch('/api/models');
			if (response.ok) {
				const data = await response.json();
				models = data;
			}
		} catch (error) {
			console.error('Failed to fetch models:', error);
			// Use fallback models on error
		}
	});

	const chat = useChat();
	let selectedModel = $derived(chat.selectedModel || 'gpt-3.5-turbo');
	const currentModelLabel = $derived(models.find((m) => m.value === selectedModel)?.label);
</script>

<div class="flex h-full items-center justify-start px-4 align-middle">
	<div class="text-start">
		<h2 class="mb-2 flex flex-col items-start gap-6 text-2xl text-gray-900 dark:text-gray-100">
			<div class="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200">
				<img src="/logo.svg" alt="Kwark Logo" class="h-8 w-8" />
			</div>
			<div class="flex flex-col gap-1">
				{currentModelLabel}
				<div class="text-muted-foreground/30">How can I help you today?</div>
			</div>
		</h2>
	</div>
</div>
