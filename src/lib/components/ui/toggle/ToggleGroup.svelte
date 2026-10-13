<script lang="ts">
    import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";
    import { setToggleGroupContext, type ToggleSize, type ToggleVariant } from "./Toggle.svelte";

    type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> & {
        /** Reaches every `<Toggle>` through context. @default "default" */
        variant?: ToggleVariant;
        /** Reaches every `<Toggle>` through context. @default "md" */
        size?: ToggleSize;
        /** Which arrow keys walk the group. @default "horizontal" */
        orientation?: "horizontal" | "vertical";
        /** One sunken track, segmented-control style. @default false */
        attached?: boolean;
        /** One group-owned capsule that slides between single selections. */
        indicator?: "sliding";
        /** Fill the container, every button taking an equal share. @default false */
        fullWidth?: boolean;
        /** Disables every button in the group. @default false */
        disabled?: boolean;
        /** The group's accessible name. Optional in the type, not in practice — see `Toggle.md`. */
        label?: string;
        /** `<Toggle value="…">` buttons. */
        children?: Snippet;
    };

    /** `type` decides what `value` is, both spellings reaching the one `$bindable` prop. */
    type Props = BaseProps &
        (
            | { type?: "multiple"; value?: string[]; onValueChange?: (value: string[]) => void }
            | { type: "single"; value?: string | null; onValueChange?: (value: string | null) => void }
        );

    let {
        type = "multiple",
        value = $bindable(),
        onValueChange,
        variant = "default",
        size = "md",
        orientation = "horizontal",
        attached = false,
        indicator,
        fullWidth = false,
        disabled = false,
        label,
        id,
        class: className,
        children,
        ...restProps
    }: Props = $props();

    const sliding = $derived(indicator === "sliding" && type === "single");
    setToggleGroupContext(() => ({
        variant,
        size,
        disabled,
        attached: attached || sliding,
        fullWidth,
        sliding,
        indicatorReady: capsule.ready
    }));

    let capsule = $state({ x: 0, y: 0, width: 0, height: 0, radius: "0px", ready: false, disabled: false });

    function measureTrack(track: HTMLElement) {
        function measure() {
            const active = Array.from(track.children).find(
                (child): child is HTMLElement => child instanceof HTMLElement && child.matches("[data-toggle-group-item][data-state=on]")
            );
            const bounds = active?.getBoundingClientRect();
            const trackBounds = track.getBoundingClientRect();
            capsule =
                active && bounds
                    ? {
                          x: bounds.left - trackBounds.left - track.clientLeft + track.scrollLeft,
                          y: bounds.top - trackBounds.top - track.clientTop + track.scrollTop,
                          width: bounds.width,
                          height: bounds.height,
                          radius: getComputedStyle(active).borderRadius,
                          ready: true,
                          disabled: active.hasAttribute("disabled")
                      }
                    : { x: 0, y: 0, width: 0, height: 0, radius: "0px", ready: false, disabled: false };
        }
        const resize = new ResizeObserver(measure);
        function observe() {
            resize.disconnect();
            resize.observe(track);
            for (const child of track.children) {
                if (child.hasAttribute("data-toggle-group-item")) resize.observe(child);
            }
            measure();
        }
        const mutations = new MutationObserver(observe);
        mutations.observe(track, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state", "disabled"] });
        observe();
        return () => {
            resize.disconnect();
            mutations.disconnect();
        };
    }

    const vertical = $derived(orientation === "vertical");

    function emit(next: string[] | string | null) {
        // The destructure cannot narrow one prop by another, so the signature `type` picked
        // is cast back; the two setters below are the only callers and each hands it theirs.
        (onValueChange as ((value: string[] | string | null) => void) | undefined)?.(next);
    }

    // bits-ui spells "nothing selected" as `""`; this contract spells it `null`. These four
    // are the only place the two vocabularies meet.
    const asMultiple = $derived(Array.isArray(value) ? value : []);
    const asSingle = $derived(typeof value === "string" ? value : "");

    function setMultiple(next: string[]) {
        value = next;
        emit(next);
    }

    function setSingle(next: string) {
        const settled = next === "" ? null : next;
        value = settled;
        emit(settled);
    }

    // The rest props land on this component's own element, not on the primitive: handing
    // `ToggleGroup.Root` the whole attribute set is a union TypeScript declines to
    // represent, and it narrows `id` to `string` where the DOM type admits `null`. The
    // `aria-*` join the spread so a call site setting either is not clobbered by ours.
    const elementProps = $derived({
        ...restProps,
        ...(label === undefined ? {} : { "aria-label": label }),
        // `group` supports no `aria-orientation`; `radiogroup` does, and the arrow keys it
        // describes are the ones bits-ui has already moved to the other axis.
        ...(type === "single" && vertical ? { "aria-orientation": "vertical" as const } : {})
    });

    // The reference's track is `--background-muted`, the exact colour Toggle's hover wash
    // paints; one step off the scale keeps the track sunken and the hover visible.
    const classes = $derived(
        cn(
            "items-stretch",
            fullWidth ? "flex w-full" : "inline-flex",
            vertical ? "flex-col" : "flex-row",
            attached && !sliding && "rounded-lg bg-background-subtle p-1",
            sliding && "relative isolate rounded-lg border border-border-muted bg-surface-sunken p-1",
            !attached && !sliding && "gap-1.5",
            className
        )
    );
</script>

<!--
    Render delegation, for one attribute: `ToggleGroup.Root` hardcodes `role="group"` and
    wins the merge against anything passed in, so a single-select group would otherwise be
    a set of `role="radio"` buttons with no `radiogroup` to own them.
-->
{#snippet track({ props }: { props: Record<string, unknown> })}
    <div {...elementProps} {...props} role={type === "single" ? "radiogroup" : "group"} class={classes} {@attach sliding && measureTrack}>
        {#if sliding}
            <span
                aria-hidden="true"
                class={cn(
                    "pointer-events-none absolute top-0 left-0 h-(--toggle-height) w-(--toggle-width) translate-x-(--toggle-x) translate-y-(--toggle-y) rounded-(--toggle-radius) bg-primary motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-snap",
                    !capsule.disabled && "shadow-btn-default",
                    !capsule.ready && "opacity-0"
                )}
                style="--toggle-x: {capsule.x}px; --toggle-y: {capsule.y}px; --toggle-width: {capsule.width}px; --toggle-height: {capsule.height}px; --toggle-radius: {capsule.radius}"
            ></span>
        {/if}
        {@render children?.()}
    </div>
{/snippet}

{#if type === "single"}
    <ToggleGroupPrimitive.Root
        type="single"
        id={id ?? undefined}
        {orientation}
        {disabled}
        bind:value={() => asSingle, setSingle}
        child={track} />
{:else}
    <ToggleGroupPrimitive.Root
        type="multiple"
        id={id ?? undefined}
        {orientation}
        {disabled}
        bind:value={() => asMultiple, setMultiple}
        child={track} />
{/if}
