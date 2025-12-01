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
	let messagesEndRef: HTMLDivElement | undefined = $state();

	// Auto-scroll to bottom when messages change or loading state changes
	$effect(() => {
		// Track dependencies
		messages.length;
		isLoading;

		// Scroll to bottom
		if (messagesEndRef) {
			messagesEndRef.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
	});
</script>

<div class="min-h-0 flex-1">
	<ScrollArea class="h-full">
		<div class="mx-auto h-full max-w-5xl">
			{#if messages.length === 0}
				<EmptyState />
			{:else}
				<div class="space-y-4 px-8 py-6">
					{#each messages as message, index (message.id)}
						<ChatMessage {message} isStreaming={isLoading && index === messages.length - 1} />
					{/each}
					{#if isLoading}
						<LoadingIndicator />
					{/if}
					<!-- Invisible element to scroll to -->
					<div bind:this={messagesEndRef}></div>
				</div>
			{/if}
		</div>
	</ScrollArea>
</div>
