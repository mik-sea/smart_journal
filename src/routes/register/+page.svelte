<script lang="ts">
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import MailCheckIcon from "@lucide/svelte/icons/mail-check";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";

	import { createProfile, requestEmailVerification } from "$lib/api/smart-journal";
	import { authSession, registerWithEmail } from "$lib/auth";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { DEFAULT_TIMEZONE } from "$lib/timezone";

	let name = $state("");
	let email = $state("");
	let password = $state("");
	let confirmPassword = $state("");
	let isSubmitting = $state(false);
	let errorMessage = $state("");
	let successMessage = $state("");

	async function submitRegister(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = "";
		successMessage = "";

		if (password !== confirmPassword) {
			errorMessage = "Password dan konfirmasi password belum sama.";
			return;
		}

		isSubmitting = true;

		try {
			const user = await registerWithEmail({ name, email, password });
			await createProfile({
				email: user.email || email,
				name,
				avatar_url: "",
				bio: "",
				timezone: DEFAULT_TIMEZONE,
			});
			await requestEmailVerification();
			successMessage = "Akun dibuat. Email verifikasi sudah dikirim ke inbox kamu.";
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : "Register gagal.";
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Register - Smart Journal</title>
</svelte:head>

<main class="grid min-h-screen bg-background text-foreground lg:grid-cols-[0.95fr_1fr]">
	<section class="hidden border-r border-border bg-secondary/70 p-8 lg:flex lg:items-center">
		<div class="mx-auto max-w-lg">
			<img
				src="/smart-journal-preview.png"
				alt="Preview dashboard Smart Journal"
				class="aspect-[16/10] w-full rounded-md border border-border object-cover shadow-lg"
			/>
			<p class="mt-6 text-lg font-medium">Mulai dari catatan harian, lanjut menjadi data yang siap dipakai.</p>
			<p class="mt-2 leading-7 text-muted-foreground">
				Register membuat akun Firebase, menyiapkan profile, lalu backend mengirim email verifikasi.
			</p>
		</div>
	</section>

	<section class="flex items-center justify-center px-4 py-10 sm:px-6">
		<div class="w-full max-w-md">
			<a href="/" class="mb-8 inline-flex items-center gap-2 font-semibold">
				<span class="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<SparklesIcon class="size-4" />
				</span>
				<span>Smart Journal</span>
			</a>

			<h1 class="text-3xl font-semibold tracking-normal">Buat akun baru</h1>
			<p class="mt-2 text-sm leading-6 text-muted-foreground">
				Setelah register, backend akan mengirim email verifikasi melalui Resend.
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

			{#if successMessage}
				<div class="mt-5 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
					<MailCheckIcon class="mt-0.5 size-4 shrink-0" />
					<div>
						<p class="font-medium">{successMessage}</p>
						<div class="mt-3 flex gap-2">
							<Button size="sm" href="/home">Buka home</Button>
							<Button size="sm" variant="outline" href="/login">Login</Button>
						</div>
					</div>
				</div>
			{/if}

			<form class="mt-6 space-y-4" onsubmit={submitRegister}>
				<label class="block space-y-2">
					<span class="text-sm font-medium">Nama</span>
					<Input bind:value={name} autocomplete="name" required placeholder="Nama kamu" />
				</label>
				<label class="block space-y-2">
					<span class="text-sm font-medium">Email</span>
					<Input bind:value={email} type="email" autocomplete="email" required placeholder="nama@email.com" />
				</label>
				<label class="block space-y-2">
					<span class="text-sm font-medium">Password</span>
					<Input bind:value={password} type="password" autocomplete="new-password" required minlength={6} placeholder="Minimal 6 karakter" />
				</label>
				<label class="block space-y-2">
					<span class="text-sm font-medium">Konfirmasi password</span>
					<Input bind:value={confirmPassword} type="password" autocomplete="new-password" required minlength={6} placeholder="Ulangi password" />
				</label>

				<Button class="w-full" type="submit" disabled={isSubmitting || !$authSession.configured}>
					{#if isSubmitting}
						<LoaderCircleIcon class="size-4 animate-spin" />
						Membuat akun
					{:else}
						Register
						<ArrowRightIcon class="size-4" />
					{/if}
				</Button>
			</form>

			<p class="mt-6 text-sm text-muted-foreground">
				Sudah punya akun?
				<a class="font-medium text-foreground underline-offset-4 hover:underline" href="/login">Login</a>
			</p>
		</div>
	</section>
</main>
