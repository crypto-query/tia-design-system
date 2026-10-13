<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Toggle from "./Toggle.svelte";

    // Test fixture: a parent that binds and prints what it holds, which is the only way a
    // test can read a `$bindable` back out.
    let { pressed = $bindable(false), ...restProps }: ComponentProps<typeof Toggle> = $props();
</script>

<Toggle {...restProps} bind:pressed />
<p data-testid="bound">pressed={pressed}</p>
