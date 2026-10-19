<script lang="ts">
    import { resolve } from "$app/paths";

    const pages = [
        "button",
        "card",
        "alert",
        "spinner",
        "checkbox",
        "radio-group",
        "toggle",
        "tooltip",
        "popover",
        "select",
        "combobox",
        "table",
        "kbd",
        "chart"
    ] as const;
</script>

<svelte:head>
    <title>Playground</title>
</svelte:head>

<div class="space-y-4 p-10">
    <h1 class="text-2xl font-bold">Design system playground</h1>
    <p class="text-sm text-foreground-muted">One page per component. Each page shows every variant, size and state.</p>
    <ul class="list-disc space-y-1 pl-5">
        {#each pages as name (name)}
            <li><a href={resolve(`/playground/${name}`)} class="capitalize">{name}</a></li>
        {/each}
    </ul>
</div>
