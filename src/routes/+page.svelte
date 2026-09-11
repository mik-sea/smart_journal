<script lang="ts">
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import CheckIcon from "@lucide/svelte/icons/check";
	import CircleDollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";
	import XIcon from "@lucide/svelte/icons/x";

	import OmniboxResultPreview, {
		type OmniboxPreview,
	} from "$lib/components/omnibox/omnibox-result-preview.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	type TimelineItem = {
		time: string;
		title: string;
		meta: string;
		amount?: string;
		type: "expense" | "income" | "reminder";
	};

	let entry = $state("");
	let isProcessing = $state(false);
	let preview = $state<OmniboxPreview | null>(null);
	let toast = $state("");
	let todayLabel = new Intl.DateTimeFormat("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(new Date());

	const timeline = $state<TimelineItem[]>([
		{
			time: "08:10",
			title: "Kopi sebelum meeting",
			meta: "Pengeluaran - Makanan",
			amount: "-Rp 30.000",
			type: "expense",
		},
		{
			time: "13:30",
			title: "Invoice freelance cair",
			meta: "Pemasukan - Project",
			amount: "+Rp 1.250.000",
			type: "income",
		},
		{
			time: "20:00",
			title: "Bayar listrik",
			meta: "Pengingat via Discord",
			type: "reminder",
		},
	]);

	let reminderCount = $derived(timeline.filter((item) => item.type === "reminder").length);

	const suggestions = [
		"Beli kopi 30rb",
		"Ingatkan bayar listrik besok jam 8 pagi",
		"Gaji masuk 5jt dari project",
	];

	function inferPreview(text: string): OmniboxPreview {
		const lowerText = text.toLowerCase();
		const hasReminder = /ingat|remind|alarm|besok|hari|jam|discord/.test(lowerText);
		const hasIncome = /gaji|masuk|income|bayaran|dibayar|cair/.test(lowerText);
		const amountMatch = text.match(/(\d+)\s*(rb|ribu|jt|juta|k)?/i);
		const amountNumber = amountMatch ? Number(amountMatch[1]) : 60000;
		const multiplier = amountMatch?.[2]?.toLowerCase().startsWith("j") ? 1000000 : 1000;
		const amount = amountMatch ? amountNumber * multiplier : 60000;

		return {
			kind: hasIncome
				? "Pemasukan"
				: hasReminder
					? "Pengeluaran + Pengingat"
					: "Catatan Journal",
			amount: hasIncome
				? `Rp ${amount.toLocaleString("id-ID")}`
				: `Rp ${amount.toLocaleString("id-ID")}`,
			category: hasIncome ? "Project" : lowerText.includes("kopi") ? "Makanan" : "Tagihan/Utilitas",
			reminder: hasReminder ? "4 Okt 2026, 00:00" : "Tidak ada alarm",
			destination: hasReminder ? "Discord" : "Journal",
			source: text,
		};
	}

	function getCurrentTime() {
		return new Intl.DateTimeFormat("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}).format(new Date());
	}

	function showToast(message: string) {
		toast = message;
		window.setTimeout(() => {
			toast = "";
		}, 2600);
	}

	async function processEntry() {
		const text = entry.trim();

		if (!text || isProcessing) return;

		isProcessing = true;
		preview = null;

		await new Promise((resolve) => window.setTimeout(resolve, 850));

		preview = inferPreview(text);
		isProcessing = false;
	}

	function savePreview() {
		if (!preview) return;

		const isIncome = preview.kind === "Pemasukan";
		const isReminder = preview.kind.includes("Pengingat");

		timeline.unshift({
			time: getCurrentTime(),
			title: preview.source,
			meta: `${preview.kind} - ${preview.category}`,
			amount: isReminder || isIncome ? `${isIncome ? "+" : "-"}${preview.amount}` : undefined,
			type: isIncome ? "income" : isReminder ? "expense" : "reminder",
		});

		entry = "";
		preview = null;
		showToast("Berhasil disimpan.");
	}

	function editPreview() {
		if (!preview) return;

		entry = preview.source;
		preview = null;
	}

	function cancelPreview() {
		preview = null;
	}

	function useSuggestion(value: string) {
		entry = value;
		preview = null;
	}
</script>

<svelte:head>
	<title>Home - Smart Journal</title>
</svelte:head>

<section class="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">{todayLabel}</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Home</h1>
			</div>

			<div class="flex gap-2 text-sm">
				<div class="rounded-md border border-border px-3 py-2">
					<span class="text-muted-foreground">Item</span>
					<span class="ml-2 font-medium">{timeline.length}</span>
				</div>
				<div class="rounded-md border border-border px-3 py-2">
					<span class="text-muted-foreground">Reminder</span>
					<span class="ml-2 font-medium">{reminderCount}</span>
				</div>
			</div>
		</header>

		<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
			<div class="space-y-5">
				<section class="rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-3 flex items-center justify-between gap-3">
						<h2 class="text-base font-medium">Catatan baru</h2>
						{#if isProcessing}
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<LoaderCircleIcon class="size-4 animate-spin" />
								<span>Memproses</span>
							</div>
						{/if}
					</div>

					<div class="relative">
						<Textarea
							bind:value={entry}
							disabled={isProcessing}
							placeholder="Beli kopi 30rb, ingatkan bayar listrik besok jam 8 pagi"
							class="min-h-36 resize-none rounded-md bg-background p-4 pr-14 text-base leading-7 shadow-none placeholder:text-muted-foreground md:text-base"
							onkeydown={(event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									processEntry();
								}
							}}
						/>
						<Button
							size="icon"
							class="absolute bottom-3 right-3"
							aria-label="Proses catatan"
							disabled={!entry.trim() || isProcessing}
							onclick={processEntry}
						>
							{#if isProcessing}
								<LoaderCircleIcon class="size-4 animate-spin" />
							{:else}
								<ArrowUpIcon class="size-4" />
							{/if}
						</Button>
					</div>

					<div class="mt-3 flex flex-wrap gap-2">
						{#each suggestions as suggestion}
							<Button
								variant="outline"
								size="sm"
								class="h-auto whitespace-normal border-input px-3 py-2 text-left text-muted-foreground"
								onclick={() => useSuggestion(suggestion)}
							>
								{suggestion}
							</Button>
						{/each}
					</div>
				</section>

				{#if preview}
					<OmniboxResultPreview {preview} onCancel={cancelPreview} onEdit={editPreview} onSave={savePreview} />
				{/if}
			</div>

			<section class="rounded-md border border-border bg-card p-4 sm:p-5">
				<div class="mb-4 flex items-center justify-between gap-3">
					<h2 class="text-base font-medium">Hari ini</h2>
					<span class="text-sm text-muted-foreground">{timeline.length} item</span>
				</div>

				<div class="space-y-1">
					{#each timeline as item}
						<article class="flex gap-3 rounded-md px-2 py-3 hover:bg-secondary/60">
							<div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
								{#if item.type === "expense"}
									<WalletCardsIcon class="size-4 text-destructive" />
								{:else if item.type === "income"}
									<CircleDollarSignIcon class="size-4 text-chart-1" />
								{:else}
									<AlarmClockIcon class="size-4 text-chart-2" />
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between gap-3">
									<p class="truncate font-medium">{item.title}</p>
									<span class="shrink-0 text-xs text-muted-foreground">{item.time}</span>
								</div>
								<div class="mt-1 flex items-center justify-between gap-3">
									<p class="truncate text-sm text-muted-foreground">{item.meta}</p>
									{#if item.amount}
										<p
											class={`shrink-0 text-sm font-medium ${
												item.type === "income" ? "text-chart-1" : "text-destructive"
											}`}
										>
											{item.amount}
										</p>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			</section>
		</div>
	</div>

	{#if toast}
		<div class="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm shadow-lg">
			<CheckIcon class="size-4 text-chart-1" />
			<span>{toast}</span>
			<Button variant="ghost" size="icon-xs" aria-label="Tutup notifikasi" onclick={() => (toast = "")}>
				<XIcon class="size-3" />
			</Button>
		</div>
	{/if}
</section>
