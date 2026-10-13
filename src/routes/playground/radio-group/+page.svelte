<script lang="ts">
    import { Clock, Globe, ShieldCheck, Wallet, Zap } from "lucide-svelte";
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Card from "$lib/components/ui/card/Card.svelte";
    import Radio from "$lib/components/ui/radio-group/Radio.svelte";
    import RadioGroup from "$lib/components/ui/radio-group/RadioGroup.svelte";

    const variants = ["plain", "card"] as const;
    const orientations = ["vertical", "horizontal"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    const risk = [
        { value: "1", label: "1R" },
        { value: "2", label: "2R" },
        { value: "3", label: "3R" }
    ];

    const accounts = [
        { value: "cash", label: "Cash", description: "Settled funds only." },
        { value: "margin", label: "Margin", description: "Leverage up to 4×, subject to review." },
        { value: "ira", label: "Retirement", description: "Not available in every region.", disabled: true }
    ];

    // Every variant × orientation × size, each group holding its own selection.
    const matrixKeys = variants.flatMap((variant) =>
        orientations.flatMap((orientation) => sizes.map((size) => `${variant}-${orientation}-${size}`))
    );
    let matrix = $state(Object.fromEntries(matrixKeys.map((key) => [key, "2"])));

    // Both variants × three sizes, each carrying a label, description, meta and icon.
    const fullKeys = variants.flatMap((variant) => sizes.map((size) => `${variant}-${size}`));
    let full = $state(Object.fromEntries(fullKeys.map((key) => [key, "patient"])));

    let plan = $state("annual");
    let session = $state("london");
    let speed = $state("balanced");
    let account = $state("");
    let sizing = $state("2");
    let locked = $state("margin");
</script>

<svelte:head>
    <title>RadioGroup — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">RadioGroup</h1>
        <p class="text-sm text-foreground-muted">
            One choice from a short visible set, built on <code class="font-mono">RadioGroup.Root</code> and
            <code class="font-mono">RadioGroup.Item</code>: Tab enters the group once, the arrows move the selection, and a disabled option
            is skipped on the way past. Each row <em>is</em> the button — the dial, the label, the meta and the description all sit inside it,
            so the whole row is the hit target.
        </p>
    </header>

    <Alert variant="info" role="note" title="Radio group, toggle group, combobox or checkboxes?">
        Reach for a <strong>RadioGroup</strong> when one value is chosen from a short visible set and seeing all of it is worth the space —
        especially when each option needs a description or a price beside it. A <strong>ToggleGroup</strong> is the compact form of the same
        choice, for short labels in a strip. A <strong>Combobox</strong> takes over once the list is long enough to want searching. And
        <strong>Checkbox</strong> is what to reach for the moment more than one option can be true at a time.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="text-sm text-foreground-muted">
            RadioGroup gives the whole row to the option: the dial, the label, the meta and the description all sit inside the button, so
            the hit target is the row rather than the dial. Use it for two to about six options that the reader should compare before
            choosing — below two there is no choice, and above six the list stops being scannable and wants a Combobox.
        </p>
        <ul class="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">A plan picker.</span> Card tiles, where the price and what each plan includes are the
                whole basis of the decision.
            </li>
            <li>
                <span class="font-medium text-foreground">A payment or delivery method.</span> Rows with a glyph and a note, one of which must
                be chosen before the form goes.
            </li>
            <li>
                <span class="font-medium text-foreground">A choice that can be wrong.</span> The error state colours the group rather than any
                one option, because it is the group that is unanswered.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for a value with a long list behind it.</span> A country or a market is a Combobox;
                showing sixty dials is a page of noise around one answer.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Card tiles — one plan</h2>
        <p class="text-sm text-foreground-muted">
            The tile is the control, so its own <code class="font-mono">min-h-11</code> is the 44px touch target — the one component in this library
            that meets the floor. The selection is never colour alone: the dial fills, and the border, ring and lifted surface only reinforce
            it.
        </p>
        <Card padding="md">
            <RadioGroup bind:value={plan} label="Billing period" name="billing" orientation="horizontal" variant="card">
                <Radio value="monthly" description="Cancel any time. Billed on the 1st." label="Monthly" meta="$149" />
                <Radio value="annual" description="Two months free, billed today." label="Annual" meta="$1,290" />
                <Radio value="lifetime" disabled description="Not available on the Starter tier." label="Lifetime" meta="—" />
            </RadioGroup>
            <p class="mt-4 text-sm text-foreground-muted">Selected: <code class="font-mono">{plan}</code></p>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Plain rows</h2>
        <p class="text-sm text-foreground-muted">
            The default: a dial, a label, and an optional description. The group's own label and description sit above it and name it for
            assistive technology.
        </p>
        <div class="grid gap-6 md:grid-cols-2">
            <Card padding="md">
                <RadioGroup
                    bind:value={session}
                    description="Signals outside the window are suppressed."
                    label="Session filter"
                    name="session">
                    <Radio value="london" description="07:00–11:00 UTC" label="London" />
                    <Radio value="newyork" description="13:00–17:00 UTC" label="New York" />
                    <Radio value="both" label="Both sessions" />
                </RadioGroup>
            </Card>
            <Card padding="md">
                <RadioGroup bind:value={sizing} label="Risk multiple" name="risk" orientation="horizontal" size="sm" items={risk} />
                <p class="mt-4 text-sm text-foreground-muted">
                    Short options sit in a wrapping row. This one is the <code class="font-mono">items</code> form — plain data rather than composed
                    children.
                </p>
            </Card>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Icons and meta</h2>
        <p class="text-sm text-foreground-muted">
            An <code class="font-mono">icon</code> leads the label line and takes the accent colour when the row is selected;
            <code class="font-mono">meta</code> is pushed to the far end in tabular figures. Neither is part of the row's name — both describe
            it.
        </p>
        <Card class="max-w-xl" padding="md">
            <RadioGroup bind:value={speed} label="Execution profile" name="speed" variant="card">
                <Radio value="patient" description="Waits for the spread to close." label="Patient" meta="~40s">
                    {#snippet icon()}<Clock class="size-4" />{/snippet}
                </Radio>
                <Radio value="balanced" description="The default for most strategies." label="Balanced" meta="~8s">
                    {#snippet icon()}<ShieldCheck class="size-4" />{/snippet}
                </Radio>
                <Radio value="aggressive" description="Crosses the spread immediately." label="Aggressive" meta="~1s">
                    {#snippet icon()}<Zap class="size-4" />{/snippet}
                </Radio>
            </RadioGroup>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">A full row at every size</h2>
        <p class="text-sm text-foreground-muted">
            Label, description, meta and icon together, so each size's own type ramp is on screen: the description steps 12 · 13 · 13px
            under a label that steps 13 · 14 · 16px. The icon is the caller's snippet and does not scale with the group.
        </p>
        <Card padding="md">
            <div class="flex flex-col gap-8 lg:flex-row">
                {#each variants as variant (variant)}
                    <div class="flex flex-1 flex-col gap-6">
                        <p class="text-2xs font-semibold tracking-widest text-foreground-subtle uppercase">{variant}</p>
                        {#each sizes as size (size)}
                            <RadioGroup bind:value={full[`${variant}-${size}`]} {size} {variant} label={size}>
                                <Radio value="patient" description="Waits for the spread to close." label="Patient" meta="~40s">
                                    {#snippet icon()}<Clock class="size-4" />{/snippet}
                                </Radio>
                                <Radio value="aggressive" description="Crosses the spread immediately." label="Aggressive" meta="~1s">
                                    {#snippet icon()}<Zap class="size-4" />{/snippet}
                                </Radio>
                            </RadioGroup>
                        {/each}
                    </div>
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Every variant, orientation and size</h2>
        <p class="text-sm text-foreground-muted">
            Twelve groups: two variants × two orientations × three sizes. The dial steps 16 · 20 · 24px and the type steps with it.
        </p>
        <Card padding="md">
            <div class="flex flex-col gap-8">
                {#each variants as variant (variant)}
                    {#each orientations as orientation (orientation)}
                        <div class="space-y-3">
                            <p class="text-2xs font-semibold tracking-widest text-foreground-subtle uppercase">
                                {variant} · {orientation}
                            </p>
                            <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
                                {#each sizes as size (size)}
                                    <div class="lg:w-64">
                                        <RadioGroup
                                            bind:value={matrix[`${variant}-${orientation}-${size}`]}
                                            {orientation}
                                            {size}
                                            {variant}
                                            label={size}
                                            items={risk} />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                {/each}
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Disabled</h2>
        <p class="text-sm text-foreground-muted">
            One option inside a live group, or the whole group at once. Both dim to <code class="font-mono">opacity-50</code>, and a
            disabled option is skipped by the arrows rather than stopping them.
        </p>
        <div class="grid gap-6 md:grid-cols-2">
            <Card padding="md">
                <RadioGroup bind:value={account} label="Account type" name="account" items={accounts} />
                <p class="mt-4 text-sm text-foreground-muted">One option disabled, the group live.</p>
            </Card>
            <Card padding="md">
                <RadioGroup bind:value={locked} disabled label="Account type — locked" name="locked" variant="card" items={accounts} />
                <p class="mt-4 text-sm text-foreground-muted">The whole group disabled, its selection still readable.</p>
            </Card>
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Error</h2>
        <p class="text-sm text-foreground-muted">
            <code class="font-mono">error</code> colours the group's own label and its message, and nothing below them — the dials, the
            marks and the tile borders render exactly as they do in a valid group. The red marks what
            <code class="font-mono">aria-invalid</code> marks, and that is the group: what is wrong is that no choice has been made, not any
            option on offer. The message becomes the group's description via <code class="font-mono">aria-describedby</code>, with no alert
            role to announce it twice. Pass one — with the options left neutral it is most of what separates a group in error from a group
            at rest.
        </p>
        <div class="grid gap-6 md:grid-cols-2">
            <Card padding="md">
                <RadioGroup
                    error
                    description="Shown while the group is valid — the error message stands in for this line, never beside it."
                    errorMessage="Choose an account type to continue."
                    label="Account type"
                    name="acct-error"
                    orientation="horizontal"
                    size="sm"
                    items={[
                        { value: "cash", label: "Cash" },
                        { value: "margin", label: "Margin" }
                    ]} />
                <p class="mt-4 text-sm text-foreground-muted">
                    This group has a <code class="font-mono">description</code> as well, and it is not rendered: one message slot, so what
                    is read and what <code class="font-mono">aria-describedby</code> points at are the same string.
                </p>
            </Card>
            <Card padding="md">
                <RadioGroup
                    error
                    errorMessage="Pick a payout account before withdrawing."
                    label="Payout account"
                    name="payout-error"
                    value="iban"
                    variant="card">
                    <Radio value="iban" description="2–3 business days." label="Bank transfer" meta="Free">
                        {#snippet icon()}<Wallet class="size-4" />{/snippet}
                    </Radio>
                    <Radio value="wire" description="Same day, above $10,000." label="International wire" meta="$25">
                        {#snippet icon()}<Globe class="size-4" />{/snippet}
                    </Radio>
                </RadioGroup>
            </Card>
        </div>
    </section>
</div>
