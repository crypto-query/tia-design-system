<script lang="ts">
    import { DropdownMenu as MenuPrimitive } from "bits-ui";
    import { cn } from "../../../utils/cn";

    let { class: className, ...restProps }: Omit<MenuPrimitive.SeparatorProps, "children" | "child"> = $props();
</script>

<!-- Edge to edge: the negative margin cancels the panel's padding. -->
<MenuPrimitive.Separator {...restProps} class={cn("-mx-1.25 my-1.25 h-px shrink-0 bg-border-muted", className)} />
