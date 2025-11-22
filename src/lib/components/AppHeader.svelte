<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/';
	import { ModelSelector } from '$lib/components/chat';
	import { useChat } from '$lib/hooks/useChat.svelte';
	const chat = useChat();
</script>

<div class="flex flex-row items-center">
	<Sidebar.Trigger class="shrink-0" />
	<ModelSelector bind:value={chat.selectedModel} />
</div>
