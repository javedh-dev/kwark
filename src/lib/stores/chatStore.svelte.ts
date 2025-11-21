interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'nanochat_conversations';

function loadChatsFromStorage(): Chat[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading chats from storage:', error);
        return [];
    }
}

function saveChatsToStorage(chats: Chat[]) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
        console.error('Error saving chats to storage:', error);
    }
}

function generateChatTitle(messages: Message[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New Chat';

    const content = firstUserMessage.content.trim();
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
}

function createChatStore() {
    let chats = $state<Chat[]>(loadChatsFromStorage());
    let currentChatId = $state<string | null>(null);

    return {
        get chats() {
            return chats;
        },
        get currentChatId() {
            return currentChatId;
        },
        get currentChat() {
            return chats.find(c => c.id === currentChatId) || null;
        },

        createNewChat(): string {
            const newChat: Chat = {
                id: crypto.randomUUID(),
                title: 'New Chat',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            chats = [newChat, ...chats];
            currentChatId = newChat.id;
            saveChatsToStorage(chats);

            return newChat.id;
        },

        selectChat(chatId: string) {
            const chat = chats.find(c => c.id === chatId);
            if (chat) {
                currentChatId = chatId;
            }
        },

        updateCurrentChat(messages: Message[]) {
            if (!currentChatId) {
                this.createNewChat();
            }

            chats = chats.map(chat => {
                if (chat.id === currentChatId) {
                    const title = chat.messages.length === 0 ? generateChatTitle(messages) : chat.title;
                    return {
                        ...chat,
                        messages,
                        title,
                        updatedAt: Date.now()
                    };
                }
                return chat;
            });

            saveChatsToStorage(chats);
        },

        deleteChat(chatId: string) {
            chats = chats.filter(c => c.id !== chatId);

            if (currentChatId === chatId) {
                currentChatId = chats.length > 0 ? chats[0].id : null;
            }

            saveChatsToStorage(chats);
        },

        clearAllChats() {
            chats = [];
            currentChatId = null;
            saveChatsToStorage(chats);
        }
    };
}

export const chatStore = createChatStore();
export type { Message, Chat };
