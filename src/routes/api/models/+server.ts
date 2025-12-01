import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';

const db = getDatabase();

export const GET: RequestHandler = async ({ url }) => {
	const connectionId = url.searchParams.get('connectionId');
	
	let apiKey = '';
	let baseUrl = '';

	// If connectionId is provided, use that connection
	// Otherwise, try to get the default connection from database
	if (connectionId) {
		const connection = await db.getAiConnection(connectionId);
		if (!connection) {
			console.error('AI connection not found:', connectionId);
			throw error(404, 'AI connection not found');
		}
		apiKey = connection.apiKey;
		baseUrl = connection.baseUrl;
		console.log('Using connection:', connection.name, 'URL:', baseUrl);
	} else {
		const defaultConnection = await db.getDefaultAiConnection();
		if (!defaultConnection) {
			console.error('No default AI connection configured');
			throw error(400, 'No default AI connection configured. Please add one in Settings.');
		}
		apiKey = defaultConnection.apiKey;
		baseUrl = defaultConnection.baseUrl;
		console.log('Using default connection:', defaultConnection.name, 'URL:', baseUrl);
	}

	if (!apiKey || !baseUrl) {
		console.error('Invalid AI connection configuration');
		throw error(400, 'Invalid AI connection configuration');
	}

	try {
		// Fetch models from the LLM API
		const modelsUrl = `${baseUrl}/models`;
		console.log('Fetching models from:', modelsUrl);
		
		const response = await fetch(modelsUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Failed to fetch models from API:', response.status, response.statusText, errorText);
			throw error(response.status, `Failed to fetch models: ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Received models data:', data);

		const models =
			data.data?.map((model: any) => ({
				value: model.id,
				label: model.id
			})) || [];

		console.log('Returning models:', models.length);
		return json(models);
	} catch (err: any) {
		console.error('Error fetching models:', err);
		if (err.status) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Failed to fetch models from API');
	}
};
