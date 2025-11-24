<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import {
		Hexagon,
		MessageCircle,
		SquarePen,
		Trash2,
		Pencil,
		ChevronDown,
		CircleOff
	} from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import * as Collapsible from '../ui/collapsible';

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

	let editingChatId = $state<string | null>(null);
	let editTitle = $state('');

	function startRename(chatId: string, currentTitle: string, event: MouseEvent) {
		event.stopPropagation();
		editingChatId = chatId;
		editTitle = currentTitle;
	}

	async function saveRename(chatId: string) {
		if (editTitle.trim()) {
			await chatStore.renameChat(chatId, editTitle.trim());
		}
		editingChatId = null;
		editTitle = '';
	}

	function cancelRename() {
		editingChatId = null;
		editTitle = '';
	}

	function handleKeydown(e: KeyboardEvent, chatId: string) {
		if (e.key === 'Enter') {
			saveRename(chatId);
		} else if (e.key === 'Escape') {
			cancelRename();
		}
	}
</script>

<Sidebar.Root class="shadow-none">
	<Sidebar.Header>
		<div class="flex items-center gap-2 px-2 py-4">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg">
				<img src="/logo.svg" alt="Kwark Logo" class="h-8 w-8" />
			</div>
			<span class="text-lg font-bold">Kwark</span>
		</div>
		<div class="px-2">
			<Button onclick={handleNewChat} class="w-full justify-start gap-2" variant="outline">
				<SquarePen class="h-4 w-4" />
				New Chat
			</Button>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<Collapsible.Root open class="group/collapsible">
			<Sidebar.Group>
				<Collapsible.Trigger>
					<Sidebar.GroupLabel
						class="flex cursor-pointer items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						Chats
						<ChevronDown
							class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
						/>
					</Sidebar.GroupLabel>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.GroupContent>
						{#if chatStore.chats.length === 0}
							<div
								class="flex h-full items-center justify-center gap-2 px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-400"
							>
								<CircleOff class="h-4 w-4" />
								No Chats Found
							</div>
						{:else}
							<div class="space-y-1">
								{#each chatStore.chats as chat (chat.id)}
									<div
										class="group flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-1 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 {chatStore.currentChatId ===
										chat.id
											? 'bg-gray-100 dark:bg-gray-800'
											: ''}"
										onclick={() => handleSelectChat(chat.id)}
										role="button"
										tabindex="0"
										onkeydown={(e) => e.key === 'Enter' && handleSelectChat(chat.id)}
									>
										<div class="flex flex-1 items-center gap-2 overflow-hidden">
											<MessageCircle class="h-4 w-4 shrink-0 text-gray-500" />
											{#if editingChatId === chat.id}
												<!-- svelte-ignore a11y_autofocus -->
												<input
													type="text"
													bind:value={editTitle}
													class="h-6 w-full min-w-0 rounded border border-gray-300 bg-white px-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
													onclick={(e) => e.stopPropagation()}
													onkeydown={(e) => handleKeydown(e, chat.id)}
													onblur={() => saveRename(chat.id)}
													autofocus
												/>
											{:else}
												<span class="truncate">{chat.title}</span>
											{/if}
										</div>
										{#if editingChatId !== chat.id}
											<div
												class="flex items-center opacity-0 transition-opacity group-hover:opacity-100"
											>
												<button
													class="mr-1 p-1 hover:text-blue-500"
													onclick={(e) => startRename(chat.id, chat.title, e)}
													aria-label="Rename chat"
												>
													<Pencil class="h-3.5 w-3.5" />
												</button>
												<button
													class="p-1 hover:text-red-500"
													onclick={(e) => handleDeleteChat(chat.id, e)}
													aria-label="Delete chat"
												>
													<Trash2 class="h-3.5 w-3.5" />
												</button>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</Sidebar.GroupContent>
				</Collapsible.Content>
			</Sidebar.Group>
		</Collapsible.Root>
	</Sidebar.Content>

	<Sidebar.Footer>
		<div class="flex items-center justify-between p-4">
			<div class="text-xs text-gray-500">v0.0.1</div>
			<ThemeToggle />
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
