import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';

const db = getDatabase();

// GET single AI connection
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const connection = await db.getAiConnection(params.id);
		if (!connection) {
			throw error(404, 'Connection not found');
		}
		return json(connection);
	} catch (err: any) {
		console.error('Error fetching AI connection:', err);
		throw error(err.status || 500, err.message || 'Failed to fetch AI connection');
	}
};

// PATCH update AI connection
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const data = await request.json();
		await db.updateAiConnection(params.id, data);
		return json({ success: true });
	} catch (err: any) {
		console.error('Error updating AI connection:', err);
		throw error(err.status || 500, err.message || 'Failed to update AI connection');
	}
};

// DELETE AI connection
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		await db.deleteAiConnection(params.id);
		return json({ success: true });
	} catch (err: any) {
		console.error('Error deleting AI connection:', err);
		throw error(err.status || 500, err.message || 'Failed to delete AI connection');
	}
};
