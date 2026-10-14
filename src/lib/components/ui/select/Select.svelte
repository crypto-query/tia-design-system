<script lang="ts" module>
    export type SelectItem = {
        value: string;
        label: string;
        /** Rows sharing a name sit under one heading. Omit for rows with no heading. */
        group?: string;
        disabled?: boolean;
    };
</script>

<script lang="ts">
    import { Label, type PortalProps, Select } from "bits-ui";
    import { Check, ChevronDown } from "lucide-svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";

    type SelectSize = "sm" | "md" | "lg";

    type Props = Omit<HTMLButtonAttributes, "value" | "disabled" | "class" | "children"> & {
        items: SelectItem[];
        /** The chosen value; `""` means nothing is chosen. */
        value?: string;
        open?: boolean;
        /** Visible label above the trigger. Without it, pass `aria-label`. */
        label?: string;
        /** @default "Select…" */
        placeholder?: string;
        /** @default "md" */
        size?: SelectSize;
        disabled?: boolean;
        /** Element or selector the panel mounts in, so it keeps a scoped root's styles. @default document.body */
        portalTarget?: PortalProps["to"];
        onValueChange?: (value: string) => void;
        onOpenChange?: (open: boolean) => void;
        /** Lands on the bordered trigger, for width and shape; it is `w-full` by default. */
        class?: string;
    };

    let {
        items,
        value = $bindable(""),
        open = $bindable(false),
        label,
        placeholder = "Select…",
        size = "md",
        disabled = false,
        portalTarget,
        onValueChange,
        onOpenChange,
        id,
        class: className,
        ...restProps
    }: Props = $props();

    const uid = $props.id();
    const triggerId = $derived(id ?? `${uid}-trigger`);

    // Fields are 34 | 40 | 46px and rows 32 | 36 | 42px. `pointer-coarse` lifts both
    // to the 44px touch floor without moving what a mouse sees.
    const sizes: Record<SelectSize, { field: string; row: string; headingPad: string }> = {
        sm: {
            field: "h-8.5 gap-1.5 px-2.5 text-sm/snug pointer-coarse:h-11",
            row: "min-h-8 gap-2 px-2 text-sm/snug pointer-coarse:min-h-11",
            headingPad: "px-2"
        },
        md: {
            field: "h-10 gap-2 px-3 text-md/snug pointer-coarse:h-11",
            row: "min-h-9 gap-2.5 px-2.25 text-md/snug pointer-coarse:min-h-11",
            headingPad: "px-2.25"
        },
        lg: {
            field: "h-11.5 gap-2.5 px-3.5 text-md/snug",
            row: "min-h-10.5 gap-3 px-2.75 text-md/snug pointer-coarse:min-h-11",
            headingPad: "px-2.75"
        }
    };

    const spec = $derived(sizes[size]);

    const selectedLabel = $derived(items.find((item) => item.value === value)?.label ?? "");

    // Bucketed by name, not by position: two rows sharing a `group` land under one
    // heading even when a third sits between them.
    const buckets = $derived.by(() => {
        const built: { key: string; heading?: string; rows: SelectItem[] }[] = [];

        for (const item of items) {
            const heading = item.group || undefined;
            let bucket = built.find((candidate) => candidate.heading === heading);

            if (!bucket) {
                bucket = { key: `bucket-${built.length}`, heading, rows: [] };
                built.push(bucket);
            }

            bucket.rows.push(item);
        }

        return built;
    });

    const fieldClass = $derived(
        cn(
            "rounded-md border bg-background-alt text-foreground transition-colors duration-150 ease-out-soft",
            // An outline rather than a `ring-*`: only an outline's offset band is transparent.
            // `focus:ring-0` drops the ring `@tailwindcss/forms` puts on plain `:focus`.
            "focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-50",
            "flex w-full cursor-pointer items-center",
            spec.field,
            // `--border-input-hover`, not `--border-emphasis`: on the navy canvas emphasis is
            // fainter than the resting input border, so hovering would fade the field.
            "border-border-input hover:border-border-input-hover focus-visible:border-border-focus focus-visible:outline-border-focus",
            open && "border-border-focus",
            className
        )
    );

    const chevronClass = $derived(
        cn("pointer-events-none size-3.5 shrink-0 text-foreground-subtle transition-transform duration-200 ease-out", open && "rotate-180")
    );

    // `max-w-*` caps the panel at the room floating-ui reports, so a trigger wider than
    // the viewport's free span cannot push the panel off screen. `z-50` is enough: the
    // panel is portalled to the end of its target.
    const panelClass =
        "z-50 flex w-(--bits-select-anchor-width) max-w-(--bits-select-content-available-width) max-h-(--bits-select-content-available-height) flex-col overflow-hidden rounded-lg border border-border-muted bg-surface shadow-medium outline-hidden";

    const rowClass = $derived(
        cn(
            "group relative flex cursor-pointer items-center rounded-md outline-hidden transition-colors duration-150 ease-out select-none",
            // Only the highlight fills: `data-selected` here is the chosen row, which the check marks.
            // `accent-foreground`: `primary` text on the dark `accent` fill reads under 3:1.
            "text-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50",
            spec.row
        )
    );

    const headingClass = $derived(
        cn("mt-1.75 mb-0.5 font-bold tracking-widest text-foreground-subtle uppercase", "text-2xs/normal", spec.headingPad)
    );
</script>

{#snippet rows(list: SelectItem[])}
    {#each list as item (item.value)}
        <!-- bits-ui marks a disabled option only with `data-disabled`, which no reader announces. -->
        <Select.Item
            class={rowClass}
            aria-disabled={item.disabled ? "true" : undefined}
            disabled={item.disabled}
            label={item.label}
            value={item.value}>
            {#snippet children({ selected })}
                <span class={cn("min-w-0 flex-1 truncate", selected && "font-semibold")}>{item.label}</span>
                <!-- Always rendered rather than toggled, so the row's text does not shift
                     sideways the moment it becomes the chosen one. -->
                <Check
                    aria-hidden="true"
                    class={cn(
                        "size-3.75 shrink-0 text-primary group-data-highlighted:text-accent-foreground",
                        selected ? "opacity-100" : "opacity-0"
                    )} />
            {/snippet}
        </Select.Item>
    {/each}
{/snippet}

<div class="flex flex-col gap-1.5">
    {#if label}
        <Label.Root class="text-sm font-medium text-foreground" for={triggerId}>{label}</Label.Root>
    {/if}

    <Select.Root type="single" bind:value bind:open {disabled} {items} {onOpenChange} {onValueChange}>
        <!-- bits-ui gives the trigger `aria-haspopup="listbox"` but no role; the combobox role
             is what the ARIA select-only pattern names it. -->
        <Select.Trigger {...restProps} class={fieldClass} id={triggerId} role="combobox">
            <span class={cn("min-w-0 flex-1 truncate text-left", selectedLabel ? "text-foreground" : "text-foreground-subtle")}>
                {selectedLabel || placeholder}
            </span>
            <ChevronDown aria-hidden="true" class={chevronClass} />
        </Select.Trigger>
        <Select.Portal to={portalTarget}>
            <Select.Content class={panelClass} collisionPadding={12} sideOffset={6}>
                <Select.Viewport class="max-h-72 min-h-0 overflow-y-auto p-1.25">
                    {#each buckets as bucket (bucket.key)}
                        {#if bucket.heading}
                            <Select.Group>
                                <Select.GroupHeading class={headingClass}>{bucket.heading}</Select.GroupHeading>
                                {@render rows(bucket.rows)}
                            </Select.Group>
                        {:else}
                            {@render rows(bucket.rows)}
                        {/if}
                    {/each}
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>
</div>
