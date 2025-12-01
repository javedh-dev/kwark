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
			const connectionIds = chatStore.connectionIds;
			
			if (connectionIds.length === 0) {
				// No connections selected, try default
				console.log('Loading models from default connection');
				const response = await fetch('/api/models');
				
				if (!response.ok) {
					const errorText = await response.text();
					console.error('Failed to fetch models:', response.status, errorText);
					models = [];
					return;
				}
				
				const data = await response.json();
				console.log('Loaded models from default:', data.length);
				models = data;
			} else {
				// Fetch models from all selected connections
				console.log('Loading models from connections:', connectionIds);
				const allModels: any[] = [];
				
				for (const connectionId of connectionIds) {
					try {
						const response = await fetch(`/api/models?connectionId=${connectionId}`);
						
						if (response.ok) {
							const data = await response.json();
							// Add connection name prefix to avoid duplicates
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
						console.error(`Failed to fetch models from connection ${connectionId}:`, err);
					}
				}
				
				console.log('Loaded total models:', allModels.length);
				models = allModels;
			}
			
			if (models.length > 0 && !value) {
				value = models[0].value;
			}
		} catch (error) {
			console.error('Failed to fetch models:', error);
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
			console.error('Failed to load connections:', error);
		}
	}

	onMount(() => {
		loadConnections();
		loadModels();
	});

	// Reload models when connections change
	let previousConnectionIds = $state<string[]>([]);
	$effect(() => {
		const currentConnectionIds = chatStore.connectionIds;
		const idsChanged = JSON.stringify(currentConnectionIds) !== JSON.stringify(previousConnectionIds);
		if (idsChanged) {
			previousConnectionIds = [...currentConnectionIds];
			loadModels();
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
