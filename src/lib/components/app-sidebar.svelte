<script lang="ts">
 import * as Sidebar from "$lib/components/ui/sidebar/index.js";
 
 
 //icon
 import HouseIcon from "@lucide/svelte/icons/house";
const items = [
    {
      title: "Home",
      url: "#",
      icon: HouseIcon,
    },
    {
      title: "Finance Tracker",
      url: "#",
      icon: HouseIcon,
    },
    {
      title: "Reminders",
      url: "#",
      icon: HouseIcon,
    },
    {
      title: "Settings",
      url: "#",
      icon: HouseIcon,
    },
]

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