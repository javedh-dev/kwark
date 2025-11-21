import { SQLiteAdapter } from './sqlite';
import type { DatabaseAdapter } from './types';

let dbInstance: DatabaseAdapter | null = null;

export function getDatabase(
    type: 'sqlite' = 'sqlite',
    config?: { dbPath?: string }
): DatabaseAdapter {
    if (dbInstance) return dbInstance;

    switch (type) {
        case 'sqlite':
            dbInstance = new SQLiteAdapter(config?.dbPath);
            break;
        // Easy to add more database types:
        // case 'postgres':
        //   dbInstance = new PostgresAdapter(config);
        //   break;
        // case 'mysql':
        //   dbInstance = new MySQLAdapter(config);
        //   break;
        default:
            throw new Error(`Unsupported database type: ${type}`);
    }

    return dbInstance;
}

export async function closeDatabase() {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
}

export * from './types';
export * from './schema';
