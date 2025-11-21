<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	interface Props {
		value: string;
	}

	let { value = $bindable() }: Props = $props();

	const models = [
		{ value: 'openrouter/openai/gpt-oss-20b:free', label: 'GPT OSS 20B' },
		{ value: 'openrouter/openai/gpt-4o-mini', label: 'GPT-4o Mini' },
		{ value: 'openrouter/openai/gpt-4o', label: 'GPT-4o' },
		{ value: 'openrouter/openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
		{ value: 'openrouter/openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
	];

	// Get current label for display
	const currentLabel = $derived(models.find((m) => m.value === value)?.label || value);
</script>

<div class="flex items-center gap-3 border-b border-border px-8 py-3">
	<span class="text-sm font-medium text-muted-foreground">Model:</span>
	<Select.Root type="single" bind:value>
		<Select.Trigger class="w-[200px]">
			{currentLabel}
		</Select.Trigger>
		<Select.Content>
			{#each models as model}
				<Select.Item value={model.value} label={model.label}>
					{model.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
