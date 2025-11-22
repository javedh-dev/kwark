<script lang="ts">
	import { Diamonds } from 'svelte-loading-spinners';
</script>

<div class="group relative -mx-4 flex gap-4 px-4 py-6">
	<div class="flex shrink-0 items-center justify-center gap-2 rounded-full">
		<span class="rounded-full bg-gray-200 p-2 text-sm font-medium dark:bg-gray-800">AI</span>
		<Diamonds size="30" unit="px" duration="3s" color="var(--color-primary)" />
	</div>
</div>
