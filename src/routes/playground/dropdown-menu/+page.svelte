<script lang="ts">
    import { Download, Eraser, Ellipsis, RotateCcw, Settings, Spline, SquareMousePointer, Type } from "lucide-svelte";
    import Button from "$lib/components/ui/button/Button.svelte";
    import DropdownMenu from "$lib/components/ui/dropdown-menu/DropdownMenu.svelte";
    import DropdownMenuGroup from "$lib/components/ui/dropdown-menu/DropdownMenuGroup.svelte";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/DropdownMenuItem.svelte";
    import DropdownMenuSeparator from "$lib/components/ui/dropdown-menu/DropdownMenuSeparator.svelte";

    let tooltip = $state(true);
    let labels = $state(true);
    let logScale = $state(false);
    let last = $state("none");
</script>

<svelte:head>
    <title>Dropdown menu — playground</title>
</svelte:head>

{#snippet roundTrigger(props: Record<string, unknown>, label: string)}
    <button
        {...props}
        type="button"
        aria-label={label}
        class="grid size-7.5 shrink-0 cursor-pointer place-items-center rounded-full border border-border-input bg-surface text-foreground hover:bg-muted aria-expanded:border-primary aria-expanded:bg-background pointer-coarse:size-11">
        <Settings aria-hidden="true" class="size-4" />
    </button>
{/snippet}

{#snippet settings()}
    <DropdownMenuGroup heading="Actions">
        <DropdownMenuItem description="Hides every line except Actual." label="Clear" onSelect={() => (last = "Clear")}>
            {#snippet leadingIcon()}<Eraser />{/snippet}
        </DropdownMenuItem>
        <DropdownMenuItem
            description="Shows all lines and years, full zoom, Actual back in place."
            label="Reset"
            onSelect={() => (last = "Reset")}>
            {#snippet leadingIcon()}<RotateCcw />{/snippet}
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup heading="Show">
        <DropdownMenuItem description="Values of the day under the pointer." label="Tooltip" bind:checked={tooltip}>
            {#snippet leadingIcon()}<SquareMousePointer />{/snippet}
        </DropdownMenuItem>
        <DropdownMenuItem description="Months and % values on the axes." label="Axis labels" bind:checked={labels}>
            {#snippet leadingIcon()}<Type />{/snippet}
        </DropdownMenuItem>
        <DropdownMenuItem description="Makes large moves easier to compare." label="Log scale" bind:checked={logScale}>
            {#snippet leadingIcon()}<Spline />{/snippet}
        </DropdownMenuItem>
    </DropdownMenuGroup>
{/snippet}

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Dropdown menu</h1>
        <p class="max-w-3xl text-sm text-foreground-muted">
            A menu of actions and on/off settings, opened by the caller's own element, on the bits-ui
            <code class="font-mono">dropdown-menu</code> primitive. An item is an action, which closes the menu. Bind
            <code class="font-mono">checked</code> and it becomes a <code class="font-mono">menuitemcheckbox</code> with a switch at its end,
            and the menu stays open. Arrow keys move the highlight; Escape closes and focus goes back to the trigger. The panel aligns to the
            trigger's end and stays 8px inside the viewport.
        </p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Settings: icons, switches and help text</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            A round icon trigger at the card's right edge, as the Predictive Cycles Block draws it. Last action: <span
                class="font-semibold text-foreground"
                data-testid="last">{last}</span>
            · tooltip={tooltip} labels={labels} logScale={logScale}
        </p>
        <div class="flex items-center justify-between gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <span class="text-sm font-semibold">Chart</span>
            <DropdownMenu aria-label="Settings">
                {#snippet trigger({ props })}
                    {@render roundTrigger(props, "Settings")}
                {/snippet}
                {@render settings()}
            </DropdownMenu>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Plain items, no headings, a disabled item</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Without a description a row is one line. A disabled row is skipped by the arrow keys and cannot be chosen.
        </p>
        <div class="flex items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <DropdownMenu align="start" aria-label="More" class="w-56">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">
                        {#snippet leadingIcon()}<Ellipsis aria-hidden="true" class="size-4" />{/snippet}
                        More
                    </Button>
                {/snippet}
                <DropdownMenuItem label="Export CSV" onSelect={() => (last = "Export CSV")}>
                    {#snippet leadingIcon()}<Download />{/snippet}
                </DropdownMenuItem>
                <DropdownMenuItem disabled label="Export PNG" />
                <DropdownMenuSeparator />
                <DropdownMenuItem label="Log scale" bind:checked={logScale} />
                <DropdownMenuItem checked={false} description="Needs a paid plan." disabled label="Volume" />
            </DropdownMenu>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Narrow card</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            The same menu in a 360px card. The trigger grows to 44px on a touch screen. On a 360px viewport the 300px panel still fits, 8px
            from each edge.
        </p>
        <div class="flex w-90 max-w-full items-center justify-between gap-4 rounded-xl border border-border-muted bg-surface p-4">
            <span class="text-sm font-semibold">Chart</span>
            <DropdownMenu aria-label="Settings (narrow)">
                {#snippet trigger({ props })}
                    {@render roundTrigger(props, "Settings (narrow)")}
                {/snippet}
                {@render settings()}
            </DropdownMenu>
        </div>
    </section>
</div>
