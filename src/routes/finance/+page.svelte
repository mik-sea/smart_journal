<script lang="ts">
	import { goto } from "$app/navigation";
	import CircleDollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";

	import { ApiError, getProfile, getTransactions, type Transaction } from "$lib/api/smart-journal";
	import { authSession } from "$lib/auth";
	import { Button } from "$lib/components/ui/button/index.js";
	import { DEFAULT_TIMEZONE, formatDateTimeInTimeZone, normalizeTimeZone } from "$lib/timezone";

	let transactions = $state<Transaction[]>([]);
	let timezone = $state(DEFAULT_TIMEZONE);
	let isLoading = $state(false);
	let errorMessage = $state("");
	let loaded = $state(false);

	const incomeTotal = $derived(sumTransactions(transactions, "income"));
	const expenseTotal = $derived(sumTransactions(transactions, "expense"));

	$effect(() => {
		const session = $authSession;

		if (!session.loading && !session.user) {
			goto("/login");
		}

		if (session.user && !loaded) {
			loaded = true;
			loadTransactions();
		}
	});

	function formatCurrency(value: number) {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		}).format(value);
	}

	function formatDate(value: string) {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";

		return formatDateTimeInTimeZone(date, timezone, {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function sumTransactions(items: Transaction[], type: Transaction["type"]) {
		return items
			.filter((item) => item.type === type)
			.reduce((total, item) => total + Number(item.amount || 0), 0);
	}

	function setApiError(error: unknown, fallback: string) {
		errorMessage = error instanceof ApiError ? error.message : fallback;
	}

	async function loadTransactions() {
		isLoading = true;
		errorMessage = "";

		try {
			const [profile, response] = await Promise.all([getProfile().catch(() => null), getTransactions(100)]);
			timezone = normalizeTimeZone(profile?.timezone || DEFAULT_TIMEZONE);
			transactions = response.transactions;
		} catch (error) {
			setApiError(error, "Gagal mengambil data transaksi.");
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Finance Tracker - Smart Journal</title>
</svelte:head>

<section class="min-h-[calc(100vh-3rem)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Finance Tracker</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Transaksi</h1>
			</div>

			<Button variant="outline" size="sm" onclick={loadTransactions} disabled={isLoading}>
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
				<div class="flex items-center gap-3 text-sm text-muted-foreground">
					<CircleDollarSignIcon class="size-4 text-chart-1" />
					Pemasukan
				</div>
				<p class="mt-3 text-2xl font-semibold text-chart-1">{formatCurrency(incomeTotal)}</p>
			</div>
			<div class="rounded-md border border-border bg-card p-5">
				<div class="flex items-center gap-3 text-sm text-muted-foreground">
					<WalletCardsIcon class="size-4 text-destructive" />
					Pengeluaran
				</div>
				<p class="mt-3 text-2xl font-semibold text-destructive">{formatCurrency(expenseTotal)}</p>
			</div>
		</section>

		<section class="rounded-md border border-border bg-card p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between gap-3">
				<h2 class="text-base font-medium">Riwayat transaksi</h2>
				<span class="text-sm text-muted-foreground">{transactions.length} item</span>
			</div>

			{#if isLoading && transactions.length === 0}
				<div class="flex items-center gap-2 py-8 text-sm text-muted-foreground">
					<LoaderCircleIcon class="size-4 animate-spin" />
					<span>Mengambil data</span>
				</div>
			{:else if transactions.length === 0}
				<p class="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
					Belum ada transaksi. Tambahkan lewat catatan natural di halaman Home.
				</p>
			{:else}
				<div class="divide-y divide-border">
					{#each transactions as item (item.id)}
						<article class="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
							<div>
								<p class="font-medium">{item.category || "Transaksi"}</p>
								<p class="mt-1 text-sm text-muted-foreground">{formatDate(item.created_at)}</p>
							</div>
							<p class={`font-semibold ${item.type === "income" ? "text-chart-1" : "text-destructive"}`}>
								{item.type === "income" ? "+" : "-"}{formatCurrency(Number(item.amount || 0))}
							</p>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</section>
