<script lang="ts">
    import { ArrowRight, Download, Plus } from "lucide-svelte";
    import Button from "$lib/components/ui/button/Button.svelte";

    const variants = ["default", "accent", "destructive", "outline", "outline-fill", "ghost", "success", "link"] as const;
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
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            Button is the library's action control, in a set of variants that rank one against another. Use it for anything the reader does,
            and let the variant carry the ranking: one filled button per region, because a screen where everything is primary has no primary
            at all.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">The main action of a form or a panel.</span> Filled, once, where the reader's eye should
                land when they have finished reading.
            </li>
            <li>
                <span class="font-medium text-foreground">Secondary actions beside it.</span> Outline or ghost, so Cancel is reachable without
                competing with Save.
            </li>
            <li>
                <span class="font-medium text-foreground">A destructive action.</span> Named for what it destroys, and paired with a confirmation
                step when there is no undo.
            </li>
            <li>
                <span class="font-medium text-foreground">An offer that saves the reader money.</span> Success, in the status tint, and with words
                that say what the reader gains.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for navigation dressed as an action.</span> Give it an
                <code class="font-mono">href</code> and it renders as a link, which is what a destination should always be.
            </li>
        </ul>
    </section>

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
            <Button variant="outline-fill" href="/playground" disabled>Disabled outline-fill anchor</Button>
        </div>
        <p class="text-sm text-foreground-muted">
            Body copy with an <Button variant="link" href="/playground">inline link</Button> in it, to check the link variant sits on the text
            baseline rather than in a 40px slot.
        </p>
    </section>
</div>
