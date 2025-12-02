<script lang="ts">
	import { AlertCircle, Settings } from '@lucide/svelte';
	import { goto } from '$app/navigation';
</script>

<div class="flex h-full items-center justify-center p-8">
	<div class="max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
		<AlertCircle class="mx-auto h-12 w-12 text-destructive" />
		<h2 class="mt-4 text-xl font-semibold">No AI Connection Configured</h2>
		<p class="mt-2 text-sm text-muted-foreground">
			You need to configure at least one AI connection to start chatting.
		</p>
		<button
			onclick={() => goto('/settings')}
			class="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			<Settings class="h-4 w-4" />
			Go to Settings
		</button>
	</div>
</div>
