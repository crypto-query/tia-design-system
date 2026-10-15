import { cleanup, render, screen, waitFor, within } from "@testing-library/svelte";
import type {} from "@vitest/browser/providers/playwright";
import { cdp, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, vi } from "vitest";
import Harness from "./ToggleGroup.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not. Without this, every render stacks up and the
// group query finds several.
afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
});

const BUTTONS = ["Bold", "Italic", "Underline"];

/** What the parent holds, printed by the harness — the only way to read a `$bindable`. */
const bound = () => screen.getByTestId("bound").textContent;

describe("ToggleGroup", () => {
    describe("sliding indicator", () => {
        it("takes the selected item's radius, so a caller's rounded-full rounds it too", async () => {
            render(Harness, {
                type: "single",
                indicator: "sliding",
                value: "bold",
                label: "Layout",
                class: "rounded-full",
                firstItem: { class: "rounded-full" }
            });
            const track = screen.getByRole("radiogroup", { name: "Layout" });
            const capsule = track.querySelector<HTMLElement>("[aria-hidden=true]");
            if (!capsule) throw new Error("Missing indicator");
            const bold = screen.getByRole("radio", { name: "Bold" });
            const italic = screen.getByRole("radio", { name: "Italic" });

            await waitFor(() => expect(getComputedStyle(capsule).borderRadius).toBe(getComputedStyle(bold).borderRadius));
            expect(getComputedStyle(bold).borderRadius).not.toBe(getComputedStyle(italic).borderRadius);
            expect(getComputedStyle(track).borderRadius).toBe(getComputedStyle(bold).borderRadius);

            await userEvent.click(italic);
            await waitFor(() => expect(getComputedStyle(capsule).borderRadius).toBe(getComputedStyle(italic).borderRadius));
        });

        it.each(["horizontal", "vertical"] as const)("slides to the selected item in %s groups", async (orientation) => {
            const view = render(Harness, {
                type: "single",
                indicator: "sliding",
                orientation,
                value: "bold",
                label: "Layout",
                fullWidth: true
            });
            const track = screen.getByRole("radiogroup", { name: "Layout" });
            const capsule = track.querySelector<HTMLElement>("[aria-hidden=true]");
            expect(capsule).not.toBeNull();
            if (!capsule) throw new Error("Missing indicator");
            expect(getComputedStyle(track).borderTopWidth).toBe("1px");
            expect(getComputedStyle(capsule).transitionDuration).toBe("0.3s");
            expect(getComputedStyle(capsule).transitionTimingFunction).toBe("cubic-bezier(0.65, 0, 0.35, 1)");
            const bold = screen.getByRole("radio", { name: "Bold" });
            const italic = screen.getByRole("radio", { name: "Italic" });
            const matches = (item: HTMLElement) => {
                const expected = item.getBoundingClientRect();
                const actual = capsule.getBoundingClientRect();
                for (const key of ["x", "y", "width", "height"] as const) expect(actual[key]).toBeCloseTo(expected[key], 0);
            };
            await waitFor(() => matches(bold));
            expect(getComputedStyle(bold).backgroundColor).toBe("rgba(0, 0, 0, 0)");
            expect(getComputedStyle(bold).color).not.toBe(getComputedStyle(italic).color);
            expect(getComputedStyle(bold).transitionProperty).toContain("color");
            expect(getComputedStyle(bold).transitionDuration).toBe("0.2s");
            bold.focus();
            await userEvent.keyboard(orientation === "horizontal" ? "{ArrowRight}" : "{ArrowDown}");
            expect(italic).toHaveFocus();
            expect(bound()).toBe("bold");
            await userEvent.keyboard(" ");
            expect(bound()).toBe("italic");
            await waitFor(() => matches(italic));
            await userEvent.click(italic);
            expect(bound()).toBe("null");
            await waitFor(() => expect(getComputedStyle(capsule).opacity).toBe("0"));
            await view.rerender({ value: "underline", disabled: true });
            const underline = screen.getByRole("radio", { name: "Underline" });
            expect(underline).toBeDisabled();
            await waitFor(() => matches(underline));
            await view.rerender({ value: "missing" });
            await waitFor(() => expect(getComputedStyle(capsule).opacity).toBe("0"));
        });

        it.each([
            ["light", "group"],
            ["dark", "group"],
            ["light", "item"],
            ["dark", "item"]
        ] as const)("keeps the disabled selection visible in %s mode with the %s disabled", async (theme, disabledScope) => {
            document.documentElement.classList.toggle("dark", theme === "dark");
            const onValueChange = vi.fn();
            const view = render(Harness, {
                type: "single",
                indicator: "sliding",
                label: "Layout",
                value: "bold",
                size: "sm",
                disabled: disabledScope === "group",
                firstItem: { size: "lg", disabled: disabledScope === "item" },
                onValueChange
            });
            const track = screen.getByRole("radiogroup");
            const capsule = track.querySelector<HTMLElement>("[aria-hidden=true]");
            if (!capsule) throw new Error("Missing indicator");
            const bold = screen.getByRole("radio", { name: "Bold" });
            const probe = document.createElement("span");
            probe.style.backgroundColor = "var(--primary)";
            probe.style.color = "var(--primary-foreground)";
            view.container.appendChild(probe);
            const primary = getComputedStyle(probe).backgroundColor;
            const primaryForeground = getComputedStyle(probe).color;
            probe.remove();
            const matches = () => {
                const expected = bold.getBoundingClientRect();
                const actual = capsule.getBoundingClientRect();
                for (const key of ["x", "y", "width", "height"] as const) expect(actual[key]).toBeCloseTo(expected[key], 0);
            };
            await waitFor(matches);
            expect(bold).toBeDisabled();
            expect(bold).toHaveAttribute("aria-checked", "true");
            expect(bold.getBoundingClientRect().height).toBe(42);
            expect(getComputedStyle(capsule).backgroundColor).toBe(primary);
            expect(getComputedStyle(capsule).backgroundColor).not.toBe(getComputedStyle(track).backgroundColor);
            expect(getComputedStyle(capsule).opacity).toBe("1");
            expect(getComputedStyle(bold).color).toBe(primaryForeground);
            expect(getComputedStyle(bold).opacity).toBe("1");
            expect(getComputedStyle(bold).backgroundColor).toBe("rgba(0, 0, 0, 0)");
            for (const button of within(track).getAllByRole("radio")) {
                expect(getComputedStyle(button).transitionProperty).toContain("color");
                expect(getComputedStyle(button).animationName).toBe("none");
                if (button === bold || disabledScope === "group") {
                    expect(button).toBeDisabled();
                    button.focus();
                    expect(button).not.toHaveFocus();
                    button.click();
                    if (button !== bold) expect(getComputedStyle(button).opacity).toBe("0.5");
                } else {
                    expect(button).toBeEnabled();
                    expect(getComputedStyle(button).opacity).toBe("1");
                }
            }
            await userEvent.hover(bold);
            expect(getComputedStyle(capsule).boxShadow).toBe("none");
            expect(getComputedStyle(capsule).transitionDuration).toBe("0.3s");
            expect(getComputedStyle(capsule).animationName).toBe("none");
            expect(bound()).toBe("bold");
            expect(onValueChange).not.toHaveBeenCalled();
            matches();
            const disabledFill = getComputedStyle(capsule).backgroundColor;
            await view.rerender({ disabled: false, firstItem: { size: "lg", disabled: false } });
            await waitFor(() => expect(getComputedStyle(capsule).boxShadow).not.toBe("none"));
            expect(getComputedStyle(capsule).backgroundColor).toBe(disabledFill);
            expect(getComputedStyle(bold).color).toBe(primaryForeground);
            expect(getComputedStyle(bold).opacity).toBe("1");
            expect(getComputedStyle(capsule).backgroundColor).not.toBe(getComputedStyle(track).backgroundColor);
            expect(getComputedStyle(capsule).boxShadow).not.toBe("none");
            expect(getComputedStyle(bold).color).not.toBe(getComputedStyle(capsule).backgroundColor);
            await view.rerender({ fullWidth: true, value: "underline" });
            await waitFor(() =>
                expect(capsule.getBoundingClientRect().width).toBeCloseTo(
                    screen.getByRole("radio", { name: "Underline" }).getBoundingClientRect().width,
                    0
                )
            );
            await view.rerender({ showLast: false });
            await waitFor(() => expect(getComputedStyle(capsule).opacity).toBe("0"));
        });

        it("moves without an animated transform under reduced motion", async () => {
            await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
            try {
                render(Harness, { type: "single", indicator: "sliding", value: "bold", label: "Layout" });
                const track = screen.getByRole("radiogroup");
                const capsule = track.querySelector<HTMLElement>("[aria-hidden=true]");
                if (!capsule) throw new Error("Missing indicator");
                await userEvent.click(screen.getByRole("radio", { name: "Italic" }));
                await waitFor(() =>
                    expect(capsule.getBoundingClientRect().x).toBeCloseTo(
                        screen.getByRole("radio", { name: "Italic" }).getBoundingClientRect().x,
                        0
                    )
                );
                expect(getComputedStyle(capsule).transitionDuration).toBe("0s");
                expect(capsule.getAnimations()).toHaveLength(0);
            } finally {
                await cdp().send("Emulation.setEmulatedMedia", { features: [] });
            }
        });

        it("leaves multiple-selection groups on their existing presentation", async () => {
            render(Harness, { type: "multiple", indicator: "sliding", label: "Formatting", value: ["bold"] });
            expect(screen.getByRole("group").querySelector("[aria-hidden=true]")).toBeNull();
            await userEvent.click(screen.getByRole("button", { name: "Italic" }));
            expect(bound()).toBe("[bold,italic]");
        });
    });

    describe("the bound value", () => {
        it("is an array under multiple, gaining and losing values as buttons are pressed", async () => {
            render(Harness, { type: "multiple", label: "Formatting", value: ["bold"] });

            expect(bound()).toBe("[bold]");

            await userEvent.click(screen.getByRole("button", { name: "Italic" }));
            expect(bound()).toBe("[bold,italic]");

            await userEvent.click(screen.getByRole("button", { name: "Bold" }));
            expect(bound()).toBe("[italic]");
        });

        it("is an array even when the call site bound nothing to start with", async () => {
            render(Harness, { type: "multiple", label: "Formatting" });

            expect(bound()).toBe("undefined");
            for (const name of BUTTONS) {
                expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "false");
            }

            await userEvent.click(screen.getByRole("button", { name: "Bold" }));
            expect(bound()).toBe("[bold]");
        });

        it("is one value under single, and null once the pressed button is pressed again", async () => {
            render(Harness, { type: "single", label: "Layout", value: "bold" });

            expect(bound()).toBe("bold");

            await userEvent.click(screen.getByRole("radio", { name: "Italic" }));
            expect(bound()).toBe("italic");

            // bits-ui spells the empty selection `""`; this component publishes `null`.
            await userEvent.click(screen.getByRole("radio", { name: "Italic" }));
            expect(bound()).toBe("null");
        });

        it("hands onValueChange the value the group moved to, beside the binding", async () => {
            const onValueChange = vi.fn();
            render(Harness, { type: "single", label: "Layout", onValueChange });

            await userEvent.click(screen.getByRole("radio", { name: "Italic" }));
            expect(onValueChange).toHaveBeenLastCalledWith("italic");

            await userEvent.click(screen.getByRole("radio", { name: "Italic" }));
            expect(onValueChange).toHaveBeenLastCalledWith(null);
        });
    });

    describe("keyboard travel", () => {
        it("is one tab stop, with the arrow keys walking the buttons", async () => {
            render(Harness, { type: "multiple", label: "Formatting" });
            const [first, second, third] = BUTTONS.map((name) => screen.getByRole("button", { name }));

            await userEvent.tab();
            expect(first).toHaveFocus();

            // One arrow per call: from 2.18 bits-ui drops the second key of a batch.
            await userEvent.keyboard("{ArrowRight}");
            expect(second).toHaveFocus();

            await userEvent.keyboard("{ArrowRight}");
            expect(third).toHaveFocus();

            await userEvent.keyboard("{ArrowLeft}");
            expect(second).toHaveFocus();

            await userEvent.keyboard("{Home}");
            expect(first).toHaveFocus();

            await userEvent.keyboard("{End}");
            expect(third).toHaveFocus();

            // The whole point of the roving tabindex: leaving costs one Tab, not one
            // per button.
            await userEvent.tab();
            for (const button of [first, second, third]) expect(button).not.toHaveFocus();
        });

        it("walks with up and down when the group is vertical", async () => {
            render(Harness, { type: "single", label: "Layout", orientation: "vertical" });
            const [first, second] = BUTTONS.map((name) => screen.getByRole("radio", { name }));

            // Focused rather than tabbed into: the browser's sequential-navigation
            // starting point survives cleanup, so where Tab lands depends on the test
            // that ran before this one. What this asserts is the axis, not the entry.
            first.focus();
            expect(first).toHaveFocus();

            await userEvent.keyboard("{ArrowDown}");
            expect(second).toHaveFocus();

            await userEvent.keyboard("{ArrowUp}");
            expect(first).toHaveFocus();
        });

        it("moves focus rather than the selection, which Space then commits", async () => {
            render(Harness, { type: "single", label: "Layout", value: null });

            screen.getByRole("radio", { name: "Bold" }).focus();
            await userEvent.keyboard("{ArrowRight}");
            expect(screen.getByRole("radio", { name: "Italic" })).toHaveFocus();
            expect(bound()).toBe("null");

            await userEvent.keyboard(" ");
            expect(bound()).toBe("italic");
        });
    });

    describe("the tab stop under single", () => {
        const radios = () => BUTTONS.map((name) => screen.getByRole("radio", { name }));
        const tabStops = () => radios().filter((radio) => radio.tabIndex === 0);
        const enterFromBefore = async () => {
            screen.getByRole("button", { name: "Before" }).focus();
            await userEvent.tab();
        };

        it("is the pressed item, so Tab lands on the current choice", async () => {
            render(Harness, { type: "single", label: "Layout", value: "italic", fenced: true });

            await enterFromBefore();
            expect(screen.getByRole("radio", { name: "Italic" })).toHaveFocus();
            expect(tabStops()).toEqual([screen.getByRole("radio", { name: "Italic" })]);
        });

        it("is the first item when nothing is pressed", async () => {
            render(Harness, { type: "single", label: "Layout", value: null, fenced: true });

            await enterFromBefore();
            expect(screen.getByRole("radio", { name: "Bold" })).toHaveFocus();
            expect(tabStops()).toHaveLength(1);
        });

        it("follows the item focused last, so leaving and coming back returns to it", async () => {
            render(Harness, { type: "single", label: "Layout", value: "bold", fenced: true });

            await enterFromBefore();
            await userEvent.keyboard("{ArrowRight}");
            const italic = screen.getByRole("radio", { name: "Italic" });
            expect(italic).toHaveFocus();

            await userEvent.tab();
            expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
            await userEvent.tab({ shift: true });
            expect(italic).toHaveFocus();
            expect(tabStops()).toEqual([italic]);
        });

        it("leaves the group in one Shift+Tab from the pressed item", async () => {
            render(Harness, { type: "single", label: "Layout", value: "underline", fenced: true });

            await enterFromBefore();
            expect(screen.getByRole("radio", { name: "Underline" })).toHaveFocus();
            await userEvent.tab({ shift: true });
            expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
        });

        it("moves to the new pressed item when the parent changes the value", async () => {
            const view = render(Harness, { type: "single", label: "Layout", value: "bold", fenced: true });

            await view.rerender({ value: "underline" });
            await waitFor(() => expect(tabStops()).toEqual([screen.getByRole("radio", { name: "Underline" })]));
            await enterFromBefore();
            expect(screen.getByRole("radio", { name: "Underline" })).toHaveFocus();
        });
    });

    describe("what assistive technology is told", () => {
        it("takes its accessible name from label", () => {
            render(Harness, { type: "multiple", label: "Formatting" });

            expect(screen.getByRole("group", { name: "Formatting" })).toBeInTheDocument();
        });

        it("is a radiogroup of radios under single", () => {
            render(Harness, { type: "single", label: "Layout", value: "bold" });
            const group = screen.getByRole("radiogroup", { name: "Layout" });

            expect(within(group).getAllByRole("radio")).toHaveLength(3);
            expect(within(group).getByRole("radio", { name: "Bold" })).toHaveAttribute("aria-checked", "true");
            expect(within(group).getByRole("radio", { name: "Italic" })).toHaveAttribute("aria-checked", "false");
        });

        it("is a group of pressable buttons under multiple", () => {
            render(Harness, { type: "multiple", label: "Formatting", value: ["italic"] });
            const group = screen.getByRole("group", { name: "Formatting" });

            expect(within(group).getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
            expect(within(group).getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
            expect(within(group).queryAllByRole("radio")).toHaveLength(0);
        });

        it("says vertical on the radiogroup, the one role that supports saying it", () => {
            render(Harness, { type: "single", label: "Layout", orientation: "vertical" });

            expect(screen.getByRole("radiogroup", { name: "Layout" })).toHaveAttribute("aria-orientation", "vertical");
        });
    });

    describe("what the group sets on its buttons", () => {
        it("disables every one of them", async () => {
            render(Harness, { type: "multiple", label: "Formatting", value: [], disabled: true });
            const buttons = BUTTONS.map((name) => screen.getByRole("button", { name }));

            // A disabled button cannot be clicked to prove it does nothing — the click
            // never lands. What it can be held to is being out of reach: disabled to the
            // platform, untouched by focus, and still saying it is not pressed.
            for (const button of buttons) {
                expect(button).toBeDisabled();
                expect(button).toHaveAttribute("aria-pressed", "false");
            }

            await userEvent.tab();
            for (const button of buttons) expect(button).not.toHaveFocus();
            expect(bound()).toBe("[]");
        });

        it("gives them its size", () => {
            render(Harness, { type: "multiple", label: "Formatting", size: "lg" });

            for (const name of BUTTONS) {
                expect(screen.getByRole("button", { name }).getBoundingClientRect().height).toBeCloseTo(42, 0);
            }
        });

        it("gives them its variant, which decides how pressed is painted", () => {
            const solid = render(Harness, { type: "multiple", label: "Formatting", variant: "solid", value: ["bold"] });
            const tinted = render(Harness, { type: "multiple", label: "Formatting", variant: "default", value: ["bold"] });

            const pressedFill = (root: HTMLElement) => getComputedStyle(within(root).getByRole("button", { name: "Bold" })).backgroundColor;

            // The claim is that the group's variant reached its buttons at all. *Which*
            // surface each variant paints is Toggle's own contract and is pinned in
            // Toggle's own test; asserting it again here would pin a paint this component
            // does not choose.
            expect(pressedFill(solid.container)).not.toBe(pressedFill(tinted.container));
        });

        it("keeps a child's explicit variant and size ahead of the group defaults", () => {
            render(Harness, {
                type: "multiple",
                variant: "solid",
                size: "sm",
                value: ["bold", "italic"],
                firstItem: { variant: "outline", size: "lg" }
            });
            const bold = screen.getByRole("button", { name: "Bold" });
            const italic = screen.getByRole("button", { name: "Italic" });
            expect(bold.getBoundingClientRect().height).toBe(42);
            expect(italic.getBoundingClientRect().height).toBe(30);
            expect(getComputedStyle(bold).backgroundColor).not.toBe(getComputedStyle(italic).backgroundColor);
        });

        it("gives each of them an equal share when fullWidth", () => {
            render(Harness, { type: "single", label: "Panel", fullWidth: true });
            const widths = BUTTONS.map((name) => screen.getByRole("radio", { name }).getBoundingClientRect().width);

            expect(widths[0]).toBeGreaterThan(0);
            for (const width of widths) expect(width).toBeCloseTo(widths[0], 0);
        });

        it("keeps each item at its size's height and the group's width when fullWidth and vertical", () => {
            render(Harness, { type: "multiple", label: "Panel", fullWidth: true, orientation: "vertical" });
            const track = screen.getByRole("group", { name: "Panel" }).getBoundingClientRect();

            for (const name of BUTTONS) {
                const button = screen.getByRole("button", { name }).getBoundingClientRect();
                expect(button.height).toBe(36);
                expect(button.width).toBeCloseTo(track.width, 0);
            }
        });

        it("leaves their widths to their labels when it is not fullWidth", () => {
            render(Harness, { type: "single", label: "Panel" });
            const widths = BUTTONS.map((name) => screen.getByRole("radio", { name }).getBoundingClientRect().width);

            expect(widths[2]).toBeGreaterThan(widths[0]);
        });
    });

    describe("attached", () => {
        const between = (left: Element, right: Element) => right.getBoundingClientRect().left - left.getBoundingClientRect().right;
        const inset = (track: Element, first: Element) => first.getBoundingClientRect().left - track.getBoundingClientRect().left;

        it("closes the gap between the buttons and pads a track around them", () => {
            render(Harness, { type: "single", label: "Range", attached: true });
            const track = screen.getByRole("radiogroup", { name: "Range" });
            const [first, second] = BUTTONS.map((name) => screen.getByRole("radio", { name }));

            expect(between(first, second)).toBeCloseTo(0, 0);
            expect(inset(track, first)).toBeCloseTo(4, 0);
        });

        it("leaves a run of separate buttons on no track when it is not set", () => {
            render(Harness, { type: "single", label: "Range" });
            const track = screen.getByRole("radiogroup", { name: "Range" });
            const [first, second] = BUTTONS.map((name) => screen.getByRole("radio", { name }));

            expect(between(first, second)).toBeCloseTo(6, 0);
            expect(inset(track, first)).toBeCloseTo(0, 0);
        });
    });

    // `shape` is not ported either, and the attached track is the surface it would have
    // rounded. Same mechanism, same pin — `Toggle.svelte.test.ts` has the button's half.
    it("lets a caller's rounded-full round the attached track", () => {
        const square = render(Harness, { type: "single", label: "Range", attached: true });
        const pill = render(Harness, { type: "single", label: "Range", attached: true, class: "rounded-full" });

        const track = (root: HTMLElement) => within(root).getByRole("radiogroup", { name: "Range" });
        const radius = (root: HTMLElement) => parseFloat(getComputedStyle(track(root)).borderTopLeftRadius);
        const height = (root: HTMLElement) => track(root).getBoundingClientRect().height;

        expect(radius(pill.container)).toBeGreaterThanOrEqual(height(pill.container) / 2);
        expect(radius(square.container)).toBeLessThan(height(square.container) / 2);
    });

    // `gap` is not ported: a caller's class is the whole mechanism, and this is what
    // stands between that decision and a silent regression.
    it("lets a caller's own gap class through", () => {
        render(Harness, { type: "single", label: "Range", class: "gap-3" });
        const [first, second] = BUTTONS.map((name) => screen.getByRole("radio", { name }));

        expect(second.getBoundingClientRect().left - first.getBoundingClientRect().right).toBeCloseTo(12, 0);
    });
});
