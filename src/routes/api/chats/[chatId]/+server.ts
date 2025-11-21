import { json, error } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET single chat
export const GET: RequestHandler = async ({ params }) => {
    const chat = await db.getChat(params.chatId);

    if (!chat) {
        throw error(404, 'Chat not found');
    }

    return json(chat);
};

// PATCH update chat
export const PATCH: RequestHandler = async ({ params, request }) => {
    const { title } = await request.json();

    await db.updateChat(params.chatId, {
        title,
        updatedAt: new Date()
    });

    const chat = await db.getChat(params.chatId);
    return json(chat);
};

// DELETE chat
export const DELETE: RequestHandler = async ({ params }) => {
    await db.deleteChat(params.chatId);
    return json({ success: true });
};
