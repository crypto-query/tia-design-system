<script lang="ts">
    import Combobox, { type ComboboxItem } from "$lib/components/ui/combobox/Combobox.svelte";

    const assets: ComboboxItem[] = [
        { value: "btc", label: "Bitcoin", group: "Crypto" },
        { value: "eth", label: "Ethereum", group: "Crypto" },
        { value: "sol", label: "Solana", group: "Crypto", disabled: true },
        { value: "aapl", label: "Apple", group: "Stocks" },
        { value: "msft", label: "Microsoft", group: "Stocks" },
        { value: "nvda", label: "Nvidia", group: "Stocks" },
        { value: "xau", label: "Gold", group: "Metals" },
        { value: "xag", label: "Silver", group: "Metals" },
        { value: "spx", label: "S&P 500", group: "Indices" },
        { value: "ndx", label: "Nasdaq 100", group: "Indices" },
        { value: "dax", label: "DAX 40", group: "Indices" }
    ];

    const timeframes: ComboboxItem[] = [
        { value: "5m", label: "5 minutes" },
        { value: "15m", label: "15 minutes" },
        { value: "1h", label: "1 hour" },
        { value: "4h", label: "4 hours", disabled: true },
        { value: "1d", label: "1 day" }
    ];

    const sizes = ["sm", "md", "lg"] as const;

    let asset = $state("eth");
</script>

<svelte:head>
    <title>Combobox — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Combobox</h1>
        <p class="max-w-3xl text-sm text-foreground-muted">
            A Select with a search box in its panel. Typing filters the rows by letters in order, so "ndq" finds Nasdaq 100. Groups keep
            their declared order, and a heading goes once the query empties its group. The panel is never wider than the room beside the
            trigger.
        </p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sizes</h2>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-3">
            {#each sizes as size (size)}
                <Combobox items={assets} label={`size="${size}"`} {size} />
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Preset value, placeholder and ungrouped</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Solana and 4 hours are disabled rows. Type "zz" in any panel to see the empty message.
        </p>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-3">
            <div class="space-y-2">
                <Combobox items={assets} label="Chosen, bound" bind:value={asset} />
                <p class="font-mono text-xs text-foreground-subtle">value = "{asset}"</p>
            </div>
            <Combobox
                emptyMessage="No asset by that name."
                items={assets}
                label="Placeholders"
                placeholder="Choose an asset"
                searchPlaceholder="Search assets…" />
            <Combobox items={timeframes} label="Ungrouped" value="1h" />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Disabled</h2>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-2">
            <Combobox disabled items={assets} label="Disabled, empty" />
            <Combobox disabled items={assets} label="Disabled, chosen" value="btc" />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Inside a scoped root</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            <code class="font-mono">portalTarget</code> takes an element or a selector, and the panel mounts inside that container rather
            than on <code class="font-mono">&lt;body&gt;</code>.
        </p>
        <div id="combobox-scoped-root" class="max-w-sm rounded-xl border border-border-muted bg-surface p-6">
            <Combobox items={assets} label="portalTarget" portalTarget="#combobox-scoped-root" />
        </div>
    </section>
</div>
