import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';

const db = getDatabase('sqlite');

export const POST: RequestHandler = async ({ locals, cookies }) => {
	try {
		// Delete session from database if it exists
		if (locals.session) {
			await db.deleteSession(locals.session.id);
		}

		// Clear session cookie
		cookies.delete('session', {
			path: '/'
		});

		return json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: 'An error occurred during logout' }, { status: 500 });
	}
};
