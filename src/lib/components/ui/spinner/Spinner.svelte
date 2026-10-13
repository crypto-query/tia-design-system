<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";

    /** `style` is omitted because the component sets its own: a caller's would replace the mark's geometry, so it is a `check` error rather than a silent no-op. */
    interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "style"> {
        /** Shape: rotating `ring` · masked conic `arc` · three `dots` · equalizer `bars` · rippling `pulse` · fading `spokes`. @default "ring" */
        variant?: "ring" | "arc" | "dots" | "bars" | "pulse" | "spokes";
        /** Named step or an explicit px extent. @default "md" */
        size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
        /** Ink. `current` inherits from the surface it sits on. @default "current" */
        tone?: "current" | "brand" | "muted" | "success" | "warning" | "destructive";
        /** Animation-rate multiplier — 1.5 is half again as fast. @default 1 */
        speed?: number;
        /** Accessible name, and the visible text when `showLabel`. @default "Loading" */
        label?: string;
        /** Render `label` beside the mark. @default false */
        showLabel?: boolean;
        /** Hide from assistive tech — for a spinner inside something that already announces the wait. @default false */
        decorative?: boolean;
        class?: string;
    }

    let {
        variant = "ring",
        size = "md",
        tone = "current",
        speed = 1,
        label = "Loading",
        showLabel = false,
        decorative = false,
        class: className,
        ...restProps
    }: Props = $props();

    const SIZES = { xs: "spinner-xs", sm: "spinner-sm", md: "spinner-md", lg: "spinner-lg", xl: "spinner-xl" } as const;

    /** Every mark paints in `currentColor`, so `current` takes the surrounding surface's ink with no prop at all. */
    const TONES = {
        current: undefined,
        brand: "text-primary",
        muted: "text-foreground-subtle",
        success: "text-success",
        warning: "text-warning",
        destructive: "text-destructive"
    } as const;

    const MARKS = {
        ring: "spinner-ring",
        arc: "spinner-arc",
        dots: "spinner-dots",
        bars: "spinner-bars",
        pulse: "spinner-pulse",
        spokes: "spinner-spokes"
    } as const;

    /** How many children each mark draws. `ring` and `arc` are a single element. */
    const PARTS = { ring: 0, arc: 0, dots: 3, bars: 4, pulse: 2, spokes: 8 } as const;

    const sizeClass = $derived(typeof size === "number" ? undefined : SIZES[size]);

    /** Named steps rather than a px table — `theme.css` holds the five extents, and a second copy here would drift. */
    const smallLabel = $derived(typeof size === "number" ? size <= 16 : size === "xs" || size === "sm");

    /** At 0 the duration divides by zero, which is an invalid `animation` and so a spinner that silently stands still. */
    const rate = $derived(Math.max(0.1, speed));

    const parts = $derived(Array.from({ length: PARTS[variant] }, (_, index) => index));

    const style = $derived(typeof size === "number" ? `--spinner-speed: ${rate}; --spinner-size: ${size}px` : `--spinner-speed: ${rate}`);
</script>

<!--
    `role="status"` already implies `aria-live="polite"`, so the reference's explicit
    one is dropped. With `showLabel` the `aria-label` goes rather than doubling the
    string; `status` names from author only, so the text becomes the announcement
    instead of the name. `Spinner.md` has both, and the trap `decorative` closes.
-->
<span
    role={decorative ? undefined : "status"}
    aria-label={decorative || showLabel ? undefined : label}
    aria-hidden={decorative || undefined}
    {...restProps}
    {style}
    class={cn(
        "inline-flex max-w-full items-center align-middle",
        showLabel ? "min-w-0" : "shrink-0",
        sizeClass,
        TONES[tone],
        showLabel && "spinner-gap",
        className
    )}>
    <span class={cn("shrink-0", MARKS[variant])}>
        {#each parts as part (part)}
            <span></span>
        {/each}
    </span>
    {#if showLabel}
        <span class={cn("min-w-0 text-pretty text-foreground-muted", smallLabel ? "text-sm/snug" : "text-md/snug")}>{label}</span>
    {/if}
</span>
