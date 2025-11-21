import { json } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET all chats
export const GET: RequestHandler = async ({ url }) => {
    const userId = url.searchParams.get('userId') || undefined;
    const chats = await db.getChats(userId);
    return json(chats);
};

// POST create new chat
export const POST: RequestHandler = async ({ request }) => {
    const { id, userId, title } = await request.json();

    await db.createChat({
        id,
        userId,
        title: title || 'New Chat'
    });

    const chat = await db.getChat(id);
    return json(chat, { status: 201 });
};
