<script module lang="ts">
    import { getContext, setContext, type Snippet } from "svelte";

    export type RadioSize = "sm" | "md" | "lg";
    export type RadioVariant = "plain" | "card";

    /** One option in a `RadioGroup`'s `items` array — the plain-data form of a `<Radio>`. */
    export type RadioOption = {
        value: string;
        label?: string;
        description?: string;
        /** Trailing note — a price, a count, a shortcut. */
        meta?: string;
        icon?: Snippet;
        disabled?: boolean;
    };

    /**
     * Presentation a `RadioGroup` sets once for every row inside it. The selected value
     * and `disabled` belong to the primitive; `error` is deliberately absent, because
     * the red marks the group and not its options. See `RadioGroup.md`.
     */
    export type RadioGroupContext = {
        size: RadioSize;
        variant: RadioVariant;
    };

    const contextKey = Symbol("tia-radio-group");

    /** Called by `RadioGroup`. A getter, so its props stay reactive in the children. */
    export function setRadioGroupContext(context: () => RadioGroupContext): void {
        setContext(contextKey, context);
    }

    function getRadioGroupContext(): (() => RadioGroupContext) | undefined {
        return getContext(contextKey);
    }
</script>

<script lang="ts">
    import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
    import { cn } from "../../../utils/cn";

    type Props = Omit<RadioGroupPrimitive.ItemProps, "children" | "child"> & {
        /** Names the row for assistive technology. The meta and description describe it instead. */
        label?: string;
        /** A second line under the label. */
        description?: string;
        /** Trailing note — a price, a count, a shortcut. */
        meta?: string;
        icon?: Snippet;
    };

    let {
        label,
        description,
        meta,
        icon,
        class: className,
        "aria-describedby": describedBy,
        "aria-labelledby": labelledBy,
        ...restProps
    }: Props = $props();

    const uid = $props.id();
    const labelId = `${uid}-label`;
    const descriptionId = `${uid}-description`;
    const metaId = `${uid}-meta`;

    // A `<Radio>` outside a group falls back rather than throwing: the primitive is what
    // actually requires the parent, and it raises its own error.
    const group = getRadioGroupContext();
    const presentation = $derived(group?.() ?? { size: "md" as const, variant: "plain" as const });
    const card = $derived(presentation.variant === "card");

    // With no `label` there is nothing to pin the name to, so the row is named by its
    // own content and both ids drop out rather than being read twice.
    const descriptions = $derived(
        [describedBy, label && meta ? metaId : undefined, label && description ? descriptionId : undefined].filter(Boolean).join(" ")
    );

    // The padding steps are exact quarter-steps of Tailwind's 0.25rem multiplier, so
    // they are written rather than snapped. Lint cannot see a class inside a map.
    const sizeStyles: Record<RadioSize, { dial: string; dot: string; gap: string; label: string; description: string; pad: string }> = {
        sm: { dial: "size-4", dot: "size-1.5", gap: "gap-2", label: "text-sm/snug", description: "text-xs/normal", pad: "px-3 py-2.5" },
        md: {
            dial: "size-5",
            dot: "size-2",
            gap: "gap-2.5",
            label: "text-md/snug",
            description: "text-sm/normal",
            pad: "px-3.75 py-3.25"
        },
        lg: {
            dial: "size-6",
            dot: "size-2.5",
            gap: "gap-3",
            label: "text-base/snug",
            description: "text-sm/normal",
            pad: "px-4.5 py-4"
        }
    };

    // No error branch: a tile only ever draws its selected state. The lift is
    // `--surface-raised` because `--accent` is the light canvas's own colour. Both
    // decisions are in `RadioGroup.md`.
    const cardStyles =
        "border-border-muted bg-surface shadow-card not-data-[state=checked]:enabled:hover:border-border-emphasis data-[state=checked]:border-primary data-[state=checked]:bg-surface-raised data-[state=checked]:shadow-none data-[state=checked]:ring-1 data-[state=checked]:ring-primary";

    // The whole row is the control, so `min-h-11` is the 44px touch floor met by the
    // tile itself rather than by a pseudo-element.
    const rowStyles = $derived(
        cn(
            "group flex cursor-pointer text-left transition-all duration-150 ease-out-soft disabled:cursor-not-allowed disabled:opacity-50",
            description || card ? "items-start" : "items-center",
            sizeStyles[presentation.size].gap,
            card && cn("min-h-11 flex-1 rounded-lg border", sizeStyles[presentation.size].pad, cardStyles),
            className
        )
    );

    const dialStyles = $derived(
        cn(
            "grid shrink-0 place-items-center rounded-full border-2 border-border-input bg-surface transition-colors duration-150 ease-out-soft group-data-[state=checked]:border-primary",
            sizeStyles[presentation.size].dial,
            description && "mt-px"
        )
    );

    const dotStyles = $derived(
        cn(
            // Still appears under reduced motion; it just stops growing into place.
            "scale-0 rounded-full bg-primary transition-transform duration-200 ease-out-soft group-data-[state=checked]:scale-100 motion-reduce:transition-none",
            sizeStyles[presentation.size].dot
        )
    );

    const iconStyles = "grid shrink-0 place-items-center text-foreground-muted group-data-[state=checked]:text-primary";

    const labelStyles = $derived(cn("font-medium text-foreground", sizeStyles[presentation.size].label));
</script>

<RadioGroupPrimitive.Item
    {...restProps}
    aria-describedby={descriptions || undefined}
    aria-labelledby={label ? labelId : labelledBy}
    class={rowStyles}>
    <span aria-hidden="true" class={dialStyles}>
        <span class={dotStyles}></span>
    </span>
    <!-- `grow`: without it the column shrink-wraps and `meta`'s `ml-auto` reaches the end
         of the description rather than the end of the row. -->
    <span class="flex min-w-0 grow flex-col gap-0.5">
        <span class="flex items-center gap-2">
            {#if icon}
                <span aria-hidden="true" class={iconStyles}>
                    {@render icon()}
                </span>
            {/if}
            {#if label}
                <span id={labelId} class={labelStyles}>{label}</span>
            {/if}
            {#if meta}
                <span id={metaId} class="ml-auto shrink-0 text-sm text-foreground-muted tabular-nums">{meta}</span>
            {/if}
        </span>
        {#if description}
            <span id={descriptionId} class={cn("text-pretty text-foreground-muted", sizeStyles[presentation.size].description)}>
                {description}
            </span>
        {/if}
    </span>
</RadioGroupPrimitive.Item>
