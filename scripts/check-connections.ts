#!/usr/bin/env tsx
/**
 * Check AI connections status
 * 
 * Usage: npx tsx scripts/check-connections.ts
 */

import { getDatabase } from '../src/lib/db/index.js';

async function checkConnections() {
	const db = getDatabase();

	try {
		const connections = await db.getAiConnections();

		if (connections.length === 0) {
			console.log('❌ No AI connections configured');
			console.log('');
			console.log('To get started:');
			console.log('1. Start the app: pnpm dev');
			console.log('2. Navigate to Settings > AI Connections');
			console.log('3. Add your first connection');
			console.log('');
			console.log('Or migrate from .env: npx tsx scripts/migrate-env-to-connection.ts');
			process.exit(1);
		}

		console.log(`✅ Found ${connections.length} AI connection(s):\n`);

		connections.forEach((conn, index) => {
			console.log(`${index + 1}. ${conn.name}`);
			console.log(`   Base URL: ${conn.baseUrl}`);
			console.log(`   API Key: ***${conn.apiKey.slice(-4)}`);
			if (conn.defaultModel) {
				console.log(`   Default Model: ${conn.defaultModel}`);
			}
			console.log(`   Default: ${conn.isDefault ? '✓ Yes' : '  No'}`);
			console.log('');
		});

		const defaultConn = connections.find(c => c.isDefault);
		if (!defaultConn) {
			console.log('⚠️  No default connection set');
			console.log('   Set one as default in Settings > AI Connections');
		}

	} catch (error) {
		console.error('❌ Error checking connections:', error);
		process.exit(1);
	} finally {
		await db.close();
	}
}

checkConnections();
