<script module lang="ts">
    import { getContext, setContext } from "svelte";

    export type ToggleVariant = "default" | "outline" | "solid";
    export type ToggleSize = "sm" | "md" | "lg";

    /**
     * What a `ToggleGroup` hands the buttons inside it, so a call site sets the
     * presentation once on the group rather than on every child. The pressed state is
     * deliberately not here: bits-ui's `ToggleGroup.Root` owns that, and its `Item`
     * reads it through the primitive's own context.
     */
    export type ToggleGroupContext = {
        variant: ToggleVariant;
        size: ToggleSize;
        disabled: boolean;
        /** The group is a segmented track, so its buttons draw no edges of their own. */
        attached: boolean;
        /** The group fills its container, so each button takes an equal share of it. */
        fullWidth: boolean;
        /** The single-select group paints the selected surface below its items. */
        sliding?: boolean;
        indicatorReady?: boolean;
    };

    const contextKey = Symbol("tia-toggle-group");

    /** Called by `ToggleGroup`. A getter, so its props stay reactive in the children. */
    export function setToggleGroupContext(context: () => ToggleGroupContext): void {
        setContext(contextKey, context);
    }

    function getToggleGroupContext(): (() => ToggleGroupContext) | undefined {
        return getContext(contextKey);
    }
</script>

<script lang="ts">
    import { Toggle as TogglePrimitive, ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import { cn } from "../../../utils/cn";

    type Props = Omit<TogglePrimitive.RootProps, "children" | "child"> & {
        /** Tinted capsule, bordered, or filled. Inherited from a `ToggleGroup`. @default "default" */
        variant?: ToggleVariant;
        /** Inherited from a `ToggleGroup`. @default "md" */
        size?: ToggleSize;
        /** Identity inside a `ToggleGroup`, which then owns the pressed state. Inert on its own. */
        value?: string;
        leadingIcon?: Snippet;
        trailingIcon?: Snippet;
        children?: Snippet;
    };

    let {
        pressed = $bindable(false),
        onPressedChange,
        variant,
        size,
        value,
        disabled,
        class: className,
        children,
        leadingIcon,
        trailingIcon,
        ...restProps
    }: Props = $props();

    const group = getToggleGroupContext();
    const inherited = $derived(group?.());

    const resolvedVariant = $derived(variant ?? inherited?.variant ?? "default");
    const resolvedSize = $derived(size ?? inherited?.size ?? "md");
    const resolvedDisabled = $derived(disabled ?? inherited?.disabled ?? false);

    /**
     * `Toggle.Root` and `ToggleGroup.Item` are separate bits-ui primitives with separate
     * state models — `Root` owns its pressed state, `Item` reads the group's — so the
     * component renders whichever applies. The value is the identity the group tracks,
     * which makes it what picks the primitive; one passed outside a group is inert.
     */
    const groupItemValue = $derived(inherited === undefined ? undefined : value);

    const iconOnly = $derived(children === undefined);

    // The group's geometry reaching into the button. `min-w-0` lets a wide label shrink to
    // its equal share, and sits before the size map so an icon-only square keeps its own.
    const groupStyles = $derived(
        cn(
            inherited?.attached && "border-transparent",
            inherited?.fullWidth && "min-w-0 flex-1",
            inherited?.sliding &&
                groupItemValue !== undefined &&
                "relative z-10 transition-colors duration-200 data-[state=on]:border-transparent data-[state=on]:bg-primary data-[state=on]:enabled:text-primary-foreground data-[state=on]:disabled:text-primary-foreground data-[state=on]:disabled:opacity-100",
            inherited?.sliding && inherited.indicatorReady && groupItemValue !== undefined && "data-[state=on]:bg-transparent"
        )
    );

    const baseStyles =
        "inline-flex cursor-pointer items-center justify-center rounded-md border font-semibold whitespace-nowrap text-foreground-muted transition-all duration-200 ease-out not-data-[state=on]:enabled:hover:text-foreground disabled:cursor-not-allowed disabled:text-foreground-subtle disabled:opacity-50";

    // The pressed *ink* carries `enabled:` so that a disabled toggle keeps the subtle
    // ink whichever state it is parked in.
    const variantStyles: Record<ToggleVariant, string> = {
        default:
            "border-transparent not-data-[state=on]:enabled:hover:bg-background-muted data-[state=on]:bg-primary/12 data-[state=on]:enabled:text-primary",
        outline:
            "border-border-input not-data-[state=on]:enabled:hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary/12 data-[state=on]:enabled:text-primary",
        solid: "border-transparent not-data-[state=on]:enabled:hover:bg-background-muted data-[state=on]:bg-primary data-[state=on]:enabled:text-primary-foreground"
    };

    // `pointer-coarse:h-11` is the 44px touch floor; `sm` cannot reach it without losing
    // the density it exists for — see `Toggle.md`.
    const sizeStyles: Record<ToggleSize, { box: string; iconOnly: string; labelled: string }> = {
        sm: { box: "h-7.5 gap-1.5 text-sm/snug", iconOnly: "min-w-7.5 px-0", labelled: "px-2" },
        md: {
            box: "h-9 gap-1.75 text-md/snug pointer-coarse:h-11",
            iconOnly: "min-w-9 px-0 pointer-coarse:min-w-11",
            labelled: "px-3"
        },
        lg: {
            box: "h-10.5 gap-2 text-md/snug pointer-coarse:h-11",
            iconOnly: "min-w-10.5 px-0 pointer-coarse:min-w-11",
            labelled: "px-4"
        }
    };

    const classes = $derived(
        cn(
            baseStyles,
            variantStyles[resolvedVariant],
            groupStyles,
            sizeStyles[resolvedSize].box,
            iconOnly ? sizeStyles[resolvedSize].iconOnly : sizeStyles[resolvedSize].labelled,
            className
        )
    );
</script>

{#snippet body()}
    {@render leadingIcon?.()}
    {@render children?.()}
    {@render trailingIcon?.()}
{/snippet}

{#if groupItemValue !== undefined}
    <ToggleGroupPrimitive.Item value={groupItemValue} class={classes} disabled={resolvedDisabled} {...restProps}>
        {@render body()}
    </ToggleGroupPrimitive.Item>
{:else}
    <TogglePrimitive.Root class={classes} disabled={resolvedDisabled} {onPressedChange} bind:pressed {...restProps}>
        {@render body()}
    </TogglePrimitive.Root>
{/if}
