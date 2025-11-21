import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, desc } from 'drizzle-orm';
import * as schema from './schema';
import type { DatabaseAdapter, ChatWithMessages, MessageData, UserData } from './types';

export class SQLiteAdapter implements DatabaseAdapter {
    private sqlite: Database.Database;
    private db: ReturnType<typeof drizzle>;

    constructor(dbPath: string = './data/nanochat.db') {
        this.sqlite = new Database(dbPath);
        this.db = drizzle(this.sqlite, { schema });
        this.initDatabase();
    }

    private initDatabase() {
        // Create tables if they don't exist
        this.sqlite.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				email TEXT UNIQUE,
				username TEXT,
				password_hash TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS chats (
				id TEXT PRIMARY KEY,
				user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS messages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
				role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
				content TEXT NOT NULL,
				created_at INTEGER NOT NULL
			);

			CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
			CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
		`);
    }

    async createChat(chat: { id: string; userId?: string; title: string }): Promise<void> {
        const now = new Date();
        await this.db.insert(schema.chats).values({
            id: chat.id,
            userId: chat.userId || null,
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
    }): Promise<void> {
        await this.db.insert(schema.messages).values({
            chatId: message.chatId,
            role: message.role,
            content: message.content,
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

    // User operations for future auth
    async createUser(user: { id: string; email: string; username?: string }): Promise<void> {
        const now = new Date();
        await this.db.insert(schema.users).values({
            id: user.id,
            email: user.email,
            username: user.username || null,
            passwordHash: null,
            createdAt: now,
            updatedAt: now
        });
    }

    async getUser(userId: string): Promise<UserData | null> {
        const users = await this.db.select().from(schema.users).where(eq(schema.users.id, userId));
        return users.length > 0 ? users[0] : null;
    }

    async getUserByEmail(email: string): Promise<UserData | null> {
        const users = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email));
        return users.length > 0 ? users[0] : null;
    }

    async close(): Promise<void> {
        this.sqlite.close();
    }
}
