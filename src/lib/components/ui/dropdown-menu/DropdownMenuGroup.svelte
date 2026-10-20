<script lang="ts">
    import { DropdownMenu as MenuPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import { cn } from "../../../utils/cn";

    type Props = Omit<MenuPrimitive.GroupProps, "children" | "child"> & {
        /** Small uppercase heading; it also names the group. */
        heading?: string;
        children: Snippet;
    };

    let { heading, children, class: className, ...restProps }: Props = $props();
</script>

<MenuPrimitive.Group {...restProps} class={cn("flex flex-col", className)}>
    {#if heading}
        <MenuPrimitive.GroupHeading
            class="mt-1.75 mb-0.5 px-2.25 text-2xs/normal font-bold tracking-widest text-foreground-subtle uppercase first:mt-0.5">
            {heading}
        </MenuPrimitive.GroupHeading>
    {/if}
    {@render children()}
</MenuPrimitive.Group>
