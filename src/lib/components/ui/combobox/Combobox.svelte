<script lang="ts" module>
    export type ComboboxItem = {
        value: string;
        label: string;
        /** Rows sharing a name sit under one heading. Omit for rows with no heading. */
        group?: string;
        disabled?: boolean;
    };
</script>

<script lang="ts">
    import { Command, Label, Popover, type PortalProps } from "bits-ui";
    import { Check, ChevronDown, Search } from "lucide-svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";
    import { fuzzyMatch } from "./fuzzy-match";

    type ComboboxSize = "sm" | "md" | "lg";

    type Props = Omit<HTMLButtonAttributes, "value" | "disabled" | "class" | "children"> & {
        items: ComboboxItem[];
        /** The chosen value; `""` means nothing is chosen. */
        value?: string;
        open?: boolean;
        /** Visible label above the trigger. Without it, pass `aria-label`. */
        label?: string;
        /** @default "Select…" */
        placeholder?: string;
        /** Placeholder and accessible name of the search box. @default "Search…" */
        searchPlaceholder?: string;
        /** Shown when the query matches nothing. @default "No results." */
        emptyMessage?: string;
        /** @default "md" */
        size?: ComboboxSize;
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
        searchPlaceholder = "Search…",
        emptyMessage = "No results.",
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
    const labelId = `${uid}-label`;
    const listId = `${uid}-list`;

    // Fields are 34 | 40 | 46px and rows 32 | 36 | 42px. `pointer-coarse` lifts both
    // to the 44px touch floor without moving what a mouse sees.
    const sizes: Record<
        ComboboxSize,
        { field: string; row: string; headingPad: string; search: string; searchText: string; searchIcon: string }
    > = {
        sm: {
            field: "h-8.5 gap-1.5 px-2.5 text-sm/snug pointer-coarse:h-11",
            row: "min-h-8 gap-2 px-2 text-sm/snug pointer-coarse:min-h-11",
            headingPad: "px-2",
            search: "gap-1.5 px-2.5 py-2",
            searchText: "text-sm/snug",
            searchIcon: "size-3.5"
        },
        md: {
            field: "h-10 gap-2 px-3 text-md/snug pointer-coarse:h-11",
            row: "min-h-9 gap-2.5 px-2.25 text-md/snug pointer-coarse:min-h-11",
            headingPad: "px-2.25",
            search: "gap-2 px-2.75 py-2.25",
            searchText: "text-md/snug",
            searchIcon: "size-4"
        },
        lg: {
            field: "h-11.5 gap-2.5 px-3.5 text-md/snug",
            row: "min-h-10.5 gap-3 px-2.75 text-md/snug pointer-coarse:min-h-11",
            headingPad: "px-2.75",
            search: "gap-2.5 px-3 py-2.5",
            searchText: "text-md/snug",
            searchIcon: "size-4.5"
        }
    };

    const spec = $derived(sizes[size]);

    const selectedLabel = $derived(items.find((item) => item.value === value)?.label ?? "");

    // Bucketed by name, not by position: two rows sharing a `group` land under one
    // heading even when a third sits between them.
    const buckets = $derived.by(() => {
        const built: { key: string; heading?: string; rows: ComboboxItem[] }[] = [];

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

    // Binary rather than graded: a graded score lets `Command` re-sort the rows under
    // the cursor, where the declared order is the one a reader scanned.
    function score(commandValue: string, search: string): number {
        const haystack = items.find((item) => item.value === commandValue)?.label ?? commandValue;

        return fuzzyMatch(haystack, search) ? 1 : 0;
    }

    function choose(next: string): void {
        value = next;
        onValueChange?.(next);
        open = false;
    }

    // The popover trigger opens only on Enter and Space; the select-only pattern opens on the arrows too.
    // Bound as a capture handler: a plain `onkeydown` after the spread would replace the popover's own.
    function openOnArrow(event: KeyboardEvent): void {
        if (open || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;

        event.preventDefault();
        open = true;
        onOpenChange?.(true);
    }

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
        "z-50 flex w-(--bits-popover-anchor-width) max-w-(--bits-popover-content-available-width) max-h-(--bits-popover-content-available-height) flex-col overflow-hidden rounded-lg border border-border-muted bg-surface shadow-medium outline-hidden";

    // `data-selected` is the highlighted row in `Command`, not the chosen one; the check marks that.
    // `accent-foreground`: `primary` text on the dark `accent` fill reads under 3:1.
    const rowClass = $derived(
        cn(
            "group relative flex cursor-pointer items-center rounded-md outline-hidden transition-colors duration-150 ease-out select-none",
            "text-foreground data-selected:bg-accent data-selected:text-accent-foreground",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50",
            spec.row
        )
    );

    const headingClass = $derived(
        cn("mt-1.75 mb-0.5 font-bold tracking-widest text-foreground-subtle uppercase", "text-2xs/normal", spec.headingPad)
    );
</script>

<div class="flex flex-col gap-1.5">
    {#if label}
        <Label.Root class="text-sm font-medium text-foreground" for={triggerId} id={labelId}>{label}</Label.Root>
    {/if}

    <!-- `Popover` over `Command`, not the combobox primitive: its input positions the
         panel against itself, and here the input sits inside the panel. -->
    <Popover.Root bind:open {onOpenChange}>
        <Popover.Trigger {...restProps} {disabled}>
            {#snippet child({ props })}
                <!-- Attributes after the spread win over the popover's own `aria-haspopup="dialog"`.
                     `role="combobox"` takes no name from content, hence `aria-labelledby`. -->
                <button
                    {...props}
                    aria-controls={open ? listId : undefined}
                    aria-haspopup="listbox"
                    aria-labelledby={label ? labelId : undefined}
                    class={fieldClass}
                    id={triggerId}
                    onkeydowncapture={openOnArrow}
                    role="combobox"
                    type="button">
                    <span class={cn("min-w-0 flex-1 truncate text-left", selectedLabel ? "text-foreground" : "text-foreground-subtle")}>
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronDown aria-hidden="true" class={chevronClass} />
                </button>
            {/snippet}
        </Popover.Trigger>
        <Popover.Portal to={portalTarget}>
            <Popover.Content align="start" class={panelClass} collisionPadding={12} sideOffset={6}>
                <!-- `label` names the search box: `Command` points the input's `aria-labelledby` at it.
                     `value` is `Command`'s highlighted row, seeded with the choice; it writes back only locally. -->
                <Command.Root class="flex min-h-0 flex-col" filter={score} label={searchPlaceholder} loop {value}>
                    <div class={cn("flex shrink-0 items-center border-b border-border-muted", spec.search)}>
                        <Search aria-hidden="true" class={cn("shrink-0 text-foreground-subtle", spec.searchIcon)} />
                        <!-- Keeps the base layer's outline: focus lands here when the panel opens. -->
                        <Command.Input
                            class={cn(
                                "min-w-0 flex-1 border-0 bg-transparent p-0 text-foreground placeholder:text-foreground-subtle focus:ring-0",
                                spec.searchText
                            )}
                            placeholder={searchPlaceholder} />
                    </div>
                    <Command.List class="min-h-0 flex-1 overflow-hidden" id={listId}>
                        <Command.Viewport class="max-h-72 overflow-y-auto p-1.25">
                            <!-- Announced: a panel that shrinks to nothing reads as the list being gone. -->
                            <Command.Empty class="px-3 py-5.5 text-center text-sm/normal text-foreground-subtle" role="status">
                                {emptyMessage}
                            </Command.Empty>
                            <!-- Every bucket is a group, headed or not: `Command` sorts grouped rows
                                 below ungrouped ones while filtering, which would lose the declared order. -->
                            {#each buckets as bucket (bucket.key)}
                                <Command.Group value={bucket.key}>
                                    {#if bucket.heading}
                                        <Command.GroupHeading class={headingClass}>{bucket.heading}</Command.GroupHeading>
                                    {/if}
                                    <Command.GroupItems>
                                        {#each bucket.rows as item (item.value)}
                                            <Command.Item
                                                class={rowClass}
                                                disabled={item.disabled}
                                                onSelect={() => choose(item.value)}
                                                value={item.value}>
                                                <span class={cn("min-w-0 flex-1 truncate", item.value === value && "font-semibold")}>
                                                    {item.label}
                                                </span>
                                                <!-- Always rendered, so the text does not shift when the row is chosen. -->
                                                <Check
                                                    aria-hidden="true"
                                                    class={cn(
                                                        "size-3.75 shrink-0 text-primary group-data-selected:text-accent-foreground",
                                                        item.value === value ? "opacity-100" : "opacity-0"
                                                    )} />
                                            </Command.Item>
                                        {/each}
                                    </Command.GroupItems>
                                </Command.Group>
                            {/each}
                        </Command.Viewport>
                    </Command.List>
                </Command.Root>
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>
</div>
