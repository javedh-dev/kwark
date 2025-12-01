import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username'),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	secretHash: blob('secret_hash', { mode: 'buffer' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const chats = sqliteTable('chats', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	systemPrompt: text('system_prompt'),
	temperature: text('temperature'),
	llmParams: text('llm_params'), // JSON string of custom LLM parameters
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const messages = sqliteTable('messages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	chatId: text('chat_id')
		.notNull()
		.references(() => chats.id, { onDelete: 'cascade' }),
	role: text('role', { enum: ['user', 'assistant'] }).notNull(),
	content: text('content').notNull(),
	model: text('model'),
	thinking: text('thinking'), // Reasoning/thinking content for models that support it
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const aiConnections = sqliteTable('ai_connections', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	baseUrl: text('base_url').notNull(),
	apiKey: text('api_key').notNull(),
	defaultModel: text('default_model'),
	isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type AiConnection = typeof aiConnections.$inferSelect;
export type InsertAiConnection = typeof aiConnections.$inferInsert;
