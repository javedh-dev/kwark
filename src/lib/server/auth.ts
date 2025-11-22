import { sha256 } from '@oslojs/crypto/sha2';
import { hash, verify } from '@node-rs/argon2';

const SESSION_EXPIRY_DAYS = 30;

/**
 * Generate a secure random ID for sessions
 * Uses human-readable alphabet (a-z, 0-9) with 120 bits of entropy
 */
function generateRandomString(length: number): string {
	const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);

	let result = '';
	for (let i = 0; i < bytes.length; i++) {
		result += alphabet[bytes[i] >> 3];
	}
	return result;
}

/**
 * Generate a secure random ID for sessions
 * Uses human-readable alphabet (a-z, 0-9) with 120 bits of entropy
 */
export function generateSessionId(): string {
	return generateRandomString(24);
}

/**
 * Generate a secure random secret for session tokens
 */
export function generateSessionSecret(): string {
	return generateRandomString(24);
}

/**
 * Hash a session secret using SHA-256
 * Returns a Buffer to store in database
 */
export function hashSessionSecret(secret: string): Buffer {
	const secretBytes = new TextEncoder().encode(secret);
	const hashBytes = sha256(secretBytes);
	return Buffer.from(hashBytes);
}

/**
 * Constant-time comparison of two byte arrays
 * Prevents timing attacks
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
}

/**
 * Verify a session secret against its hash
 */
export function verifySessionSecret(secret: string, hash: Buffer): boolean {
	const secretHash = hashSessionSecret(secret);
	return constantTimeEqual(secretHash, hash);
}

/**
 * Create a session token from ID and secret
 * Format: <SESSION_ID>.<SESSION_SECRET>
 */
export function createSessionToken(id: string, secret: string): string {
	return `${id}.${secret}`;
}

/**
 * Parse a session token into ID and secret
 */
export function parseSessionToken(token: string): { id: string; secret: string } | null {
	const parts = token.split('.');
	if (parts.length !== 2) {
		return null;
	}
	return {
		id: parts[0],
		secret: parts[1]
	};
}

/**
 * Calculate session expiration date
 */
export function getSessionExpiration(): Date {
	return new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	return await verify(hash, password);
}

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
	let id = 'user_' + generateRandomString(16);
	return id;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requires at least 8 characters
 */
export function isValidPassword(password: string): boolean {
	return password.length >= 8;
}
