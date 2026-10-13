<script lang="ts">
    import { BarChart3 } from "lucide-svelte";
    import Card from "$lib/components/ui/card/Card.svelte";

    const radii = ["lg", "xl", "2xl"] as const;
    const paddings = ["none", "sm", "md", "lg"] as const;

    const treatments = [
        { name: "flat", props: { flat: true } },
        { name: "default", props: {} },
        { name: "elevated", props: { elevated: true } },
        { name: "glass", props: { glass: true } },
        { name: "interactive", props: { interactive: true } },
        { name: "hoverable", props: { hoverable: true } },
        { name: "elevated + interactive", props: { elevated: true, interactive: true } },
        { name: "elevated + hoverable", props: { elevated: true, hoverable: true } }
    ];
</script>

<svelte:head>
    <title>Card — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Card</h1>
        <p class="text-sm text-foreground-muted">
            Hover the interactive card to see it lift, and the hoverable one to see it deepen and accent its border without moving.
        </p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            Card is the library's surface: it lifts a group of things off the canvas and gives them an edge. Use it once the grouping needs
            a boundary rather than a gap — once a reader would otherwise have to guess where one group ends and the next begins, or once the
            group is a thing they can act on.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">A panel of related fields or figures.</span> The ordinary case: a boundary and a padding,
                so a settings block or a metric group reads as one.
            </li>
            <li>
                <span class="font-medium text-foreground">An object in a list.</span> <code class="font-mono">interactive</code> lifts on hover
                and says the whole card is the target, rather than some link inside it.
            </li>
            <li>
                <span class="font-medium text-foreground">A surface over something busy.</span> The glass treatment, for a panel that sits on
                imagery rather than on the flat canvas.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for the page itself.</span> The page layout sets the measure; a Card wrapped around
                a whole page draws a border around everything and so groups nothing.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Resting treatments</h2>
        <div class="grid gap-6 md:grid-cols-3">
            <Card flat>
                <h3 class="mb-2 text-base font-semibold">flat</h3>
                <p class="text-sm text-foreground-muted">Border only, no shadow.</p>
            </Card>
            <Card>
                <h3 class="mb-2 text-base font-semibold">default</h3>
                <p class="text-sm text-foreground-muted">The subtle resting shadow.</p>
            </Card>
            <Card elevated>
                <h3 class="mb-2 text-base font-semibold">elevated</h3>
                <p class="text-sm text-foreground-muted">Raised at rest.</p>
            </Card>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Hover treatments</h2>
        <div class="grid gap-6 md:grid-cols-3">
            <Card interactive>
                <h3 class="mb-2 text-base font-semibold">interactive</h3>
                <p class="text-sm text-foreground-muted">Lifts 4px and deepens.</p>
            </Card>
            <Card hoverable>
                <h3 class="mb-2 text-base font-semibold">hoverable</h3>
                <p class="text-sm text-foreground-muted">Deepens and accents the border. Never moves.</p>
            </Card>
            <Card interactive hoverable>
                <h3 class="mb-2 text-base font-semibold">interactive + hoverable</h3>
                <p class="text-sm text-foreground-muted">interactive wins: it lifts.</p>
            </Card>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Glass</h2>
        <div class="grid gap-6 rounded-2xl bg-gradient-blue-smooth p-8 md:grid-cols-3">
            <Card glass>
                <h3 class="mb-2 text-base font-semibold">glass</h3>
                <p class="text-sm text-foreground-muted">Frosted over the tinted canvas.</p>
            </Card>
            <Card glass interactive>
                <h3 class="mb-2 text-base font-semibold">glass + interactive</h3>
                <p class="text-sm text-foreground-muted">Frosted, lifts on hover.</p>
            </Card>
            <Card glass hoverable radius="2xl">
                <h3 class="mb-2 text-base font-semibold">glass + hoverable + 2xl</h3>
                <p class="text-sm text-foreground-muted">Frosted, accents its border, never moves.</p>
            </Card>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Treatment × radius</h2>
        {#each treatments as treatment (treatment.name)}
            <div class="grid gap-6 md:grid-cols-3">
                {#each radii as radius (radius)}
                    <Card {radius} padding="sm" {...treatment.props}>
                        <p class="text-center text-sm">{treatment.name} · radius {radius}</p>
                    </Card>
                {/each}
            </div>
        {/each}
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Radius × padding</h2>
        {#each radii as radius (radius)}
            <div class="grid gap-6 md:grid-cols-4">
                {#each paddings as padding (padding)}
                    <Card {radius} {padding}>
                        <p class="bg-surface-sunken p-2 text-center text-sm">radius {radius} · padding {padding}</p>
                    </Card>
                {/each}
            </div>
        {/each}
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Clipping</h2>
        <div class="grid gap-6 md:grid-cols-2">
            <Card padding="none" radius="2xl" interactive>
                <div class="flex h-32 items-center justify-center bg-gradient-blue-smooth">
                    <BarChart3 class="size-10 text-white" aria-hidden="true" />
                </div>
                <div class="p-6">
                    <h3 class="mb-2 text-base font-semibold">Full-bleed header</h3>
                    <p class="text-sm text-foreground-muted">The tinted band stops at the rounded corner.</p>
                </div>
            </Card>
            <Card padding="none" radius="2xl" class="overflow-visible">
                <div class="flex h-32 items-center justify-center bg-gradient-blue-smooth">
                    <BarChart3 class="size-10 text-white" aria-hidden="true" />
                </div>
                <div class="p-6">
                    <h3 class="mb-2 text-base font-semibold">Escape hatch</h3>
                    <p class="text-sm text-foreground-muted">
                        <code class="font-mono">class="overflow-visible"</code> lets a child escape — square corners on the band.
                    </p>
                </div>
            </Card>
        </div>
    </section>
</div>
