<script lang="ts">
    import Switch from "$lib/components/ui/switch/Switch.svelte";

    let bare = $state(false);
    let tooltip = $state(true);
    let labels = $state(false);
    let logScale = $state(true);
</script>

<svelte:head>
    <title>Switch — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Switch</h1>
        <p class="max-w-3xl text-sm text-foreground-muted">
            A boolean that applies the moment it flips, on the bits-ui <code class="font-mono">switch</code> primitive — a
            <code class="font-mono">&lt;button role="switch"&gt;</code> that owns focus and the space key. A form value that waits for a submit
            is a Checkbox. Named and described like Checkbox: the label names it, the description describes it.
        </p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">States</h2>
        <div class="flex flex-wrap items-center gap-8 rounded-xl border border-border-muted bg-surface p-6">
            <Switch aria-label="Bare switch" bind:checked={bare} />
            <Switch aria-label="Unchecked" />
            <Switch aria-label="Checked" checked />
            <Switch aria-label="Disabled off" disabled />
            <Switch aria-label="Disabled on" checked disabled />
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">With label and description</h2>
        <div class="flex max-w-sm flex-col gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Switch label="Tooltip" bind:checked={tooltip} />
            <Switch description="Months and % values on the axes." label="Axis labels" bind:checked={labels} />
            <Switch description="Makes large moves easier to compare." label="Log scale" bind:checked={logScale} />
            <Switch description="Not available for this asset." disabled label="Volume" />
        </div>
        <p class="text-sm text-foreground-muted">
            tooltip={tooltip} labels={labels} logScale={logScale} bare={bare}
        </p>
    </section>
</div>
