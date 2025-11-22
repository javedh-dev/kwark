import { json, error } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET single chat
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const chat = await db.getChat(params.chatId);

	if (!chat) {
		throw error(404, 'Chat not found');
	}

	// Verify user owns this chat
	if (chat.userId !== locals.user.id) {
		throw error(403, 'Forbidden');
	}

	return json(chat);
};

// PATCH update chat
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// First verify ownership
	const existingChat = await db.getChat(params.chatId);
	if (!existingChat || existingChat.userId !== locals.user.id) {
		throw error(403, 'Forbidden');
	}

	const { title } = await request.json();

	await db.updateChat(params.chatId, {
		title,
		updatedAt: new Date()
	});

	const chat = await db.getChat(params.chatId);
	return json(chat);
};

// DELETE chat
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// First verify ownership
	const existingChat = await db.getChat(params.chatId);
	if (!existingChat || existingChat.userId !== locals.user.id) {
		throw error(403, 'Forbidden');
	}

	await db.deleteChat(params.chatId);
	return json({ success: true });
};
