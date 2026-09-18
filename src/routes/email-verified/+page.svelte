<script lang="ts">
	import { page } from "$app/state";
	import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
	import HomeIcon from "@lucide/svelte/icons/home";
	import MailWarningIcon from "@lucide/svelte/icons/mail-warning";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import XCircleIcon from "@lucide/svelte/icons/x-circle";

	import { Button } from "$lib/components/ui/button/index.js";

	const failedReasons: Record<string, string> = {
		expired: "Link verifikasi sudah kedaluwarsa. Minta email verifikasi baru dari halaman Settings.",
		already_used: "Link ini sudah pernah dipakai. Akun kamu kemungkinan sudah diverifikasi.",
		email_changed: "Email profile berubah setelah link ini dibuat. Kirim ulang verifikasi untuk email terbaru.",
		invalid: "Link verifikasi tidak valid. Kirim ulang verifikasi dari halaman Settings.",
	};

	const status = $derived(page.url.searchParams.get("status") ?? "failed");
	const reason = $derived(page.url.searchParams.get("reason") ?? "invalid");
	const isSuccess = $derived(status === "success");
	const message = $derived(
		isSuccess
			? "Email kamu sudah diverifikasi. Smart Journal siap memakai email ini untuk notifikasi reminder."
			: (failedReasons[reason] ?? failedReasons.invalid),
	);
</script>

<svelte:head>
	<title>Email Verification - Smart Journal</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground sm:px-6">
	<section class="w-full max-w-lg">
		<a href="/" class="mb-8 inline-flex items-center gap-2 font-semibold">
			<span class="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
				<SparklesIcon class="size-4" />
			</span>
			<span>Smart Journal</span>
		</a>

		<div class="rounded-md border border-border bg-card p-6 shadow-sm sm:p-8">
			<div
				class={`mb-5 flex size-12 items-center justify-center rounded-md ${
					isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"
				}`}
			>
				{#if isSuccess}
					<CheckCircleIcon class="size-6" />
				{:else}
					<XCircleIcon class="size-6" />
				{/if}
			</div>

			<p class="text-sm text-muted-foreground">Email verification</p>
			<h1 class="mt-2 text-2xl font-semibold tracking-normal">
				{#if isSuccess}
					Email berhasil diverifikasi
				{:else}
					Verifikasi email gagal
				{/if}
			</h1>
			<p class="mt-3 leading-7 text-muted-foreground">{message}</p>

			{#if !isSuccess}
				<div class="mt-5 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
					<MailWarningIcon class="mt-0.5 size-4 shrink-0" />
					<p>
						Reason: <span class="font-medium">{reason}</span>
					</p>
				</div>
			{/if}

			<div class="mt-7 flex flex-col gap-2 sm:flex-row">
				<Button href="/home">
					<HomeIcon class="size-4" />
					Buka Home
				</Button>
				<Button href="/settings" variant="outline">
					<SettingsIcon class="size-4" />
					Settings
				</Button>
			</div>
		</div>
	</section>
</main>
