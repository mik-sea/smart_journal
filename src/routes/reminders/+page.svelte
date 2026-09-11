<script lang="ts">
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import BellRingIcon from "@lucide/svelte/icons/bell-ring";
	import CheckIcon from "@lucide/svelte/icons/check";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import XIcon from "@lucide/svelte/icons/x";

	type Reminder = {
		title: string;
		due: string;
		note: string;
		channel: string;
		status: "active" | "done";
	};

	let activeTab = $state<"active" | "history">("active");

	const reminders: Reminder[] = [
		{ title: "Bayar listrik", due: "Besok, 08:00", note: "Tagihan rumah bulanan", channel: "Discord", status: "active" },
		{ title: "Follow up invoice", due: "Jumat, 10:00", note: "Cek pembayaran project", channel: "Local", status: "active" },
		{ title: "Kirim laporan", due: "Selesai kemarin", note: "Rekap mingguan", channel: "Discord", status: "done" },
	];

	let visibleReminders = $derived(
		reminders.filter((item) => (activeTab === "active" ? item.status === "active" : item.status === "done")),
	);
</script>

<svelte:head>
	<title>Reminders - Smart Journal</title>
</svelte:head>

<section class="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Alarm dan follow-up</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Reminders</h1>
			</div>
			<div class="flex gap-2">
				<div class="rounded-md border border-border px-3 py-2 text-sm">
					<span class="text-muted-foreground">Aktif</span>
					<span class="ml-2 font-medium">2</span>
				</div>
				<div class="rounded-md border border-border px-3 py-2 text-sm">
					<span class="text-muted-foreground">Discord</span>
					<span class="ml-2 font-medium">2</span>
				</div>
			</div>
		</header>

		<div class="grid gap-4 md:grid-cols-3">
			<section class="rounded-md border border-border bg-card p-4">
				<BellRingIcon class="mb-3 size-5 text-muted-foreground" />
				<p class="text-sm text-muted-foreground">Reminder berikutnya</p>
				<p class="mt-1 font-medium">Bayar listrik</p>
			</section>
			<section class="rounded-md border border-border bg-card p-4">
				<AlarmClockIcon class="mb-3 size-5 text-muted-foreground" />
				<p class="text-sm text-muted-foreground">Waktu</p>
				<p class="mt-1 font-medium">Besok, 08:00</p>
			</section>
			<section class="rounded-md border border-border bg-card p-4">
				<MessageCircleIcon class="mb-3 size-5 text-muted-foreground" />
				<p class="text-sm text-muted-foreground">Channel utama</p>
				<p class="mt-1 font-medium">Discord</p>
			</section>
		</div>

		<section class="rounded-md border border-border bg-card p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between gap-3">
				<h2 class="text-base font-medium">Daftar reminder</h2>
				<div class="grid grid-cols-2 rounded-md border border-border bg-background p-1">
					<button
						class={`rounded-sm px-3 py-1.5 text-sm ${activeTab === "active" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
						onclick={() => (activeTab = "active")}
					>
						Aktif
					</button>
					<button
						class={`rounded-sm px-3 py-1.5 text-sm ${activeTab === "history" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
						onclick={() => (activeTab = "history")}
					>
						Riwayat
					</button>
				</div>
			</div>

			<div class="space-y-2">
				{#each visibleReminders as item}
					<article class="flex gap-3 rounded-md border border-border p-3">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
							{#if item.status === "done"}
								<CheckIcon class="size-4 text-chart-1" />
							{:else}
								<AlarmClockIcon class="size-4 text-chart-2" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div class="min-w-0">
									<p class="font-medium">{item.title}</p>
									<p class="mt-1 text-sm text-muted-foreground">{item.due}</p>
									<p class="mt-1 text-sm text-muted-foreground">
										<span>{item.note}</span>
										<span class="mx-1">-</span>
										<span class="whitespace-nowrap">{item.channel}</span>
									</p>
								</div>
								{#if item.status === "active"}
									<button class="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary" aria-label="Batalkan reminder">
										<XIcon class="size-4" />
									</button>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		</section>
	</div>
</section>
