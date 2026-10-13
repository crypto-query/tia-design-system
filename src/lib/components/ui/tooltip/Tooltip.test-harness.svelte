<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Tooltip from "./Tooltip.svelte";

    // The trigger has to be written in a parent: `createRawSnippet` renders a string of
    // HTML, with no element to spread the primitive's props onto.
    type Props = Omit<ComponentProps<typeof Tooltip>, "trigger">;

    let { ...restProps }: Props = $props();
</script>

<Tooltip {...restProps}>
    {#snippet trigger({ props })}
        <button {...props}>Copy webhook URL</button>
    {/snippet}
</Tooltip>
