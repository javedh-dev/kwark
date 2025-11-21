<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Plus, MessageSquare, Trash2 } from '@lucide/svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';

	interface Props {
		onNewChat: () => void;
	}

	let { onNewChat }: Props = $props();

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;

		return date.toLocaleDateString();
	}

	function handleDeleteChat(chatId: string, event: MouseEvent) {
		event.stopPropagation();
		if (confirm('Are you sure you want to delete this chat?')) {
			chatStore.deleteChat(chatId);
		}
	}
</script>

<div
	class="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
>
	<!-- Header -->
	<div class="border-b border-gray-200 p-4 dark:border-gray-800">
		<Button onclick={onNewChat} class="w-full" variant="default">
			<Plus class="mr-2 h-4 w-4" />
			New Chat
		</Button>
	</div>

	<!-- Chat List -->
	<ScrollArea class="flex-1">
		<div class="space-y-1 p-2">
			{#each chatStore.chats as chat (chat.id)}
				<div
					class="group relative flex w-full cursor-pointer items-start gap-2 rounded-lg px-3 py-2 transition-colors
						{chatStore.currentChatId === chat.id
						? 'bg-gray-200 dark:bg-gray-800'
						: 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}"
					onclick={() => chatStore.selectChat(chat.id)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							chatStore.selectChat(chat.id);
						}
					}}
				>
					<MessageSquare class="mt-0.5 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
							{chat.title}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							{formatDate(chat.updatedAt)}
						</p>
					</div>
					<button
						onclick={(e) => handleDeleteChat(chat.id, e)}
						class="opacity-0 transition-opacity group-hover:opacity-100"
						aria-label="Delete chat"
					>
						<Trash2 class="h-4 w-4 text-gray-500 hover:text-red-500 dark:text-gray-400" />
					</button>
				</div>
			{/each}

			{#if chatStore.chats.length === 0}
				<div class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
					No chats yet. Start a new conversation!
				</div>
			{/if}
		</div>
	</ScrollArea>
</div>
