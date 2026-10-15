<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Toggle from "./Toggle.svelte";
    import ToggleGroup from "./ToggleGroup.svelte";

    // A harness rather than a getter/setter pair because bits-ui round-trips the value:
    // what needs asserting is that the *primitive's* write reaches the parent in this
    // component's vocabulary (an array under `multiple`, `null` under `single`) rather than
    // in the primitive's own (`""` for nothing selected). `type` is a discriminant, so the
    // two spellings cannot be handed to one element — the harness branches, as a call site does.
    type Props = Omit<ComponentProps<typeof ToggleGroup>, "children" | "onValueChange" | "value"> & {
        value?: string[] | string | null;
        firstItem?: Pick<ComponentProps<typeof Toggle>, "variant" | "size" | "disabled" | "class">;
        showLast?: boolean;
        /** Focusable buttons before and after the group, so a Tab enters and leaves it from a known place. */
        fenced?: boolean;
        /** Widened over both branches; each accepts it, since a callback may take more. */
        onValueChange?: (value: string[] | string | null) => void;
    };

    let { value = $bindable(), type = "multiple", firstItem, showLast = true, fenced = false, ...restProps }: Props = $props();

    const asMultiple = $derived(Array.isArray(value) ? value : []);
    const asSingle = $derived(typeof value === "string" ? value : null);
    const printed = $derived(Array.isArray(value) ? `[${value.join(",")}]` : String(value));
</script>

{#snippet items()}
    <Toggle {...firstItem} value="bold">Bold</Toggle>
    <Toggle value="italic">Italic</Toggle>
    {#if showLast}<Toggle value="underline">Underline</Toggle>{/if}
{/snippet}

{#if fenced}<button type="button">Before</button>{/if}
{#if type === "single"}
    <ToggleGroup {...restProps} type="single" bind:value={() => asSingle, (next) => (value = next)}>
        {@render items()}
    </ToggleGroup>
{:else}
    <ToggleGroup {...restProps} type="multiple" bind:value={() => asMultiple, (next) => (value = next)}>
        {@render items()}
    </ToggleGroup>
{/if}
{#if fenced}<button type="button">After</button>{/if}
<p data-testid="bound">{printed}</p>
