<script lang="ts">
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Card from "$lib/components/ui/card/Card.svelte";
    import Checkbox from "$lib/components/ui/checkbox/Checkbox.svelte";

    const sizes = ["sm", "md", "lg"] as const;

    const strategies = ["Swing Break", "Trend Reversal", "Trend Following"];
    let picked = $state([true, false, false]);

    const all = $derived(picked.every(Boolean));
    const some = $derived(picked.some(Boolean) && !all);

    let alerts = $state(true);
    let updates = $state(false);
    let terms = $state(false);
</script>

<svelte:head>
    <title>Checkbox — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Checkbox</h1>
        <p class="text-sm text-foreground-muted">
            The box is the bits-ui primitive — a <code class="font-mono">&lt;button role="checkbox"&gt;</code> that owns focus, the space
            key and the mixed state. Select any box to draw its check over 300ms with <code class="font-mono">ease-out-soft</code>. Reduced
            motion shows the full check immediately. The mixed dash stays instant.
        </p>
    </header>

    <Alert variant="info" role="note" title="Checkbox, switch, radio group or toggle?">
        Reach for a <strong>Checkbox</strong> for a boolean inside a form that takes effect when the form is submitted, and for any list
        where several options can be true at once. A <strong>Switch</strong> is the same boolean when flipping it applies immediately — that
        timing is the whole distinction, not the shape. A <strong>RadioGroup</strong> is for exactly one choice out of several. And a
        <strong>Toggle</strong> is a button that stays pressed, for an option among other buttons rather than among other fields.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            Checkbox is a <code class="font-mono">role="checkbox"</code> button that owns focus, the space key and the mixed state. Use it where
            the reader is filling something in and will press a submit afterwards — and wherever the answer to "can more than one be true?" is
            yes, which rules out a RadioGroup on its own.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">Terms and consents.</span> One box the reader must tick before the form will go, with
                the description beside it rather than in a tooltip.
            </li>
            <li>
                <span class="font-medium text-foreground">A list of options.</span> Several independent booleans that belong together and are
                saved together.
            </li>
            <li>
                <span class="font-medium text-foreground">A select-all header.</span> The mixed state is the reason to use a real checkbox here
                rather than anything hand-rolled — it says "some" without lying about "all".
            </li>
            <li>
                <span class="font-medium text-foreground">Not for a setting that saves itself.</span> Where there is no submit, a reader expects
                a Switch, and a checkbox that has already taken effect is a small surprise every time.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">States</h2>
        <p class="text-sm text-foreground-muted">
            Checked and mixed both fill the box and draw their mark on the fill's foreground, so <code class="font-mono">error</code> swaps the
            fill and the mark follows it.
        </p>
        <Card class="max-w-sm" padding="md">
            <div class="flex flex-col gap-3.5">
                <Checkbox label="Unchecked" />
                <Checkbox checked label="Checked" />
                <Checkbox indeterminate label="Indeterminate" />
                <Checkbox error label="Error — accept the terms" />
                <Checkbox checked error label="Error — checked, so the fill is the red one" />
                <Checkbox description="And the error carries a description too." error label="Error — with a description" />
                <Checkbox disabled label="Disabled" />
                <Checkbox checked disabled label="Disabled checked" />
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Card rows</h2>
        <p class="text-sm text-foreground-muted">
            Card rows separate selectable strategies. Selection adds a blue tint. A disabled locked row adds a lock and a subtle surface.
        </p>
        <Card padding="md">
            <div class="grid gap-6 md:grid-cols-3">
                {#each sizes as size (size)}
                    <div class="flex flex-col gap-2">
                        <Checkbox variant="card" {size} label="Unchecked, {size}">
                            {#snippet trailing()}<span class="text-sm font-semibold tabular-nums">$990/yr</span>{/snippet}
                        </Checkbox>
                        <Checkbox variant="card" {size} checked label="Checked, {size}">
                            {#snippet trailing()}<span class="text-sm font-semibold tabular-nums">$990/yr</span>{/snippet}
                        </Checkbox>
                        <Checkbox variant="card" {size} indeterminate label="Mixed, {size}" />
                        <Checkbox variant="card" {size} error label="Error, {size}" />
                        <Checkbox variant="card" {size} checked disabled label="Temporarily disabled, {size}" />
                        <Checkbox variant="card" {size} disabled locked label="Locked, {size}" description="You already have this" />
                    </div>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Three sizes</h2>
        <p class="text-sm text-foreground-muted">16, 20 and 24px boxes, each with its own label step and gap.</p>
        <Card class="max-w-sm" padding="md">
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-6">
                    {#each sizes as size (size)}
                        <Checkbox checked {size} />
                    {/each}
                    {#each sizes as size (size)}
                        <Checkbox indeterminate {size} />
                    {/each}
                </div>
                {#each sizes as size (size)}
                    <Checkbox checked label="Size {size}" {size} />
                {/each}
                {#each sizes as size (size)}
                    <Checkbox error label="Size {size}, in error" {size} />
                {/each}
                {#each sizes as size (size)}
                    <Checkbox description="The description holds one step for every size." label="Size {size}" {size} />
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">With a description</h2>
        <p class="text-sm text-foreground-muted">
            The label names the box and the description is announced as its description — both are part of the target, so a tap anywhere in
            the block toggles it.
        </p>
        <Card class="max-w-lg" padding="md">
            <div class="flex flex-col gap-4">
                <Checkbox bind:checked={alerts} description="Get notified the moment a strategy fires a signal." label="Email alerts" />
                <Checkbox
                    bind:checked={updates}
                    description="Occasional news about new models and platform features."
                    label="Product updates" />
                <Checkbox
                    bind:checked={terms}
                    description="You cannot subscribe until this one is ticked."
                    error={!terms}
                    label="Accept the terms" />
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">A select-all group — the mixed state doing its job</h2>
        <p class="text-sm text-foreground-muted">
            The parent reports <code class="font-mono">aria-checked="mixed"</code> while the picks are partial. Toggling it from there resolves
            to checked and clears the mixed state, which is the primitive's own behaviour.
        </p>
        <Card class="max-w-sm" padding="md">
            <div class="flex flex-col gap-2.5">
                <Checkbox
                    checked={all}
                    indeterminate={some}
                    label="All strategies"
                    onCheckedChange={(next) => (picked = picked.map(() => next))} />
                <div class="flex flex-col gap-2 pl-7">
                    {#each strategies as strategy, index (strategy)}
                        <Checkbox bind:checked={picked[index]} label={strategy} size="sm" />
                    {/each}
                </div>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Bare boxes, in a row</h2>
        <p class="text-sm text-foreground-muted">
            With neither label nor description the component renders the box alone — for a table's select column, where the header names it.
        </p>
        <Card class="max-w-md" padding="none">
            <div class="divide-y divide-border-muted">
                {#each strategies as strategy, index (strategy)}
                    <div class="flex items-center gap-4 px-6 py-4">
                        <Checkbox aria-label="Select {strategy}" bind:checked={picked[index]} />
                        <span class="font-medium">{strategy}</span>
                    </div>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Overriding from the call site</h2>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">cn()</code> puts the incoming class last, and it lands on whichever element is the root — the box when there
            is no text, the label block when there is.
        </p>
        <div class="flex flex-wrap items-center gap-6">
            <Checkbox aria-label="Round box" checked class="rounded-full" />
            <Checkbox checked class="flex-row-reverse" label="Label first" />
            <Checkbox checked class="gap-6" label="Pushed apart" />
        </div>
    </section>
</div>
