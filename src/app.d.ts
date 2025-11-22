// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/db/schema').User | null;
			session: import('$lib/db/schema').Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const LLM_API_KEY: string;
	export const LLM_BASE_URL: string;
	export const LLM_MODEL: string;
}

export {};
