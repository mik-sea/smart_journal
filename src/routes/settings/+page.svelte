<script lang="ts">
	import { goto } from "$app/navigation";
	import CheckIcon from "@lucide/svelte/icons/check";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import MailCheckIcon from "@lucide/svelte/icons/mail-check";
	import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";
	import SaveIcon from "@lucide/svelte/icons/save";

	import { ApiError, getProfile, requestEmailVerification, updateProfile } from "$lib/api/smart-journal";
	import { authSession } from "$lib/auth";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import {
		DEFAULT_TIMEZONE,
		TIMEZONE_OPTIONS,
		formatDateTimeInTimeZone,
		formatTimeZoneLabel,
		normalizeTimeZone,
	} from "$lib/timezone";

	let name = $state("");
	let avatarUrl = $state("");
	let bio = $state("");
	let timezone = $state(DEFAULT_TIMEZONE);
	let email = $state("");
	let emailVerifiedAt = $state("");
	let isLoading = $state(false);
	let isSaving = $state(false);
	let isSendingVerification = $state(false);
	let errorMessage = $state("");
	let successMessage = $state("");
	let loaded = $state(false);

	$effect(() => {
		const session = $authSession;

		if (!session.loading && !session.user) {
			goto("/login");
		}

		if (session.user && !loaded) {
			loaded = true;
			loadProfile();
		}
	});

	function setApiError(error: unknown, fallback: string) {
		errorMessage = error instanceof ApiError ? error.message : fallback;
	}

	async function loadProfile() {
		isLoading = true;
		errorMessage = "";
		successMessage = "";

		try {
			const profile = await getProfile();
			email = profile.email ?? "";
			emailVerifiedAt = profile.email_verified_at ?? "";
			name = profile.name ?? "";
			avatarUrl = profile.avatar_url ?? "";
			bio = profile.bio ?? "";
			timezone = normalizeTimeZone(profile.timezone || DEFAULT_TIMEZONE);
		} catch (error) {
			setApiError(error, "Gagal mengambil profile.");
		} finally {
			isLoading = false;
		}
	}

	async function saveSettings(event: SubmitEvent) {
		event.preventDefault();
		isSaving = true;
		errorMessage = "";
		successMessage = "";

		try {
			const profile = await updateProfile({
				name,
				avatar_url: avatarUrl,
				bio,
				timezone: normalizeTimeZone(timezone),
			});
			email = profile.email ?? "";
			emailVerifiedAt = profile.email_verified_at ?? "";
			name = profile.name ?? "";
			avatarUrl = profile.avatar_url ?? "";
			bio = profile.bio ?? "";
			timezone = normalizeTimeZone(profile.timezone || DEFAULT_TIMEZONE);
			successMessage = "Settings berhasil disimpan.";
		} catch (error) {
			setApiError(error, "Gagal menyimpan settings.");
		} finally {
			isSaving = false;
		}
	}

	async function sendVerificationEmail() {
		isSendingVerification = true;
		errorMessage = "";
		successMessage = "";

		try {
			await requestEmailVerification();
			successMessage = "Email verifikasi dikirim ulang.";
		} catch (error) {
			setApiError(error, "Gagal mengirim email verifikasi.");
		} finally {
			isSendingVerification = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - Smart Journal</title>
</svelte:head>

<section class="min-h-[calc(100vh-3rem)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Settings</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Profile dan email</h1>
			</div>

			<Button variant="outline" size="sm" onclick={loadProfile} disabled={isLoading}>
				<RefreshCcwIcon class={`size-4 ${isLoading ? "animate-spin" : ""}`} />
				Refresh
			</Button>
		</header>

		{#if errorMessage}
			<div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				{errorMessage}
			</div>
		{/if}

		{#if successMessage}
			<div class="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
				<CheckIcon class="size-4" />
				<span>{successMessage}</span>
			</div>
		{/if}

		<section class="rounded-md border border-border bg-card p-4 sm:p-5">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex gap-3">
					<MailCheckIcon class="mt-0.5 size-5 shrink-0 text-chart-3" />
					<div>
						<p class="font-medium">{email || "Email profile"}</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{#if emailVerifiedAt}
								Terverifikasi pada {formatDateTimeInTimeZone(emailVerifiedAt, timezone, {
									day: "numeric",
									month: "short",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							{:else}
								Belum diverifikasi untuk notifikasi email.
							{/if}
						</p>
					</div>
				</div>

				{#if !emailVerifiedAt}
					<Button variant="outline" size="sm" onclick={sendVerificationEmail} disabled={isSendingVerification || isLoading}>
						{#if isSendingVerification}
							<LoaderCircleIcon class="size-4 animate-spin" />
						{:else}
							<MailCheckIcon class="size-4" />
						{/if}
						Kirim verifikasi
					</Button>
				{/if}
			</div>
		</section>

		<form class="rounded-md border border-border bg-card p-4 sm:p-5" onsubmit={saveSettings}>
			<div class="space-y-4">
				<label class="block space-y-2">
					<span class="text-sm font-medium">Nama</span>
					<Input bind:value={name} disabled={isLoading || isSaving} placeholder="Nama kamu" />
				</label>

				<label class="block space-y-2">
					<span class="text-sm font-medium">Avatar URL</span>
					<Input bind:value={avatarUrl} disabled={isLoading || isSaving} placeholder="https://..." />
				</label>

				<label class="block space-y-2">
					<span class="text-sm font-medium">Bio</span>
					<Textarea bind:value={bio} disabled={isLoading || isSaving} class="min-h-24 resize-none" placeholder="Sedikit tentang kamu" />
				</label>

				<label class="block space-y-2">
					<span class="text-sm font-medium">Timezone</span>
					<select
						bind:value={timezone}
						disabled={isLoading || isSaving}
						class="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#each TIMEZONE_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					<p class="text-xs leading-5 text-muted-foreground">
						Timezone profile: {formatTimeZoneLabel(timezone)}.
					</p>
				</label>

			</div>

			<div class="mt-5 flex justify-end">
				<Button type="submit" disabled={isSaving || isLoading}>
					{#if isSaving}
						<LoaderCircleIcon class="size-4 animate-spin" />
						Menyimpan
					{:else}
						<SaveIcon class="size-4" />
						Simpan
					{/if}
				</Button>
			</div>
		</form>
	</div>
</section>
