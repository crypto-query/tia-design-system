<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";

    type Radius = "lg" | "xl" | "2xl";
    type Padding = "none" | "sm" | "md" | "lg";

    type Props = HTMLAttributes<HTMLDivElement> & {
        /** Resting treatment: raised shadow at rest. Beaten by `flat`. */
        elevated?: boolean;
        /** Resting treatment: border only, no shadow. Good for dense lists. */
        flat?: boolean;
        /** Hover: lifts and deepens the shadow. For clickable cards. */
        interactive?: boolean;
        /** Hover: deepens the shadow and accents the border, without moving. For grids and lists. Beaten by `interactive`. */
        hoverable?: boolean;
        /** Frosted panel over the tinted canvas. */
        glass?: boolean;
        radius?: Radius;
        padding?: Padding;
        children?: Snippet;
    };

    let {
        elevated = false,
        flat = false,
        interactive = false,
        hoverable = false,
        glass = false,
        radius = "xl",
        padding = "lg",
        class: className,
        children,
        ...restProps
    }: Props = $props();

    // Content clips to the radius, so a full-bleed child — an image against the
    // top edge, a tinted footer, divided rows — keeps the rounded corners. A
    // card that must let a child escape passes class="overflow-visible".
    const baseStyles =
        "overflow-hidden border border-card-border bg-card-background text-card-foreground transition-all duration-300 ease-out-soft";

    const radiusStyles: Record<Radius, string> = {
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl"
    };

    const paddingStyles: Record<Padding, string> = {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
    };

    // --glass-blur is a whole filter function, which no Tailwind namespace can
    // hold, so no class reaches it; backdrop-blur-sm matches its 8px. Change
    // one and change the other.
    const glassStyles = "border-border-glass bg-surface-glass backdrop-blur-sm";

    const restStyles = $derived(flat ? "shadow-none" : elevated ? "shadow-medium" : "shadow-subtle");

    // At most one hover treatment applies: `interactive` lifts, `hoverable`
    // deepens and accents the border but must never move.
    const hoverStyles = $derived(
        interactive ? "hover:-translate-y-1 hover:shadow-medium" : hoverable ? "hover:border-primary hover:shadow-medium" : undefined
    );

    const classes = $derived(
        cn(baseStyles, radiusStyles[radius], paddingStyles[padding], restStyles, glass && glassStyles, hoverStyles, className)
    );
</script>

<div class={classes} {...restProps}>
    {@render children?.()}
</div>
