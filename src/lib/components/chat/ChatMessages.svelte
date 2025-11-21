<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ChatMessage from './ChatMessage.svelte';
	import EmptyState from './EmptyState.svelte';
	import LoadingIndicator from './LoadingIndicator.svelte';
	import type { Message } from '$lib/stores/chatStore.svelte';

	interface Props {
		messages: Message[];
		isLoading: boolean;
	}

	let { messages, isLoading }: Props = $props();
</script>

<ScrollArea class="flex-1">
	<div class="mx-auto max-w-3xl">
		{#if messages.length === 0}
			<EmptyState />
		{:else}
			<div class="space-y-4 px-4 py-6">
				{#each messages as message (message.id)}
					<ChatMessage {message} />
				{/each}
				{#if isLoading}
					<LoadingIndicator />
				{/if}
			</div>
		{/if}
	</div>
</ScrollArea>
