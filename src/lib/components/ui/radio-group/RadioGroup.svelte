<script lang="ts">
    import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import { cn } from "../../../utils/cn";
    import Radio, { setRadioGroupContext, type RadioOption, type RadioSize, type RadioVariant } from "./Radio.svelte";

    type Props = Omit<RadioGroupPrimitive.RootProps, "children" | "child"> & {
        /** `<Radio>` rows. Ignored when `items` is given. */
        children?: Snippet;
        /** Plain-data alternative to `children`, and the one that wins when both are passed. */
        items?: RadioOption[];
        /** Names the group for assistive technology. */
        label?: string;
        /** A second line under the label — announced as the group's description. */
        description?: string;
        /** `plain` rows or selectable `card` tiles. @default "plain" */
        variant?: RadioVariant;
        /** @default "md" */
        size?: RadioSize;
        /** Reds the group's label and message, and sets `aria-invalid`. The options are left alone. */
        error?: boolean;
        /** Replaces the description while in error. Pass one — a red label with no message is colour alone. */
        errorMessage?: string;
    };

    let {
        value = $bindable(""),
        items,
        label,
        description,
        orientation = "vertical",
        variant = "plain",
        size = "md",
        disabled = false,
        error = false,
        errorMessage,
        name,
        class: className,
        children,
        "aria-describedby": describedBy,
        "aria-labelledby": labelledBy,
        "aria-invalid": ariaInvalid,
        ...restProps
    }: Props = $props();

    const uid = $props.id();
    const labelId = `${uid}-label`;
    const descriptionId = `${uid}-description`;
    const errorId = `${uid}-error`;

    // Always defined: it is what makes the primitive render its hidden input, and what
    // keeps two groups on one page from stealing each other's selection.
    const groupName = $derived(name ?? `${uid}-radio-group`);

    // A getter, so these stay reactive in the children. `error` is deliberately not
    // handed down — the red marks the group, not its options.
    setRadioGroupContext(() => ({ size, variant }));

    const horizontal = $derived(orientation === "horizontal");

    // One message slot, like Input: the message replaces the rendered description, not
    // just its id. Two lines on screen with one announced is the accessibility floor
    // failed where no gate can see it.
    const showError = $derived(error && Boolean(errorMessage));

    const descriptions = $derived([describedBy, showError ? errorId : description ? descriptionId : undefined].filter(Boolean).join(" "));

    // `gap` is not ported; `class` lands here, on the element that carries the gap.
    const listStyles = $derived(
        cn("flex", horizontal ? "flex-row flex-wrap" : "flex-col", variant === "card" ? "gap-2.5" : horizontal ? "gap-4.5" : "gap-3")
    );
</script>

<div class="flex flex-col gap-2">
    {#if label}
        <span id={labelId} class={cn("text-sm font-semibold", error ? "text-destructive" : "text-foreground")}>{label}</span>
    {/if}
    {#if description && !showError}
        <span id={descriptionId} class="-mt-1 text-sm/normal text-foreground-muted">{description}</span>
    {/if}
    <RadioGroupPrimitive.Root
        {...restProps}
        {disabled}
        {orientation}
        aria-describedby={descriptions || undefined}
        aria-invalid={error ? "true" : ariaInvalid}
        aria-labelledby={label ? labelId : labelledBy}
        class={cn(listStyles, className)}
        name={groupName}
        bind:value>
        {#if items}
            {#each items as item (item.value)}
                <Radio
                    value={item.value}
                    description={item.description}
                    disabled={item.disabled}
                    icon={item.icon}
                    label={item.label}
                    meta={item.meta} />
            {/each}
        {:else}
            {@render children?.()}
        {/if}
    </RadioGroupPrimitive.Root>
    {#if showError}
        <span id={errorId} class="text-sm text-destructive">{errorMessage}</span>
    {/if}
</div>
