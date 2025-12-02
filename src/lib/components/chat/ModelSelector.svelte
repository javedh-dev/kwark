<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';

	interface Props {
		value: string;
	}

	let { value = $bindable() }: Props = $props();

	let models = $state<any>([]);
	let loading = $state(true);

	// Fetch models from API
	async function loadModels() {
		loading = true;
		try {
			let connectionIds = chatStore.connectionIds;

			// If no connections selected, get the default connection
			if (connectionIds.length === 0) {
				const defaultConnection = aiConnections.find((c: any) => c.isDefault);
				if (defaultConnection) {
					connectionIds = [defaultConnection.id];
					// Update store with default connection
					chatStore.connectionIds = connectionIds;
				}
			}

			if (connectionIds.length === 0) {
				models = [];
				loading = false;
				return;
			}

			const allModels: any[] = [];

			for (const connectionId of connectionIds) {
				try {
					const response = await fetch(`/api/models?connectionId=${connectionId}`);

					if (response.ok) {
						const data = await response.json();
						const connection = aiConnections.find((c: any) => c.id === connectionId);
						const connectionName = connection?.name || connectionId;

						const prefixedModels = data.map((model: any) => ({
							value: `${connectionId}:${model.value}`,
							label: `[${connectionName}] ${model.label}`,
							connectionId,
							originalValue: model.value
						}));

						allModels.push(...prefixedModels);
					}
				} catch (err) {
					// Silently handle errors
				}
			}

			models = allModels;

			// Auto-select first model if none selected or current selection is invalid
			if (models.length > 0) {
				const currentModelValid = models.some((m: any) => m.value === value);
				if (!value || !currentModelValid) {
					value = models[0].value;
				}
			}
		} catch (error) {
			models = [];
		} finally {
			loading = false;
		}
	}

	// Load connections for model prefixing
	let aiConnections = $state<any[]>([]);
	async function loadConnections() {
		try {
			const response = await fetch('/api/ai-connections');
			if (response.ok) {
				aiConnections = await response.json();
			}
		} catch (error) {
			// Silently handle errors
		}
	}

	onMount(async () => {
		await loadConnections();
		await loadModels();
	});

	// Reload models when connections change
	let previousConnectionIds = $state<string[]>([]);
	$effect(() => {
		const currentConnectionIds = chatStore.connectionIds;
		const idsChanged =
			JSON.stringify(currentConnectionIds) !== JSON.stringify(previousConnectionIds);
		if (idsChanged) {
			previousConnectionIds = [...currentConnectionIds];
			loadModels();

			// Reset selected model if it's not from an active connection
			if (value && value.includes(':')) {
				const [connId] = value.split(':', 2);
				if (!currentConnectionIds.includes(connId)) {
					value = '';
				}
			}
		}
	});

	// Get current label for display
	const currentLabel = $derived(models.find((m: any) => m.value === value)?.label || value);
</script>

<div class="flex items-center gap-3 p-2">
	{#if loading}
		<span class="text-sm text-muted-foreground">Loading models...</span>
	{:else if models.length === 0}
		<span class="text-sm text-destructive">No connection configured</span>
	{:else}
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
	{/if}
</div>
