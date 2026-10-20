<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Switch from "./Switch.svelte";

    // A parent that binds and prints what it holds: the only way a test reads a `$bindable` back.
    let { checked = $bindable(false), ...restProps }: ComponentProps<typeof Switch> = $props();
</script>

<Switch {...restProps} bind:checked />
<p data-testid="bound">checked={checked}</p>
