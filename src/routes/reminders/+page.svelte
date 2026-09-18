<script lang="ts">
	import { goto } from "$app/navigation";
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";

	import { ApiError, getProfile, getReminders, type Reminder } from "$lib/api/smart-journal";
	import { authSession } from "$lib/auth";
	import { Button } from "$lib/components/ui/button/index.js";
	import { DEFAULT_TIMEZONE, formatDateTimeInTimeZone, formatTimeZoneLabel, normalizeTimeZone } from "$lib/timezone";

	let reminders = $state<Reminder[]>([]);
	let timezone = $state(DEFAULT_TIMEZONE);
	let isLoading = $state(false);
	let errorMessage = $state("");
	let loaded = $state(false);

	const pendingCount = $derived(reminders.filter((item) => item.status === "pending").length);
	const sentCount = $derived(reminders.filter((item) => item.status === "sent").length);

	$effect(() => {
		const session = $authSession;

		if (!session.loading && !session.user) {
			goto("/login");
		}

		if (session.user && !loaded) {
			loaded = true;
			loadReminders();
		}
	});

	function formatDate(value: string) {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";

		return formatDateTimeInTimeZone(date, timezone, {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function setApiError(error: unknown, fallback: string) {
		errorMessage = error instanceof ApiError ? error.message : fallback;
	}

	async function loadReminders() {
		isLoading = true;
		errorMessage = "";

		try {
			const [profile, response] = await Promise.all([getProfile().catch(() => null), getReminders(100)]);
			timezone = normalizeTimeZone(profile?.timezone || DEFAULT_TIMEZONE);
			reminders = response.reminders;
		} catch (error) {
			setApiError(error, "Gagal mengambil data reminder.");
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Reminders - Smart Journal</title>
</svelte:head>

<section class="min-h-[calc(100vh-3rem)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Reminders</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Pengingat</h1>
				<p class="mt-2 text-sm text-muted-foreground">Ditampilkan dalam {formatTimeZoneLabel(timezone)}</p>
			</div>

			<Button variant="outline" size="sm" onclick={loadReminders} disabled={isLoading}>
				<RefreshCcwIcon class={`size-4 ${isLoading ? "animate-spin" : ""}`} />
				Refresh
			</Button>
		</header>

		{#if errorMessage}
			<div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				{errorMessage}
			</div>
		{/if}

		<section class="grid gap-3 sm:grid-cols-2">
			<div class="rounded-md border border-border bg-card p-5">
				<p class="text-sm text-muted-foreground">Pending</p>
				<p class="mt-3 text-2xl font-semibold">{pendingCount}</p>
			</div>
			<div class="rounded-md border border-border bg-card p-5">
				<p class="text-sm text-muted-foreground">Sent</p>
				<p class="mt-3 text-2xl font-semibold">{sentCount}</p>
			</div>
		</section>

		<section class="rounded-md border border-border bg-card p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between gap-3">
				<h2 class="text-base font-medium">Daftar reminder</h2>
				<span class="text-sm text-muted-foreground">{reminders.length} item</span>
			</div>

			{#if isLoading && reminders.length === 0}
				<div class="flex items-center gap-2 py-8 text-sm text-muted-foreground">
					<LoaderCircleIcon class="size-4 animate-spin" />
					<span>Mengambil data</span>
				</div>
			{:else if reminders.length === 0}
				<p class="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
					Belum ada reminder. Tulis catatan dengan instruksi pengingat di halaman Home.
				</p>
			{:else}
				<div class="divide-y divide-border">
					{#each reminders as item (item.id)}
						<article class="flex gap-3 py-4">
							<div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
								<AlarmClockIcon class="size-4 text-chart-2" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<p class="font-medium">{item.message}</p>
									<span class="w-fit rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">{item.status}</span>
								</div>
								<p class="mt-1 text-sm text-muted-foreground">{formatDate(item.remind_at)}</p>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</section>
