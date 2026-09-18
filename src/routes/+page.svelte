<script lang="ts">
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BellRingIcon from "@lucide/svelte/icons/bell-ring";
	import BrainCircuitIcon from "@lucide/svelte/icons/brain-circuit";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";

	import { Button } from "$lib/components/ui/button/index.js";

	const benefits = [
		{
			title: "Satu input untuk banyak kebutuhan",
			description: "Tulis natural seperti jurnal harian. Smart Journal memisahkan catatan, transaksi, dan reminder dari satu kalimat.",
			icon: BrainCircuitIcon,
		},
		{
			title: "Keuangan harian ikut rapi",
			description: "Pengeluaran dan pemasukan langsung tersusun dengan nominal, kategori, dan riwayat yang mudah dipindai.",
			icon: WalletCardsIcon,
		},
		{
			title: "Reminder siap dikirim",
			description: "Catatan yang punya waktu pengingat disimpan sebagai reminder, siap dikirim melalui email.",
			icon: BellRingIcon,
		},
		{
			title: "Aman dengan Firebase Auth",
			description: "Login ditukar ke session cookie HttpOnly, lalu backend tetap memverifikasi user dari Firebase.",
			icon: ShieldCheckIcon,
		},
	];

	const previewItems = [
		"Beli paket XL 60rb, ingatkan 3 hari sebelum habis",
		"Invoice project masuk 2,5jt",
		"Catat ide fitur laporan mingguan",
	];
</script>

<svelte:head>
	<title>Smart Journal - Journal pintar untuk hidup yang lebih rapi</title>
	<meta
		name="description"
		content="Smart Journal mengubah catatan natural menjadi jurnal, transaksi keuangan, dan reminder berbasis Firebase Auth."
	/>
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
	<section class="border-b border-border bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_70%)]">
		<nav class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
			<a href="/" class="flex items-center gap-2 font-semibold" aria-label="Smart Journal">
				<span class="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<SparklesIcon class="size-4" />
				</span>
				<span>Smart Journal</span>
			</a>

			<div class="flex items-center gap-2">
				<Button variant="ghost" href="/login">Login</Button>
				<Button href="/register">
					Register
					<ArrowRightIcon class="size-4" />
				</Button>
			</div>
		</nav>

		<div class="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-20 lg:pt-12">
			<div class="max-w-2xl">
				<p class="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm text-muted-foreground shadow-xs">
					<CheckCircle2Icon class="size-4 text-chart-1" />
					Jurnal, finance tracker, dan reminder dalam satu alur
				</p>
				<h1 class="text-4xl font-semibold tracking-normal text-balance sm:text-5xl lg:text-6xl">
					Smart Journal untuk mencatat cepat dan menata hidup lebih rapi.
				</h1>
				<p class="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
					Tulis apa yang terjadi hari ini dengan bahasa biasa. Smart Journal membantu mengubahnya menjadi catatan, transaksi, dan pengingat yang siap ditindaklanjuti.
				</p>

				<div class="mt-7 flex flex-col gap-3 sm:flex-row">
					<Button size="lg" href="/register">
						Mulai sekarang
						<ArrowRightIcon class="size-4" />
					</Button>
					<Button size="lg" variant="outline" href="/login">Saya sudah punya akun</Button>
				</div>
			</div>

			<div class="relative">
				<img
					src="/smart-journal-preview.png"
					alt="Preview dashboard Smart Journal"
					class="aspect-[16/10] w-full rounded-md border border-border object-cover shadow-xl"
				/>
			</div>
		</div>
	</section>

	<section class="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-16">
		<div>
			<p class="text-sm font-medium text-chart-3">Kenapa Smart Journal</p>
			<h2 class="mt-2 text-3xl font-semibold tracking-normal">Lebih sedikit aplikasi, lebih banyak konteks.</h2>
			<p class="mt-4 leading-7 text-muted-foreground">
				Smart Journal cocok untuk catatan kecil yang biasanya tercecer: uang keluar, uang masuk, ide, tugas kecil, sampai reminder penting.
			</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-2">
			{#each benefits as benefit}
				<article class="rounded-md border border-border bg-card p-5 shadow-xs">
					<div class="mb-4 flex size-10 items-center justify-center rounded-md bg-secondary">
						<benefit.icon class="size-5 text-chart-3" />
					</div>
					<h3 class="font-semibold">{benefit.title}</h3>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
				</article>
			{/each}
		</div>
	</section>

	<section class="border-t border-border bg-secondary/60">
		<div class="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:py-16">
			<div class="rounded-md border border-border bg-background p-5 shadow-xs">
				<p class="mb-3 text-sm font-medium text-muted-foreground">Contoh input</p>
				<div class="space-y-2">
					{#each previewItems as item}
						<div class="rounded-md border border-border bg-card px-4 py-3 text-sm">{item}</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-col justify-center">
				<h2 class="text-3xl font-semibold tracking-normal">Login sekali, browser mengirim session cookie ke BE.</h2>
				<p class="mt-4 leading-7 text-muted-foreground">
					Setelah user login lewat Firebase Auth, frontend menukar ID token menjadi cookie HttpOnly. Request berikutnya memakai cookie, bukan bearer token JavaScript.
				</p>
				<div class="mt-6">
					<Button href="/login">
						Masuk ke home
						<ArrowRightIcon class="size-4" />
					</Button>
				</div>
			</div>
		</div>
	</section>
</main>
