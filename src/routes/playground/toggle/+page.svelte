<script lang="ts">
    import { AlignCenter, AlignLeft, AlignRight, Bell, Bold, Eye, Italic, LayoutGrid, List, Strikethrough, Underline } from "lucide-svelte";
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Card from "$lib/components/ui/card/Card.svelte";
    import Toggle from "$lib/components/ui/toggle/Toggle.svelte";
    import ToggleGroup from "$lib/components/ui/toggle/ToggleGroup.svelte";

    const variants = ["default", "outline", "solid"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    type Demo = {
        key: string;
        type: "multiple" | "single";
        variant: (typeof variants)[number];
        attached: boolean;
        orientation: "horizontal" | "vertical";
    };

    const matrix = (attached: boolean, orientation: Demo["orientation"]): Demo[] =>
        variants.flatMap((variant) =>
            (["multiple", "single"] as const).map((type) => ({
                key: `${attached ? "attached" : "loose"}-${orientation}-${variant}-${type}`,
                type,
                variant,
                attached,
                orientation
            }))
        );

    const looseRow = matrix(false, "horizontal");
    const attachedRow = matrix(true, "horizontal");
    const verticalRows = [...matrix(false, "vertical"), ...matrix(true, "vertical")];
    const cells = [...looseRow, ...attachedRow, ...verticalRows];

    // One store per shape of value, keyed by the demo's id, so the matrix binds without a
    // `$state` per cell. Every cell starts pressed: a variant is a statement about how a
    // button says *pressed*, and at rest all three look alike. `multiple` seeds two
    // non-adjacent segments, which is what makes an attached multi-select read as a track.
    let picked = $state<Record<string, string | null>>({
        ...Object.fromEntries(cells.map((cell) => [cell.key, "1w"])),
        ...Object.fromEntries(sizes.map((size) => [`size-${size}`, "grid"])),
        "usage-range": "1w",
        "usage-align": "centre",
        "usage-view": "grid",
        "full-attached": "signals",
        "sliding-sm": "month",
        "sliding-md": "month",
        "sliding-lg": "month",
        "sliding-vertical": "month",
        "sliding-empty": null
    });
    let marked = $state<Record<string, string[]>>({
        ...Object.fromEntries(cells.map((cell) => [cell.key, ["1d", "1m"]])),
        "usage-format": ["bold"],
        "usage-marks": ["bold", "underline"],
        "usage-notify": ["alerts"],
        "full-loose": ["alerts", "digest"]
    });

    let live = $state(true);
    let alerted = $state(false);
    let alertLog = $state("not touched yet");
    let panel = $state("chart");
    let panelLog = $state("chart");
</script>

<svelte:head>
    <title>Toggle — playground</title>
</svelte:head>

{#snippet bold()}
    <Bold class="size-4" aria-hidden="true" />
{/snippet}

{#snippet italic()}
    <Italic class="size-4" aria-hidden="true" />
{/snippet}

{#snippet underline()}
    <Underline class="size-4" aria-hidden="true" />
{/snippet}

{#snippet strike()}
    <Strikethrough class="size-4" aria-hidden="true" />
{/snippet}

{#snippet alignLeft()}
    <AlignLeft class="size-4" aria-hidden="true" />
{/snippet}

{#snippet alignCentre()}
    <AlignCenter class="size-4" aria-hidden="true" />
{/snippet}

{#snippet alignRight()}
    <AlignRight class="size-4" aria-hidden="true" />
{/snippet}

{#snippet grid()}
    <LayoutGrid class="size-4" aria-hidden="true" />
{/snippet}

{#snippet rows()}
    <List class="size-4" aria-hidden="true" />
{/snippet}

{#snippet bell()}
    <Bell class="size-4" aria-hidden="true" />
{/snippet}

{#snippet eye()}
    <Eye class="size-4" aria-hidden="true" />
{/snippet}

<!-- The same three ranges either way, so the only thing moving between cells is the
     property the section is about. -->
{#snippet cell(demo: Demo)}
    <div class="space-y-2">
        <p class="text-2xs font-bold tracking-wider text-foreground-subtle uppercase">
            {demo.variant} · {demo.type}
        </p>
        {#if demo.type === "single"}
            <ToggleGroup
                type="single"
                variant={demo.variant}
                attached={demo.attached}
                orientation={demo.orientation}
                bind:value={picked[demo.key]}
                label="Range, {demo.variant}, one at a time">
                <Toggle value="1d">1D</Toggle>
                <Toggle value="1w">1W</Toggle>
                <Toggle value="1m">1M</Toggle>
            </ToggleGroup>
        {:else}
            <ToggleGroup
                type="multiple"
                variant={demo.variant}
                attached={demo.attached}
                orientation={demo.orientation}
                bind:value={marked[demo.key]}
                label="Range, {demo.variant}, many at once">
                <Toggle value="1d">1D</Toggle>
                <Toggle value="1w">1W</Toggle>
                <Toggle value="1m">1M</Toggle>
            </ToggleGroup>
        {/if}
    </div>
{/snippet}

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Toggle</h1>
        <p class="text-sm text-foreground-muted">
            A button that stays down — the two-state <em>action</em>, where <code class="font-mono">Switch</code> is a setting that reads as
            on/off in prose and <code class="font-mono">Checkbox</code> is one of several things picked in a form. Pressed borrows the
            tinted capsule the Tabs pill rail paints, so a pressed toggle and a selected tab read as one idea. Tab to one and it takes the
            base layer's focus ring; the state it carries is <code class="font-mono">aria-pressed</code>.
        </p>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">ToggleGroup</code> shares this page, further down: the same buttons sharing one value on a single tab stop.
        </p>
    </header>

    <Alert variant="info" role="note" title="Toggle, toggle group, switch or button?">
        Reach for a <strong>Toggle</strong> when a single button should stay pressed — an option that lives among other buttons, like bold
        in a toolbar. A <strong>ToggleGroup</strong> is the pick as soon as there are several of them that belong together: it holds the
        value, shares one tab stop, and passes variant and size down. A <strong>Switch</strong> is the same state as a form-shaped control
        with a label beside it, and a <strong>Checkbox</strong> is one of several things picked in a form. A plain <strong>Button</strong> is
        what you want when pressing it does something rather than becoming something.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            Toggle is a button carrying <code class="font-mono">aria-pressed</code>, drawn in the same tinted capsule the Tabs pill rail
            uses, so a pressed toggle and a selected tab read as one idea. Use it where the state belongs to the toolbar rather than to a
            form — and where one option stands alone, since two or more want the group.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">A view option.</span> Show archived, compact rows, grid or list — applied at once, and
                belonging to the screen rather than to a record.
            </li>
            <li>
                <span class="font-medium text-foreground">An icon-only control.</span> A toolbar button whose pressed state is the whole feedback,
                with the name carried as a label.
            </li>
            <li>
                <span class="font-medium text-foreground">Beside other buttons.</span> It takes the same variants and sizes, so a pressed option
                sits in a row of actions without looking like a different kind of thing.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for a setting in a form.</span> With a label and a submit, a reader expects a Checkbox
                or a Switch; a pressed button among fields is hard to read as a value.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Interactive</h2>
        <p class="text-sm text-foreground-muted">
            The first binds its state, so the toggle <em>is</em> the value rather than a copy of it. The second holds nothing and reads the
            change off <code class="font-mono">onPressedChange</code>, which fires beside the binding rather than instead of it.
        </p>
        <Card class="max-w-xl" padding="md">
            <div class="flex flex-wrap items-center gap-3">
                <Toggle bind:pressed={live} leadingIcon={eye}>Compare to benchmark</Toggle>
                <span class={live ? "text-sm font-medium text-success" : "text-sm text-foreground-muted"}
                    >{live ? "Overlaid" : "Hidden"}</span>
                <Toggle
                    pressed={alerted}
                    onPressedChange={(next) => {
                        alerted = next;
                        alertLog = next ? "armed" : "muted";
                    }}
                    leadingIcon={bell}>Alerts</Toggle>
                <span class="text-sm text-foreground-muted">{alertLog}</span>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Every variant, at every size, in both states</h2>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">default</code> is a tinted capsule that darkens when pressed,
            <code class="font-mono">outline</code> keeps a border in a dense toolbar and moves it to
            <code class="font-mono">primary</code> when pressed, and <code class="font-mono">solid</code> fills — for the rare toggle that
            must read as a hard mode switch. Hover an unpressed one: the wash is neutral on
            <code class="font-mono">default</code> and <code class="font-mono">solid</code> so it cannot be mistaken for the blue tint they use
            when pressed.
        </p>
        <Card padding="md">
            <div class="space-y-6">
                {#each variants as variant (variant)}
                    <div class="space-y-2">
                        <p class="text-2xs font-bold tracking-widest text-foreground-subtle uppercase">{variant}</p>
                        <div class="flex flex-wrap items-center gap-3">
                            {#each sizes as size (size)}
                                <Toggle {variant} {size} leadingIcon={eye}>{size} · off</Toggle>
                                <Toggle {variant} {size} pressed leadingIcon={eye}>{size} · on</Toggle>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Disabled</h2>
        <p class="text-sm text-foreground-muted">
            Dimmed to half opacity in both states, with the ink dropped to <code class="font-mono">foreground-subtle</code> whichever state
            it is parked in. The native <code class="font-mono">disabled</code> takes it out of the tab order, so it is neither focusable nor
            actionable.
        </p>
        <Card padding="md">
            <div class="flex flex-wrap items-center gap-3">
                {#each variants as variant (variant)}
                    <Toggle {variant} disabled leadingIcon={eye}>{variant} · off</Toggle>
                    <Toggle {variant} disabled pressed leadingIcon={eye}>{variant} · on</Toggle>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Icon-only, and named</h2>
        <p class="text-sm text-foreground-muted">
            With no children the toggle goes square at its size's height, so a toolbar row lines up on one 30 / 36 / 42px grid. The
            component cannot invent a name — every one of these passes <code class="font-mono">aria-label</code>, and
            <code class="font-mono">aria-pressed</code> is the only thing a screen reader has to go on for the state.
        </p>
        <Card padding="md">
            <div class="space-y-6">
                {#each sizes as size (size)}
                    <div class="space-y-2">
                        <p class="text-2xs font-bold tracking-widest text-foreground-subtle uppercase">{size}</p>
                        <div class="flex flex-wrap items-center gap-3">
                            <Toggle {size} pressed leadingIcon={bold} aria-label="Bold" />
                            <Toggle {size} variant="outline" pressed leadingIcon={italic} aria-label="Italic" />
                            <Toggle {size} variant="solid" pressed leadingIcon={underline} aria-label="Underline" />
                            <Toggle {size} leadingIcon={bold} aria-label="Bold, off" />
                            <Toggle {size} variant="outline" leadingIcon={italic} aria-label="Italic, off" />
                            <Toggle {size} variant="solid" leadingIcon={strike} aria-label="Strikethrough, off" />
                            <Toggle {size} disabled leadingIcon={bold} aria-label="Bold, unavailable" />
                        </div>
                    </div>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Leading and trailing icons</h2>
        <p class="text-sm text-foreground-muted">
            Both are snippets, and both come from lucide-svelte rather than the reference's inline SVGs. The gap between icon and label
            grows with the size — 6, 7 and 8px.
        </p>
        <Card padding="md">
            <div class="flex flex-wrap items-center gap-3">
                <Toggle leadingIcon={eye}>Leading</Toggle>
                <Toggle variant="outline" trailingIcon={bell}>Trailing</Toggle>
                <Toggle variant="solid" pressed leadingIcon={eye} trailingIcon={bell}>Both</Toggle>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">A pill is a class, not a prop</h2>
        <p class="text-sm text-foreground-muted">
            The reference's <code class="font-mono">shape</code> is not ported. Pass
            <code class="font-mono">class="rounded-full"</code> and it wins, because the incoming class goes through
            <code class="font-mono">cn()</code> last. Only the radius follows the class: the side padding stays the size's own, so a pill toggle
            is not the reference's wider pill.
        </p>
        <Card padding="md">
            <div class="flex flex-wrap items-center gap-3">
                <Toggle class="rounded-full" leadingIcon={eye}>Pill</Toggle>
                <Toggle class="rounded-full" variant="outline" pressed leadingIcon={eye}>Pill · on</Toggle>
                <Toggle class="rounded-full" variant="solid" pressed leadingIcon={bold} aria-label="Bold, pill" />
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">In a toolbar</h2>
        <p class="text-sm text-foreground-muted">
            What the component is for. Each of these is independent — give them a <code class="font-mono">value</code> and wrap the row in
            <code class="font-mono">ToggleGroup</code> and the group owns the state, the arrow keys and the styling instead.
        </p>
        <Card class="max-w-md" padding="md">
            <div class="flex flex-wrap items-center gap-1">
                <Toggle size="sm" leadingIcon={bold} aria-label="Bold" />
                <Toggle size="sm" leadingIcon={italic} aria-label="Italic" />
                <Toggle size="sm" leadingIcon={underline} aria-label="Underline" />
                <Toggle size="sm" leadingIcon={strike} aria-label="Strikethrough" />
            </div>
        </Card>
    </section>

    <section class="space-y-3 border-t border-border pt-10">
        <h2 class="text-lg font-semibold">ToggleGroup</h2>
        <p class="text-sm text-foreground-muted">
            Toggles sharing one value on a single tab stop — a formatting bar when
            <code class="font-mono">type="multiple"</code>, a segmented mode picker when
            <code class="font-mono">type="single"</code>. Tab reaches the group once and the arrow keys walk it from there, so a six-button
            toolbar does not cost six tabs. The group owns the presentation:
            <code class="font-mono">variant</code>, <code class="font-mono">size</code> and <code class="font-mono">disabled</code> reach every
            button through context rather than being repeated on each one.
        </p>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Interactive</h2>
        <p class="text-sm text-foreground-muted">
            The value is an array under <code class="font-mono">multiple</code> and one value — or
            <code class="font-mono">null</code> — under <code class="font-mono">single</code>, where pressing the pressed button clears it.
            The third holds nothing and reads the change off <code class="font-mono">onValueChange</code>, which fires beside the binding
            rather than instead of it.
        </p>
        <Card class="max-w-3xl" padding="md">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-4">
                <div class="flex items-center gap-3">
                    <ToggleGroup type="multiple" bind:value={marked["usage-format"]} label="Formatting">
                        <Toggle value="bold" leadingIcon={bold} aria-label="Bold" />
                        <Toggle value="italic" leadingIcon={italic} aria-label="Italic" />
                        <Toggle value="underline" leadingIcon={underline} aria-label="Underline" />
                    </ToggleGroup>
                    <span class="text-sm text-foreground-muted">
                        {marked["usage-format"]?.length ? marked["usage-format"].join(" · ") : "none"}
                    </span>
                </div>
                <div class="flex items-center gap-3">
                    <ToggleGroup type="single" attached bind:value={picked["usage-range"]} label="Range">
                        <Toggle value="1d">1D</Toggle>
                        <Toggle value="1w">1W</Toggle>
                        <Toggle value="1m">1M</Toggle>
                        <Toggle value="1y">1Y</Toggle>
                    </ToggleGroup>
                    <span class="font-mono text-sm text-foreground-muted">{picked["usage-range"]?.toUpperCase() ?? "NONE"}</span>
                </div>
                <div class="flex items-center gap-3">
                    <ToggleGroup
                        type="single"
                        attached
                        value={panel}
                        onValueChange={(next) => {
                            panel = next ?? "chart";
                            panelLog = next ?? "cleared, held at chart";
                        }}
                        label="Panel">
                        <Toggle value="chart">Chart</Toggle>
                        <Toggle value="signals">Signals</Toggle>
                    </ToggleGroup>
                    <span class="text-sm text-foreground-muted">{panelLog}</span>
                </div>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Unattached, horizontal</h2>
        <p class="text-sm text-foreground-muted">
            A flex run of Toggles, 6px apart. The variant is a statement about how a pressed button says <em>pressed</em> —
            <code class="font-mono">default</code> gains a tint, <code class="font-mono">solid</code> a fill,
            <code class="font-mono">outline</code> moves its border — so at rest the first two are identical, here as in the reference.
        </p>
        <Card class="max-w-4xl" padding="md">
            <div class="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                {#each looseRow as demo (demo.key)}
                    {@render cell(demo)}
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Attached — the segmented control</h2>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">attached</code> sets the buttons on one sunken track with no gaps and takes their own edges away, which
            is the control you want above a chart. A capsule can only sit in one place, so
            <code class="font-mono">single</code> is what it is for; under <code class="font-mono">multiple</code> the track fills each
            pressed segment instead of drawing one capsule. The capsule does not glide between segments — see
            <code class="font-mono">Toggle.md</code>.
        </p>
        <Card class="max-w-4xl" padding="md">
            <div class="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                {#each attachedRow as demo (demo.key)}
                    {@render cell(demo)}
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sliding indicator — state-driven motion</h2>
        <p class="text-sm text-foreground-muted">
            Single selection uses one primary capsule on a bordered sunken track. It slides for 300ms; labels change colour for 200ms.
            Reduced motion makes the position change instant. Select the active item again to clear it.
        </p>
        <Card padding="md" class="max-w-3xl">
            <div class="space-y-4">
                {#each sizes as size (size)}
                    <ToggleGroup
                        type="single"
                        indicator="sliding"
                        {size}
                        fullWidth
                        bind:value={picked[`sliding-${size}`]}
                        label="Billing period, {size}">
                        <Toggle value="month">Monthly</Toggle>
                        <Toggle value="year">Annual</Toggle>
                    </ToggleGroup>
                {/each}
                <div class="flex flex-wrap items-start gap-6">
                    <ToggleGroup
                        type="single"
                        indicator="sliding"
                        orientation="vertical"
                        bind:value={picked["sliding-vertical"]}
                        label="Billing period, vertical">
                        <Toggle value="month">Monthly</Toggle>
                        <Toggle value="year">Annual</Toggle>
                    </ToggleGroup>
                    <ToggleGroup type="single" indicator="sliding" bind:value={picked["sliding-empty"]} label="Billing period, empty">
                        <Toggle value="month">Monthly</Toggle>
                        <Toggle value="year">Annual</Toggle>
                    </ToggleGroup>
                    <ToggleGroup type="single" indicator="sliding" disabled value="month" label="Billing period, disabled">
                        <Toggle value="month">Monthly</Toggle>
                        <Toggle value="year">Annual</Toggle>
                    </ToggleGroup>
                </div>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Vertical</h2>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">orientation="vertical"</code> stacks the buttons and moves the arrow travel to ↑ ↓ — bits-ui's own, not
            a key handler of ours. The buttons stretch to the widest of them, because the track aligns its items to
            <code class="font-mono">stretch</code>.
        </p>
        <Card class="max-w-4xl" padding="md">
            <div class="grid grid-cols-3 gap-x-8 gap-y-6 sm:grid-cols-6">
                {#each verticalRows as demo (demo.key)}
                    {@render cell(demo)}
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sizes</h2>
        <p class="text-sm text-foreground-muted">
            30 · 36 · 42px tall, set once on the group and inherited by every button. An icon-only Toggle goes square at its size's height,
            so a row of them lines up on one grid.
        </p>
        <Card class="max-w-2xl" padding="md">
            <div class="flex flex-wrap items-center gap-6">
                {#each sizes as size (size)}
                    <div class="space-y-2">
                        <p class="text-2xs font-bold tracking-wider text-foreground-subtle uppercase">{size}</p>
                        <ToggleGroup type="single" attached {size} bind:value={picked[`size-${size}`]} label="Layout, {size}">
                            <Toggle value="grid" leadingIcon={grid} aria-label="Grid" />
                            <Toggle value="rows" leadingIcon={rows} aria-label="Rows" />
                        </ToggleGroup>
                    </div>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Filling a column</h2>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">fullWidth</code> stretches the group across its container with every button taking an equal share — for a
            segmented control at the top of a card or a sidebar, where the row should meet both edges.
        </p>
        <Card class="max-w-md" padding="md">
            <div class="space-y-4">
                <ToggleGroup type="single" attached fullWidth bind:value={picked["full-attached"]} label="Panel, full width">
                    <Toggle value="chart">Chart</Toggle>
                    <Toggle value="signals">Signals</Toggle>
                    <Toggle value="fills">Fills</Toggle>
                </ToggleGroup>
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    fullWidth
                    bind:value={marked["full-loose"]}
                    label="Notifications, full width">
                    <Toggle value="alerts">Alerts</Toggle>
                    <Toggle value="fills">Fills</Toggle>
                    <Toggle value="digest">Daily digest</Toggle>
                </ToggleGroup>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Disabled</h2>
        <p class="text-sm text-foreground-muted">
            A <code class="font-mono">disabled</code> group greys every button, keeps whichever one is pressed looking pressed, and takes the
            whole set out of the tab order.
        </p>
        <Card class="max-w-2xl" padding="md">
            <div class="flex flex-wrap items-center gap-6">
                <ToggleGroup type="single" attached disabled value="1w" label="Range, disabled">
                    <Toggle value="1d">1D</Toggle>
                    <Toggle value="1w">1W</Toggle>
                    <Toggle value="1m">1M</Toggle>
                </ToggleGroup>
                <ToggleGroup type="multiple" variant="outline" disabled value={["bold"]} label="Formatting, disabled">
                    <Toggle value="bold" leadingIcon={bold} aria-label="Bold" />
                    <Toggle value="italic" leadingIcon={italic} aria-label="Italic" />
                </ToggleGroup>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">In use</h2>
        <p class="text-sm text-foreground-muted">
            The two shapes the component exists for. A formatting bar is <code class="font-mono">multiple</code> and unattached — each
            button is its own on/off. A mode picker is <code class="font-mono">single</code> and attached — one of a set, and the segments
            read as one control. Reach for <code class="font-mono">Tabs</code> instead when the choice also swaps a panel of content below.
        </p>
        <div class="grid max-w-4xl gap-5 md:grid-cols-2">
            <Card padding="md">
                <div class="space-y-3">
                    <p class="text-2xs font-bold tracking-wider text-foreground-subtle uppercase">Formatting bar</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <ToggleGroup type="multiple" bind:value={marked["usage-marks"]} label="Text style">
                            <Toggle value="bold" leadingIcon={bold} aria-label="Bold" />
                            <Toggle value="italic" leadingIcon={italic} aria-label="Italic" />
                            <Toggle value="underline" leadingIcon={underline} aria-label="Underline" />
                        </ToggleGroup>
                        <ToggleGroup type="single" bind:value={picked["usage-align"]} label="Alignment">
                            <Toggle value="left" leadingIcon={alignLeft} aria-label="Align left" />
                            <Toggle value="centre" leadingIcon={alignCentre} aria-label="Align centre" />
                            <Toggle value="right" leadingIcon={alignRight} aria-label="Align right" />
                        </ToggleGroup>
                    </div>
                    <p class="text-sm text-foreground-muted">
                        Two groups side by side, each its own tab stop. Every icon-only button carries its own
                        <code class="font-mono">aria-label</code> — the group's <code class="font-mono">label</code> names the set, not the buttons.
                    </p>
                </div>
            </Card>
            <Card padding="md">
                <div class="space-y-3">
                    <p class="text-2xs font-bold tracking-wider text-foreground-subtle uppercase">Mode picker</p>
                    <div class="space-y-3">
                        <ToggleGroup type="single" attached fullWidth bind:value={picked["usage-view"]} label="Layout">
                            <Toggle value="grid" leadingIcon={grid}>Grid</Toggle>
                            <Toggle value="rows" leadingIcon={rows}>Rows</Toggle>
                        </ToggleGroup>
                        <ToggleGroup
                            type="multiple"
                            variant="outline"
                            orientation="vertical"
                            fullWidth
                            bind:value={marked["usage-notify"]}
                            label="Notifications">
                            <Toggle value="alerts" leadingIcon={bell}>Alerts</Toggle>
                            <Toggle value="fills" leadingIcon={eye}>Fills</Toggle>
                        </ToggleGroup>
                    </div>
                    <p class="text-sm text-foreground-muted">
                        A segmented control across the top of a card, and a vertical multi-select under it — the settings-list shape, where
                        each row is its own switch but the set is styled once.
                    </p>
                </div>
            </Card>
        </div>
    </section>
</div>
