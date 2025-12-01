<script lang="ts">
	import { themeStore } from '$lib/stores/themeStore.svelte';
	import { Sun, Moon, Monitor, User, Bell, Shield, Palette, Plug, Plus, Trash2, Check } from '@lucide/svelte';

	let activeTab = $state('appearance');
	let notifications = $state({
		email: true,
		push: false,
		updates: true
	});

	let profile = $state({
		name: '',
		email: '',
		bio: ''
	});

	let aiConnections = $state<any[]>([]);
	let showAddConnection = $state(false);
	let editingConnection = $state<any>(null);
	let newConnection = $state({
		name: '',
		baseUrl: '',
		apiKey: '',
		defaultModel: '',
		isDefault: false
	});

	const tabs = [
		{ id: 'appearance', label: 'Appearance', icon: Palette },
		{ id: 'ai-connections', label: 'AI Connections', icon: Plug },
		{ id: 'profile', label: 'Profile', icon: User },
		{ id: 'notifications', label: 'Notifications', icon: Bell },
		{ id: 'privacy', label: 'Privacy & Security', icon: Shield }
	];

	const themes = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	] as const;

	function handleThemeChange(theme: 'light' | 'dark' | 'system') {
		themeStore.setTheme(theme);
	}

	function saveProfile() {
		// TODO: Implement profile save API call
		console.log('Saving profile:', profile);
	}

	function saveNotifications() {
		// TODO: Implement notifications save API call
		console.log('Saving notifications:', notifications);
	}

	async function loadAiConnections() {
		try {
			const response = await fetch('/api/ai-connections');
			if (response.ok) {
				aiConnections = await response.json();
			}
		} catch (error) {
			console.error('Failed to load AI connections:', error);
		}
	}

	async function addAiConnection() {
		try {
			const response = await fetch('/api/ai-connections', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newConnection)
			});

			if (response.ok) {
				await loadAiConnections();
				showAddConnection = false;
				newConnection = { name: '', baseUrl: '', apiKey: '', defaultModel: '', isDefault: false };
			}
		} catch (error) {
			console.error('Failed to add AI connection:', error);
		}
	}

	async function deleteAiConnection(id: string) {
		if (!confirm('Are you sure you want to delete this connection?')) return;

		try {
			const response = await fetch(`/api/ai-connections/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadAiConnections();
			}
		} catch (error) {
			console.error('Failed to delete AI connection:', error);
		}
	}

	async function setDefaultConnection(id: string) {
		try {
			const response = await fetch(`/api/ai-connections/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isDefault: true })
			});

			if (response.ok) {
				await loadAiConnections();
			}
		} catch (error) {
			console.error('Failed to set default connection:', error);
		}
	}

	function startEditConnection(connection: any) {
		editingConnection = {
			id: connection.id,
			name: connection.name,
			baseUrl: connection.baseUrl,
			apiKey: '', // Don't pre-fill the masked API key
			defaultModel: connection.defaultModel || '',
			isDefault: connection.isDefault
		};
		showAddConnection = false;
	}

	async function updateConnection() {
		if (!editingConnection) return;

		try {
			const updateData: any = {
				name: editingConnection.name,
				baseUrl: editingConnection.baseUrl,
				defaultModel: editingConnection.defaultModel,
				isDefault: editingConnection.isDefault
			};

			// Only include API key if it was changed (not empty)
			if (editingConnection.apiKey) {
				updateData.apiKey = editingConnection.apiKey;
			}

			const response = await fetch(`/api/ai-connections/${editingConnection.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData)
			});

			if (response.ok) {
				await loadAiConnections();
				editingConnection = null;
			}
		} catch (error) {
			console.error('Failed to update AI connection:', error);
		}
	}

	function cancelEdit() {
		editingConnection = null;
		showAddConnection = false;
	}

	$effect(() => {
		if (activeTab === 'ai-connections') {
			loadAiConnections();
		}
	});
</script>

<div class="flex h-screen bg-background">
	<div class="flex flex-1 flex-col overflow-hidden px-8 py-6">
		<div class="mb-6">
			<h1 class="text-3xl font-bold">Settings</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				Manage your account settings and preferences
			</p>
		</div>

		<div class="flex flex-1 gap-6 overflow-hidden">
			<!-- Sidebar Navigation -->
			<nav class="w-64 shrink-0">
				<ul class="space-y-1">
					{#each tabs as tab}
						{@const Icon = tab.icon}
						<li>
							<button
								onclick={() => (activeTab = tab.id)}
								class="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors {activeTab ===
								tab.id
									? 'bg-accent text-accent-foreground'
									: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}"
							>
								<Icon class="h-5 w-5" />
								{tab.label}
							</button>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Content Area -->
			<div class="flex-1 overflow-y-auto">
				<div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
				{#if activeTab === 'ai-connections'}
					<div>
						<div class="flex items-center justify-between">
							<div>
								<h2 class="text-xl font-semibold">AI Connections</h2>
								<p class="mt-1 text-sm text-muted-foreground">
									Manage OpenAI-compatible API connections
								</p>
							</div>
							<button
								onclick={() => (showAddConnection = true)}
								class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
							>
								<Plus class="h-4 w-4" />
								Add Connection
							</button>
						</div>

						{#if showAddConnection}
							<div class="mt-6 rounded-lg border bg-muted/50 p-4">
								<h3 class="font-medium">New Connection</h3>
								<form onsubmit={(e) => { e.preventDefault(); addAiConnection(); }} class="mt-4 space-y-4">
									<div>
										<label for="conn-name" class="block text-sm font-medium">
											Name
										</label>
										<input
											id="conn-name"
											type="text"
											bind:value={newConnection.name}
											required
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="e.g., OpenAI, Local LLM"
										/>
									</div>
									<div>
										<label for="conn-url" class="block text-sm font-medium">
											Base URL
										</label>
										<input
											id="conn-url"
											type="url"
											bind:value={newConnection.baseUrl}
											required
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="https://api.openai.com/v1"
										/>
									</div>
									<div>
										<label for="conn-key" class="block text-sm font-medium">
											API Key
										</label>
										<input
											id="conn-key"
											type="password"
											bind:value={newConnection.apiKey}
											required
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="sk-..."
										/>
									</div>
									<div>
										<label for="conn-model" class="block text-sm font-medium">
											Default Model (optional)
										</label>
										<input
											id="conn-model"
											type="text"
											bind:value={newConnection.defaultModel}
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="gpt-4"
										/>
									</div>
									<div class="flex items-center gap-2">
										<input
											type="checkbox"
											id="isDefault"
											bind:checked={newConnection.isDefault}
											class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
										/>
										<label for="isDefault" class="text-sm">
											Set as default connection
										</label>
									</div>
									<div class="flex gap-2">
										<button
											type="submit"
											class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
										>
											Save Connection
										</button>
										<button
											type="button"
											onclick={() => (showAddConnection = false)}
											class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						{/if}

						{#if editingConnection}
							<div class="mt-6 rounded-lg border bg-muted/50 p-4">
								<h3 class="font-medium">Edit Connection</h3>
								<form onsubmit={(e) => { e.preventDefault(); updateConnection(); }} class="mt-4 space-y-4">
									<div>
										<label for="edit-conn-name" class="block text-sm font-medium">
											Name
										</label>
										<input
											id="edit-conn-name"
											type="text"
											bind:value={editingConnection.name}
											required
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="e.g., OpenAI, Local LLM"
										/>
									</div>
									<div>
										<label for="edit-conn-url" class="block text-sm font-medium">
											Base URL
										</label>
										<input
											id="edit-conn-url"
											type="url"
											bind:value={editingConnection.baseUrl}
											required
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="https://api.openai.com/v1"
										/>
									</div>
									<div>
										<label for="edit-conn-key" class="block text-sm font-medium">
											API Key
										</label>
										<input
											id="edit-conn-key"
											type="password"
											bind:value={editingConnection.apiKey}
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="Leave empty to keep current key"
										/>
										<p class="mt-1 text-xs text-muted-foreground">
											Leave empty to keep the existing API key
										</p>
									</div>
									<div>
										<label for="edit-conn-model" class="block text-sm font-medium">
											Default Model (optional)
										</label>
										<input
											id="edit-conn-model"
											type="text"
											bind:value={editingConnection.defaultModel}
											class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="gpt-4"
										/>
									</div>
									<div class="flex items-center gap-2">
										<input
											type="checkbox"
											id="editIsDefault"
											bind:checked={editingConnection.isDefault}
											class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
										/>
										<label for="editIsDefault" class="text-sm">
											Set as default connection
										</label>
									</div>
									<div class="flex gap-2">
										<button
											type="submit"
											class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
										>
											Update Connection
										</button>
										<button
											type="button"
											onclick={cancelEdit}
											class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						{/if}

						<div class="mt-6 space-y-3">
							{#each aiConnections as connection}
								<div class="flex items-center justify-between rounded-lg border bg-card p-4">
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<h3 class="font-medium">{connection.name}</h3>
											{#if connection.isDefault}
												<span class="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
													<Check class="h-3 w-3" />
													Default
												</span>
											{/if}
										</div>
										<p class="mt-1 text-sm text-muted-foreground">{connection.baseUrl}</p>
										{#if connection.defaultModel}
											<p class="mt-0.5 text-xs text-muted-foreground">
												Model: {connection.defaultModel}
											</p>
										{/if}
									</div>
									<div class="flex items-center gap-2">
										<button
											onclick={() => startEditConnection(connection)}
											class="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent"
										>
											Edit
										</button>
										{#if !connection.isDefault}
											<button
												onclick={() => setDefaultConnection(connection.id)}
												class="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent"
											>
												Set Default
											</button>
										{/if}
										<button
											onclick={() => deleteAiConnection(connection.id)}
											class="rounded-lg p-2 text-destructive hover:bg-destructive/10"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									</div>
								</div>
							{:else}
								<p class="py-8 text-center text-sm text-muted-foreground">
									No AI connections configured. Add one to get started.
								</p>
							{/each}
						</div>
					</div>
				{:else if activeTab === 'appearance'}
					<div>
						<h2 class="text-xl font-semibold">Appearance</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Customize how the app looks and feels
						</p>

						<div class="mt-6">
							<p class="text-sm font-medium">Theme</p>
							<div class="mt-3 grid grid-cols-3 gap-3">
								{#each themes as theme}
									{@const ThemeIcon = theme.icon}
									<button
										onclick={() => handleThemeChange(theme.value)}
										class="flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all {themeStore.theme ===
										theme.value
											? 'border-primary bg-primary/5'
											: 'border-border hover:border-primary/50'}"
									>
										<ThemeIcon
											class="h-6 w-6 {themeStore.theme === theme.value
												? 'text-primary'
												: 'text-muted-foreground'}"
										/>
										<span
											class="text-sm font-medium {themeStore.theme === theme.value
												? 'text-primary'
												: 'text-foreground'}"
										>
											{theme.label}
										</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				{:else if activeTab === 'profile'}
					<div>
						<h2 class="text-xl font-semibold">Profile</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Update your personal information
						</p>

						<form onsubmit={(e) => { e.preventDefault(); saveProfile(); }} class="mt-6 space-y-4">
							<div>
								<label for="name" class="block text-sm font-medium">
									Name
								</label>
								<input
									id="name"
									type="text"
									bind:value={profile.name}
									class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder="Enter your name"
								/>
							</div>

							<div>
								<label for="email" class="block text-sm font-medium">
									Email
								</label>
								<input
									id="email"
									type="email"
									bind:value={profile.email}
									class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder="Enter your email"
								/>
							</div>

							<div>
								<label for="bio" class="block text-sm font-medium">
									Bio
								</label>
								<textarea
									id="bio"
									bind:value={profile.bio}
									rows="4"
									class="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder="Tell us about yourself"
								></textarea>
							</div>

							<button
								type="submit"
								class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							>
								Save Changes
							</button>
						</form>
					</div>
				{:else if activeTab === 'notifications'}
					<div>
						<h2 class="text-xl font-semibold">Notifications</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Manage how you receive notifications
						</p>

						<div class="mt-6 space-y-4">
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Email Notifications</p>
									<p class="text-sm text-muted-foreground">
										Receive notifications via email
									</p>
								</div>
								<label class="relative inline-flex cursor-pointer items-center">
									<input
										type="checkbox"
										bind:checked={notifications.email}
										onchange={saveNotifications}
										class="peer sr-only"
									/>
									<div
										class="peer h-6 w-11 rounded-full bg-input after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2"
									></div>
								</label>
							</div>

							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Push Notifications</p>
									<p class="text-sm text-muted-foreground">
										Receive push notifications in your browser
									</p>
								</div>
								<label class="relative inline-flex cursor-pointer items-center">
									<input
										type="checkbox"
										bind:checked={notifications.push}
										onchange={saveNotifications}
										class="peer sr-only"
									/>
									<div
										class="peer h-6 w-11 rounded-full bg-input after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2"
									></div>
								</label>
							</div>

							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Product Updates</p>
									<p class="text-sm text-muted-foreground">
										Get notified about new features and updates
									</p>
								</div>
								<label class="relative inline-flex cursor-pointer items-center">
									<input
										type="checkbox"
										bind:checked={notifications.updates}
										onchange={saveNotifications}
										class="peer sr-only"
									/>
									<div
										class="peer h-6 w-11 rounded-full bg-input after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2"
									></div>
								</label>
							</div>
						</div>
					</div>
				{:else if activeTab === 'privacy'}
					<div>
						<h2 class="text-xl font-semibold">
							Privacy & Security
						</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Manage your privacy and security settings
						</p>

						<div class="mt-6 space-y-6">
							<div>
								<h3 class="font-medium">Password</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									Change your password to keep your account secure
								</p>
								<button
									class="mt-3 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
								>
									Change Password
								</button>
							</div>

							<div class="border-t pt-6">
								<h3 class="font-medium">Two-Factor Authentication</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									Add an extra layer of security to your account
								</p>
								<button
									class="mt-3 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
								>
									Enable 2FA
								</button>
							</div>

							<div class="border-t pt-6">
								<h3 class="font-medium text-destructive">Danger Zone</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									Permanently delete your account and all associated data
								</p>
								<button
									class="mt-3 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
								>
									Delete Account
								</button>
							</div>
						</div>
					</div>
				{/if}
				</div>
			</div>
		</div>
	</div>
</div>
