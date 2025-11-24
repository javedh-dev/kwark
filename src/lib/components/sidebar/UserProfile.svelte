<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Avatar from '$lib/components/ui/avatar';
	import { ChevronsUpDown, LogOut, Settings, User, UserRound } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { user } = $props<{ user: { id: string; email: string; username?: string | null } }>();

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			goto('/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<div class="flex items-center gap-2">
							<UserRound class="h-9 w-9 rounded-full bg-accent p-2 text-foreground" />
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{user.username || 'User'}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[--sidebar-width-min] min-w-56 rounded-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<UserRound class="h-9 w-9 rounded-full bg-accent p-2 text-foreground" />
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{user.username || 'User'}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<User class="mr-2 h-4 w-4" />
						Profile
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<Settings class="mr-2 h-4 w-4" />
						Settings
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleLogout}>
					<LogOut class="mr-2 h-4 w-4" />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
