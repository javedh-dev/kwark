<script lang="ts">
	import '../layout.css';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/sidebar/AppSidebar.svelte';
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/themeStore.svelte';

	let { children, data } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		{@render children?.()}
	</main>
</Sidebar.Provider>
