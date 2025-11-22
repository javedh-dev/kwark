import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Redirect to login if not authenticated
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email,
			username: locals.user.username
		}
	};
};
