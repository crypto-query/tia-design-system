<script lang="ts">
    import { Button as ButtonPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import { cn } from "../../../utils/cn";

    type Variant = "default" | "accent" | "destructive" | "outline" | "ghost" | "success" | "link";
    type Size = "sm" | "md" | "lg" | "xl" | "icon";

    type Props = ButtonPrimitive.RootProps & {
        variant?: Variant;
        size?: Size;
        leadingIcon?: Snippet;
        trailingIcon?: Snippet;
    };

    let {
        variant = "default",
        size = "md",
        class: className,
        children,
        leadingIcon,
        trailingIcon,
        disabled = false,
        ...restProps
    }: Props = $props();

    // No focus style here on purpose: the base layer's `:focus-visible` outline is this same ring,
    // and its gap is transparent, so it is right on a card, inside a field and on the page alike.
    // A `ring-*` cannot be — it is a box-shadow whose gap must be painted some one opaque colour.
    const baseStyles =
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-semibold whitespace-nowrap button-motion disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:shadow-none";

    const variantStyles: Record<Variant, string> = {
        default:
            "bg-primary text-primary-foreground shadow-btn-default hover:shadow-btn-default-hover active:bg-primary-hover active:shadow-btn-default",
        accent: "bg-secondary text-secondary-foreground shadow-btn-accent hover:bg-secondary-hover hover:shadow-btn-accent-hover active:bg-secondary-hover active:shadow-btn-accent",
        destructive:
            "bg-destructive text-destructive-foreground shadow-btn-destructive hover:bg-destructive-hover hover:shadow-btn-destructive-hover active:bg-destructive-hover active:shadow-btn-destructive",
        outline:
            "border-border-input bg-surface text-foreground hover:border-primary hover:text-primary hover:shadow-subtle active:border-primary active:bg-accent active:text-primary active:shadow-none",
        ghost: "text-foreground-muted hover:bg-accent hover:text-foreground active:bg-active-overlay active:text-foreground",
        success: "border-success/35 bg-success-light text-success-strong hover:border-success active:border-success",
        link: "text-primary underline-offset-4 hover:underline active:text-primary-hover active:underline"
    };

    const sizeStyles: Record<Size, string> = {
        sm: "h-9 px-4 text-sm",
        md: "h-10 px-5.5 text-md",
        lg: "h-11 px-7 text-lg",
        xl: "h-13 px-8 text-base",
        icon: "h-10 w-10"
    };

    const linkStyles = "h-auto w-auto rounded-sm p-0";
    const liftStyles = "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-98";

    const isLink = $derived(variant === "link");
    const lifts = $derived(!isLink && variant !== "ghost" && variant !== "success");

    const classes = $derived(
        cn(baseStyles, variantStyles[variant], sizeStyles[size], isLink && linkStyles, lifts && liftStyles, className)
    );
</script>

<ButtonPrimitive.Root class={classes} {disabled} {...restProps}>
    {@render leadingIcon?.()}
    {@render children?.()}
    {@render trailingIcon?.()}
</ButtonPrimitive.Root>
