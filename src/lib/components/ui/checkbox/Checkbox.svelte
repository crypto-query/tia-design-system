<script lang="ts">
    import { Checkbox as CheckboxPrimitive } from "bits-ui";
    import { LockKeyhole } from "lucide-svelte";
    import type { Snippet } from "svelte";
    import { cn } from "../../../utils/cn";

    type Size = "sm" | "md" | "lg";

    type Props = Omit<CheckboxPrimitive.RootProps, "children" | "child"> & {
        size?: Size;
        variant?: "default" | "card";
        /** Marks a disabled card as owned, rather than temporarily unavailable. */
        locked?: boolean;
        /** Names the box for assistive technology, and toggles it when clicked. */
        label?: string;
        /** A second line under the label — announced as the description, and clickable too. */
        description?: string;
        /** Card-only trailing content, such as a price or status. */
        trailing?: Snippet;
        /** Red box and label, for a tick the form is still waiting on. */
        error?: boolean;
    };

    let {
        checked = $bindable(false),
        indeterminate = $bindable(false),
        size = "md",
        variant = "default",
        locked = false,
        label,
        description,
        trailing,
        error = false,
        disabled = false,
        class: className,
        id,
        "aria-describedby": describedBy,
        "aria-labelledby": labelledBy,
        "aria-invalid": ariaInvalid,
        ...restProps
    }: Props = $props();

    const uid = $props.id();
    const boxId = $derived(id ?? `${uid}-checkbox`);
    const labelId = `${uid}-label`;
    const descriptionId = `${uid}-description`;

    const hasText = $derived(Boolean(label || description));

    const descriptions = $derived([describedBy, description ? descriptionId : undefined].filter(Boolean).join(" "));

    const active = $derived(checked || indeterminate);

    // One red in both themes: `--destructive` is the step neither block lifts, where
    // the `*-strong` this took before is a salmon on the navy canvas. The mark is set
    // once for both fills — `--primary-foreground` is white either way, while
    // `--surface` goes navy in dark and vanishes on the red.
    const fillStyles = $derived(
        cn(
            "text-primary-foreground",
            error
                ? cn("border-destructive", active ? "bg-destructive text-destructive-foreground" : "bg-surface")
                : active
                  ? "border-primary bg-primary"
                  : "border-border-input bg-surface"
        )
    );

    // The leading rides on the font size as `text-*/snug` rather than a separate
    // `leading-snug`: the pair form autofixes to `text-md/snug` whatever size it
    // started from, because the rule resolves `text-sm` against Tailwind's stock
    // 14px while `:root` shadows it to 13px.
    //
    // The mark is sized absolutely, never as a percentage of the box: `border-2`
    // takes 4px off the content box a percentage resolves against, which drew every
    // check a whole step small while a test pinning only the box stayed green.
    const sizeStyles: Record<Size, { box: string; mark: string; dash: string; stroke: number; gap: string; label: string }> = {
        sm: { box: "size-4 rounded-sm", mark: "size-3.25", dash: "w-1.75", stroke: 2.75, gap: "gap-2", label: "text-sm/snug" },
        md: { box: "size-5 rounded-sm", mark: "size-4", dash: "w-2.25", stroke: 3, gap: "gap-2.5", label: "text-md/snug" },
        lg: { box: "size-6 rounded-md", mark: "size-4.75", dash: "w-2.75", stroke: 3.25, gap: "gap-3", label: "text-base/snug" }
    };

    const baseStyles =
        "grid shrink-0 cursor-pointer place-items-center border-2 transition-all duration-150 ease-out-soft disabled:cursor-not-allowed disabled:opacity-50";

    const boxStyles = $derived(
        cn(
            baseStyles,
            sizeStyles[size].box,
            fillStyles,
            description && "mt-px",
            variant === "card" && "transition-none",
            !hasText && className
        )
    );
</script>

{#snippet box()}
    <CheckboxPrimitive.Root
        {...restProps}
        id={boxId}
        {disabled}
        aria-describedby={descriptions || undefined}
        aria-invalid={error ? "true" : ariaInvalid}
        aria-labelledby={label ? labelId : labelledBy}
        class={boxStyles}
        bind:checked
        bind:indeterminate>
        {#snippet children({ checked: isChecked, indeterminate: isMixed })}
            {#if isMixed}
                <!-- The dash's width steps with the box; its height does not — the
                     reference's 2.25｜2.5｜2.75px all snap to the same 2px step. -->
                <span aria-hidden="true" class={cn("h-0.5 rounded-full bg-current", sizeStyles[size].dash)}></span>
            {:else if isChecked}
                <svg aria-hidden="true" class={sizeStyles[size].mark} fill="none" viewBox="0 0 24 24">
                    <path
                        d="M5 12.5l4 4L19 7"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width={sizeStyles[size].stroke}
                        stroke-dasharray="24"
                        stroke-dashoffset="0" />
                </svg>
            {/if}
        {/snippet}
    </CheckboxPrimitive.Root>
{/snippet}

{#if hasText}
    <!-- The box is a <button role="checkbox">, which is labelable — so `for` both
         forwards a click on this whole block and would name the control from all of
         it. The name is pinned to the label line instead, leaving the description a
         description rather than part of what the box is called. -->
    <label
        for={boxId}
        data-variant={variant}
        data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
        data-locked={disabled && locked ? "" : undefined}
        class={cn(
            "inline-flex",
            description ? "items-start" : "items-center",
            sizeStyles[size].gap,
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            variant === "card" && "min-h-11 w-full rounded-md border border-border-input bg-surface p-3",
            variant === "card" && disabled && locked && "border-border-muted bg-background-subtle",
            className
        )}>
        {@render box()}
        <span class={cn("flex min-w-0 flex-col gap-0.5", variant === "card" && "grow", disabled && "opacity-60")}>
            {#if label}
                <span id={labelId} class={cn("font-medium", sizeStyles[size].label, error ? "text-destructive" : "text-foreground")}>
                    {label}
                </span>
            {/if}
            {#if description}
                <span id={descriptionId} class="text-sm/snug text-foreground-muted">{description}</span>
            {/if}
        </span>
        {#if variant === "card" && trailing}
            <span class="ml-auto flex items-center self-center">{@render trailing()}</span>
        {:else if variant === "card" && disabled && locked}
            <LockKeyhole aria-hidden="true" class="ml-auto size-4 shrink-0 self-center text-foreground-subtle" />
        {/if}
    </label>
{:else}
    {@render box()}
{/if}

<style>
    @media (prefers-reduced-motion: no-preference) {
        path {
            transition: stroke-dashoffset var(--duration-300) var(--ease-out-soft);
        }

        @starting-style {
            path {
                stroke-dashoffset: 24;
            }
        }
    }

    label[data-variant="card"][data-state="checked"]:not([data-locked]) {
        background: color-mix(in srgb, var(--primary) 9%, var(--surface));
        border-color: color-mix(in srgb, var(--primary) 38%, transparent);
    }
</style>
