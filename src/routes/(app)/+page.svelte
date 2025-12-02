<script lang="ts">
	import { ChatMessages, ChatInput } from '$lib/components/chat';
	import { useChat } from '$lib/hooks/useChat.svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import { onMount } from 'svelte';
	import '$lib/utils/markdown';
	import AppHeader from '$lib/components/AppHeader.svelte';

	const chat = useChat();

	onMount(async () => {
		await chatStore.loadChats();
		if (chatStore.chats.length > 0 && !chatStore.currentChatId) {
			chatStore.selectChat(chatStore.chats[0].id);
		}
	});
</script>

<div class="flex h-screen bg-background">
	<div class="flex flex-1 flex-col overflow-hidden px-8">
		<AppHeader />
		<ChatMessages messages={chat.messages} isLoading={chat.isLoading} />
		<div class="shrink-0">
			<ChatInput
				bind:value={chat.input}
				isLoading={chat.isLoading}
				onSubmit={chat.sendMessage}
				onInput={(value: any) => (chat.input = value)}
			/>
		</div>
	</div>
</div>
