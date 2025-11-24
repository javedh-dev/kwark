<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, ...restProps }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 512 512"
	fill="none"
	class={cn('h-8 w-8', className)}
	{...restProps}
>
	<g>
		<!-- Three particles -->
		<circle cx="256" cy="128" r="48" fill="currentColor" />
		<circle cx="145" cy="320" r="48" fill="currentColor" />
		<circle cx="367" cy="320" r="48" fill="currentColor" />

		<!-- Orbital/Connection Lines -->
		<path
			d="M256 128 L145 320 L367 320 Z"
			stroke="currentColor"
			stroke-width="16"
			stroke-linecap="round"
			stroke-linejoin="round"
			fill="none"
			opacity="0.8"
		/>

		<!-- Orbital Rings -->
		<ellipse
			cx="256"
			cy="256"
			rx="180"
			ry="60"
			transform="rotate(0 256 256)"
			stroke="currentColor"
			stroke-width="12"
			stroke-opacity="0.4"
			fill="none"
		/>
		<ellipse
			cx="256"
			cy="256"
			rx="180"
			ry="60"
			transform="rotate(60 256 256)"
			stroke="currentColor"
			stroke-width="12"
			stroke-opacity="0.4"
			fill="none"
		/>
		<ellipse
			cx="256"
			cy="256"
			rx="180"
			ry="60"
			transform="rotate(120 256 256)"
			stroke="currentColor"
			stroke-width="12"
			stroke-opacity="0.4"
			fill="none"
		/>
	</g>
</svg>
