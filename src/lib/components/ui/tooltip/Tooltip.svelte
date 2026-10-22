<script lang="ts">
    import { type BitsPrimitiveDivAttributes, type PortalProps, Tooltip as TooltipPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import { createAttachmentKey } from "svelte/attachments";
    import Kbd from "../kbd/Kbd.svelte";
    import { cn } from "../../../utils/cn";

    type TooltipSize = "sm" | "md";

    // The primitive's div attributes rather than the platform's: bits-ui rejects the
    // `null` Svelte's `HTMLAttributes` admits on `id`, and `dir` goes with it.
    type Props = Omit<BitsPrimitiveDivAttributes, "dir" | "children"> & {
        /**
         * The control the hint belongs to. It receives the primitive's props — the hover,
         * focus and blur handlers, the id `aria-describedby` points back at, and the ref
         * the panel positions against — to spread onto its own element.
         */
        trigger: Snippet<[{ props: Record<string, unknown> }]>;
        /** The hint. One line or two, and never a control — see `Tooltip.md`. */
        content: string;
        /** Keyboard hint drawn as `<kbd>` chips after the text, e.g. `["⌘", "C"]`. */
        shortcut?: string | string[];
        /** Preferred side. The primitive flips it when there is no room. @default "top" */
        side?: "top" | "right" | "bottom" | "left";
        align?: "start" | "center" | "end";
        /** Gap between trigger and panel, px. @default 8 */
        offset?: number;
        /** Hover open delay, ms. Focus always opens instantly. @default 250 */
        delay?: number;
        /** @default true */
        arrow?: boolean;
        /** Let the pointer enter the panel — for a hint holding a link. @default false */
        interactive?: boolean;
        /** @default "sm" */
        size?: TooltipSize;
        /** Suppress the tooltip entirely. */
        disabled?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        /** Element or selector the panel mounts in, so it keeps a scoped root's styles. @default document.body */
        portalTarget?: PortalProps["to"];
    };

    let {
        trigger,
        content,
        shortcut,
        side = "top",
        align = "center",
        offset = 8,
        delay = 250,
        arrow = true,
        interactive = false,
        size = "sm",
        disabled = false,
        open = $bindable(false),
        onOpenChange,
        portalTarget,
        class: className,
        ...restProps
    }: Props = $props();

    const panelStyles =
        "z-50 flex w-max max-w-60 items-center gap-1.75 border border-popover-border bg-popover-background font-medium text-pretty text-popover-foreground shadow-medium";

    // `fill-mode-forwards` for Toaster's reason: the plugin's `animate-out` carries no fill
    // mode, so the panel flashes back to full opacity for the frame before it unmounts.
    const motionStyles =
        "origin-(--bits-tooltip-content-transform-origin) animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:fill-mode-forwards motion-reduce:animate-none";

    const sizeStyles: Record<TooltipSize, string> = {
        sm: "rounded-sm px-2 py-1.25 text-xs/normal",
        md: "rounded-md px-2.5 py-1.75 text-sm/normal"
    };

    const keys = $derived(shortcut === undefined ? [] : Array.isArray(shortcut) ? shortcut : [shortcut]);

    // Ours because bits-ui drops Content's id before it reaches the DOM, which leaves the
    // trigger's `aria-describedby` empty — the reason for the `child` snippet. `Tooltip.md`.
    const hintId = $props.id();

    // bits-ui closes every open tooltip on a window scroll, and focus scrolls an off-screen
    // trigger into view. So an open waits a frame, or for that scroll to end.
    function afterScroll(trigger: Element | undefined, run: () => void): () => void {
        // A smooth scroll starts frames after the focus, so an off-screen trigger says one is coming.
        let still = trigger === undefined || inView(trigger);
        let quiet: ReturnType<typeof setTimeout> | undefined;
        const done = () => {
            stop();
            run();
        };
        // Fallback for Safari before 26.2 and a scroll that ends without `scrollend`: 100 ms of quiet.
        const wait = () => {
            clearTimeout(quiet);
            quiet = setTimeout(done, 100);
        };
        const onScroll = () => {
            still = false;
            wait();
        };
        const frame = requestAnimationFrame(() => (still ? done() : wait()));
        function stop() {
            cancelAnimationFrame(frame);
            clearTimeout(quiet);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("scrollend", done);
        }
        window.addEventListener("scroll", onScroll);
        window.addEventListener("scrollend", done);
        return stop;
    }

    function inView(element: Element) {
        const { top, left, bottom, right } = element.getBoundingClientRect();
        return top >= 0 && left >= 0 && bottom <= window.innerHeight && right <= window.innerWidth;
    }

    let triggerNode: HTMLElement | undefined;
    const captureTrigger = {
        [createAttachmentKey()]: (node: HTMLElement) => {
            triggerNode = node;
        }
    };

    // The primitive's open, a step behind `open`. The step also keeps bits-ui from meeting a
    // panel already open on its first render, which it never places.
    let shown = $state(false);

    $effect(() => {
        if (!open) {
            shown = false;
            return;
        }
        return afterScroll(triggerNode, () => (shown = true));
    });

    let cancelFocusOpen: (() => void) | undefined;

    // Keyboard focus is what scrolls; a press focuses in place, and the primitive ignores it.
    function deferFocus(props: Record<string, unknown>) {
        const onfocus = props.onfocus as (event: FocusEvent) => void;
        return {
            ...props,
            ...captureTrigger,
            onfocus: (event: FocusEvent) => {
                const target = event.currentTarget as HTMLElement;
                cancelFocusOpen?.();
                if (!target.matches(":focus-visible")) return onfocus(event);
                cancelFocusOpen = afterScroll(target, () => {
                    if (document.activeElement === target) onfocus(event);
                });
            }
        };
    }

    function handleOpenChange(next: boolean) {
        open = next;
        onOpenChange?.(next);
    }
</script>

<TooltipPrimitive.Provider>
    <TooltipPrimitive.Root
        delayDuration={delay}
        {disabled}
        disableHoverableContent={!interactive}
        onOpenChange={handleOpenChange}
        open={shown}>
        <TooltipPrimitive.Trigger>
            {#snippet child({ props })}
                {@render trigger({ props: deferFocus(props) })}
            {/snippet}
        </TooltipPrimitive.Trigger>

        <!-- The primitive only stops the trigger from opening the panel, so a call site
             binding `open` would still draw one it asked to suppress. -->
        {#if !disabled}
            <TooltipPrimitive.Portal to={portalTarget}>
                <TooltipPrimitive.Content
                    {...restProps}
                    {align}
                    arrowPadding={10}
                    collisionPadding={8}
                    role="tooltip"
                    {side}
                    sideOffset={offset}>
                    {#snippet child({ props, wrapperProps })}
                        <div {...wrapperProps}>
                            <div {...props} class={cn(panelStyles, motionStyles, sizeStyles[size], className)} id={hintId}>
                                <span>{content}</span>

                                {#if keys.length > 0}
                                    <span class="flex shrink-0 gap-0.75">
                                        {#each keys as key, index (index)}
                                            <Kbd>{key}</Kbd>
                                        {/each}
                                    </span>
                                {/if}

                                {#if arrow}
                                    <!-- A square centred on the panel's edge, replacing the primitive's
                                         own svg, which draws detached. The span is re-anchored and
                                         rotated per placed side, so one shape serves all four. -->
                                    <TooltipPrimitive.Arrow>
                                        <div
                                            class="size-2 -translate-y-1/2 rotate-45 border-r border-b border-popover-border bg-popover-background">
                                        </div>
                                    </TooltipPrimitive.Arrow>
                                {/if}
                            </div>
                        </div>
                    {/snippet}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        {/if}
    </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>
