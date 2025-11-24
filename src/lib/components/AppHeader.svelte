<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/';
	import { ModelSelector } from '$lib/components/chat';
	import { chatStore } from '$lib/stores/chatStore.svelte';
</script>

<div class="flex w-full flex-row items-center justify-between">
	<div class="flex flex-row items-center">
		<Sidebar.Trigger class="shrink-0" />
		<ModelSelector bind:value={chatStore.selectedModel} />
	</div>
</div>
