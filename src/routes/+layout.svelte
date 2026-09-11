<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  	import AppSidebar from "$lib/components/app-sidebar.svelte";
	let { children } = $props();
</script>

<svelte:head>
	<title>Smart Journal - We Will Remember</title>
	<link rel="icon" href={favicon} />
</svelte:head>
<!-- {@render children()} -->

<Sidebar.Provider>
  <AppSidebar />
  <main class="flex-1 flex flex-col">
    <Sidebar.Trigger />
    {@render children?.()}
  </main>
</Sidebar.Provider>
