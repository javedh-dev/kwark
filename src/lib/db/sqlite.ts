import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, desc, lt } from 'drizzle-orm';
import * as schema from './schema';
import type { DatabaseAdapter, ChatWithMessages, MessageData, UserData } from './types';

export class SQLiteAdapter implements DatabaseAdapter {
	private sqlite: Database.Database;
	private db: ReturnType<typeof drizzle>;

	constructor(dbPath: string = './data/kwark.db') {
		this.sqlite = new Database(dbPath);
		this.db = drizzle(this.sqlite, { schema });
		this.initDatabase();
	}

	private initDatabase() {
		// Create tables if they don't exist
		this.sqlite.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				email TEXT UNIQUE NOT NULL,
				username TEXT,
				password_hash TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS sessions (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				secret_hash BLOB NOT NULL,
				created_at INTEGER NOT NULL,
				expires_at INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS chats (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS messages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
				role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
				content TEXT NOT NULL,
				model TEXT,
				created_at INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS ai_connections (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				base_url TEXT NOT NULL,
				api_key TEXT NOT NULL,
				default_model TEXT,
				is_default INTEGER NOT NULL DEFAULT 0,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			);

			CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
			CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
			CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
		`);
	}

	async createChat(chat: { id: string; userId: string; title: string }): Promise<void> {
		const now = new Date();
		await this.db.insert(schema.chats).values({
			id: chat.id,
			userId: chat.userId,
			title: chat.title,
			createdAt: now,
			updatedAt: now
		});
	}

	async getChats(userId?: string): Promise<ChatWithMessages[]> {
		const chatsData = userId
			? await this.db
					.select()
					.from(schema.chats)
					.where(eq(schema.chats.userId, userId))
					.orderBy(desc(schema.chats.updatedAt))
			: await this.db.select().from(schema.chats).orderBy(desc(schema.chats.updatedAt));

		const chatsWithMessages = await Promise.all(
			chatsData.map(async (chat) => {
				const messages = await this.getMessages(chat.id);
				return {
					...chat,
					messages
				};
			})
		);

		return chatsWithMessages;
	}

	async getChat(chatId: string): Promise<ChatWithMessages | null> {
		const chat = await this.db.select().from(schema.chats).where(eq(schema.chats.id, chatId));

		if (chat.length === 0) return null;

		const messages = await this.getMessages(chatId);
		return {
			...chat[0],
			messages
		};
	}

	async updateChat(chatId: string, data: { title?: string; updatedAt: Date }): Promise<void> {
		await this.db.update(schema.chats).set(data).where(eq(schema.chats.id, chatId));
	}

	async deleteChat(chatId: string): Promise<void> {
		await this.db.delete(schema.chats).where(eq(schema.chats.id, chatId));
	}

	async addMessage(message: {
		chatId: string;
		role: 'user' | 'assistant';
		content: string;
		model?: string;
		thinking?: string;
	}): Promise<void> {
		await this.db.insert(schema.messages).values({
			chatId: message.chatId,
			role: message.role,
			content: message.content,
			model: message.model,
			thinking: message.thinking,
			createdAt: new Date()
		});

		// Update chat's updatedAt timestamp
		await this.updateChat(message.chatId, { updatedAt: new Date() });
	}

	async getMessages(chatId: string): Promise<MessageData[]> {
		return await this.db
			.select()
			.from(schema.messages)
			.where(eq(schema.messages.chatId, chatId))
			.orderBy(schema.messages.createdAt);
	}

	// Session operations
	async createSession(session: {
		id: string;
		userId: string;
		secretHash: Buffer;
		expiresAt: Date;
	}): Promise<void> {
		const now = new Date();
		await this.db.insert(schema.sessions).values({
			id: session.id,
			userId: session.userId,
			secretHash: session.secretHash,
			createdAt: now,
			expiresAt: session.expiresAt
		});
	}

	async getSession(sessionId: string): Promise<typeof schema.sessions.$inferSelect | null> {
		const sessions = await this.db
			.select()
			.from(schema.sessions)
			.where(eq(schema.sessions.id, sessionId));

		if (sessions.length === 0) {
			return null;
		}

		const session = sessions[0];

		// Check if session is expired
		if (new Date() > session.expiresAt) {
			await this.deleteSession(sessionId);
			return null;
		}

		return session;
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
	}

	async deleteExpiredSessions(): Promise<void> {
		const now = new Date();
		await this.db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, now));
	}

	async getUserSessions(userId: string): Promise<(typeof schema.sessions.$inferSelect)[]> {
		return await this.db.select().from(schema.sessions).where(eq(schema.sessions.userId, userId));
	}

	// User operations for auth
	async createUser(user: {
		id: string;
		email: string;
		username?: string;
		passwordHash: string;
	}): Promise<void> {
		const now = new Date();
		await this.db.insert(schema.users).values({
			id: user.id,
			email: user.email,
			username: user.username || null,
			passwordHash: user.passwordHash,
			createdAt: now,
			updatedAt: now
		});
	}

	async getUser(userId: string): Promise<UserData | null> {
		const users = await this.db.select().from(schema.users).where(eq(schema.users.id, userId));
		return users.length > 0 ? users[0] : null;
	}

	async getUserByEmail(email: string): Promise<UserData | null> {
		const users = await this.db.select().from(schema.users).where(eq(schema.users.email, email));
		return users.length > 0 ? users[0] : null;
	}

	// AI Connection operations
	async createAiConnection(connection: {
		id: string;
		name: string;
		baseUrl: string;
		apiKey: string;
		defaultModel?: string;
		isDefault?: boolean;
	}): Promise<void> {
		const now = new Date();
		
		// If this is set as default, unset all other defaults
		if (connection.isDefault) {
			await this.db.update(schema.aiConnections).set({ isDefault: false });
		}

		await this.db.insert(schema.aiConnections).values({
			id: connection.id,
			name: connection.name,
			baseUrl: connection.baseUrl,
			apiKey: connection.apiKey,
			defaultModel: connection.defaultModel || null,
			isDefault: connection.isDefault || false,
			createdAt: now,
			updatedAt: now
		});
	}

	async getAiConnections(): Promise<(typeof schema.aiConnections.$inferSelect)[]> {
		return await this.db.select().from(schema.aiConnections).orderBy(desc(schema.aiConnections.createdAt));
	}

	async getAiConnection(id: string): Promise<(typeof schema.aiConnections.$inferSelect) | null> {
		const connections = await this.db
			.select()
			.from(schema.aiConnections)
			.where(eq(schema.aiConnections.id, id));
		return connections.length > 0 ? connections[0] : null;
	}

	async getDefaultAiConnection(): Promise<(typeof schema.aiConnections.$inferSelect) | null> {
		const connections = await this.db
			.select()
			.from(schema.aiConnections)
			.where(eq(schema.aiConnections.isDefault, true));
		return connections.length > 0 ? connections[0] : null;
	}

	async updateAiConnection(
		id: string,
		data: {
			name?: string;
			baseUrl?: string;
			apiKey?: string;
			defaultModel?: string;
			isDefault?: boolean;
		}
	): Promise<void> {
		// If setting as default, unset all other defaults
		if (data.isDefault) {
			await this.db.update(schema.aiConnections).set({ isDefault: false });
		}

		await this.db
			.update(schema.aiConnections)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.aiConnections.id, id));
	}

	async deleteAiConnection(id: string): Promise<void> {
		await this.db.delete(schema.aiConnections).where(eq(schema.aiConnections.id, id));
	}

	async close(): Promise<void> {
		this.sqlite.close();
	}
}
