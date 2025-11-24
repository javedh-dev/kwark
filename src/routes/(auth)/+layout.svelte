<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	let { children } = $props();

	// Redirect to home if already authenticated
	onMount(async () => {
		try {
			const response = await fetch('/api/auth/user');
			if (response.ok) {
				goto('/');
			}
		} catch (err) {
			// Not authenticated, stay on auth page
		}
	});
</script>

<div class="grid min-h-screen w-full place-items-center overflow-x-hidden bg-background px-4">
	{#key $page.url.pathname}
		<div
			class="col-start-1 row-start-1 flex w-full justify-center"
			in:fade={{ duration: 400, easing: cubicInOut }}
			out:fade={{ duration: 0, delay: 400 }}
		>
			{@render children?.()}
		</div>
	{/key}
</div>
