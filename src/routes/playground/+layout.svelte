<script lang="ts">
    import "../../app.css";
    import { resolve } from "$app/paths";
    import { ModeWatcher, toggleMode } from "mode-watcher";
    import type { Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();

    const pages = ["button", "card", "alert", "spinner"] as const;
</script>

<ModeWatcher />

<div class="min-h-dvh bg-background text-foreground">
    <header class="flex items-center justify-between gap-4 border-b border-border-muted bg-surface px-6 py-3">
        <nav aria-label="Components" class="flex flex-wrap items-center gap-4 text-sm">
            <a href={resolve("/playground")} class="font-semibold">Playground</a>
            {#each pages as name (name)}
                <a href={resolve(`/playground/${name}`)} class="text-foreground-muted capitalize hover:text-primary">{name}</a>
            {/each}
        </nav>
        <button
            type="button"
            class="cursor-pointer rounded-full border border-border-input bg-surface px-4 py-1.5 text-sm text-foreground hover:border-primary"
            onclick={toggleMode}>
            Toggle theme
        </button>
    </header>

    <main>
        {@render children()}
    </main>
</div>
