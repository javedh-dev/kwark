import { json, error } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import type { RequestHandler } from './$types';

const db = getDatabase('sqlite');

// GET user's model preferences
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const preferences = await db.getModelPreferences(locals.user.id);
	return json(preferences);
};

// POST update model preference
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { connectionId, modelId, isEnabled } = await request.json();

	if (!connectionId || !modelId || typeof isEnabled !== 'boolean') {
		throw error(400, 'Invalid request body');
	}

	await db.setModelPreference(locals.user.id, connectionId, modelId, isEnabled);

	return json({ success: true });
};
