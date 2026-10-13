<script lang="ts">
    import { Sparkles } from "lucide-svelte";
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Button from "$lib/components/ui/button/Button.svelte";

    let replay = $state(0);
    let dismissed = $state<string[]>([]);

    const notices = [
        { variant: "default", title: "Heads up", body: "A plain notice — just supporting copy." },
        {
            variant: "info",
            title: "Public enrollment opens soon",
            body: "Join the waitlist to lock in 50% off your first annual subscription."
        },
        { variant: "success", title: "You're on the list!", body: "We'll let you know the moment we go live." },
        { variant: "warning", title: "Markets closed", body: "Signals resume when the session reopens." },
        { variant: "destructive", title: "Subscription failed", body: "Please enter a valid email address." }
    ] as const;
</script>

<svelte:head>
    <title>Alert — playground</title>
</svelte:head>

{#snippet sparkle()}
    <Sparkles size={20} aria-hidden="true" />
{/snippet}

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Alert</h1>
        <p class="text-sm text-foreground-muted">Five variants, each on its status tint with the matching strong text.</p>
    </header>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Entry motion</h2>
        <p class="text-sm text-foreground-muted">Alerts rise 6px and fade in over 240ms. Reduced motion keeps only the fade.</p>
        <Button variant="outline" onclick={() => (replay += 1)}>Replay alert</Button>
        {#key replay}
            <Alert variant="warning" title="Price update failed">Your last confirmed price stays available.</Alert>
        {/key}
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Variants — title and default icon</h2>
        <div class="space-y-3">
            {#each notices as notice (notice.variant)}
                <Alert variant={notice.variant} title={notice.title}>{notice.body}</Alert>
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Without a title</h2>
        <div class="space-y-3">
            {#each notices as notice (notice.variant)}
                <Alert variant={notice.variant}>{notice.body}</Alert>
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Without an icon</h2>
        <div class="space-y-3">
            {#each notices as notice (notice.variant)}
                <Alert variant={notice.variant} title={notice.title} icon={false}>{notice.body}</Alert>
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Neither title nor icon</h2>
        <div class="space-y-3">
            {#each notices as notice (notice.variant)}
                <Alert variant={notice.variant} icon={false}>{notice.body}</Alert>
            {/each}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Dismissible</h2>
        <Button variant="outline" onclick={() => (dismissed = [])}>Restore alerts</Button>
        <div class="space-y-3">
            {#each notices.filter((notice) => !dismissed.includes(notice.variant)) as notice (notice.variant)}
                <Alert variant={notice.variant} onDismiss={() => (dismissed = [...dismissed, notice.variant])}>{notice.body}</Alert>
            {/each}
            {#if !dismissed.includes("titled")}
                <Alert variant="destructive" title="Your card was declined" onDismiss={() => (dismissed = [...dismissed, "titled"])}>
                    Nothing was charged. Choose another card and try again.
                </Alert>
            {/if}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Title alone, an overridden icon, a long value</h2>
        <div class="space-y-3">
            <Alert variant="success" title="Payment received" />
            <Alert variant="warning" title="Backfill running" icon={sparkle}
                >The default glyph gives way to whatever the caller passes.</Alert>
            <Alert variant="info" role="note" title="role=&quot;note&quot;">A note beside content, not an assertive live region.</Alert>
            <Alert variant="info">
                A long unbroken value has to wrap rather than push the panel wide:
                <span class="font-mono">strategy-guide-momentum-breakout-eurusd-h4-2026-revision</span>.
            </Alert>
        </div>
    </section>
</div>
