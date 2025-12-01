import type { User, Chat, Message, Session } from './schema';

export interface DatabaseAdapter {
	// Chats
	createChat(chat: { id: string; userId: string; title: string }): Promise<void>;
	getChats(userId?: string): Promise<ChatWithMessages[]>;
	getChat(chatId: string): Promise<ChatWithMessages | null>;
	updateChat(chatId: string, data: { title?: string; updatedAt: Date }): Promise<void>;
	deleteChat(chatId: string): Promise<void>;

	// Messages
	addMessage(message: {
		chatId: string;
		role: 'user' | 'assistant';
		content: string;
		model?: string;
		thinking?: string;
	}): Promise<void>;
	getMessages(chatId: string): Promise<MessageData[]>;

	// Users
	createUser(user: {
		id: string;
		email: string;
		username?: string;
		passwordHash: string;
	}): Promise<void>;
	getUser(userId: string): Promise<UserData | null>;
	getUserByEmail(email: string): Promise<UserData | null>;

	// Sessions
	createSession(session: {
		id: string;
		userId: string;
		secretHash: Buffer;
		expiresAt: Date;
	}): Promise<void>;
	getSession(sessionId: string): Promise<Session | null>;
	deleteSession(sessionId: string): Promise<void>;
	deleteExpiredSessions(): Promise<void>;
	getUserSessions(userId: string): Promise<Session[]>;

	close(): Promise<void>;
}

export type UserData = User;
export type MessageData = Message;
export type ChatWithMessages = Chat & { messages: MessageData[] };
