import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';
import {
	generateSessionId,
	generateSessionSecret,
	hashSessionSecret,
	createSessionToken,
	getSessionExpiration,
	verifyPassword
} from '$lib/server/auth';

const db = getDatabase('sqlite');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Get user by email
		const user = await db.getUserByEmail(email);
		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Verify password
		const validPassword = await verifyPassword(user.passwordHash, password);
		if (!validPassword) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Create session
		const sessionId = generateSessionId();
		const sessionSecret = generateSessionSecret();
		const secretHash = hashSessionSecret(sessionSecret);
		const expiresAt = getSessionExpiration();

		await db.createSession({
			id: sessionId,
			userId: user.id,
			secretHash,
			expiresAt
		});

		// Set session cookie
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		return json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				username: user.username
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'An error occurred during login' }, { status: 500 });
	}
};
