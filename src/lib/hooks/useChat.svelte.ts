import { chatStore } from '$lib/stores/chatStore.svelte';

export function useChat() {
	let input = $state('');

	async function sendMessage() {
		if (!input.trim() || chatStore.isSending) return;

		const message = input;
		input = ''; // Clear input immediately

		await chatStore.sendMessage(message);
	}

	return {
		get messages() {
			return chatStore.currentChat?.messages || [];
		},
		get input() {
			return input;
		},
		set input(value: string) {
			input = value;
		},
		get isLoading() {
			return chatStore.isSending || chatStore.isLoading;
		},
		get selectedModel() {
			return chatStore.selectedModel;
		},
		set selectedModel(value: string) {
			chatStore.selectedModel = value;
		},
		sendMessage
	};
}
