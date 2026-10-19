<script lang="ts">
    import { ChevronDown, CircleHelp } from "lucide-svelte";
    import Button from "$lib/components/ui/button/Button.svelte";
    import Kbd from "$lib/components/ui/kbd/Kbd.svelte";
    import Popover from "$lib/components/ui/popover/Popover.svelte";
    import Toggle from "$lib/components/ui/toggle/Toggle.svelte";

    const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

    let included = $state<Record<number, boolean>>(Object.fromEntries(YEARS.map((year) => [year, true])));
    const count = $derived(YEARS.filter((year) => included[year]).length);

    // One popover open at a time across the page: the call site owns `open`.
    let openId = $state<string | null>(null);

    function bind(id: string) {
        return {
            open: openId === id,
            onOpenChange: (next: boolean) => {
                if (next) openId = id;
                else if (openId === id) openId = null;
            }
        };
    }

    function includeAll() {
        for (const year of YEARS) included[year] = true;
    }

    function onlyRecent() {
        for (const [index, year] of YEARS.entries()) included[year] = index >= YEARS.length - 5;
    }

    const HELP = [
        { title: "Show or hide a line", text: "Click its chip. Hover a chip to highlight its line." },
        { title: "Move Actual", text: "Drag the Actual line, or focus the chart and use the arrow keys." },
        { title: "Zoom", text: "Drag the handles of the slider under the chart." },
        { title: "Log scale", text: "Makes large moves easier to compare." },
        { title: "Reset", text: "Shows all lines and includes all years again. It does not change the asset, the Base Year or Log scale." }
    ];
</script>

<svelte:head>
    <title>Popover — playground</title>
</svelte:head>

{#snippet years(sheet: boolean)}
    <p class="text-xs/normal text-foreground-muted">Pick the years that make up the average. At least one year stays included.</p>
    <div class="grid grid-cols-5 gap-1.5">
        {#each YEARS as year (year)}
            <Toggle bind:pressed={included[year]} disabled={included[year] && count === 1} size={sheet ? "lg" : "sm"} variant="outline">
                {year}
            </Toggle>
        {/each}
    </div>
    <div class="flex gap-2 pt-1">
        <Button onclick={includeAll} size={sheet ? "lg" : "sm"} variant="outline">Include all</Button>
        <Button onclick={onlyRecent} size={sheet ? "lg" : "sm"} variant="outline">Only recent 5</Button>
    </div>
    <p class="border-t border-border-muted pt-2 text-2xs text-foreground-subtle">Changes reload the average.</p>
{/snippet}

{#snippet help(sheet: boolean)}
    <ul class={["grid", sheet ? "gap-2.5 text-sm/normal" : "gap-2 text-xs/normal", "text-foreground-muted"]}>
        <li>
            <span class={["block font-semibold text-popover-foreground", sheet ? "text-md" : "text-sm"]}>Change the years</span>
            Open the year badge, for example <Kbd>8/10</Kbd>, on Bear, Bull, Halving or Decade offsets.
        </li>
        {#each HELP as item (item.title)}
            <li>
                <span class={["block font-semibold text-popover-foreground", sheet ? "text-md" : "text-sm"]}>{item.title}</span>
                {item.text}
            </li>
        {/each}
    </ul>
{/snippet}

{#snippet badge(props: Record<string, unknown>)}
    <button
        {...props}
        class="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-input bg-surface px-2.5 py-1 text-xs font-semibold text-foreground tabular-nums hover:border-primary">
        {count}/{YEARS.length}
        <ChevronDown class="size-3.5" />
    </button>
{/snippet}

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Popover</h1>
        <p class="max-w-3xl text-sm text-foreground-muted">
            A panel with controls in it, opened by a click on the caller's own element, on the bits-ui <code class="font-mono"
                >popover</code>
            primitive. Escape and a click outside close it, and focus goes back to the trigger. The panel is a
            <code class="font-mono">dialog</code> named by its <code class="font-mono">title</code>. With
            <code class="font-mono">sheet</code> the same panel draws as a bottom sheet with a close button, for a narrow container — the
            call site decides when, from its own width. Each page keeps one panel open at a time: <code class="font-mono">open</code> is the call
            site's.
        </p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Popover</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Anchored to the trigger, <code class="font-mono">side="bottom"</code> and <code class="font-mono">align="start"</code> by default.
            The help panel opens to the left of a round button at the card's right edge.
        </p>
        <div class="flex items-center justify-between gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <div class="flex items-center gap-2 text-sm font-semibold">
                Bear
                <Popover {...bind("years")} title="Bear years">
                    {#snippet trigger({ props })}
                        {@render badge(props)}
                    {/snippet}
                    {@render years(false)}
                </Popover>
            </div>
            <Popover {...bind("help")} align="end" class="w-85" title="How to use this chart">
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="How to use this chart" class="size-8" size="icon" variant="outline">
                        <CircleHelp class="size-4.5" />
                    </Button>
                {/snippet}
                {@render help(false)}
            </Popover>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sheet</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            The same content with <code class="font-mono">sheet</code>: full width, fixed to the bottom of the viewport, over a scrim. The
            close button is a 44px target, and the call site raises its own controls to the touch size.
        </p>
        <div class="flex max-w-sm items-center justify-between gap-4 rounded-xl border border-border-muted bg-surface p-4">
            <div class="flex items-center gap-2 text-sm font-semibold">
                Bear
                <Popover {...bind("years-sheet")} sheet title="Bear years">
                    {#snippet trigger({ props })}
                        {@render badge(props)}
                    {/snippet}
                    {@render years(true)}
                </Popover>
            </div>
            <Popover {...bind("help-sheet")} sheet title="How to use this chart">
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="How to use this chart" class="size-11" size="icon" variant="outline">
                        <CircleHelp class="size-5" />
                    </Button>
                {/snippet}
                {@render help(true)}
            </Popover>
        </div>
    </section>
</div>
