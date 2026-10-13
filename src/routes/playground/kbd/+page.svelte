<script lang="ts">
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Button from "$lib/components/ui/button/Button.svelte";
    import Kbd from "$lib/components/ui/kbd/Kbd.svelte";

    // The faces a keycap actually has to draw: single glyphs, arrows, and the two- to
    // four-character words that decide whether `min-w` or the padding wins.
    const GLYPHS = ["⌘", "⇧", "⌥", "⌃", "↵", "⌫", "⇥"];
    const LETTERS = ["K", "S", "P", "N", "1", "?"];
    const WORDS = ["esc", "Tab", "Del", "Home", "Enter"];
    const ARROWS = ["↑", "↓", "←", "→"];
</script>

<svelte:head>
    <title>Kbd — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Kbd</h1>
        <p class="max-w-200 text-sm text-foreground-muted">
            One keycap. It draws a key the reader is meant to press — never a key they just pressed, and never a label that happens to be
            short. It is the library's only keycap: Command, Search, Tooltip and Dropdown all draw this one component. The chip is flat — a
            border and a <code class="font-mono">--background-subtle</code> fill, with no raised lip, because a key drawn as a physical object
            reads wrong against surfaces that are otherwise flat. Use the toggle in the header to read it on the other canvas.
        </p>
    </header>

    <Alert class="max-w-200" variant="info" role="note" title="Kbd, Badge, or code?">
        Reach for <strong>Kbd</strong> when the text <em>is a key on the reader's keyboard</em> and naming it is an instruction — the
        shortcut in a menu row, the hint in a tooltip, the hotkey on a search trigger. A <strong>Badge</strong> is a status or a count that
        describes something; it is never an instruction and it takes a colour role, which a keycap never does. A plain
        <strong>code</strong> element is for identifiers the reader will read or type into a file — a prop, a path, a flag — where a keycap
        would falsely promise a key exists. And a <strong>Button</strong> is the thing to reach for when the reader can click it: a keycap
        is decoration beside the real control, never the control itself, which is why it is
        <code class="font-mono">aria-hidden</code> at every call site here.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="max-w-200 text-sm text-foreground-muted">
            Kbd is a keycap for one key. Use it when a shortcut is worth advertising in place — beside the command it runs, so the reader
            learns it without leaving what they are doing.
        </p>
        <ul class="max-w-200 list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">A shortcut on a command row.</span> The palette teaches its own bindings as the
                reader scans it — <code class="font-mono">CommandItem</code> draws one per row.
            </li>
            <li>
                <span class="font-medium text-foreground">A hint in a footer or a tooltip.</span> The key is the fastest way to do what the surface
                is already about, so it belongs on the surface rather than in a help page.
            </li>
            <li>
                <span class="font-medium text-foreground">A hotkey on a trigger.</span> It tells the reader they never needed to reach for the
                pointer at all.
            </li>
            <li>
                <span class="font-medium text-foreground">Documentation prose.</span> A key sits mid-sentence and must not disturb the line it
                is in.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for a key nothing listens to.</span> A chip is a promise that the binding
                exists — which is exactly why <code class="font-mono">SearchTrigger</code> draws no chip until a host passes one.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for short text that is not a key.</span> A version, a count, a state, a file
                extension — those are <code class="font-mono">Badge</code> or <code class="font-mono">code</code>, and a keycap on one reads
                as an instruction that goes nowhere.
            </li>
        </ul>
    </section>

    <Alert class="max-w-200" variant="info" role="note" title="One chip per key, and the combo is the caller's">
        There is no <code class="font-mono">Kbd.Group</code>. A combination is drawn by putting chips next to each other in whatever the
        surrounding layout already is, because the two places that draw more than one also interleave label text — the footer below reads
        <em>arrows, then the word “move”</em>, which no group wrapper would have produced. The one exception is a hotkey the reference
        writes as a single face, like the trigger's <code class="font-mono">⌘K</code>: that is one chip carrying two characters, not two
        chips.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Every face it has to draw</h2>
        <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3 rounded-xl border border-border-muted bg-surface p-6">
                <h3 class="text-lg font-semibold">Modifiers and returns</h3>
                <p class="text-sm text-foreground-muted">Single glyphs, where the square minimum width is what keeps the row even.</p>
                <div class="flex flex-wrap items-center gap-1.5">
                    {#each GLYPHS as glyph (glyph)}
                        <Kbd>{glyph}</Kbd>
                    {/each}
                </div>
            </div>
            <div class="space-y-3 rounded-xl border border-border-muted bg-surface p-6">
                <h3 class="text-lg font-semibold">Letters and digits</h3>
                <p class="text-sm text-foreground-muted">The narrowest case — a single character on the minimum width, never narrower.</p>
                <div class="flex flex-wrap items-center gap-1.5">
                    {#each LETTERS as letter (letter)}
                        <Kbd>{letter}</Kbd>
                    {/each}
                </div>
            </div>
            <div class="space-y-3 rounded-xl border border-border-muted bg-surface p-6">
                <h3 class="text-lg font-semibold">Named keys</h3>
                <p class="text-sm text-foreground-muted">
                    Where the padding takes over from the minimum width. The height does not move, which is the point.
                </p>
                <div class="flex flex-wrap items-center gap-1.5">
                    {#each WORDS as word (word)}
                        <Kbd>{word}</Kbd>
                    {/each}
                </div>
            </div>
            <div class="space-y-3 rounded-xl border border-border-muted bg-surface p-6">
                <h3 class="text-lg font-semibold">Arrows</h3>
                <p class="text-sm text-foreground-muted">Drawn adjacent rather than grouped, which is how a pair of directions reads.</p>
                <div class="flex flex-wrap items-center gap-1.5">
                    {#each ARROWS as arrow (arrow)}
                        <Kbd>{arrow}</Kbd>
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Where it actually lands</h2>
        <div class="space-y-6 rounded-xl border border-border-muted bg-surface p-6">
            <div class="space-y-3">
                <span class="text-2xs font-bold tracking-widest text-foreground-subtle uppercase">A combination</span>
                <div class="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                    <span class="flex items-center gap-1.25"><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd> command palette</span>
                    <span class="flex items-center gap-1.25"><Kbd>Ctrl</Kbd><span>+</span><Kbd>B</Kbd> bold</span>
                    <span class="flex items-center gap-1.25"><Kbd>⌘K</Kbd> as one face</span>
                </div>
            </div>

            <div class="space-y-3">
                <span class="text-2xs font-bold tracking-widest text-foreground-subtle uppercase">A palette footer</span>
                <div
                    class="flex items-center gap-3.5 rounded-lg border border-border-muted bg-background-subtle px-4 py-2 text-xs/normal text-foreground-subtle">
                    <span class="flex items-center gap-1.25"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
                    <span class="flex items-center gap-1.25"><Kbd>↵</Kbd> run</span>
                    <span class="flex items-center gap-1.25"><Kbd>esc</Kbd> close</span>
                    <span class="ml-auto tabular-nums">14 results</span>
                </div>
            </div>

            <div class="space-y-3">
                <span class="text-2xs font-bold tracking-widest text-foreground-subtle uppercase">Inside a control</span>
                <div class="flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="outline">Accept <Kbd>↵</Kbd></Button>
                    <Button size="sm" variant="outline">Dismiss <Kbd>esc</Kbd></Button>
                </div>
            </div>

            <div class="space-y-3">
                <span class="text-2xs font-bold tracking-widest text-foreground-subtle uppercase">In prose</span>
                <p class="max-w-200 text-sm/normal text-foreground-muted">
                    Press <Kbd>⌘</Kbd><Kbd>K</Kbd> to open the palette, <Kbd>↑</Kbd> and <Kbd>↓</Kbd> to walk the rows, and
                    <Kbd>↵</Kbd> to run the highlighted one. <Kbd>esc</Kbd> closes it. The chips sit on the middle of the line rather than on
                    its baseline, so this paragraph is exactly as tall as the one below it — a keycap must never be the thing that sets a line's
                    height.
                </p>
                <p class="max-w-200 text-sm/normal text-foreground-muted">
                    Press nothing at all. This paragraph carries no keycaps and exists only to be measured against the one above it, which
                    is the same check <code class="font-mono">Kbd.svelte.test.ts</code> makes on every run.
                </p>
            </div>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">The escape hatch</h2>
        <p class="max-w-200 text-sm text-foreground-muted">
            <code class="font-mono">class</code> reaches the <code class="font-mono">kbd</code> element itself, so a caller can change the radius
            or push it to one end of a row. The geometry is not up for negotiation: overriding the height is what the fixed height exists to prevent.
        </p>
        <div class="flex flex-wrap items-center gap-3 rounded-xl border border-border-muted bg-surface p-6">
            <Kbd>esc</Kbd>
            <Kbd class="rounded-full">esc</Kbd>
            <Kbd class="border-border-input">esc</Kbd>
        </div>
    </section>
</div>
