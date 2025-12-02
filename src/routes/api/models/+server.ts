import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';

const db = getDatabase();

export const GET: RequestHandler = async ({ url }) => {
	const connectionId = url.searchParams.get('connectionId');

	let apiKey = '';
	let baseUrl = '';

	if (connectionId) {
		const connection = await db.getAiConnection(connectionId);
		if (!connection) {
			throw error(404, 'AI connection not found');
		}
		apiKey = connection.apiKey;
		baseUrl = connection.baseUrl;
	} else {
		const defaultConnection = await db.getDefaultAiConnection();
		if (!defaultConnection) {
			throw error(400, 'No default AI connection configured. Please add one in Settings.');
		}
		apiKey = defaultConnection.apiKey;
		baseUrl = defaultConnection.baseUrl;
	}

	if (!apiKey || !baseUrl) {
		throw error(400, 'Invalid AI connection configuration');
	}

	try {
		const modelsUrl = `${baseUrl}/models`;

		const response = await fetch(modelsUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw error(response.status, `Failed to fetch models: ${response.statusText}`);
		}

		const data = await response.json();

		const models =
			data.data?.map((model: any) => ({
				value: model.id,
				label: model.id
			})) || [];

		return json(models);
	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		throw error(500, 'Failed to fetch models from API');
	}
};
