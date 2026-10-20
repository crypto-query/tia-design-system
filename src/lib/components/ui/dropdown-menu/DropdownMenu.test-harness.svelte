<script lang="ts">
    import { Eraser } from "lucide-svelte";
    import DropdownMenu from "./DropdownMenu.svelte";
    import DropdownMenuGroup from "./DropdownMenuGroup.svelte";
    import DropdownMenuItem from "./DropdownMenuItem.svelte";
    import DropdownMenuSeparator from "./DropdownMenuSeparator.svelte";

    // The trigger and items have to be written in a parent: `createRawSnippet` renders a string
    // of HTML, with no element to spread the primitive's props onto.
    let { open = $bindable(false), tooltip = $bindable(true), logScale = $bindable(false), selected = $bindable("none") } = $props();
</script>

<div class="flex justify-end">
    <DropdownMenu aria-label="Settings" bind:open>
        {#snippet trigger({ props })}
            <button {...props} class="size-7.5" type="button" aria-label="Settings">S</button>
        {/snippet}
        <DropdownMenuGroup heading="Actions">
            <DropdownMenuItem description="Hides every line except Actual." label="Clear" onSelect={() => (selected = "Clear")}>
                {#snippet leadingIcon()}<Eraser />{/snippet}
            </DropdownMenuItem>
            <DropdownMenuItem disabled label="Export" onSelect={() => (selected = "Export")} />
            <DropdownMenuItem label="Reset" onSelect={() => (selected = "Reset")} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup heading="Show">
            <DropdownMenuItem description="Values of the day under the pointer." label="Tooltip" bind:checked={tooltip} />
            <DropdownMenuItem label="Log scale" bind:checked={logScale} />
        </DropdownMenuGroup>
    </DropdownMenu>
</div>

<output data-testid="state">open={open} tooltip={tooltip} logScale={logScale} selected={selected}</output>
