<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/sidebar/AppSidebar.svelte';
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/themeStore.svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		{@render children?.()}
	</main>
</Sidebar.Provider>
