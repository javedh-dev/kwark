<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { Eye, EyeOff } from '@lucide/svelte';
	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

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

<div class={cn('flex w-full flex-col gap-6', className)} {...restProps}>
	<Card.Root class="overflow-hidden p-0">
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form
				class="p-6 md:p-8"
				onsubmit={(e) => {
					e.preventDefault();
					handleSignup();
				}}
			>
				<Field.Group>
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Create your account</h1>
						<p class="text-sm text-balance text-muted-foreground">
							Enter your email below to create your account
						</p>
					</div>
					<Field.Field>
						<Field.Label for="email">Email</Field.Label>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
							bind:value={email}
						/>
						<!-- <Field.Description>
							We'll use this to contact you. We will not share your email with anyone else.
						</Field.Description> -->
					</Field.Field>
					<Field.Field>
						<Field.Label for="username">Username</Field.Label>
						<Input
							id="username"
							type="text"
							placeholder="username"
							required
							bind:value={username}
						/>
						<!-- <Field.Description>
							We'll use this to contact you. We will not share your email with anyone else.
						</Field.Description> -->
					</Field.Field>
					<Field.Field>
						<Field.Field class="grid grid-cols-2 gap-4">
							<Field.Field>
								<Field.Label for="password">Password</Field.Label>
								<Input id="password" type="password" required bind:value={password} />
							</Field.Field>
							<Field.Field>
								<Field.Label for="confirm-password">Confirm Password</Field.Label>
								<Input
									id="confirm-password"
									type="password"
									required
									bind:value={confirmPassword}
								/>
							</Field.Field>
						</Field.Field>
						<Field.Description>Must be at least 8 characters long.</Field.Description>
					</Field.Field>
					<Field.Field>
						<Button type="submit">Create Account</Button>
					</Field.Field>
					<Field.Description class="text-center">
						Already have an account? <a href="/login">Sign in</a>
					</Field.Description>
				</Field.Group>
			</form>
			<div class="relative hidden bg-muted md:block">
				<img
					src="/auth-placeholder-min.png"
					alt=""
					class="absolute inset-0 h-full w-full object-cover opacity-80 dark:opacity-60"
				/>
			</div>
		</Card.Content>
	</Card.Root>
	<Field.Description class="px-6 text-center">
		By clicking continue, you agree to our <a href="#/">Terms of Service</a>
		and <a href="#/">Privacy Policy</a>.
	</Field.Description>
</div>
