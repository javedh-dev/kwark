// Database adapter interface for flexibility
export interface DatabaseAdapter {
    // Chat operations
    createChat(chat: { id: string; userId?: string; title: string }): Promise<void>;
    getChats(userId?: string): Promise<ChatWithMessages[]>;
    getChat(chatId: string): Promise<ChatWithMessages | null>;
    updateChat(chatId: string, data: { title?: string; updatedAt: Date }): Promise<void>;
    deleteChat(chatId: string): Promise<void>;

    // Message operations
    addMessage(message: {
        chatId: string;
        role: 'user' | 'assistant';
        content: string;
    }): Promise<void>;
    getMessages(chatId: string): Promise<MessageData[]>;

    // User operations (for future auth)
    createUser?(user: { id: string; email: string; username?: string }): Promise<void>;
    getUser?(userId: string): Promise<UserData | null>;
    getUserByEmail?(email: string): Promise<UserData | null>;

    // Cleanup
    close(): Promise<void>;
}

export interface MessageData {
    id: number;
    chatId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

export interface ChatData {
    id: string;
    userId?: string | null;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatWithMessages extends ChatData {
    messages: MessageData[];
}

export interface UserData {
    id: string;
    email: string | null;
    username?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
