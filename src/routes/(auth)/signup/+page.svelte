<script lang="ts">
	import { goto } from '$app/navigation';
	import SignupForm from '$lib/components/auth/signup-form.svelte';
	import { Eye, EyeOff } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let username = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleSignup() {
		error = '';

		// Validate passwords match
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, username: username || undefined })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Signup failed';
				return;
			}

			// Redirect to home page
			goto('/');
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<SignupForm class="max-w-sm md:max-w-3xl" />
