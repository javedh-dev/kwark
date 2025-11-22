<script lang="ts">
	import { goto } from '$app/navigation';
	import { Eye, EyeOff } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Login failed';
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

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<div class="w-full max-w-md space-y-6">
		<div class="text-center">
			<h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
			<p class="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
		</div>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleLogin();
			}}
			class="space-y-4"
		>
			{#if error}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<div class="space-y-2">
				<label for="email" class="text-sm font-medium">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					disabled={loading}
					class="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
					placeholder="you@example.com"
				/>
			</div>

			<div class="space-y-2">
				<label for="password" class="text-sm font-medium">Password</label>
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						required
						disabled={loading}
						class="w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
						placeholder="••••••••"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						{#if showPassword}
							<EyeOff size={18} />
						{:else}
							<Eye size={18} />
						{/if}
					</button>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{loading ? 'Signing in...' : 'Sign in'}
			</button>
		</form>

		<p class="text-center text-sm text-muted-foreground">
			Don't have an account?
			<a href="/signup" class="font-medium text-primary hover:underline">Sign up</a>
		</p>
	</div>
</div>
