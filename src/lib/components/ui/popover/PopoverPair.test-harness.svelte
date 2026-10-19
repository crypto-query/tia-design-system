<script lang="ts">
    import Popover from "./Popover.svelte";

    // Two popovers sharing one `open` owner, so opening one closes the other.
    let openId = $state<"a" | "b" | null>(null);

    function change(id: "a" | "b", next: boolean) {
        if (next) openId = id;
        else if (openId === id) openId = null;
    }
</script>

{#each ["a", "b"] as const as id (id)}
    <Popover onOpenChange={(next) => change(id, next)} open={openId === id} title="Panel {id}">
        {#snippet trigger({ props })}
            <button {...props}>Open {id}</button>
        {/snippet}
        <p>Body {id}</p>
    </Popover>
{/each}
