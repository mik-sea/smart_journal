<script lang="ts">
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import HouseIcon from "@lucide/svelte/icons/house";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";

	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	const items = [
		{
			title: "Home",
			url: "/",
			icon: HouseIcon,
		},
		{
			title: "Finance",
			url: "/finance",
			icon: WalletCardsIcon,
		},
		{
			title: "Reminders",
			url: "#reminders",
			icon: AlarmClockIcon,
		},
		{
			title: "Settings",
			url: "#settings",
			icon: SettingsIcon,
		},
	];
</script>
 
<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Smart Journal</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
