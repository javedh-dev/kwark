import { json, error } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET messages for a chat
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Verify user owns the chat
	const chat = await db.getChat(params.chatId);
	if (!chat || chat.userId !== locals.user.id) {
		throw error(403, 'Forbidden');
	}

	const messages = await db.getMessages(params.chatId);
	return json(messages);
};

// POST add message to chat
export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Verify user owns the chat
	const chat = await db.getChat(params.chatId);
	if (!chat || chat.userId !== locals.user.id) {
		throw error(403, 'Forbidden');
	}

	const { role, content, model, thinking } = await request.json();

	await db.addMessage({
		chatId: params.chatId,
		role,
		content,
		...(model && { model }),
		...(thinking && { thinking })
	});

	const messages = await db.getMessages(params.chatId);
	return json(messages, { status: 201 });
};
