<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Radio from "./Radio.svelte";
    import RadioGroup from "./RadioGroup.svelte";

    // Composes real `<Radio>` children, which `createRawSnippet` cannot do, and prints
    // its bound `value` so a test can assert the primitive's write reaches the parent.
    // `restProps` is spread before `bind:` so the spread cannot clobber a bindable.
    let { value = $bindable(""), radioClass, ...restProps }: ComponentProps<typeof RadioGroup> & { radioClass?: string } = $props();
</script>

<RadioGroup {...restProps} bind:value>
    <Radio value="london" class={radioClass} description="07:00–11:00 UTC" label="London" />
    <Radio value="newyork" disabled label="New York" />
    <Radio value="both" label="Both sessions" />
</RadioGroup>
<p data-testid="bound">value={value}</p>
