<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

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

{@render children?.()}
