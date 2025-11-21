<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowUp, Paperclip, Wrench } from '@lucide/svelte';

	interface Props {
		value: string;
		isLoading: boolean;
		onSubmit: () => void;
		onInput: (value: string) => void;
	}

	let { value = $bindable(), isLoading, onSubmit, onInput }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSubmit();
		}
	}
</script>

<div class="border-0 border-gray-200 bg-background px-4 py-4 dark:border-gray-800">
	<div class="mx-auto max-w-3xl">
		<form onsubmit={onSubmit}>
			<div class="flex w-full flex-col rounded-3xl border border-input bg-secondary">
				<Textarea
					bind:value
					onkeydown={handleKeydown}
					placeholder="Message ChatGPT..."
					class="resize-none border-none bg-transparent px-6 pt-4 pb-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
					disabled={isLoading}
				/>
				<div class="flex items-center justify-between px-4 pb-4">
					<div>
						<Button type="button" size="sm" variant="outline" class="rounded-4xl" disabled>
							<Paperclip class="h-5 w-5" /> Attach
						</Button>
						<Button type="button" size="sm" variant="outline" class="rounded-4xl" disabled>
							<Wrench class="h-5 w-5" /> Tools
						</Button>
					</div>
					<Button
						type="submit"
						size="icon"
						disabled={!value.trim() || isLoading}
						class="h-9 w-9 rounded-full"
					>
						<ArrowUp class="h-5 w-5" />
					</Button>
				</div>
			</div>
		</form>
		<p class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
			LLMs can make mistakes. Check important info.
		</p>
	</div>
</div>
