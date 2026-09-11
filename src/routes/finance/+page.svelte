<script lang="ts">
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
	import FilterIcon from "@lucide/svelte/icons/filter";
	import ReceiptTextIcon from "@lucide/svelte/icons/receipt-text";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";

	import { Button } from "$lib/components/ui/button/index.js";

	type Transaction = {
		date: string;
		title: string;
		category: string;
		amount: number;
		type: "income" | "expense";
	};

	const transactions: Transaction[] = [
		{
			date: "11 Sep",
			title: "Kopi sebelum meeting",
			category: "Makanan",
			amount: -30000,
			type: "expense",
		},
		{
			date: "11 Sep",
			title: "Invoice freelance cair",
			category: "Project",
			amount: 1250000,
			type: "income",
		},
		{
			date: "10 Sep",
			title: "Beli paket data XL",
			category: "Utilitas",
			amount: -60000,
			type: "expense",
		},
		{
			date: "09 Sep",
			title: "Makan siang",
			category: "Makanan",
			amount: -45000,
			type: "expense",
		},
		{
			date: "08 Sep",
			title: "Langganan app",
			category: "Produktivitas",
			amount: -99000,
			type: "expense",
		},
	];

	const categories = [
		{ name: "Makanan", amount: 75000 },
		{ name: "Utilitas", amount: 60000 },
		{ name: "Produktivitas", amount: 99000 },
	];

	const totalIncome = transactions
		.filter((transaction) => transaction.type === "income")
		.reduce((total, transaction) => total + transaction.amount, 0);

	const totalExpense = Math.abs(
		transactions
			.filter((transaction) => transaction.type === "expense")
			.reduce((total, transaction) => total + transaction.amount, 0)
	);

	const balance = totalIncome - totalExpense;
	const maxCategoryAmount = Math.max(...categories.map((category) => category.amount));

	function formatCurrency(value: number) {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		}).format(value);
	}
</script>

<svelte:head>
	<title>Finance - Smart Journal</title>
</svelte:head>

<section class="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">September 2026</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Finance</h1>
			</div>

			<Button variant="outline" class="w-fit">
				<CalendarDaysIcon class="size-4" />
				Bulan ini
			</Button>
		</header>

		<div class="grid gap-3 sm:grid-cols-3">
			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Saldo bersih</p>
					<WalletCardsIcon class="size-4 text-muted-foreground" />
				</div>
				<p class="text-2xl font-semibold">{formatCurrency(balance)}</p>
				<p class="mt-2 text-sm text-muted-foreground">Pemasukan dikurangi pengeluaran.</p>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Pemasukan</p>
					<ArrowUpIcon class="size-4 text-chart-1" />
				</div>
				<p class="text-2xl font-semibold text-chart-1">{formatCurrency(totalIncome)}</p>
				<p class="mt-2 text-sm text-muted-foreground">1 transaksi bulan ini.</p>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Pengeluaran</p>
					<ArrowDownIcon class="size-4 text-destructive" />
				</div>
				<p class="text-2xl font-semibold text-destructive">{formatCurrency(totalExpense)}</p>
				<p class="mt-2 text-sm text-muted-foreground">4 transaksi bulan ini.</p>
			</section>
		</div>

		<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
			<section class="rounded-md border border-border bg-card p-4 sm:p-5">
				<div class="mb-4 flex items-center justify-between gap-3">
					<div>
						<h2 class="text-base font-medium">Transaksi</h2>
						<p class="text-sm text-muted-foreground">Riwayat yang dikenali dari journal.</p>
					</div>
					<Button variant="outline" size="sm">
						<FilterIcon class="size-4" />
						Filter
					</Button>
				</div>

				<div class="divide-y divide-border rounded-md border border-border">
					{#each transactions as transaction}
						<article class="grid gap-3 p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
							<p class="text-sm text-muted-foreground">{transaction.date}</p>
							<div class="min-w-0">
								<p class="truncate font-medium">{transaction.title}</p>
								<p class="mt-1 text-sm text-muted-foreground">{transaction.category}</p>
							</div>
							<p
								class={`font-medium ${
									transaction.type === "income" ? "text-chart-1" : "text-destructive"
								}`}
							>
								{transaction.amount > 0 ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
							</p>
						</article>
					{/each}
				</div>
			</section>

			<section class="rounded-md border border-border bg-card p-4 sm:p-5">
				<div class="mb-5 flex items-center justify-between gap-3">
					<div>
						<h2 class="text-base font-medium">Kategori</h2>
						<p class="text-sm text-muted-foreground">Pengeluaran terbesar.</p>
					</div>
					<ReceiptTextIcon class="size-4 text-muted-foreground" />
				</div>

				<div class="space-y-4">
					{#each categories as category}
						<div>
							<div class="mb-2 flex items-center justify-between gap-3 text-sm">
								<span class="font-medium">{category.name}</span>
								<span class="text-muted-foreground">{formatCurrency(category.amount)}</span>
							</div>
							<div class="h-2 rounded-md bg-secondary">
								<div
									class="h-2 rounded-md bg-primary"
									style={`width: ${(category.amount / maxCategoryAmount) * 100}%`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</section>
