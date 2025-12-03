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
	let modelPreferences = $state<any[]>([]);

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

			// Load model preferences
			try {
				const prefResponse = await fetch('/api/model-preferences');
				if (prefResponse.ok) {
					modelPreferences = await prefResponse.json();
				}
			} catch (err) {
				// Silently handle errors
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

						// Filter out disabled models
						const enabledModels = prefixedModels.filter((model: any) => {
							const pref = modelPreferences.find(
								(p) => p.connectionId === connectionId && p.modelId === model.originalValue
							);
							// Show if no preference exists (default enabled) or if explicitly enabled
							return !pref || pref.isEnabled;
						});

						allModels.push(...enabledModels);
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
			<Select.Trigger class="w-auto border-none shadow-none hover:bg-muted/50 transition-colors" placeholder="Select a model">
				<div class="flex items-center gap-2">
					{#if value && value.includes(':')}
						{@const [connId] = value.split(':', 2)}
						{@const connection = aiConnections.find((c) => c.id === connId)}
						{@const modelInfo = models.find((m: any) => m.value === value)}
						{#if connection && modelInfo}
							<span class="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
								{connection.name}
							</span>
							<span class="text-sm font-medium">{modelInfo.originalValue}</span>
						{:else}
							<span class="text-sm font-medium">{currentLabel}</span>
						{/if}
					{:else}
						<span class="text-sm font-medium">{currentLabel}</span>
					{/if}
				</div>
			</Select.Trigger>
			<Select.Content class="max-w-md">
				{#each models as model}
					{@const connection = aiConnections.find((c) => c.id === model.connectionId)}
					<Select.Item value={model.value} label={model.label}>
						<div class="flex items-center gap-2 py-1">
							<span class="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
								{connection?.name || model.connectionId}
							</span>
							<span class="font-medium">{model.originalValue}</span>
						</div>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}
</div>
