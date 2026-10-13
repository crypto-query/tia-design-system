<script lang="ts">
    import Button from "$lib/components/ui/button/Button.svelte";
    import Card from "$lib/components/ui/card/Card.svelte";
    import Spinner from "$lib/components/ui/spinner/Spinner.svelte";

    type Variant = "ring" | "arc" | "dots" | "bars" | "pulse" | "spokes";
    type Size = "xs" | "sm" | "md" | "lg" | "xl";
    type Tone = "current" | "brand" | "muted" | "success" | "warning" | "destructive";

    const variants: Variant[] = ["ring", "arc", "dots", "bars", "pulse", "spokes"];

    const sizes: { size: Size; px: number }[] = [
        { size: "xs", px: 14 },
        { size: "sm", px: 16 },
        { size: "md", px: 20 },
        { size: "lg", px: 28 },
        { size: "xl", px: 40 }
    ];

    const tones: Tone[] = ["current", "brand", "muted", "success", "warning", "destructive"];
</script>

<svelte:head>
    <title>Spinner — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Spinner</h1>
        <p class="text-sm text-foreground-muted">
            An indeterminate busy indicator in six shapes. Every mark in the matrices is decorative, so the matrices add no live regions.
        </p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            Spinner is an indeterminate busy mark in six shapes, sized and paced by one prop each. Use it where a wait is long enough to
            notice and short enough not to need explaining — roughly a second to a few seconds. Below that it flashes and reads as a glitch;
            above it, a reader wants to know what is happening, which is prose rather than a mark.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">Inside a control that was pressed.</span> The submit that is now working, where the
                mark sits in the button the reader is already looking at.
            </li>
            <li>
                <span class="font-medium text-foreground">A region that is loading.</span> A panel or a list fetching its contents, with the mark
                where the contents will land.
            </li>
            <li>
                <span class="font-medium text-foreground">An unknowable wait.</span> A third party is being called and no percentage exists to
                show — the honest case for an indeterminate mark.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for a wait you can measure.</span> Six of eight files uploaded is a fact worth showing;
                a spinner throws it away.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Every shape at every size</h2>
        <Card radius="lg" padding="md">
            <div class="grid grid-cols-[auto_repeat(5,1fr)] items-center gap-x-4 gap-y-5">
                <span></span>
                {#each sizes as { size, px } (size)}
                    <span class="text-center text-xs text-foreground-subtle">{size} · {px}px</span>
                {/each}
                {#each variants as variant (variant)}
                    <span class="text-sm font-semibold">{variant}</span>
                    {#each sizes as { size } (size)}
                        <span class="flex h-11 items-center justify-center text-primary">
                            <Spinner {variant} {size} decorative />
                        </span>
                    {/each}
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">An explicit px extent</h2>
        <Card radius="lg" padding="md" class="flex flex-wrap items-center gap-8">
            {#each variants as variant (variant)}
                {#each [13, 34, 64] as px (px)}
                    <span class="flex flex-col items-center gap-2 text-primary">
                        <span class="flex h-16 items-center">
                            <Spinner {variant} size={px} decorative />
                        </span>
                        <span class="text-xs text-foreground-subtle">{variant} {px}px</span>
                    </span>
                {/each}
            {/each}
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Tones</h2>
        <Card radius="lg" padding="md" class="flex flex-wrap items-center gap-8">
            {#each tones as tone (tone)}
                <span class="flex flex-col items-center gap-2">
                    <Spinner {tone} size="lg" decorative />
                    <span class="text-xs text-foreground-subtle">{tone}</span>
                </span>
            {/each}
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Inheriting the surface it sits on</h2>
        <div class="flex flex-wrap items-center gap-4">
            <Button>
                {#snippet leadingIcon()}
                    <Spinner size="xs" decorative />
                {/snippet}
                Placing order
            </Button>
            <Button variant="accent">
                {#snippet leadingIcon()}
                    <Spinner size="xs" variant="dots" decorative />
                {/snippet}
                Syncing
            </Button>
            <Button variant="outline" size="sm">
                {#snippet leadingIcon()}
                    <Spinner size="xs" variant="bars" decorative />
                {/snippet}
                Refreshing
            </Button>
            <span class="inline-flex items-center gap-2 rounded-lg bg-warning-light px-3 py-2 text-sm text-warning-strong">
                <Spinner size="sm" decorative />
                Waiting on the venue
            </span>
            <span class="inline-flex items-center gap-2 rounded-lg bg-success-light px-3 py-2 text-sm text-success-strong">
                <Spinner size="sm" variant="arc" decorative />
                Settling
            </span>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Two speeds</h2>
        <Card radius="lg" padding="md">
            <div class="grid grid-cols-[auto_repeat(6,1fr)] items-center gap-x-4 gap-y-5">
                <span></span>
                {#each variants as variant (variant)}
                    <span class="text-center text-xs text-foreground-subtle">{variant}</span>
                {/each}
                {#each [0.5, 2] as speed (speed)}
                    <span class="text-sm font-semibold">{speed}×</span>
                    {#each variants as variant (variant)}
                        <span class="flex h-11 items-center justify-center text-primary">
                            <Spinner {variant} size="lg" {speed} decorative />
                        </span>
                    {/each}
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">A visible label</h2>
        <div class="grid gap-3 md:grid-cols-2">
            <Card radius="lg" padding="md" class="grid min-h-26 place-items-center">
                <Spinner variant="arc" size="lg" tone="brand" label="Loading signals" showLabel />
            </Card>
            <Card radius="lg" padding="md" class="grid min-h-26 place-items-center">
                <Spinner variant="pulse" size="lg" tone="muted" speed={0.8} label="Waiting for the next tick" showLabel />
            </Card>
        </div>
        <Card radius="lg" padding="md" class="flex flex-wrap items-center gap-x-8 gap-y-4">
            {#each sizes as { size } (size)}
                <Spinner {size} label="Loading" showLabel />
            {/each}
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">What it announces</h2>
        <Card radius="lg" padding="md" class="flex flex-wrap items-center gap-8">
            <span class="flex items-center gap-3">
                <Spinner size="lg" tone="brand" />
                <span class="text-sm text-foreground-muted">announces “Loading”</span>
            </span>
            <span class="flex items-center gap-3">
                <Spinner size="lg" tone="brand" label="Fetching your positions" />
                <span class="text-sm text-foreground-muted">announces “Fetching your positions”</span>
            </span>
            <span class="flex items-center gap-3">
                <Spinner size="lg" tone="brand" decorative />
                <span class="text-sm text-foreground-muted">announces nothing</span>
            </span>
        </Card>
    </section>
</div>
