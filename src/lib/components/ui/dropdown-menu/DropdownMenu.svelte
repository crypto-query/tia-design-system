<script lang="ts">
    import { type BitsPrimitiveDivAttributes, DropdownMenu as MenuPrimitive, type PortalProps } from "bits-ui";
    import type { Snippet } from "svelte";
    import { cn } from "../../../utils/cn";

    // The primitive's div attributes, as Popover takes them. They reach the menu panel, so a
    // call site names the menu here with `aria-label`.
    type Props = Omit<BitsPrimitiveDivAttributes, "dir" | "children"> & {
        /**
         * The control that opens the menu. It receives the primitive's props — the click and key
         * handlers, `aria-haspopup`, `aria-expanded`, `aria-controls` and the ref — to spread onto its own element.
         */
        trigger: Snippet<[{ props: Record<string, unknown> }]>;
        /** `DropdownMenuGroup`, `DropdownMenuItem` and `DropdownMenuSeparator` parts. */
        children: Snippet;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        /** Preferred side. The primitive flips it when there is no room. @default "bottom" */
        side?: "top" | "right" | "bottom" | "left";
        /** @default "end" */
        align?: "start" | "center" | "end";
        /** Gap between trigger and panel, px. @default 6 */
        offset?: number;
        /** Element or selector the panel mounts in, so it keeps a scoped root's styles. @default document.body */
        portalTarget?: PortalProps["to"];
    };

    let {
        trigger,
        children,
        open = $bindable(false),
        onOpenChange,
        side = "bottom",
        align = "end",
        offset = 6,
        portalTarget,
        class: className,
        ...restProps
    }: Props = $props();

    // `max-w-*` / `max-h-*` cap the panel at the room floating-ui reports, so it never runs off a narrow viewport.
    const panelStyles =
        "z-50 flex max-h-(--bits-menu-content-available-height) w-75 max-w-(--bits-menu-content-available-width) origin-(--bits-menu-content-transform-origin) flex-col overflow-y-auto rounded-lg border border-border-muted bg-surface p-1.25 text-foreground shadow-medium outline-hidden animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:fill-mode-forwards motion-reduce:animate-none";
</script>

<MenuPrimitive.Root {onOpenChange} bind:open>
    <MenuPrimitive.Trigger child={trigger} />
    <MenuPrimitive.Portal to={portalTarget}>
        <!-- `preventScroll` off: the lock pads and freezes the page, which shifts a WordPress page under the menu. -->
        <MenuPrimitive.Content
            {...restProps}
            {align}
            class={cn(panelStyles, className)}
            collisionPadding={8}
            preventScroll={false}
            {side}
            sideOffset={offset}>
            {@render children()}
        </MenuPrimitive.Content>
    </MenuPrimitive.Portal>
</MenuPrimitive.Root>
