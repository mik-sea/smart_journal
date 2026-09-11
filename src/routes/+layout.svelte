<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SunIcon from "@lucide/svelte/icons/sun";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";

	type ThemeMode = 'system' | 'light' | 'dark';

	let { children } = $props();
	let themeMode = $state<ThemeMode>('system');
	let systemTheme = $state<'light' | 'dark'>('light');
	let resolvedTheme = $derived(themeMode === 'system' ? systemTheme : themeMode);

	const themeOptions: { value: ThemeMode; label: string; icon: typeof MonitorIcon }[] = [
		{ value: 'system', label: 'System', icon: MonitorIcon },
		{ value: 'light', label: 'Light', icon: SunIcon },
		{ value: 'dark', label: 'Dark', icon: MoonIcon },
	];

	function setThemeMode(value: ThemeMode) {
		themeMode = value;
		localStorage.setItem('smart-journal-theme', value);
	}

	onMount(() => {
		const storedTheme = localStorage.getItem('smart-journal-theme');
		const media = window.matchMedia('(prefers-color-scheme: dark)');

		if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
			themeMode = storedTheme;
		}

		const syncSystemTheme = () => {
			systemTheme = media.matches ? 'dark' : 'light';
		};

		syncSystemTheme();
		media.addEventListener('change', syncSystemTheme);

		return () => media.removeEventListener('change', syncSystemTheme);
	});
</script>

<svelte:head>
	<title>Smart Journal - We Will Remember</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background text-foreground" class:dark={resolvedTheme === 'dark'}>
	<Sidebar.Provider>
		<AppSidebar />
		<main class="flex min-h-screen flex-1 flex-col">
			<div class="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur">
				<div class="flex items-center gap-2">
					<div class="md:hidden">
						<Sidebar.Trigger />
					</div>
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
	</Sidebar.Provider>
</div>
