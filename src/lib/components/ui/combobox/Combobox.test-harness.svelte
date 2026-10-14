<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Combobox from "./Combobox.svelte";

    // Test fixture: a parent that binds and prints what it holds, the only way a test
    // can read a `$bindable` the component writes back.
    let { value = $bindable(""), open = $bindable(false), ...restProps }: ComponentProps<typeof Combobox> = $props();
</script>

<Combobox {...restProps} bind:value bind:open />
<p data-testid="bound">value={value} open={open}</p>
