<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Popover from "./Popover.svelte";

    // The trigger and body have to be written in a parent: `createRawSnippet` renders a string
    // of HTML, with no element to spread the primitive's props onto.
    type Props = Omit<ComponentProps<typeof Popover>, "trigger" | "children">;

    let { open = $bindable(false), ...restProps }: Props = $props();
</script>

<p>Page text outside the panel.</p>
<input aria-label="Search" />

<Popover bind:open {...restProps}>
    {#snippet trigger({ props })}
        <button {...props}>Years</button>
    {/snippet}
    <button type="button">2024</button>
</Popover>

<output data-testid="open">{open}</output>
