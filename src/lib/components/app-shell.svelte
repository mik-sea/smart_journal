<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="min-h-screen bg-background">
		<div class="sticky top-0 z-20 flex h-12 items-center border-b border-border bg-background/95 px-4 backdrop-blur">
			<Sidebar.Trigger />
		</div>
		{@render children?.()}
	</Sidebar.Inset>
</Sidebar.Provider>
