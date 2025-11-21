import { json } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET messages for a chat
export const GET: RequestHandler = async ({ params }) => {
    const messages = await db.getMessages(params.chatId);
    return json(messages);
};

// POST add message to chat
export const POST: RequestHandler = async ({ params, request }) => {
    const { role, content, model } = await request.json();

    await db.addMessage({
        chatId: params.chatId,
        role,
        content,
        ...(model && { model })
    });

    const messages = await db.getMessages(params.chatId);
    return json(messages, { status: 201 });
};
