<script lang="ts">
    import { DropdownMenu as MenuPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import { thumbStyles, trackStyles } from "../switch/Switch.svelte";
    import { cn } from "../../../utils/cn";

    type Props = Omit<MenuPrimitive.ItemProps, "children" | "child" | "textValue"> & {
        label: string;
        /** One line under the label, wired as the item's description. */
        description?: string;
        /** An icon, drawn 16px in the muted ink. */
        leadingIcon?: Snippet;
        /**
         * Binding this makes the item a `menuitemcheckbox` with a switch at its end. Toggling it
         * leaves the menu open. Without it the item is an action, and choosing it closes the menu.
         */
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
    };

    let { label, description, leadingIcon, checked = $bindable(), onCheckedChange, class: className, ...restProps }: Props = $props();

    const uid = $props.id();
    const labelId = `${uid}-label`;
    const descriptionId = `${uid}-description`;

    // The name is pinned to the label line, or the description would be read twice: once in the name, once as itself.
    const textProps = $derived({
        "aria-labelledby": labelId,
        "aria-describedby": description ? descriptionId : undefined
    });

    // `accent-foreground` on the highlight: `foreground` on the dark `accent` fill reads poorly, as Select found.
    const itemStyles = $derived(
        cn(
            "group relative flex min-h-9 cursor-pointer gap-2.5 rounded-md px-2.25 text-md/snug text-foreground outline-hidden transition-colors duration-150 ease-out select-none pointer-coarse:min-h-11",
            "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50",
            description ? "items-start py-2" : "items-center",
            className
        )
    );
</script>

{#snippet body(state?: "checked" | "unchecked")}
    {#if leadingIcon}
        <span
            aria-hidden="true"
            class={cn(
                "flex size-4 shrink-0 items-center justify-center text-foreground-muted *:size-4 group-data-highlighted:text-accent-foreground",
                description && "mt-px"
            )}>
            {@render leadingIcon()}
        </span>
    {/if}
    <span class="flex min-w-0 flex-1 flex-col gap-px">
        <span id={labelId}>{label}</span>
        {#if description}
            <span id={descriptionId} class="text-xs/snug text-foreground-muted">{description}</span>
        {/if}
    </span>
    {#if state}
        <!-- A picture of a switch, not a control: the row is the menuitemcheckbox. -->
        <span aria-hidden="true" class={cn(trackStyles, description && "mt-px")} data-state={state}>
            <span class={thumbStyles} data-state={state}></span>
        </span>
    {/if}
{/snippet}

{#if checked === undefined}
    <MenuPrimitive.Item {...restProps} {...textProps} class={itemStyles}>
        {@render body()}
    </MenuPrimitive.Item>
{:else}
    <MenuPrimitive.CheckboxItem closeOnSelect={false} {...restProps} {...textProps} class={itemStyles} {onCheckedChange} bind:checked>
        {#snippet children({ checked: isChecked })}
            {@render body(isChecked ? "checked" : "unchecked")}
        {/snippet}
    </MenuPrimitive.CheckboxItem>
{/if}
