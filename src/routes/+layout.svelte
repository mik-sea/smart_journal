<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import HouseIcon from "@lucide/svelte/icons/house";
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import SunIcon from "@lucide/svelte/icons/sun";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";

	type ThemeMode = 'system' | 'light' | 'dark';

	let { children } = $props();
	let themeMode = $state<ThemeMode>('system');
	let systemTheme = $state<'light' | 'dark'>('light');
	let resolvedTheme = $derived(themeMode === 'system' ? systemTheme : themeMode);
	let currentPath = $derived(page.url.pathname);

	const themeOptions: { value: ThemeMode; label: string; icon: typeof MonitorIcon }[] = [
		{ value: 'system', label: 'System', icon: MonitorIcon },
		{ value: 'light', label: 'Light', icon: SunIcon },
		{ value: 'dark', label: 'Dark', icon: MoonIcon },
	];

	const navItems = [
		{ title: 'Home', url: '/', icon: HouseIcon },
		{ title: 'Finance', url: '/finance', icon: WalletCardsIcon },
		{ title: 'Reminders', url: '/reminders', icon: AlarmClockIcon },
		{ title: 'Settings', url: '/settings', icon: SettingsIcon },
	];

	function setThemeMode(value: ThemeMode) {
		themeMode = value;
		localStorage.setItem('smart-journal-theme', value);
		window.dispatchEvent(new CustomEvent<ThemeMode>('smart-journal-theme-change', { detail: value }));
	}

	onMount(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');

		const isThemeMode = (value: string | null): value is ThemeMode =>
			value === 'light' || value === 'dark' || value === 'system';

		const syncStoredTheme = () => {
			const storedTheme = localStorage.getItem('smart-journal-theme');

			if (isThemeMode(storedTheme)) {
				themeMode = storedTheme;
			}
		};

		const syncSystemTheme = () => {
			systemTheme = media.matches ? 'dark' : 'light';
		};

		const handleThemeChange = (event: Event) => {
			const value = (event as CustomEvent<ThemeMode>).detail;

			if (isThemeMode(value)) {
				themeMode = value;
			}
		};

		const handleStorage = (event: StorageEvent) => {
			if (event.key === 'smart-journal-theme' && isThemeMode(event.newValue)) {
				themeMode = event.newValue;
			}
		};

		syncStoredTheme();
		syncSystemTheme();
		media.addEventListener('change', syncSystemTheme);
		window.addEventListener('smart-journal-theme-change', handleThemeChange);
		window.addEventListener('storage', handleStorage);

		return () => {
			media.removeEventListener('change', syncSystemTheme);
			window.removeEventListener('smart-journal-theme-change', handleThemeChange);
			window.removeEventListener('storage', handleStorage);
		};
	});
</script>

<svelte:head>
	<title>Smart Journal - We Will Remember</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background text-foreground" class:dark={resolvedTheme === 'dark'}>
	<Sidebar.Provider>
		<AppSidebar />
		<main class="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
			<div class="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur">
				<div class="flex items-center gap-2">
					<div class="md:hidden">
						<Sidebar.Trigger />
					</div>
					<a href="/" class="text-sm font-medium md:hidden">Smart Journal</a>
				</div>

				<div class="flex rounded-md border border-border bg-card p-1">
					{#each themeOptions as option (option.value)}
						<Button
							variant={themeMode === option.value ? 'secondary' : 'ghost'}
							size="sm"
							class="h-8 px-2 text-xs sm:px-3"
							aria-label={`Gunakan tema ${option.label}`}
							aria-pressed={themeMode === option.value}
							title={`Tema ${option.label}`}
							onclick={() => setThemeMode(option.value)}
						>
							<option.icon class="size-4" />
							<span class="hidden sm:inline">{option.label}</span>
						</Button>
					{/each}
				</div>
			</div>
			{@render children?.()}
		</main>

		<nav class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
			<div class="grid h-16 grid-cols-4">
				{#each navItems as item (item.title)}
					<a
						href={item.url}
						class={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
							currentPath === item.url ? 'text-foreground' : 'text-muted-foreground'
						}`}
						aria-current={currentPath === item.url ? 'page' : undefined}
					>
						<item.icon class="size-4" />
						<span>{item.title}</span>
					</a>
				{/each}
			</div>
		</nav>
	</Sidebar.Provider>
</div>
