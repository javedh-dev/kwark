import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';
import { nanoid } from 'nanoid';

const db = getDatabase();

// GET all AI connections
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const connections = await db.getAiConnections();
		// Don't expose API keys in the list
		const sanitized = connections.map((conn) => ({
			...conn,
			apiKey: '***' + conn.apiKey.slice(-4)
		}));
		return json(sanitized);
	} catch (err) {
		console.error('Error fetching AI connections:', err);
		throw error(500, 'Failed to fetch AI connections');
	}
};

// POST create new AI connection
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { name, baseUrl, apiKey, defaultModel, isDefault } = await request.json();

		if (!name || !baseUrl || !apiKey) {
			throw error(400, 'Name, base URL, and API key are required');
		}

		const id = nanoid();
		await db.createAiConnection({
			id,
			name,
			baseUrl,
			apiKey,
			defaultModel,
			isDefault: isDefault || false
		});

		return json({ success: true, id });
	} catch (err: any) {
		console.error('Error creating AI connection:', err);
		throw error(err.status || 500, err.message || 'Failed to create AI connection');
	}
};
