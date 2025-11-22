<script>
	import { Hexagon } from '@lucide/svelte';
	import { useChat } from '$lib/hooks/useChat.svelte';

	const models = [
		{ value: 'openrouter/openai/gpt-oss-20b:free', label: 'GPT OSS 20B' },
		{ value: 'openrouter/openai/gpt-4o-mini', label: 'GPT-4o Mini' },
		{ value: 'openrouter/openai/gpt-4o', label: 'GPT-4o' },
		{ value: 'openrouter/openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
		{ value: 'openrouter/openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
	];
	const chat = useChat();
	let selectedModel = $derived(chat.selectedModel || 'gpt-3.5-turbo');
	const currentModelLabel = $derived(models.find((m) => m.value === selectedModel)?.label);
</script>

<div class="flex h-full items-center justify-start px-4 align-middle">
	<div class="text-start">
		<h2 class="mb-2 flex flex-col items-start gap-6 text-2xl text-gray-900 dark:text-gray-100">
			<div class="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200">
				<Hexagon class="h-6 w-6" />
			</div>
			<div class="flex flex-col gap-1">
				{currentModelLabel}
				<div class="text-muted-foreground/30">How can I help you today?</div>
			</div>
		</h2>
	</div>
</div>
