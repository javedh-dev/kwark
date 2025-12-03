<script lang="ts">
	import { onMount } from 'svelte';
	import { Label } from '$lib/components/ui/label';
	import * as Switch from '$lib/components/ui/switch';

	let modelPreferences = $state<any[]>([]);
	let availableModels = $state<any[]>([]);
	let aiConnections = $state<any[]>([]);
	let loading = $state(true);

	async function loadData() {
		loading = true;
		try {
			// Load AI connections
			const connResponse = await fetch('/api/ai-connections');
			if (connResponse.ok) {
				aiConnections = await connResponse.json();
			}

			// Load preferences
			const prefResponse = await fetch('/api/model-preferences');
			if (prefResponse.ok) {
				modelPreferences = await prefResponse.json();
			}

			// Load all available models
			const modelsList: any[] = [];
			for (const connection of aiConnections) {
				const response = await fetch(`/api/models?connectionId=${connection.id}`);
				if (response.ok) {
					const models = await response.json();
					models.forEach((model: any) => {
						modelsList.push({
							connectionId: connection.id,
							connectionName: connection.name,
							modelId: model.value,
							modelName: model.label
						});
					});
				}
			}
			availableModels = modelsList;
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			loading = false;
		}
	}

	function isModelEnabled(connectionId: string, modelId: string): boolean {
		const pref = modelPreferences.find(
			(p) => p.connectionId === connectionId && p.modelId === modelId
		);
		// Default to enabled if no preference exists
		return pref ? pref.isEnabled : true;
	}

	async function toggleModel(connectionId: string, modelId: string, enabled: boolean) {
		try {
			const response = await fetch('/api/model-preferences', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ connectionId, modelId, isEnabled: enabled })
			});

			if (response.ok) {
				// Update local state
				const existingIndex = modelPreferences.findIndex(
					(p) => p.connectionId === connectionId && p.modelId === modelId
				);

				if (existingIndex >= 0) {
					modelPreferences[existingIndex].isEnabled = enabled;
				} else {
					modelPreferences.push({
						connectionId,
						modelId,
						isEnabled: enabled,
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}
				modelPreferences = [...modelPreferences];
			}
		} catch (error) {
			console.error('Failed to toggle model:', error);
		}
	}

	onMount(loadData);

	// Group models by connection
	const modelsByConnection = $derived(
		aiConnections.map((conn) => ({
			...conn,
			models: availableModels.filter((m) => m.connectionId === conn.id)
		}))
	);
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Model Preferences</h3>
		<p class="text-sm text-muted-foreground">
			Enable or disable models to show/hide them from the model selector.
		</p>
	</div>

	{#if loading}
		<div class="text-sm text-muted-foreground">Loading models...</div>
	{:else if modelsByConnection.length === 0}
		<div class="text-sm text-muted-foreground">No connections configured.</div>
	{:else}
		<div class="space-y-6">
			{#each modelsByConnection as connection}
				{#if connection.models.length > 0}
					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<span class="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
								{connection.name}
							</span>
						</div>
						<div class="space-y-2 pl-4">
							{#each connection.models as model}
								<div class="flex items-center justify-between rounded-lg border p-3">
									<Label for={`${connection.id}-${model.modelId}`} class="font-normal cursor-pointer">
										{model.modelName}
									</Label>
									<Switch.Root
										id={`${connection.id}-${model.modelId}`}
										checked={isModelEnabled(connection.id, model.modelId)}
										onCheckedChange={(checked) =>
											toggleModel(connection.id, model.modelId, checked)}
									/>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
