<script lang="ts">
    import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
    import Toggle, { setToggleGroupContext, type ToggleSize, type ToggleVariant } from "./Toggle.svelte";

    // Test fixture: the smallest stand-in for issue 35's `ToggleGroup` — a bits-ui
    // `ToggleGroup.Root` with this component's presentation context set over it, which is
    // the only way to reach the `ToggleGroup.Item` half of the component until the real
    // group is built.
    type Props = {
        value?: string[];
        variant?: ToggleVariant;
        size?: ToggleSize;
        disabled?: boolean;
        /** Renders a third button with no `value`, which stays a standalone toggle. */
        withValuelessChild?: boolean;
    };

    let { value = $bindable([]), variant = "default", size = "md", disabled = false, withValuelessChild = false }: Props = $props();

    setToggleGroupContext(() => ({ variant, size, disabled, attached: false, fullWidth: false }));
</script>

<ToggleGroupPrimitive.Root type="multiple" bind:value>
    <Toggle value="bold">Bold</Toggle>
    <Toggle value="italic">Italic</Toggle>
    {#if withValuelessChild}
        <Toggle>Loose</Toggle>
    {/if}
</ToggleGroupPrimitive.Root>
<p data-testid="group-value">{value.join(",")}</p>
