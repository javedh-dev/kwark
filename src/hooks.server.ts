import { getDatabase } from '$lib/db';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Initialize database on server start
if (!existsSync('./data')) {
    await mkdir('./data', { recursive: true });
}

// Initialize database connection
getDatabase('sqlite');

console.log('✓ Database initialized');
