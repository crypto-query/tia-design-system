<script lang="ts">
    import { Bell, CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-svelte";
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";

    type Variant = "default" | "info" | "success" | "warning" | "destructive";

    type VariantSpec = {
        /** Tint, strong text and border for the panel. */
        classes: string;
        /** The glyph that carries the status where colour cannot. */
        glyph: typeof Info;
        /** How that glyph is announced. Omitted where there is no status to announce. */
        status?: string;
        /** Icon colour, for the one variant whose text colour is not already the accent. */
        accent?: string;
    };

    type Props = HTMLAttributes<HTMLDivElement> & {
        variant?: Variant;
        /** Bold line above the body. It also names the alert for assistive technology. */
        title?: string;
        /** Leading icon. Defaults to the variant's glyph; `false` drops it entirely. */
        icon?: Snippet | false;
        /** Draws a close button at the trailing edge. The caller removes the alert and places focus. */
        onDismiss?: () => void;
        children?: Snippet;
    };

    let { variant = "default", title, icon, onDismiss, class: className, children, ...restProps }: Props = $props();

    // The `*-light` tint and its `*-strong` text are both redefined under `.dark`,
    // so the panel flips on its own and no `dark:` class belongs here. The border's
    // base hue is theme-constant by design — it sits between the light tint and the
    // dark one, so a quarter of it reads as an edge against either.
    const variants: Record<Variant, VariantSpec> = {
        default: { classes: "border-border bg-surface text-foreground", glyph: Bell, accent: "text-primary" },
        info: { classes: "border-info/25 bg-info-light text-info-strong", glyph: Info, status: "Information" },
        success: { classes: "border-success/25 bg-success-light text-success-strong", glyph: CircleCheck, status: "Success" },
        warning: { classes: "border-warning/25 bg-warning-light text-warning-strong", glyph: TriangleAlert, status: "Warning" },
        destructive: { classes: "border-error/25 bg-error-light text-error-strong", glyph: CircleX, status: "Error" }
    };

    const baseStyles =
        "flex w-full items-start gap-3 rounded-xl border p-4 text-md leading-normal motion-safe:animate-rise motion-reduce:transition-opacity motion-reduce:duration-240 motion-reduce:ease-out-soft motion-reduce:starting:opacity-0";

    // Toaster's close button. The negative margin keeps a one-line alert at its own height.
    const closeStyles =
        "relative -my-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 after:absolute after:-inset-1.5 hover:bg-hover-overlay motion-reduce:transition-none";

    const titleId = $props.id();
    const spec = $derived(variants[variant]);
</script>

<div role="alert" aria-labelledby={title ? titleId : undefined} class={cn(baseStyles, spec.classes, className)} {...restProps}>
    {#if icon !== false}
        <span class={cn("mt-px flex shrink-0", spec.accent)}>
            {#if icon}
                {@render icon()}
            {:else if spec.status}
                <!-- The tint is invisible to a screen reader, so the glyph standing in
                     for it says the status out loud rather than hiding as decoration. -->
                <spec.glyph size={20} role="img" aria-label={spec.status} />
            {:else}
                <spec.glyph size={20} aria-hidden="true" />
            {/if}
        </span>
    {/if}
    <div class="min-w-0 flex-1">
        {#if title}
            <div id={titleId} class={cn("font-semibold", children && "mb-0.5")}>{title}</div>
        {/if}
        {@render children?.()}
    </div>
    {#if onDismiss}
        <button type="button" aria-label="Dismiss" class={closeStyles} onclick={onDismiss}>
            <X size={16} aria-hidden="true" />
        </button>
    {/if}
</div>
