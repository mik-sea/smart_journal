<script lang="ts">
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<div class="main flex-1 flex flex-col ml-10 w-full">
    <div class="flex flex-wrap items-center gap-2 md:flex-row">
    <!-- <Button variant="outline">Button</Button> -->
    <Button variant="outline" size="lg" aria-label="Submit">
        Button with arrow up
        <ArrowUpIcon />
    </Button>
    </div>

    <div class="main-home">
        <div class="text-center">
            ketikan apa saja lee
        </div>
        <div class="input w-[50%] mx-auto mt-10 text-center">
            <Textarea placeholder="Type your message here." />
            <Button class="mt-5">
                Send message
                <ArrowUpIcon />
            </Button>
        </div>
    </div>
</div>