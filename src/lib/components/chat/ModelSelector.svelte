<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';

	interface Props {
		value: string;
	}

	let { value = $bindable() }: Props = $props();

	let models = $state<any>([]);
	let loading = $state(true);

	// Fetch models from API
	onMount(async () => {
		try {
			const response = await fetch('/api/models');
			if (response.ok) {
				const data = await response.json();
				models = data;
				value = models[0].value;
			}
		} catch (error) {
			console.error('Failed to fetch models:', error);
			// Use fallback models on error
		} finally {
			loading = false;
		}
	});

	// Get current label for display
	const currentLabel = $derived(models.find((m: any) => m.value === value)?.label || value);
</script>

<div class="flex items-center gap-3 p-2">
	<Select.Root type="single" bind:value>
		<Select.Trigger class="w-auto border-none shadow-none" placeholder="Select a model">
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
