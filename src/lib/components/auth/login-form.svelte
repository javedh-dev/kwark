<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
	const id = $props.id();

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

<div class={cn('flex w-full flex-col gap-6', className)} {...restProps}>
	<Card.Root class="overflow-hidden p-0">
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form
				class="p-6 md:p-8"
				onsubmit={(e) => {
					e.preventDefault();
					handleLogin();
				}}
			>
				<FieldGroup>
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Welcome back</h1>
						<p class="text-balance text-muted-foreground">Login to your Acme Inc account</p>
					</div>
					<Field>
						<FieldLabel for="email-{id}">Email</FieldLabel>
						<Input
							id="email-{id}"
							type="email"
							placeholder="m@example.com"
							required
							bind:value={email}
						/>
					</Field>
					<Field>
						<div class="flex items-center">
							<FieldLabel for="password-{id}">Password</FieldLabel>
							<a href="##" class="ms-auto text-sm underline-offset-2 hover:underline">
								Forgot your password?
							</a>
						</div>
						<Input id="password-{id}" type="password" required bind:value={password} />
					</Field>
					<Field>
						<Button type="submit">Login</Button>
					</Field>
					<FieldDescription class="text-center">
						Don't have an account? <a href="/signup">Sign up</a>
					</FieldDescription>
				</FieldGroup>
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
	<FieldDescription class="px-6 text-center text-muted-foreground">
		By clicking continue, you agree to our <a href="##">Terms of Service</a> and
		<a href="##">Privacy Policy</a>.
	</FieldDescription>
</div>
