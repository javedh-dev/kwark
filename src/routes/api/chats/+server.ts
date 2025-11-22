import { json } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET all chats
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const chats = await db.getChats(locals.user.id);
	return json(chats);
};

// POST create new chat
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id, title } = await request.json();

	await db.createChat({
		id,
		userId: locals.user.id,
		title: title || 'New Chat'
	});

	const chat = await db.getChat(id);
	return json(chat, { status: 201 });
};
