<script lang="ts">
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ChartNoAxesColumnIncreasingIcon from "@lucide/svelte/icons/chart-no-axes-column-increasing";
	import CircleDollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";

	type Transaction = {
		title: string;
		category: string;
		time: string;
		amount: string;
		type: "income" | "expense";
	};

	const transactions: Transaction[] = [
		{ title: "Invoice freelance cair", category: "Project", time: "13:30", amount: "+Rp 1.250.000", type: "income" },
		{ title: "Kopi sebelum meeting", category: "Makanan", time: "08:10", amount: "-Rp 30.000", type: "expense" },
		{ title: "Langganan tools", category: "Produktivitas", time: "Kemarin", amount: "-Rp 120.000", type: "expense" },
		{ title: "Gaji masuk", category: "Gaji", time: "Senin", amount: "+Rp 5.000.000", type: "income" },
	];

	const categories = [
		{ name: "Makanan", value: "Rp 430.000", width: "72%" },
		{ name: "Tagihan", value: "Rp 310.000", width: "52%" },
		{ name: "Produktivitas", value: "Rp 120.000", width: "28%" },
	];
</script>

<svelte:head>
	<title>Finance - Smart Journal</title>
</svelte:head>

<section class="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Ringkasan arus uang</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Finance</h1>
			</div>
			<div class="rounded-md border border-border px-3 py-2 text-sm">
				<span class="text-muted-foreground">Saldo bulan ini</span>
				<span class="ml-2 font-medium">Rp 6.100.000</span>
			</div>
		</header>

		<div class="grid gap-4 md:grid-cols-3">
			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
					<CircleDollarSignIcon class="size-4" />
					<span>Pemasukan</span>
				</div>
				<p class="text-2xl font-semibold">Rp 6.250.000</p>
				<p class="mt-1 text-sm text-chart-1">+18% dari bulan lalu</p>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
					<WalletCardsIcon class="size-4" />
					<span>Pengeluaran</span>
				</div>
				<p class="text-2xl font-semibold">Rp 1.020.000</p>
				<p class="mt-1 text-sm text-destructive">3 transaksi besar</p>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
					<ChartNoAxesColumnIncreasingIcon class="size-4" />
					<span>Net</span>
				</div>
				<p class="text-2xl font-semibold">Rp 5.230.000</p>
				<p class="mt-1 text-sm text-muted-foreground">Estimasi tersisa</p>
			</section>
		</div>

		<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
			<section class="rounded-md border border-border bg-card p-4 sm:p-5">
				<div class="mb-4 flex items-center justify-between gap-3">
					<h2 class="text-base font-medium">Transaksi terbaru</h2>
					<span class="text-sm text-muted-foreground">{transactions.length} item</span>
				</div>

				<div class="space-y-1">
					{#each transactions as item}
						<article class="flex gap-3 rounded-md px-2 py-3 hover:bg-secondary/60">
							<div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
								{#if item.type === "income"}
									<ArrowDownIcon class="size-4 text-chart-1" />
								{:else}
									<ArrowUpIcon class="size-4 text-destructive" />
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between gap-3">
									<p class="truncate font-medium">{item.title}</p>
									<span class={`shrink-0 text-sm font-medium ${item.type === "income" ? "text-chart-1" : "text-destructive"}`}>
										{item.amount}
									</span>
								</div>
								<p class="mt-1 truncate text-sm text-muted-foreground">{item.category} - {item.time}</p>
							</div>
						</article>
					{/each}
				</div>
			</section>

			<section class="rounded-md border border-border bg-card p-4 sm:p-5">
				<h2 class="text-base font-medium">Kategori</h2>
				<div class="mt-4 space-y-4">
					{#each categories as item}
						<div>
							<div class="mb-2 flex items-center justify-between gap-3 text-sm">
								<span>{item.name}</span>
								<span class="text-muted-foreground">{item.value}</span>
							</div>
							<div class="h-2 overflow-hidden rounded-full bg-secondary">
								<div class="h-full rounded-full bg-foreground" style={`width: ${item.width}`}></div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</section>
