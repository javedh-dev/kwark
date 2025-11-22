import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db';
import {
	generateUserId,
	generateSessionId,
	generateSessionSecret,
	hashSessionSecret,
	createSessionToken,
	getSessionExpiration,
	hashPassword,
	isValidEmail,
	isValidPassword
} from '$lib/server/auth';

const db = getDatabase('sqlite');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password, username } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		if (!isValidEmail(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		if (!isValidPassword(password)) {
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await db.getUserByEmail(email);
		if (existingUser) {
			return json({ error: 'Email already registered' }, { status: 409 });
		}

		// Create user
		const userId = generateUserId();
		const passwordHash = await hashPassword(password);

		await db.createUser({
			id: userId,
			email,
			username: username || null,
			passwordHash
		});

		// Create session
		const sessionId = generateSessionId();
		const sessionSecret = generateSessionSecret();
		const secretHash = hashSessionSecret(sessionSecret);
		const expiresAt = getSessionExpiration();

		await db.createSession({
			id: sessionId,
			userId,
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

		// Get the created user (without password hash)
		const user = await db.getUser(userId);

		return json(
			{
				success: true,
				user: {
					id: user!.id,
					email: user!.email,
					username: user!.username
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'An error occurred during signup' }, { status: 500 });
	}
};
