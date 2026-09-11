<script lang="ts">
	import { onMount } from "svelte";
	import { animate, createTimeline, onScroll, utils } from "animejs";
	import BellRingIcon from "@lucide/svelte/icons/bell-ring";
	import CheckIcon from "@lucide/svelte/icons/check";
	import Globe2Icon from "@lucide/svelte/icons/globe-2";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import MailIcon from "@lucide/svelte/icons/mail";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import PlugZapIcon from "@lucide/svelte/icons/plug-zap";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	type ThemePreference = "system" | "light" | "dark";

	let email = $state("user@smartjournal.app");
	let webhookUrl = $state("https://discord.com/api/webhooks/...");
	let timezone = $state("Asia/Jakarta");
	let themePreference = $state<ThemePreference>("system");
	let discordEnabled = $state(true);
	let reminderLeadTime = $state("3 hari sebelum");
	let saveMessage = $state("");
	let motionCleanups: (() => void)[] = [];

	const timezones = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "UTC"];

	const themeOptions: { value: ThemePreference; label: string }[] = [
		{ value: "system", label: "System" },
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
	];

	function isThemePreference(value: string | null): value is ThemePreference {
		return value === "system" || value === "light" || value === "dark";
	}

	function syncThemePreference() {
		const storedTheme = localStorage.getItem("smart-journal-theme");

		if (isThemePreference(storedTheme)) {
			themePreference = storedTheme;
		}
	}

	function cleanupMotion() {
		motionCleanups.forEach((cleanup) => cleanup());
		motionCleanups = [];
	}

	function setupSettingsScrollAnimations() {
		const elements = utils.$("[data-settings-animate]") as HTMLElement[];
		const icons = utils.$("[data-settings-icon]") as HTMLElement[];

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			[...elements, ...icons].forEach((element) => {
				element.style.opacity = "1";
				element.style.transform = "none";
			});
			return;
		}

		elements.forEach((element, index) => {
			const animation = animate(element, {
				opacity: [0, 1],
				y: [18, 0],
				scale: [0.985, 1],
				duration: 720,
				delay: index * 35,
				ease: "out(4)",
				autoplay: onScroll({ target: element, repeat: false, debug: false }),
			});

			motionCleanups.push(() => animation.revert());
		});

		icons.forEach((icon) => {
			const timeline = createTimeline({
				autoplay: onScroll({ target: icon, repeat: false, debug: false }),
			})
				.add(icon, {
					opacity: [0, 1],
					scale: [0.82, 1.04],
					rotate: [-4, 1],
					duration: 420,
					ease: "out(4)",
				})
				.add(icon, {
					scale: 1,
					rotate: 0,
					duration: 180,
					ease: "out(3)",
				});

			motionCleanups.push(() => timeline.revert());
		});
	}

	function animateTap(target: EventTarget | null) {
		if (!(target instanceof HTMLElement) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		animate(target, {
			scale: [0.97, 1],
			duration: 240,
			ease: "out(4)",
		});
	}

	function setThemePreference(value: ThemePreference, target: EventTarget | null = null) {
		themePreference = value;
		localStorage.setItem("smart-journal-theme", value);
		window.dispatchEvent(new CustomEvent<ThemePreference>("smart-journal-theme-change", { detail: value }));
		animateTap(target);
	}

	function saveSettings(event?: MouseEvent) {
		saveMessage = "Pengaturan disimpan.";
		animateTap(event?.currentTarget ?? null);

		window.setTimeout(() => {
			saveMessage = "";
		}, 2400);
	}

	onMount(() => {
		const handleThemeChange = (event: Event) => {
			const value = (event as CustomEvent<ThemePreference>).detail;

			if (isThemePreference(value)) {
				themePreference = value;
			}
		};

		const handleStorage = (event: StorageEvent) => {
			if (event.key === "smart-journal-theme") syncThemePreference();
		};

		syncThemePreference();
		setupSettingsScrollAnimations();
		window.addEventListener("smart-journal-theme-change", handleThemeChange);
		window.addEventListener("storage", handleStorage);

		return () => {
			cleanupMotion();
			window.removeEventListener("smart-journal-theme-change", handleThemeChange);
			window.removeEventListener("storage", handleStorage);
		};
	});
</script>

<svelte:head>
	<title>Settings - Smart Journal</title>
</svelte:head>

<section class="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
		<header data-settings-animate class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Akun dan integrasi</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Settings</h1>
			</div>

			<div class="flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center">
				{#if saveMessage}
					<div class="flex items-center gap-2 text-sm text-chart-1">
						<CheckIcon class="size-4" />
						<span>{saveMessage}</span>
					</div>
				{/if}
				<Button class="w-full sm:w-auto" onclick={saveSettings}>
					<CheckIcon class="size-4" />
					Simpan
				</Button>
			</div>
		</header>

		<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
			<div class="space-y-5">
				<section data-settings-animate class="settings-card rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center gap-3">
						<div data-settings-icon class="settings-icon flex size-9 items-center justify-center rounded-md border border-border bg-background">
							<MailIcon class="size-4 text-muted-foreground" />
						</div>
						<div>
							<h2 class="text-base font-medium">Profil</h2>
							<p class="text-sm text-muted-foreground">Email dari akun login.</p>
						</div>
					</div>
					<label class="grid gap-2">
						<span class="text-sm font-medium">Email</span>
						<Input bind:value={email} type="email" disabled />
					</label>
				</section>

				<section data-settings-animate class="settings-card rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center gap-3">
						<div data-settings-icon class="settings-icon flex size-9 items-center justify-center rounded-md border border-border bg-background">
							<PlugZapIcon class="size-4 text-muted-foreground" />
						</div>
						<div>
							<h2 class="text-base font-medium">Discord</h2>
							<p class="text-sm text-muted-foreground">Webhook untuk mengirim reminder otomatis.</p>
						</div>
					</div>
					<div class="space-y-4">
						<label class="grid gap-2">
							<span class="text-sm font-medium">Webhook URL</span>
							<Input bind:value={webhookUrl} type="url" placeholder="https://discord.com/api/webhooks/..." />
						</label>
						<label class="flex items-center justify-between gap-4 rounded-md border border-border p-3">
							<span>
								<span class="block text-sm font-medium">Aktifkan pengiriman Discord</span>
								<span class="text-sm text-muted-foreground">Reminder pending akan dikirim lewat webhook.</span>
							</span>
							<input bind:checked={discordEnabled} type="checkbox" class="size-4 accent-foreground" aria-label="Aktifkan pengiriman Discord" />
						</label>
					</div>
				</section>

				<section data-settings-animate class="settings-card rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center gap-3">
						<div data-settings-icon class="settings-icon flex size-9 items-center justify-center rounded-md border border-border bg-background">
							<Globe2Icon class="size-4 text-muted-foreground" />
						</div>
						<div>
							<h2 class="text-base font-medium">Zona waktu</h2>
							<p class="text-sm text-muted-foreground">Dipakai untuk menerjemahkan kata seperti besok dan malam ini.</p>
						</div>
					</div>
					<label class="grid gap-2">
						<span class="text-sm font-medium">Default timezone</span>
						<select
							bind:value={timezone}
							class="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
							style="background: var(--background); color: var(--foreground);"
						>
							{#each timezones as item}
								<option class="bg-background text-foreground" style="background: var(--background); color: var(--foreground);" value={item}>
									{item}
								</option>
							{/each}
						</select>
					</label>
				</section>
			</div>

			<div class="space-y-5">
				<section data-settings-animate class="settings-card rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center gap-3">
						<div data-settings-icon class="settings-icon flex size-9 items-center justify-center rounded-md border border-border bg-background">
							<MoonIcon class="size-4 text-muted-foreground" />
						</div>
						<div>
							<h2 class="text-base font-medium">Tampilan</h2>
							<p class="text-sm text-muted-foreground">Preferensi tema default.</p>
						</div>
					</div>
					<div class="grid grid-cols-3 rounded-md border border-border bg-background p-1">
						{#each themeOptions as option}
							<Button
								variant={themePreference === option.value ? "secondary" : "ghost"}
								size="sm"
								aria-pressed={themePreference === option.value}
								onclick={(event) => setThemePreference(option.value, event.currentTarget)}
							>
								{option.label}
							</Button>
						{/each}
					</div>
				</section>

				<section data-settings-animate class="settings-card rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center gap-3">
						<div data-settings-icon class="settings-icon flex size-9 items-center justify-center rounded-md border border-border bg-background">
							<BellRingIcon class="size-4 text-muted-foreground" />
						</div>
						<div>
							<h2 class="text-base font-medium">Reminder</h2>
							<p class="text-sm text-muted-foreground">Aturan bawaan saat AI membuat alarm.</p>
						</div>
					</div>
					<label class="grid gap-2">
						<span class="text-sm font-medium">Lead time default</span>
						<Input bind:value={reminderLeadTime} placeholder="3 hari sebelum" />
					</label>
				</section>

				<section data-settings-animate class="settings-card rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center gap-3">
						<div data-settings-icon class="settings-icon flex size-9 items-center justify-center rounded-md border border-border bg-background">
							<ShieldCheckIcon class="size-4 text-muted-foreground" />
						</div>
						<div>
							<h2 class="text-base font-medium">Sesi</h2>
							<p class="text-sm text-muted-foreground">Keluar dari perangkat ini.</p>
						</div>
					</div>
					<Button variant="outline" class="w-full justify-center">
						<LogOutIcon class="size-4" />
						Logout
					</Button>
				</section>
			</div>
		</div>
	</div>
</section>

<style>
	:global([data-settings-animate]),
	:global([data-settings-icon]) {
		will-change: opacity, transform;
	}

	.settings-card {
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			box-shadow 180ms ease;
	}

	.settings-card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in oklch, var(--foreground) 18%, var(--border));
		box-shadow: 0 18px 42px -34px color-mix(in oklch, var(--foreground) 55%, transparent);
	}

	.settings-card:hover .settings-icon {
		border-color: color-mix(in oklch, var(--foreground) 18%, var(--border));
	}

	@media (prefers-reduced-motion: reduce) {
		:global([data-settings-animate]),
		:global([data-settings-icon]),
		.settings-card {
			transition: none;
			will-change: auto;
		}

		.settings-card:hover {
			transform: none;
		}
	}
</style>
