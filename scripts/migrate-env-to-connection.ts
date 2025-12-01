#!/usr/bin/env tsx
/**
 * Migration script to convert .env LLM configuration to AI Connection
 * 
 * This script reads LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL from .env
 * and creates an AI connection in the database.
 * 
 * Usage: npx tsx scripts/migrate-env-to-connection.ts
 */

import { getDatabase } from '../src/lib/db/index.js';
import { nanoid } from 'nanoid';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function migrate() {
	const db = getDatabase();

	try {
		const baseUrl = process.env.LLM_BASE_URL;
		const apiKey = process.env.LLM_API_KEY;
		const model = process.env.LLM_MODEL;

		if (!baseUrl || !apiKey) {
			console.log('❌ No LLM configuration found in .env file');
			console.log('   Please add AI connections through the Settings page instead.');
			process.exit(1);
		}

		// Check if a connection with this base URL already exists
		const existingConnections = await db.getAiConnections();
		const existing = existingConnections.find(c => c.baseUrl === baseUrl);

		if (existing) {
			console.log('✅ AI connection already exists:');
			console.log(`   Name: ${existing.name}`);
			console.log(`   Base URL: ${existing.baseUrl}`);
			console.log(`   Default: ${existing.isDefault ? 'Yes' : 'No'}`);
			return;
		}

		// Determine a friendly name based on the URL
		let name = 'Default Connection';
		if (baseUrl.includes('openai.com')) {
			name = 'OpenAI';
		} else if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
			name = 'Local LLM';
		} else {
			// Extract domain name
			try {
				const url = new URL(baseUrl);
				name = url.hostname.split('.')[0] || 'Custom API';
			} catch {
				name = 'Custom API';
			}
		}

		// Create the connection
		await db.createAiConnection({
			id: nanoid(),
			name,
			baseUrl,
			apiKey,
			defaultModel: model || undefined,
			isDefault: true
		});

		console.log('✅ Successfully migrated .env configuration to AI connection:');
		console.log(`   Name: ${name}`);
		console.log(`   Base URL: ${baseUrl}`);
		console.log(`   Default Model: ${model || 'Not set'}`);
		console.log(`   Set as Default: Yes`);
		console.log('');
		console.log('💡 You can now remove LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL from your .env file');
		console.log('   Manage connections through Settings > AI Connections');

	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await db.close();
	}
}

migrate();
