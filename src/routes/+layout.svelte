<script lang="ts">
	import { onMount } from "svelte";
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { startAuthListener } from "$lib/auth";

	let { children } = $props();

	onMount(() => {
		startAuthListener();
	});
</script>

<svelte:head>
	<title>Smart Journal - We Will Remember</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
