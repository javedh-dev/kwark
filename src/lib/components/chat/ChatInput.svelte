<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowUp, Paperclip } from '@lucide/svelte';

	interface Props {
		value: string;
		isLoading: boolean;
		onSubmit: () => void;
		onInput: (value: string) => void;
	}

	let { value = $bindable(), isLoading, onSubmit, onInput }: Props = $props();
	let textareaRef: HTMLTextAreaElement | null = $state(null);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSubmit();
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		// Reset height to auto to get the correct scrollHeight
		target.style.height = 'auto';
		// Set height to scrollHeight to fit content
		target.style.height = target.scrollHeight + 'px';
	}

	// Reset height when value changes (e.g., when message is sent and cleared)
	$effect(() => {
		value; // Explicitly track value changes
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = textareaRef.scrollHeight + 'px';
		}
	});
</script>

<div class="border-0 border-gray-200 pb-2 dark:border-gray-800">
	<div class="mx-auto max-w-6xl">
		<form onsubmit={onSubmit}>
			<div class="flex w-full flex-col rounded-3xl border border-input">
				<Textarea
					bind:ref={textareaRef}
					bind:value
					oninput={handleInput}
					onkeydown={handleKeydown}
					placeholder="Ask anything..."
					class="max-h-[200px] min-h-[64px] resize-none border-none bg-transparent px-6 pt-4 pb-0 leading-snug shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent"
					disabled={isLoading}
				/>
				<div class="flex items-center justify-between px-4 pb-2">
					<div class="flex flex-row gap-2">
						<Button type="button" size="sm" variant="outline" class="rounded-4xl" disabled>
							<Paperclip class="h-5 w-5" /> Attach
						</Button>
					</div>
					<Button
						type="submit"
						size="icon"
						disabled={!value.trim() || isLoading}
						class="mb-2 h-9 w-9 rounded-full"
					>
						<ArrowUp class="h-5 w-5" />
					</Button>
				</div>
			</div>
		</form>
	</div>
</div>
