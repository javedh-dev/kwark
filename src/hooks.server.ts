import type { Handle } from '@sveltejs/kit';
import { getDatabase } from '$lib/db';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { parseSessionToken, verifySessionSecret } from '$lib/server/auth';
import { DATABASE_PATH } from '$env/static/private';

if (!existsSync(DATABASE_PATH)) {
	await mkdir(DATABASE_PATH, { recursive: true });
}

const db = getDatabase();

export const handle: Handle = async ({ event, resolve }) => {
	// Default to no auth
	event.locals.user = null;
	event.locals.session = null;

	// Get session cookie
	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		// Parse session token
		const parsed = parseSessionToken(sessionCookie);

		if (parsed) {
			const { id, secret } = parsed;

			// Get session from database
			const session = await db.getSession(id);

			if (session) {
				// Verify session secret
				const validSecret = verifySessionSecret(secret, session.secretHash);

				if (validSecret) {
					// Get user
					const user = await db.getUser(session.userId);

					if (user) {
						event.locals.session = session;
						event.locals.user = user;
					}
				}
			}
		}

		// If session validation failed, clear the cookie
		if (!event.locals.session) {
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
