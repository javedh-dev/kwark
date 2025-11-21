<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Hexagon, MessageCircle, SquarePen, Trash2 } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';

	function handleNewChat() {
		chatStore.createNewChat();
	}

	function handleSelectChat(chatId: string) {
		chatStore.selectChat(chatId);
	}

	function handleDeleteChat(chatId: string, event: MouseEvent) {
		event.stopPropagation();
		if (confirm('Are you sure you want to delete this chat?')) {
			chatStore.deleteChat(chatId);
		}
	}

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		return date.toLocaleDateString();
	}
</script>

<Sidebar.Root class="shadow-none">
	<Sidebar.Header>
		<header class="flex flex-row items-center gap-4 py-1">
			<Hexagon class="h-5 w-5" />
			<h1 class="text-md text-start font-semibold text-gray-900 dark:text-gray-100">NanoChat</h1>
		</header>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Button variant="ghost" class="w-full justify-start gap-2" onclick={handleNewChat}>
					<SquarePen class="mr-2 h-4 w-4" />
					New Chat
				</Button>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Chats</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				{#if chatStore.chats.length === 0}
					<div class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
						No chats yet. Start a new conversation!
					</div>
				{:else}
					<div class="space-y-1">
						{#each chatStore.chats as chat (chat.id)}
							<div
								class="group flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 {chatStore.currentChatId ===
								chat.id
									? 'bg-gray-100 dark:bg-gray-800'
									: ''}"
								onclick={() => handleSelectChat(chat.id)}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && handleSelectChat(chat.id)}
							>
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<MessageCircle class="h-4 w-4 shrink-0" />
									<div class="min-w-0 flex-1 text-left">
										<div class="truncate font-medium">{chat.title}</div>
										<div class="text-xs text-gray-500 dark:text-gray-400">
											{formatDate(chat.updatedAt)}
										</div>
									</div>
								</div>
								<button
									class="ml-2 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
									onclick={(e) => handleDeleteChat(chat.id, e)}
									aria-label="Delete chat"
								>
									<Trash2 class="h-4 w-4 text-gray-500 hover:text-red-500 dark:text-gray-400" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
