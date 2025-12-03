import { SQLiteAdapter } from './sqlite';
import type { DatabaseAdapter } from './types';

let dbInstance: DatabaseAdapter | null = null;

export function getDatabase(
	type: 'sqlite' = 'sqlite',
	config?: { dbPath?: string }
): DatabaseAdapter {
	if (dbInstance) return dbInstance;

	switch (type) {
		case 'sqlite':
			dbInstance = new SQLiteAdapter(config?.dbPath);
			break;

		default:
			throw new Error(`Unsupported database type: ${type}`);
	}

	return dbInstance;
}

export async function closeDatabase() {
	if (dbInstance) {
		await dbInstance.close();
		dbInstance = null;
	}
}

export * from './types';
export {
	users,
	sessions,
	chats,
	messages,
	aiConnections,
	userModelPreferences,
	type User,
	type InsertUser,
	type Session,
	type InsertSession,
	type Chat,
	type InsertChat,
	type Message,
	type InsertMessage,
	type AiConnection,
	type InsertAiConnection
} from './schema';
