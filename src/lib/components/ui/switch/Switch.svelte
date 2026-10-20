<script module lang="ts">
    // Exported so a menu row can draw the same switch as a picture: both read `data-state`.
    export const trackStyles =
        "inline-flex h-4.5 w-7.5 shrink-0 items-center rounded-full border border-border-input bg-background-emphasis p-0.5 transition-colors duration-150 ease-out-soft data-[state=checked]:border-primary data-[state=checked]:bg-primary motion-reduce:transition-none";

    // `primary-foreground` is white in both themes; `surface` goes navy in dark and sinks into the track.
    export const thumbStyles =
        "pointer-events-none block size-3 rounded-full bg-primary-foreground shadow-subtle transition-transform duration-150 ease-out-soft data-[state=checked]:translate-x-3 motion-reduce:transition-none";
</script>

<script lang="ts">
    import { Switch as SwitchPrimitive } from "bits-ui";
    import { cn } from "../../../utils/cn";

    type Props = Omit<SwitchPrimitive.RootProps, "children" | "child"> & {
        /** Names the switch for assistive technology, and toggles it when clicked. */
        label?: string;
        /** A second line under the label — announced as the description, and clickable too. */
        description?: string;
    };

    let {
        checked = $bindable(false),
        label,
        description,
        disabled = false,
        class: className,
        id,
        "aria-describedby": describedBy,
        "aria-labelledby": labelledBy,
        ...restProps
    }: Props = $props();

    const uid = $props.id();
    const switchId = $derived(id ?? `${uid}-switch`);
    const labelId = `${uid}-label`;
    const descriptionId = `${uid}-description`;

    const hasText = $derived(Boolean(label || description));
    const descriptions = $derived([describedBy, description ? descriptionId : undefined].filter(Boolean).join(" "));
</script>

{#snippet control()}
    <SwitchPrimitive.Root
        {...restProps}
        id={switchId}
        {disabled}
        aria-describedby={descriptions || undefined}
        aria-labelledby={label ? labelId : labelledBy}
        class={cn(
            trackStyles,
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            description && "mt-px",
            !hasText && className
        )}
        bind:checked>
        <SwitchPrimitive.Thumb class={thumbStyles} />
    </SwitchPrimitive.Root>
{/snippet}

{#if hasText}
    <!-- Same naming as Checkbox: `for` forwards a click from the whole block, and the name is
         pinned to the label line so the description stays a description. -->
    <label
        for={switchId}
        class={cn(
            "inline-flex gap-2.5 pointer-coarse:min-h-11",
            description ? "items-start" : "items-center",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            className
        )}>
        {@render control()}
        <span class={cn("flex min-w-0 flex-col gap-0.5", disabled && "opacity-60")}>
            {#if label}
                <span id={labelId} class="text-md/snug font-medium text-foreground">{label}</span>
            {/if}
            {#if description}
                <span id={descriptionId} class="text-sm/snug text-foreground-muted">{description}</span>
            {/if}
        </span>
    </label>
{:else}
    {@render control()}
{/if}
