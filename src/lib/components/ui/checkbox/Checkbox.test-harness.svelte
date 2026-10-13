<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Checkbox from "./Checkbox.svelte";

    // Test fixture: a parent that binds and prints what it holds, which is the only
    // way a test can read a `$bindable` prop back out.
    let { checked = $bindable(false), indeterminate = $bindable(false), ...restProps }: ComponentProps<typeof Checkbox> = $props();
</script>

<Checkbox {...restProps} bind:checked bind:indeterminate />
<p data-testid="bound">checked={checked} indeterminate={indeterminate}</p>
