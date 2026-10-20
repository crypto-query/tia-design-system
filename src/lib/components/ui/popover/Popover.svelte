<script lang="ts">
    import { type BitsPrimitiveDivAttributes, Popover as PopoverPrimitive, type PortalProps } from "bits-ui";
    import { X } from "lucide-svelte";
    import { onMount, type Snippet } from "svelte";
    import { MediaQuery } from "svelte/reactivity";
    import Button from "../button/Button.svelte";
    import { cn } from "../../../utils/cn";

    // The primitive's div attributes, as Tooltip takes them; `title` is ours, a heading rather than a hover hint.
    type Props = Omit<BitsPrimitiveDivAttributes, "dir" | "children" | "title"> & {
        /**
         * The control that opens the panel. It receives the primitive's props — the click and
         * key handlers, `aria-expanded`, `aria-controls` and the ref — to spread onto its own element.
         */
        trigger: Snippet<[{ props: Record<string, unknown> }]>;
        /** The panel body. */
        children: Snippet;
        /** Heading drawn at the top of the panel; it also names the dialog. */
        title: string;
        /** Controls drawn right of the title, before the sheet's close button. */
        actions?: Snippet;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        /**
         * Draw the panel as a bottom sheet with a close button, for a narrow container. It applies
         * below a 40rem viewport only; on a wider screen the panel fits as a popover. @default false
         */
        sheet?: boolean;
        /** Preferred side in popover mode. The primitive flips it when there is no room. @default "bottom" */
        side?: "top" | "right" | "bottom" | "left";
        /** @default "start" */
        align?: "start" | "center" | "end";
        /** Gap between trigger and panel, px. @default 8 */
        offset?: number;
        /** Element or selector the panel mounts in, so it keeps a scoped root's styles. @default document.body */
        portalTarget?: PortalProps["to"];
        class?: string;
    };

    let {
        trigger,
        children,
        title,
        actions,
        open = $bindable(false),
        onOpenChange,
        sheet: sheetWanted = false,
        side = "bottom",
        align = "start",
        offset = 8,
        portalTarget,
        class: className,
        ...restProps
    }: Props = $props();

    const uid = $props.id();
    const titleId = `${uid}-title`;
    const panelId = `${uid}-panel`;

    const panelStyles =
        "flex flex-col gap-2 border border-popover-border bg-popover-background text-popover-foreground shadow-medium outline-hidden";

    const floatingStyles =
        "z-50 max-h-(--bits-popover-content-available-height) w-80 overflow-y-auto rounded-md px-4 py-3.5 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:fill-mode-forwards motion-reduce:animate-none";

    const sheetStyles =
        "fixed inset-x-0 bottom-0 z-50 max-h-dvh overflow-y-auto rounded-t-2xl border-x-0 border-b-0 px-4 pt-2 pb-5 animate-in slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:fill-mode-forwards motion-reduce:animate-none";

    // bits-ui never places a panel that is already open on the root's first render — the
    // same trap as Tooltip's, and the same fix: let the root's open transition after mount.
    let mounted = $state(false);

    const wideViewport = new MediaQuery("(min-width: 40rem)");
    const sheet = $derived(sheetWanted && !wideViewport.current);

    onMount(() => {
        mounted = true;
    });

    function handleOpenChange(next: boolean) {
        open = next;
        onOpenChange?.(next);
    }

    let triggerRef = $state<HTMLElement | null>(null);

    // The primitive refocuses whatever held focus when the panel opened, which is the wrong
    // element after a hand-off between popovers. Ours: back to the trigger, unless the reader
    // already moved focus somewhere else on purpose.
    function handleCloseAutoFocus(event: Event) {
        event.preventDefault();
        const active = document.activeElement;
        if (!active || active === document.body || document.getElementById(panelId)?.contains(active)) triggerRef?.focus();
    }
</script>

{#snippet body()}
    <div class={cn("flex items-center gap-2", sheet && "-mr-2.5")}>
        <h3 id={titleId} class={cn("font-semibold text-popover-foreground", sheet ? "text-xl" : "text-lg")}>{title}</h3>
        {#if actions || sheet}
            <div class="ml-auto flex shrink-0 items-center gap-2">
                {@render actions?.()}
                {#if sheet}
                    <PopoverPrimitive.Close>
                        {#snippet child({ props })}
                            <Button {...props} aria-label="Close" class="size-11 text-popover-foreground" size="icon" variant="ghost">
                                <X class="size-5" />
                            </Button>
                        {/snippet}
                    </PopoverPrimitive.Close>
                {/if}
            </div>
        {/if}
    </div>
    {@render children()}
{/snippet}

<PopoverPrimitive.Root onOpenChange={handleOpenChange} open={mounted && open}>
    <PopoverPrimitive.Trigger bind:ref={triggerRef} child={trigger} />

    <PopoverPrimitive.Portal to={portalTarget}>
        <!-- Mounted in both modes: the primitive unmounts the scrim only once it has a node to watch
             close, so a popover closed without one leaves an invisible scrim when it turns into a sheet. -->
        <PopoverPrimitive.Overlay
            class={sheet
                ? "fixed inset-0 z-50 bg-scrim animate-in fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:fill-mode-forwards motion-reduce:animate-none"
                : "hidden"} />
        <!-- Focus is trapped only in the sheet, which covers the page. The popover is non-modal:
             Tab or a click may leave it, and leaving closes it. The rest props reach the panel through the
             primitive's props, which chains their handlers with its own. -->
        <PopoverPrimitive.Content
            {...restProps}
            {align}
            aria-labelledby={titleId}
            collisionPadding={8}
            id={panelId}
            onCloseAutoFocus={handleCloseAutoFocus}
            onFocusOutside={(event) => {
                // A press on the trigger focuses it first; closing here would let its click open the panel again.
                if (!(event.target instanceof Node && triggerRef?.contains(event.target))) handleOpenChange(false);
            }}
            preventScroll={sheet}
            role="dialog"
            {side}
            sideOffset={offset}
            trapFocus={sheet}>
            {#snippet child({ props, wrapperProps })}
                {#if sheet}
                    <!-- No floating wrapper: without it floating-ui has nothing to place, and the
                         panel's own fixed classes pin it to the viewport's bottom edge. -->
                    <div {...props} class={cn(panelStyles, sheetStyles, className)}>
                        <div aria-hidden="true" class="mx-auto h-1 w-10 shrink-0 rounded-full bg-border"></div>
                        {@render body()}
                    </div>
                {:else}
                    <div {...wrapperProps}>
                        <div
                            {...props}
                            class={cn(panelStyles, floatingStyles, "origin-(--bits-popover-content-transform-origin)", className)}>
                            {@render body()}
                        </div>
                    </div>
                {/if}
            {/snippet}
        </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
</PopoverPrimitive.Root>
