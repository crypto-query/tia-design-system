<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Select from "./Select.svelte";

    // Test fixture: a parent that binds and prints what it holds, the only way a test
    // can read a `$bindable` that bits-ui writes back.
    let { value = $bindable(""), open = $bindable(false), ...restProps }: ComponentProps<typeof Select> = $props();
</script>

<Select {...restProps} bind:value bind:open />
<p data-testid="bound">value={value} open={open}</p>
