<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";

    type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
        /** One key's face — `⌘`, `K`, `esc`, `↵`. */
        children: Snippet;
    };

    let { children, class: className, ...restProps }: Props = $props();
</script>

<!-- A fixed `h-4.5` with grid centring rather than padding: a chip sits inline beside body
     type, and a padded one takes its height from its own line box, so it — not the type
     next to it — ends up setting the row's height. `Kbd.md` has the measurement. -->
<kbd
    {...restProps}
    class={cn(
        "inline-grid h-4.5 min-w-4.5 place-items-center rounded-sm border border-border-muted bg-background-subtle px-1.25 align-middle font-mono text-2xs/normal font-semibold text-foreground-subtle",
        className
    )}>
    {@render children()}
</kbd>
