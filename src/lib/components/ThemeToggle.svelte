<script lang="ts">
	import { Moon, Sun, Laptop } from '@lucide/svelte';
	import { themeStore } from '$lib/stores/themeStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	function toggleTheme() {
		if (themeStore.theme === 'light') {
			themeStore.setTheme('dark');
		} else if (themeStore.theme === 'dark') {
			themeStore.setTheme('system');
		} else {
			themeStore.setTheme('light');
		}
	}
</script>

<Button variant="ghost" size="icon" onclick={toggleTheme} title="Toggle theme">
	{#if themeStore.theme === 'light'}
		<Sun class="h-[1.2rem] w-[1.2rem]" />
	{:else if themeStore.theme === 'dark'}
		<Moon class="h-[1.2rem] w-[1.2rem]" />
	{:else}
		<Laptop class="h-[1.2rem] w-[1.2rem]" />
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>
