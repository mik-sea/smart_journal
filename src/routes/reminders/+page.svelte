<script lang="ts">
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import BellIcon from "@lucide/svelte/icons/bell";
	import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import Clock3Icon from "@lucide/svelte/icons/clock-3";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";

	import { Button } from "$lib/components/ui/button/index.js";

	type ReminderStatus = "pending" | "sent";

	type Reminder = {
		id: number;
		title: string;
		note: string;
		date: string;
		time: string;
		channel: "Discord" | "Journal";
		status: ReminderStatus;
	};

	let activeTab = $state<ReminderStatus>("pending");

	const reminders = $state<Reminder[]>([
		{
			id: 1,
			title: "Bayar listrik",
			note: "Tagihan rumah bulanan",
			date: "Besok",
			time: "08:00",
			channel: "Discord",
			status: "pending",
		},
		{
			id: 2,
			title: "Cek masa aktif XL",
			note: "3 hari sebelum paket habis",
			date: "4 Okt 2026",
			time: "00:00",
			channel: "Discord",
			status: "pending",
		},
		{
			id: 3,
			title: "Follow up invoice",
			note: "Kirim pesan ke klien project",
			date: "Senin",
			time: "10:30",
			channel: "Journal",
			status: "pending",
		},
		{
			id: 4,
			title: "Minum obat",
			note: "Pengingat malam",
			date: "Kemarin",
			time: "21:00",
			channel: "Discord",
			status: "sent",
		},
		{
			id: 5,
			title: "Backup catatan mingguan",
			note: "Sudah dikirim ke Discord",
			date: "8 Sep 2026",
			time: "19:00",
			channel: "Discord",
			status: "sent",
		},
	]);

	let pendingCount = $derived(reminders.filter((reminder) => reminder.status === "pending").length);
	let sentCount = $derived(reminders.filter((reminder) => reminder.status === "sent").length);
	let visibleReminders = $derived(reminders.filter((reminder) => reminder.status === activeTab));
	let nextReminder = $derived(reminders.find((reminder) => reminder.status === "pending"));

	function cancelReminder(id: number) {
		const index = reminders.findIndex((reminder) => reminder.id === id);

		if (index !== -1) {
			reminders.splice(index, 1);
		}
	}
</script>

<svelte:head>
	<title>Reminders - Smart Journal</title>
</svelte:head>

<section class="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Pengingat</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Reminders</h1>
			</div>

			<Button variant="outline" class="w-fit">
				<BellIcon class="size-4" />
				Tambah reminder
			</Button>
		</header>

		<div class="grid gap-3 sm:grid-cols-3">
			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Aktif</p>
					<Clock3Icon class="size-4 text-chart-2" />
				</div>
				<p class="text-2xl font-semibold">{pendingCount}</p>
				<p class="mt-2 text-sm text-muted-foreground">Belum terkirim.</p>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Selesai</p>
					<CheckCircle2Icon class="size-4 text-chart-1" />
				</div>
				<p class="text-2xl font-semibold">{sentCount}</p>
				<p class="mt-2 text-sm text-muted-foreground">Sudah terkirim.</p>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Berikutnya</p>
					<CalendarClockIcon class="size-4 text-muted-foreground" />
				</div>
				<p class="truncate text-lg font-semibold">{nextReminder?.title ?? "Tidak ada"}</p>
				<p class="mt-2 text-sm text-muted-foreground">
					{#if nextReminder}
						{nextReminder.date}, {nextReminder.time}
					{:else}
						Semua reminder sudah selesai.
					{/if}
				</p>
			</section>
		</div>

		<section class="rounded-md border border-border bg-card p-4 sm:p-5">
			<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-base font-medium">Daftar reminder</h2>
					<p class="text-sm text-muted-foreground">Kelola alarm yang akan dikirim ke Discord atau journal.</p>
				</div>

				<div class="grid grid-cols-2 rounded-md border border-border bg-background p-1">
					<Button
						variant={activeTab === "pending" ? "secondary" : "ghost"}
						size="sm"
						aria-pressed={activeTab === "pending"}
						onclick={() => (activeTab = "pending")}
					>
						Aktif
					</Button>
					<Button
						variant={activeTab === "sent" ? "secondary" : "ghost"}
						size="sm"
						aria-pressed={activeTab === "sent"}
						onclick={() => (activeTab = "sent")}
					>
						Riwayat
					</Button>
				</div>
			</div>

			<div class="divide-y divide-border rounded-md border border-border">
				{#each visibleReminders as reminder (reminder.id)}
					<article class="grid gap-3 p-3 sm:grid-cols-[40px_1fr_auto] sm:items-center">
						<div class="flex size-9 items-center justify-center rounded-md border border-border bg-background">
							{#if reminder.status === "pending"}
								<AlarmClockIcon class="size-4 text-chart-2" />
							{:else}
								<CheckCircle2Icon class="size-4 text-chart-1" />
							{/if}
						</div>

						<div class="min-w-0 space-y-1">
							<p class="font-medium">{reminder.title}</p>
							<p class="text-sm text-muted-foreground">{reminder.date}, {reminder.time}</p>
							<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
								<span class="min-w-0">{reminder.note}</span>
								<span class="text-border">•</span>
								<span class="inline-flex items-center gap-1 whitespace-nowrap">
									<MessageCircleIcon class="size-3.5" />
									{reminder.channel}
								</span>
							</div>
						</div>

						{#if reminder.status === "pending"}
							<Button
								variant="outline"
								size="sm"
								class="w-full sm:w-auto"
								onclick={() => cancelReminder(reminder.id)}
							>
								<Trash2Icon class="size-4" />
								Batalkan
							</Button>
						{:else}
							<span class="text-sm text-muted-foreground">Terkirim</span>
						{/if}
					</article>
				{:else}
					<div class="p-6 text-center text-sm text-muted-foreground">
						Tidak ada reminder di tab ini.
					</div>
				{/each}
			</div>
		</section>
	</div>
</section>
