import { chatStore, type Message } from '$lib/stores/chatStore.svelte';

export function useChat() {
    let messages = $state<Message[]>([]);
    let input = $state('');
    let isLoading = $state(false);
    let currentChatId = $state<string | null>(null);
    let selectedModel = $state('openrouter/openai/gpt-oss-20b:free');

    // Load current chat messages when chat changes
    $effect(() => {
        const currentChat = chatStore.currentChat;
        // Only reload if we're switching to a different chat and not currently loading
        if (currentChat && currentChat.id !== currentChatId && !isLoading) {
            currentChatId = currentChat.id;
            messages = [...currentChat.messages];
        } else if (!currentChat && !isLoading) {
            currentChatId = null;
            messages = [];
        }
    });

    async function sendMessage() {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        input = '';

        const userMessageId = Date.now();
        messages = [...messages, { id: userMessageId, role: 'user', content: userMessage }];
        isLoading = true;

        const assistantMessageId = Date.now() + 1;
        messages = [...messages, { id: assistantMessageId, role: 'assistant', content: '' }];

        // Save user message immediately
        chatStore.updateCurrentChat(messages.filter((m) => m.id !== assistantMessageId));

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages
                        .filter((m) => m.id !== assistantMessageId)
                        .map((m) => ({ role: m.role, content: m.content })),
                    model: selectedModel
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const content = JSON.parse(line.slice(6));
                            accumulatedContent += content;

                            messages = messages.map((m) =>
                                m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
                            );
                        } catch (e) {
                            console.error('Error parsing streamed content:', e, 'Line:', line);
                        }
                    }
                }
            }

            // Save complete conversation
            chatStore.updateCurrentChat(messages);
        } catch (error) {
            console.error('Error sending message:', error);
            messages = messages.map((m) =>
                m.id === assistantMessageId
                    ? { ...m, content: 'Sorry, there was an error processing your request.' }
                    : m
            );
            chatStore.updateCurrentChat(messages);
        } finally {
            isLoading = false;
        }
    }

    return {
        get messages() {
            return messages;
        },
        get input() {
            return input;
        },
        set input(value: string) {
            input = value;
        },
        get isLoading() {
            return isLoading;
        },
        get selectedModel() {
            return selectedModel;
        },
        set selectedModel(value: string) {
            selectedModel = value;
        },
        sendMessage
    };
}
