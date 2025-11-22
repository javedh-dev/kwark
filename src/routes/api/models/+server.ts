import { json } from '@sveltejs/kit';
import { LLM_API_KEY, LLM_BASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const apiKey = LLM_API_KEY || '';
		const baseUrl = LLM_BASE_URL || 'https://api.openai.com/v1';

		if (!apiKey) {
			console.warn('LLM_API_KEY not configured, using fallback models');
			return json([]);
		}

		// Fetch models from the LLM API
		const response = await fetch(`${baseUrl}/models`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error('Failed to fetch models from API:', response.statusText);
			return json([]);
		}

		const data = await response.json();

		console.log('Fetched models from API:', data.data);

		const models =
			data.data?.map((model: any) => ({
				value: model.id,
				label: model.id
			})) || [];

		return json(models);
	} catch (error) {
		console.error('Error fetching models:', error);
		return json([]);
	}
};
