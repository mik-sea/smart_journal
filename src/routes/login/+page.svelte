<script lang="ts">
	import { goto } from "$app/navigation";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";

	import { authSession, loginWithEmail } from "$lib/auth";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	let email = $state("");
	let password = $state("");
	let isSubmitting = $state(false);
	let errorMessage = $state("");

	$effect(() => {
		if (!$authSession.loading && $authSession.user) {
			goto("/home");
		}
	});

	async function submitLogin(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = "";
		isSubmitting = true;

		try {
			await loginWithEmail(email, password);
			goto("/home");
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : "Login gagal.";
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Smart Journal</title>
</svelte:head>

<main class="grid min-h-screen bg-background text-foreground lg:grid-cols-[1fr_0.95fr]">
	<section class="flex items-center justify-center px-4 py-10 sm:px-6">
		<div class="w-full max-w-md">
			<a href="/" class="mb-8 inline-flex items-center gap-2 font-semibold">
				<span class="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<SparklesIcon class="size-4" />
				</span>
				<span>Smart Journal</span>
			</a>

			<h1 class="text-3xl font-semibold tracking-normal">Masuk ke akun</h1>
			<p class="mt-2 text-sm leading-6 text-muted-foreground">
				Setelah login, token Firebase ditukar menjadi session cookie HttpOnly di backend.
			</p>

			{#if !$authSession.configured}
				<div class="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
					Konfigurasi Firebase belum lengkap. Isi environment PUBLIC_FIREBASE_* terlebih dahulu.
				</div>
			{/if}

			{#if errorMessage}
				<div class="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{errorMessage}
				</div>
			{/if}

			<form class="mt-6 space-y-4" onsubmit={submitLogin}>
				<label class="block space-y-2">
					<span class="text-sm font-medium">Email</span>
					<Input bind:value={email} type="email" autocomplete="email" required placeholder="nama@email.com" />
				</label>
				<label class="block space-y-2">
					<span class="text-sm font-medium">Password</span>
					<Input bind:value={password} type="password" autocomplete="current-password" required placeholder="Minimal 6 karakter" />
				</label>

				<Button class="w-full" type="submit" disabled={isSubmitting || !$authSession.configured}>
					{#if isSubmitting}
						<LoaderCircleIcon class="size-4 animate-spin" />
						Memproses
					{:else}
						Login
						<ArrowRightIcon class="size-4" />
					{/if}
				</Button>
			</form>

			<p class="mt-6 text-sm text-muted-foreground">
				Belum punya akun?
				<a class="font-medium text-foreground underline-offset-4 hover:underline" href="/register">Register</a>
			</p>
		</div>
	</section>

	<section class="hidden border-l border-border bg-secondary/70 p-8 lg:flex lg:items-center">
		<div class="mx-auto max-w-lg">
			<img
				src="/smart-journal-preview.png"
				alt="Preview dashboard Smart Journal"
				class="aspect-[16/10] w-full rounded-md border border-border object-cover shadow-lg"
			/>
			<p class="mt-6 text-lg font-medium">Tulis satu catatan, biarkan sistem memecah konteksnya.</p>
			<p class="mt-2 leading-7 text-muted-foreground">
				Home akan mengambil notes, transactions, dan reminders dari backend lewat cookie session yang dikirim browser.
			</p>
		</div>
	</section>
</main>
