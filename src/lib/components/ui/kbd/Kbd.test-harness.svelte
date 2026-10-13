<script lang="ts">
    import Kbd from "./Kbd.svelte";
</script>

<!-- Two rows of the same type, one of them carrying a chip: the chip must not be what
     sets the row's height. A `.test.ts` cannot declare the snippet `children` needs, so
     the call sites live here. -->
<div class="text-sm" data-testid="bare">Save changes</div>
<div class="text-sm" data-testid="chipped">Save changes <Kbd>S</Kbd></div>
<Kbd class="rounded-full" data-testid="escaped">esc</Kbd>
