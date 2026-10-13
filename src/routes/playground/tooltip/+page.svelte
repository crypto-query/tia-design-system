<script lang="ts">
    import { Bell, Copy, Info, RefreshCw, Settings2 } from "lucide-svelte";
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Button from "$lib/components/ui/button/Button.svelte";
    import Tooltip from "$lib/components/ui/tooltip/Tooltip.svelte";

    const sides = ["top", "right", "bottom", "left"] as const;
    const alignments = ["start", "center", "end"] as const;

    const LONG =
        "Backtested on six years of five-minute data across eleven venues, with slippage modelled at the quoted spread rather than the mid.";

    let pinned = $state({ top: true, right: true, bottom: true, left: true });
</script>

<svelte:head>
    <title>Tooltip — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Tooltip</h1>
        <p class="max-w-3xl text-sm text-foreground-muted">
            A short hint attached to a control, on the bits-ui <code class="font-mono">tooltip</code> primitive. Hover opens it after
            <code class="font-mono">delay</code>, keyboard focus opens it instantly, and Escape closes it. The panel portals to
            <code class="font-mono">&lt;body&gt;</code> and flips to the opposite side when the preferred one will not fit. The trigger is
            the caller's own element — the component renders no wrapper of its own — and the hint reaches it as
            <code class="font-mono">aria-describedby</code>, never as its name.
        </p>
    </header>

    <Alert class="max-w-3xl" variant="info" role="note" title="Tooltip, popover or a visible label?">
        Reach for a <strong>Tooltip</strong> when a control needs a short hint with nothing in it to click — it reaches the trigger as
        <code class="font-mono">aria-describedby</code>, so it describes a control that already has a name. A <strong>Popover</strong> is
        the pick the moment the panel holds anything interactive, because a tooltip closes as the pointer travels towards it. And a plain
        <strong>label</strong> beside the control beats both: a hint nobody hovers is a hint nobody reads, so a tooltip is for the second line,
        never the first.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            Tooltip is a hint attached to the caller's own element, opened after a delay on hover and instantly on focus. Use it for a
            sentence at most, and only where the control is already usable without it — everything in a tooltip is invisible to a reader who
            never hovers, which is most of them and all of the ones on a touchscreen.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">An icon-only button.</span> The name is on the button as a label; the tooltip repeats
                it for the eye rather than supplying it.
            </li>
            <li>
                <span class="font-medium text-foreground">A keyboard shortcut.</span> The chip that teaches the binding for the action the reader
                is already pointing at.
            </li>
            <li>
                <span class="font-medium text-foreground">A truncated value.</span> The full text of something the column had to cut, where the
                cut version is enough to work with.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for anything with a link or a control in it.</span> The reader has to reach it,
                and reaching closes it — that is a Popover.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">In place</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Every trigger below is a different element spreading the same props: a Button, an icon-only Button, and a plain span. Tab
            through them to see focus open each one with no delay.
        </p>
        <div class="flex flex-wrap items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Tooltip content="Signals resume when the London session opens.">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">Session filter</Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Copy the webhook URL" shortcut={["⌘", "C"]}>
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="Copy webhook URL" size="icon" variant="ghost">
                        <Copy class="size-4.5" />
                    </Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Backtested on six years of five-minute data." side="right">
                {#snippet trigger({ props })}
                    <!-- No `tabindex` of its own: the primitive's props already carry one, which
                         is what makes a non-focusable trigger reachable by keyboard. -->
                    <span {...props} class="text-xs font-semibold text-primary">Verified</span>
                {/snippet}
            </Tooltip>

            <Tooltip content="This one never opens — the whole tooltip is suppressed." disabled>
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">disabled</Button>
                {/snippet}
            </Tooltip>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Four sides × three alignments</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            <code class="font-mono">side</code> is the preference and <code class="font-mono">align</code> nudges it along the cross axis. Both
            give way to whatever keeps the hint on screen: drag the window narrow, or scroll a row to the very top, and the panel flips rather
            than clipping.
        </p>
        <div class="space-y-8 rounded-xl border border-border-muted bg-surface px-6 py-14">
            {#each sides as side (side)}
                <div class="space-y-3">
                    <p class="font-mono text-2xs font-bold tracking-widest text-foreground-subtle uppercase">side="{side}"</p>
                    <div class="flex flex-wrap items-center gap-3">
                        {#each alignments as align (align)}
                            <Tooltip {align} content="Opens {side}, aligned {align}" {side}>
                                {#snippet trigger({ props })}
                                    <Button {...props} size="sm" variant="outline">{align}</Button>
                                {/snippet}
                            </Tooltip>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">All four sides at once</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            The same hint pinned open above, below, left and right of one trigger each, so the arrow can be read on every side without
            hovering them one at a time. It is a square rotated 45° and centred on the panel's edge: the fill covers the panel's border
            across the arrow's mouth, and the two edges the rotation leaves exposed carry that border on — so the panel and its point are
            one outline rather than a balloon with a separate chip under it. Hovering a trigger and leaving closes that one, because the
            primitive still owns the close; the button puts them back.
        </p>
        <div class="space-y-6 rounded-xl border border-border-muted bg-surface px-40 py-16">
            <div class="flex justify-center">
                <Tooltip bind:open={pinned.top} content="Opens above" side="top">
                    {#snippet trigger({ props })}
                        <Button {...props} size="sm" variant="outline">top</Button>
                    {/snippet}
                </Tooltip>
            </div>
            <div class="flex justify-center gap-16">
                <Tooltip bind:open={pinned.left} content="Opens to the left" side="left">
                    {#snippet trigger({ props })}
                        <Button {...props} size="sm" variant="outline">left</Button>
                    {/snippet}
                </Tooltip>
                <Tooltip bind:open={pinned.right} content="Opens to the right" side="right">
                    {#snippet trigger({ props })}
                        <Button {...props} size="sm" variant="outline">right</Button>
                    {/snippet}
                </Tooltip>
            </div>
            <div class="flex justify-center">
                <Tooltip bind:open={pinned.bottom} content="Opens below" side="bottom">
                    {#snippet trigger({ props })}
                        <Button {...props} size="sm" variant="outline">bottom</Button>
                    {/snippet}
                </Tooltip>
            </div>
        </div>
        <Button onclick={() => (pinned = { top: true, right: true, bottom: true, left: true })} size="sm" variant="outline">
            Pin all open
        </Button>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sizes</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            <code class="font-mono">sm</code> is the default and the one to reach for. <code class="font-mono">md</code> exists for a hint that
            runs to two lines and wants the breathing room.
        </p>
        <div class="flex flex-wrap items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Tooltip content="Small — the default" size="sm">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">size="sm"</Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Medium — a step up in padding, radius and type" size="md">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">size="md"</Button>
                {/snippet}
            </Tooltip>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Arrow</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            The arrow points at the trigger and follows the panel through a flip, because the primitive re-anchors and rotates it per placed
            side. <code class="font-mono">arrow=&#123;false&#125;</code> drops it and leaves the offset alone.
        </p>
        <div class="flex flex-wrap items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Tooltip content="With an arrow — the default">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">arrow</Button>
                {/snippet}
            </Tooltip>

            <Tooltip arrow={false} content="No arrow">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">no arrow</Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Offset out to 16px" offset={16}>
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">offset=&#123;16&#125;</Button>
                {/snippet}
            </Tooltip>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Shortcut chips</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            <code class="font-mono">shortcut</code> takes one key or an array of them, and draws each as a
            <code class="font-mono">&lt;kbd&gt;</code>
            chip after the text — the same <code class="font-mono">Kbd</code> component the Dropdown rows draw.
        </p>
        <div class="flex flex-wrap items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Tooltip content="Refresh the feed" shortcut="R">
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="Refresh the feed" size="icon" variant="ghost">
                        <RefreshCw class="size-4.5" />
                    </Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Open settings" shortcut={["⌘", ","]}>
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="Open settings" size="icon" variant="ghost">
                        <Settings2 class="size-4.5" />
                    </Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Mute alerts for the rest of the session" shortcut={["⇧", "⌘", "M"]} size="md">
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="Mute alerts" size="icon" variant="ghost">
                        <Bell class="size-4.5" />
                    </Button>
                {/snippet}
            </Tooltip>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Interactive, and the width cap</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            By default the panel takes no pointer events at all, so crossing into it closes the hint — which is what stops a tooltip getting
            stuck open under a stray cursor. <code class="font-mono">interactive</code> hands the panel back its pointer events and keeps it
            open while the cursor rests there, so a long hint can be read at leisure and its text selected. It does not make the panel a
            place for controls: <code class="font-mono">content</code> is a <code class="font-mono">string</code> by design, and a hint that needs
            a link or a button is a Popover.
        </p>
        <div class="flex flex-wrap items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Tooltip content={LONG}>
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">long hint</Button>
                {/snippet}
            </Tooltip>

            <Tooltip content={LONG} interactive size="md">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">long hint, interactive</Button>
                {/snippet}
            </Tooltip>

            <Tooltip content="Hover across into this one and it stays; try the same on the plain hint above." interactive>
                {#snippet trigger({ props })}
                    <Button {...props} aria-label="What interactive means" size="icon" variant="ghost">
                        <Info class="size-4.5" />
                    </Button>
                {/snippet}
            </Tooltip>
        </div>
        <p class="max-w-3xl text-sm text-foreground-muted">
            Both long hints wrap at <code class="font-mono">max-w-60</code> — 240px. There is no <code class="font-mono">maxWidth</code>
            prop: a hint that wants a different width is a hint that should be shorter, and <code class="font-mono">class</code> is the escape
            hatch if one genuinely is not.
        </p>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Inside a scoped root</h2>
        <p class="max-w-3xl text-sm text-foreground-muted">
            <code class="font-mono">portalTarget</code> takes an element or a selector, and the panel mounts inside that container rather
            than on <code class="font-mono">&lt;body&gt;</code>.
        </p>
        <div id="tooltip-scoped-root" class="flex flex-wrap items-center gap-4 rounded-xl border border-border-muted bg-surface p-6">
            <Tooltip content="This panel lives inside the bordered box." portalTarget="#tooltip-scoped-root">
                {#snippet trigger({ props })}
                    <Button {...props} size="sm" variant="outline">portalTarget</Button>
                {/snippet}
            </Tooltip>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Two things it cannot do</h2>
        <div class="max-w-3xl space-y-3 rounded-xl border border-border-muted bg-surface p-6">
            <p class="text-sm text-foreground-muted">
                <span class="font-semibold text-foreground">A disabled control never opens one.</span> A disabled element fires no pointer or
                focus events, so the tooltip below never appears however long you hover it. Wrapping the button in a focusable span is the fix,
                and it is the caller's to make.
            </p>
            <div class="flex flex-wrap items-center gap-4">
                <Tooltip content="You will never see this — the button underneath is disabled.">
                    {#snippet trigger({ props })}
                        <Button {...props} disabled size="sm" variant="outline">disabled trigger</Button>
                    {/snippet}
                </Tooltip>

                <Tooltip content="This one opens: the wrapper is what the tooltip listens to.">
                    {#snippet trigger({ props })}
                        <span {...props} class="inline-flex">
                            <Button disabled size="sm" tabindex={-1} variant="outline">wrapped</Button>
                        </span>
                    {/snippet}
                </Tooltip>
            </div>
            <p class="text-sm text-foreground-muted">
                <span class="font-semibold text-foreground">It is unreachable on touch.</span> There is no hover and no focus on a tap, so anything
                a tooltip says has to be available somewhere else as well. A tooltip is never the only place information lives.
            </p>
        </div>
    </section>
</div>
