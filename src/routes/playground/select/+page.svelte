<script lang="ts">
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Select, { type SelectItem } from "$lib/components/ui/select/Select.svelte";

    const assets: SelectItem[] = [
        { value: "btc", label: "Bitcoin", group: "Crypto" },
        { value: "eth", label: "Ethereum", group: "Crypto" },
        { value: "sol", label: "Solana", group: "Crypto" },
        { value: "aapl", label: "Apple", group: "Stocks" },
        { value: "msft", label: "Microsoft", group: "Stocks" },
        { value: "nvda", label: "Nvidia", group: "Stocks" },
        { value: "xau", label: "Gold", group: "Metals" },
        { value: "xag", label: "Silver", group: "Metals" },
        { value: "spx", label: "S&P 500", group: "Indices" },
        { value: "ndx", label: "Nasdaq 100", group: "Indices" },
        { value: "dax", label: "DAX 40", group: "Indices" }
    ];

    const timeframes: SelectItem[] = [
        { value: "5m", label: "5 minutes" },
        { value: "15m", label: "15 minutes" },
        { value: "1h", label: "1 hour" },
        { value: "4h", label: "4 hours", disabled: true },
        { value: "1d", label: "1 day" }
    ];

    const mixed: SelectItem[] = [
        { value: "all", label: "All assets" },
        { value: "watch", label: "Watchlist" },
        { value: "btc", label: "Bitcoin", group: "Crypto" },
        { value: "eth", label: "Ethereum", group: "Crypto" },
        { value: "xau", label: "Gold", group: "Metals" }
    ];

    const sizes = ["sm", "md", "lg"] as const;

    let asset = $state("eth");
</script>

<svelte:head>
    <title>Select — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Select</h1>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Picks one value from a fixed list, on the bits-ui <code class="font-mono">select</code> primitive. Items come as data and group
            under a heading by their <code class="font-mono">group</code>. The panel portals to <code class="font-mono">&lt;body&gt;</code>;
            typing jumps to a matching row, and Escape closes without a change.
        </p>
    </header>

    <Alert variant="info" role="note" title="Select, radio group or toggle group?">
        Reach for a <strong>Select</strong> when one value is picked from a fixed list of more than a few options, and the list can stay out
        of sight until it is opened. A <strong>RadioGroup</strong> or a <strong>ToggleGroup</strong> is the pick when there are only a few options
        and the reader should see all of them at once.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Select is a closed field that opens a list and holds one chosen value. Use it once the list has more than about six options, or
            when the field must stay small in a form or a toolbar.
        </p>
        <ul class="max-w-3xl list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li><span class="font-medium text-foreground">An asset.</span> A long list that groups well by market.</li>
            <li><span class="font-medium text-foreground">A timeframe in a toolbar.</span> A small field beside a chart.</li>
            <li>
                <span class="font-medium text-foreground">Not for two to six options that should stay visible.</span> Use a RadioGroup, or a ToggleGroup
                for short labels in a strip.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sizes</h2>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-3">
            {#each sizes as size (size)}
                <Select items={assets} label={`size="${size}"`} {size} />
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Placeholder and chosen value</h2>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-2">
            <Select items={assets} label="Placeholder" placeholder="Choose an asset" />
            <div class="space-y-2">
                <Select items={assets} label="Chosen, bound" bind:value={asset} />
                <p class="font-mono text-xs text-foreground-subtle">value = "{asset}"</p>
            </div>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Grouped, ungrouped and mixed</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Items without a <code class="font-mono">group</code> form a run with no heading. The 4 hours row is a disabled item.
        </p>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-3">
            <Select items={assets} label="Grouped" />
            <Select items={timeframes} label="Ungrouped" value="1h" />
            <Select items={mixed} label="Mixed" value="all" />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Disabled</h2>
        <div class="grid max-w-3xl gap-6 rounded-xl border border-border-muted bg-surface p-6 sm:grid-cols-2">
            <Select disabled items={assets} label="Disabled, empty" />
            <Select disabled items={assets} label="Disabled, chosen" value="btc" />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Without a visible label</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            With no <code class="font-mono">label</code>, the caller names the trigger with <code class="font-mono">aria-label</code>.
        </p>
        <div class="flex max-w-3xl items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <span class="text-sm text-foreground-muted">Show</span>
            <Select class="w-48" aria-label="Timeframe" items={timeframes} size="sm" value="15m" />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Edge to edge</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            This trigger spans the page from edge to edge. The panel takes the trigger's width, but never more than the free width, so a
            narrow viewport does not scroll sideways.
        </p>
        <div class="-mx-10">
            <Select items={assets} label="Edge to edge" />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Inside a scoped root</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            <code class="font-mono">portalTarget</code> takes an element or a selector, and the panel mounts inside that container rather
            than on <code class="font-mono">&lt;body&gt;</code>.
        </p>
        <div id="select-scoped-root" class="max-w-sm rounded-xl border border-border-muted bg-surface p-6">
            <Select items={assets} label="portalTarget" portalTarget="#select-scoped-root" />
        </div>
    </section>
</div>
