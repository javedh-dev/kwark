<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/components/ui/sheet';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Settings2, ChevronDown, ChevronUp, Plus, X } from '@lucide/svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$lib/components/ui/collapsible';

	// All LLM parameters
	interface AllParams {
		// Basic params
		temperature: string;
		max_tokens: string;
		top_p: string;
		top_k: string;
		min_p: string;

		// Penalty params
		frequency_penalty: string;
		presence_penalty: string;
		repeat_penalty: string;

		// Advanced params
		seed: string;
		stop_sequence: string;
		reasoning_effort: string;
		logit_bias: string;

		// Streaming params
		stream_chat_response: string;
		stream_delta_chunk_size: string;

		// Function params
		function_calling: string;
		reasoning_tags: string;

		// Sampling params
		mirostat_tau: string;
		repeat_last_n: string;
		tfs_z: string;

		// Memory params
		use_mmap: string;
		use_mlock: string;
	}

	let open = $state(false);
	let advancedOpen = $state(false);
	let systemPrompt = $state('');
	let customParams = $state<Record<string, string>>({});
	let newParamKey = $state('');
	let newParamValue = $state('');
	let aiConnections = $state<any[]>([]);
	let selectedConnectionIds = $state<string[]>([]);

	let allParams = $state<AllParams>({
		temperature: '0.7',
		max_tokens: '',
		top_p: '',
		top_k: '',
		min_p: '',
		frequency_penalty: '',
		presence_penalty: '',
		repeat_penalty: '',
		seed: '',
		stop_sequence: '',
		reasoning_effort: '',
		logit_bias: '',
		stream_chat_response: '',
		stream_delta_chunk_size: '',
		function_calling: '',
		reasoning_tags: '',
		mirostat_tau: '',
		repeat_last_n: '',
		tfs_z: '',
		use_mmap: '',
		use_mlock: ''
	});

	// Known parameter keys
	const knownParamKeys = new Set([
		'temperature',
		'max_tokens',
		'top_p',
		'top_k',
		'min_p',
		'frequency_penalty',
		'presence_penalty',
		'repeat_penalty',
		'seed',
		'stop_sequence',
		'reasoning_effort',
		'logit_bias',
		'stream_chat_response',
		'stream_delta_chunk_size',
		'function_calling',
		'reasoning_tags',
		'mirostat_tau',
		'repeat_last_n',
		'tfs_z',
		'use_mmap',
		'use_mlock'
	]);

	// Load AI connections
	async function loadAiConnections() {
		try {
			const response = await fetch('/api/ai-connections');
			if (response.ok) {
				const connections = await response.json();
				aiConnections = connections;
				// Set default connection if available and none selected
				const defaultConn = connections.find((c: any) => c.isDefault);
				if (defaultConn && selectedConnectionIds.length === 0) {
					selectedConnectionIds = [defaultConn.id];
				}
			}
		} catch (error) {
			console.error('Failed to load AI connections:', error);
		}
	}

	function toggleConnection(connectionId: string) {
		if (selectedConnectionIds.includes(connectionId)) {
			selectedConnectionIds = selectedConnectionIds.filter((id) => id !== connectionId);
		} else {
			selectedConnectionIds = [...selectedConnectionIds, connectionId];
		}
	}

	// Load current settings when opening
	$effect(() => {
		if (open) {
			loadAiConnections();
			const allAttrs = { ...chatStore.customAttributes };

			systemPrompt = chatStore.systemPrompt;
			// Always load from store, even if empty
			selectedConnectionIds = [...chatStore.connectionIds];

			// Separate known params from custom ones
			const custom: Record<string, string> = {};
			Object.entries(allAttrs).forEach(([key, value]) => {
				if (!knownParamKeys.has(key)) {
					custom[key] = value;
				}
			});
			customParams = custom;

			allParams = {
				temperature: chatStore.temperature.toString(),
				max_tokens: allAttrs.max_tokens || '',
				top_p: allAttrs.top_p || '',
				top_k: allAttrs.top_k || '',
				min_p: allAttrs.min_p || '',
				frequency_penalty: allAttrs.frequency_penalty || '',
				presence_penalty: allAttrs.presence_penalty || '',
				repeat_penalty: allAttrs.repeat_penalty || '',
				seed: allAttrs.seed || '',
				stop_sequence: allAttrs.stop_sequence || '',
				reasoning_effort: allAttrs.reasoning_effort || '',
				logit_bias: allAttrs.logit_bias || '',
				stream_chat_response: allAttrs.stream_chat_response || '',
				stream_delta_chunk_size: allAttrs.stream_delta_chunk_size || '',
				function_calling: allAttrs.function_calling || '',
				reasoning_tags: allAttrs.reasoning_tags || '',
				mirostat_tau: allAttrs.mirostat_tau || '',
				repeat_last_n: allAttrs.repeat_last_n || '',
				tfs_z: allAttrs.tfs_z || '',
				use_mmap: allAttrs.use_mmap || '',
				use_mlock: allAttrs.use_mlock || ''
			};
		}
	});

	function applySettings() {
		// Build final custom attributes object with only non-empty values
		const finalAttrs: Record<string, string> = {};

		// Add known params
		Object.entries(allParams).forEach(([key, value]) => {
			if (key !== 'temperature' && value.trim()) {
				finalAttrs[key] = value.trim();
			}
		});

		// Add custom params
		Object.entries(customParams).forEach(([key, value]) => {
			if (value.trim()) {
				finalAttrs[key] = value.trim();
			}
		});

		// Update store
		chatStore.temperature = parseFloat(allParams.temperature) || 0.7;
		chatStore.customAttributes = finalAttrs;
		chatStore.systemPrompt = systemPrompt;
		chatStore.connectionIds = selectedConnectionIds;

		// Save settings to current chat
		chatStore.saveChatSettings();

		open = false;
	}

	function resetToDefaults() {
		systemPrompt = '';
		customParams = {};
		newParamKey = '';
		newParamValue = '';
		allParams = {
			temperature: '0.7',
			max_tokens: '',
			top_p: '',
			top_k: '',
			min_p: '',
			frequency_penalty: '',
			presence_penalty: '',
			repeat_penalty: '',
			seed: '',
			stop_sequence: '',
			reasoning_effort: '',
			logit_bias: '',
			stream_chat_response: '',
			stream_delta_chunk_size: '',
			function_calling: '',
			reasoning_tags: '',
			mirostat_tau: '',
			repeat_last_n: '',
			tfs_z: '',
			use_mmap: '',
			use_mlock: ''
		};
	}

	function addCustomParam() {
		if (newParamKey.trim() && newParamValue.trim()) {
			customParams[newParamKey.trim()] = newParamValue.trim();
			newParamKey = '';
			newParamValue = '';
		}
	}

	function removeCustomParam(key: string) {
		const { [key]: _, ...rest } = customParams;
		customParams = rest;
	}

	// Helper to format param name for display
	function formatParamName(name: string): string {
		return name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}
</script>

<Sheet bind:open>
	<SheetTrigger>
		<Button size="icon" variant="ghost" class="h-9 w-9">
			<Settings2 class="h-5 w-5" />
		</Button>
	</SheetTrigger>
	<SheetContent side="right" class="w-[400px] overflow-y-auto sm:w-[540px]">
		<SheetHeader>
			<SheetTitle>LLM Settings</SheetTitle>
			<SheetDescription>Configure parameters for the language model.</SheetDescription>
		</SheetHeader>

		<div class="space-y-4 px-4 pb-4">
			<!-- AI Connection Selector -->
			{#if aiConnections.length > 0}
				<div class="space-y-2">
					<Label class="text-sm font-semibold">AI Connections</Label>
					<div class="space-y-2 rounded-md border border-input p-3">
						{#each aiConnections as connection}
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									checked={selectedConnectionIds.includes(connection.id)}
									onchange={() => toggleConnection(connection.id)}
									class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
								/>
								<span class="text-sm">
									{connection.name}
									{#if connection.isDefault}
										<span class="text-xs text-muted-foreground">(Default)</span>
									{/if}
								</span>
							</label>
						{/each}
					</div>
					<p class="text-xs text-muted-foreground">
						Select one or more connections. Models from all selected connections will be available.
					</p>
				</div>
			{/if}

			<!-- System Prompt -->
			<div class="space-y-2">
				<Label for="system-prompt" class="text-sm font-semibold">System Prompt</Label>
				<Textarea
					id="system-prompt"
					bind:value={systemPrompt}
					placeholder="Enter system prompt to set the behavior and context for the assistant..."
					class="min-h-[100px] resize-none text-sm"
				/>
				<p class="text-xs text-muted-foreground">
					Define the assistant's role, personality, and constraints
				</p>
			</div>

			<!-- Basic Parameters -->
			<div class="space-y-2">
				<Label class="text-sm font-semibold">Basic Parameters</Label>

				<div class="space-y-1">
					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Temperature</span>
						<Input
							type="number"
							bind:value={allParams.temperature}
							step="0.1"
							min="0"
							max="2"
							placeholder="0.7"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>

					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Max Tokens</span>
						<Input
							type="number"
							bind:value={allParams.max_tokens}
							placeholder="Default"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>

					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Top P</span>
						<Input
							type="number"
							bind:value={allParams.top_p}
							step="0.1"
							min="0"
							max="1"
							placeholder="Default"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>

					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Top K</span>
						<Input
							type="number"
							bind:value={allParams.top_k}
							placeholder="Default"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>

					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Min P</span>
						<Input
							type="number"
							bind:value={allParams.min_p}
							step="0.1"
							min="0"
							max="1"
							placeholder="Default"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>

					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Frequency Penalty</span>
						<Input
							type="number"
							bind:value={allParams.frequency_penalty}
							step="0.1"
							min="-2"
							max="2"
							placeholder="Default"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>

					<div class="flex items-center justify-between border-b border-border/40 py-1.5">
						<span class="text-sm">Presence Penalty</span>
						<Input
							type="number"
							bind:value={allParams.presence_penalty}
							step="0.1"
							min="-2"
							max="2"
							placeholder="Default"
							class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
						/>
					</div>
				</div>
			</div>

			<!-- Advanced Parameters (Collapsible) -->
			<Collapsible bind:open={advancedOpen}>
				<CollapsibleTrigger class="flex w-full items-center justify-between py-2">
					<Label class="cursor-pointer text-sm font-semibold">Advanced Parameters</Label>
					{#if advancedOpen}
						<ChevronUp class="h-4 w-4" />
					{:else}
						<ChevronDown class="h-4 w-4" />
					{/if}
				</CollapsibleTrigger>

				<CollapsibleContent>
					<div class="mt-2 space-y-1">
						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Stream Chat Response</span>
							<Input
								bind:value={allParams.stream_chat_response}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Stream Delta Chunk Size</span>
							<Input
								type="number"
								bind:value={allParams.stream_delta_chunk_size}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Function Calling</span>
							<Input
								bind:value={allParams.function_calling}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Reasoning Tags</span>
							<Input
								bind:value={allParams.reasoning_tags}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Seed</span>
							<Input
								type="number"
								bind:value={allParams.seed}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Stop Sequence</span>
							<Input
								bind:value={allParams.stop_sequence}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Reasoning Effort</span>
							<Input
								bind:value={allParams.reasoning_effort}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Logit Bias</span>
							<Input
								bind:value={allParams.logit_bias}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Mirostat Tau</span>
							<Input
								type="number"
								bind:value={allParams.mirostat_tau}
								step="0.1"
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Repeat Last N</span>
							<Input
								type="number"
								bind:value={allParams.repeat_last_n}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">TFS Z</span>
							<Input
								type="number"
								bind:value={allParams.tfs_z}
								step="0.1"
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Repeat Penalty</span>
							<Input
								type="number"
								bind:value={allParams.repeat_penalty}
								step="0.1"
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Use Mmap</span>
							<Input
								bind:value={allParams.use_mmap}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>

						<div class="flex items-center justify-between border-b border-border/40 py-1.5">
							<span class="text-sm">Use Mlock</span>
							<Input
								bind:value={allParams.use_mlock}
								placeholder="Default"
								class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
							/>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>

			<!-- Custom Parameters -->
			<div class="space-y-2">
				<Label class="text-sm font-semibold">Custom Parameters</Label>

				<!-- Existing Custom Params -->
				{#if Object.keys(customParams).length > 0}
					<div class="space-y-1">
						{#each Object.entries(customParams) as [key, value]}
							<div class="group flex items-center justify-between border-b border-border/40 py-1.5">
								<span class="text-sm">{key}</span>
								<div class="flex items-center gap-2">
									<Input
										bind:value={customParams[key]}
										placeholder="value"
										class="h-6 w-28 border-none bg-transparent text-xs shadow-none focus-visible:bg-muted/50 focus-visible:ring-0 dark:scheme-dark"
									/>
									<button
										onclick={() => removeCustomParam(key)}
										class="opacity-0 transition-opacity group-hover:opacity-100"
									>
										<X class="h-3 w-3 text-muted-foreground hover:text-foreground" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add New Custom Param -->
				<div class="flex items-center gap-1 pt-1">
					<Input
						bind:value={newParamKey}
						placeholder="param_name"
						class="h-7 flex-1 border-dashed bg-muted/30 text-xs"
					/>
					<Input
						bind:value={newParamValue}
						placeholder="value"
						class="h-7 w-24 border-dashed bg-muted/30 text-xs"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addCustomParam();
							}
						}}
					/>
					<Button
						size="icon"
						variant="ghost"
						class="h-7 w-7 shrink-0"
						onclick={addCustomParam}
						disabled={!newParamKey.trim() || !newParamValue.trim()}
					>
						<Plus class="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-2 pt-4">
				<Button class="flex-1" onclick={applySettings}>Apply</Button>
				<Button variant="outline" onclick={resetToDefaults}>Reset</Button>
				<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			</div>
		</div>
	</SheetContent>
</Sheet>
