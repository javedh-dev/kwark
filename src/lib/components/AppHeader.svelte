<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/';
	import { ModelSelector } from '$lib/components/chat';
	import { useChat } from '$lib/hooks/useChat.svelte';
	import { goto } from '$app/navigation';
	import { LogOut } from '@lucide/svelte';

	const chat = useChat();

	let { user } = $props<{ user?: { id: string; email: string; username?: string | null } }>();

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			goto('/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	}
</script>

<div class="flex w-full flex-row items-center justify-between">
	<div class="flex flex-row items-center">
		<Sidebar.Trigger class="shrink-0" />
		<ModelSelector bind:value={chat.selectedModel} />
	</div>

	{#if user}
		<div class="flex items-center gap-3 pr-4">
			<span class="text-sm text-muted-foreground">{user.email}</span>
			<button
				onclick={handleLogout}
				class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
				title="Logout"
			>
				<LogOut size={16} />
				<span>Logout</span>
			</button>
		</div>
	{/if}
</div>
