<script lang="ts">
    import { ArrowRight, Download, Plus } from "lucide-svelte";
    import Button from "$lib/components/ui/button/Button.svelte";

    const variants = ["default", "accent", "destructive", "outline", "ghost", "success", "link"] as const;
    const sizes = ["sm", "md", "lg", "xl"] as const;
</script>

<svelte:head>
    <title>Button — playground</title>
</svelte:head>

{#snippet leading()}
    <Plus class="size-4" aria-hidden="true" />
{/snippet}

{#snippet trailing()}
    <ArrowRight class="size-4" aria-hidden="true" />
{/snippet}

{#snippet iconOnly()}
    <Download class="size-4" aria-hidden="true" />
{/snippet}

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Button</h1>
        <p class="text-sm text-foreground-muted">Hover and press a filled variant to see the lift, the glow and the settle.</p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Variants</h2>
        <div class="flex flex-wrap items-center gap-4">
            {#each variants as variant (variant)}
                <Button {variant}>{variant}</Button>
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Sizes</h2>
        {#each variants as variant (variant)}
            <div class="flex flex-wrap items-center gap-4">
                {#each sizes as size (size)}
                    <Button {variant} {size}>{variant} {size}</Button>
                {/each}
                <Button {variant} size="icon" leadingIcon={iconOnly} aria-label="Download" />
            </div>
        {/each}
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Icons</h2>
        <div class="flex flex-wrap items-center gap-4">
            <Button leadingIcon={leading}>Add strategy</Button>
            <Button variant="accent" trailingIcon={trailing}>Count me in</Button>
            <Button variant="outline" leadingIcon={leading} trailingIcon={trailing}>Both</Button>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Disabled</h2>
        {#each sizes as size (size)}
            <div class="flex flex-wrap items-center gap-4">
                {#each variants as variant (variant)}
                    <Button {variant} {size} disabled>{variant}</Button>
                {/each}
                <Button size="icon" leadingIcon={iconOnly} aria-label="Download" disabled />
            </div>
        {/each}
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Links</h2>
        <div class="flex flex-wrap items-center gap-4">
            <Button href="/playground">Anchor</Button>
            <Button variant="link" href="/playground" trailingIcon={trailing}>Inline text link</Button>
            <Button href="/playground" disabled>Disabled anchor</Button>
        </div>
        <p class="text-sm text-foreground-muted">
            Body copy with an <Button variant="link" href="/playground">inline link</Button> in it, to check the link variant sits on the text
            baseline rather than in a 40px slot.
        </p>
    </section>
</div>
