import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { userEvent } from "@vitest/browser/context";
import { createRawSnippet } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Toggle from "./Toggle.svelte";
import GroupHarness from "./ToggleInGroup.test-harness.svelte";
import Harness from "./Toggle.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not. Without this, every render stacks up and the
// button query finds several toggles.
afterEach(cleanup);

const NAME = "Compare to benchmark";
const ICON_NAME = "Bold";

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
const icon = () => createRawSnippet(() => ({ render: () => `<svg aria-hidden="true" width="16" height="16"></svg>` }));

/**
 * How each variant is meant to signal pressed. `tint` washes the canvas and lets it
 * through, `fill` covers it — the reference's point that a tinted capsule and a filled
 * one cannot both say pressed the same way.
 */
const variants = [
    { variant: "default", fill: "tint", border: "static" },
    { variant: "outline", fill: "tint", border: "moves" },
    { variant: "solid", fill: "fill", border: "static" }
] as const;

/** The alpha of a computed colour, whichever space the browser reports it in. */
const alphaOf = (colour: string) => {
    const separate = colour.match(/\/\s*([\d.]+)\s*\)$/);
    if (separate) return Number(separate[1]);

    const legacy = colour.match(/^rgba?\(([^)]+)\)$/);
    if (legacy) {
        const parts = legacy[1].split(",");
        return parts.length === 4 ? Number(parts[3]) : 1;
    }

    return 1;
};

const sizes = [
    { size: "sm", height: 30 },
    { size: "md", height: 36 },
    { size: "lg", height: 42 }
] as const;

describe("Toggle", () => {
    it("flips aria-pressed and the bound value when clicked", async () => {
        render(Harness, { children: label(NAME) });
        const button = screen.getByRole("button", { name: NAME });

        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByTestId("bound")).toHaveTextContent("pressed=false");

        await userEvent.click(button);

        expect(button).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByTestId("bound")).toHaveTextContent("pressed=true");

        await userEvent.click(button);

        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByTestId("bound")).toHaveTextContent("pressed=false");
    });

    it("starts pressed when the binding does", () => {
        render(Harness, { children: label(NAME), pressed: true });

        expect(screen.getByRole("button", { name: NAME })).toHaveAttribute("aria-pressed", "true");
    });

    it("hands onPressedChange the state the toggle moved to", async () => {
        const onPressedChange = vi.fn();
        render(Toggle, { children: label(NAME), onPressedChange });
        const button = screen.getByRole("button", { name: NAME });

        await userEvent.click(button);
        expect(onPressedChange).toHaveBeenLastCalledWith(true);

        await userEvent.click(button);
        expect(onPressedChange).toHaveBeenLastCalledWith(false);
    });

    it("does not change when a disabled toggle is clicked, and cannot be focused", async () => {
        const onPressedChange = vi.fn();
        render(Harness, { children: label(NAME), disabled: true, onPressedChange });
        const button = screen.getByRole("button", { name: NAME });

        expect(button).toBeDisabled();

        // Dispatched straight at the element: a real click never lands on a disabled
        // button, so this is the only way to ask whether the component's own handler
        // refuses one that does.
        await fireEvent.click(button);

        await userEvent.tab();
        await userEvent.keyboard("{Enter}");

        expect(button).not.toHaveFocus();
        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByTestId("bound")).toHaveTextContent("pressed=false");
        expect(onPressedChange).not.toHaveBeenCalled();
    });

    it("dims a disabled toggle and says it is not actionable", () => {
        render(Toggle, { children: label(NAME), disabled: true });
        const button = screen.getByRole("button", { name: NAME });

        expect(getComputedStyle(button).opacity).toBe("0.5");
        expect(getComputedStyle(button).cursor).toBe("not-allowed");
    });

    // The reference's rule is that disabled wins over pressed, in whichever state the
    // toggle is parked — which is what the `enabled:` guard on the pressed ink buys.
    it.each(variants)("keeps the $variant variant's disabled ink in both states", ({ variant }) => {
        const off = render(Toggle, { children: label(NAME), variant, disabled: true });
        const on = render(Toggle, { children: label(NAME), variant, disabled: true, pressed: true });

        const ink = (root: HTMLElement) => getComputedStyle(within(root).getByRole("button", { name: NAME })).color;

        expect(on.container.querySelector("button")).toHaveAttribute("aria-pressed", "true");
        expect(ink(on.container)).toBe(ink(off.container));
    });

    it.each(variants)("matches aria-pressed to what the $variant variant paints", async ({ variant, fill, border }) => {
        const { container } = render(Harness, { children: label(NAME), variant });
        const button = within(container).getByRole("button", { name: NAME });
        const paint = () => {
            const style = getComputedStyle(button);
            return { bg: style.backgroundColor, ink: style.color, edge: style.borderTopColor };
        };

        const resting = paint();
        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(alphaOf(resting.bg)).toBe(0);
        expect(alphaOf(resting.edge)).toBe(border === "moves" ? 1 : 0);

        await userEvent.click(button);

        expect(button).toHaveAttribute("aria-pressed", "true");

        // Every read below goes inside the retry: the colours transition over 200ms, and
        // the first read after the click catches them mid-flight — the background has
        // already switched colour space while the ink still rounds to where it started.
        // Waiting on the end state each assertion describes is what makes them settled
        // values rather than a snapshot of the animation.
        await waitFor(() => {
            const pressed = paint();

            expect(pressed.ink).not.toBe(resting.ink);

            if (fill === "tint") {
                expect(alphaOf(pressed.bg)).toBeGreaterThan(0);
                expect(alphaOf(pressed.bg)).toBeLessThan(1);
            } else {
                expect(alphaOf(pressed.bg)).toBe(1);
            }

            if (border === "moves") {
                expect(pressed.edge).not.toBe(resting.edge);
            } else {
                expect(alphaOf(pressed.edge)).toBe(0);
            }
        });
    });

    it.each(sizes)("draws the $size size at $height px", ({ size, height }) => {
        const { container } = render(Toggle, { children: label(NAME), size });

        expect(within(container).getByRole("button", { name: NAME }).getBoundingClientRect().height).toBe(height);
    });

    it.each(sizes)("squares an icon-only $size toggle at its own height", ({ size, height }) => {
        const { container } = render(Toggle, { leadingIcon: icon(), size, "aria-label": ICON_NAME });
        const box = within(container).getByRole("button", { name: ICON_NAME }).getBoundingClientRect();

        expect(box.height).toBe(height);
        expect(box.width).toBe(height);
    });

    it("carries an icon-only toggle's pressed state on the name the caller gave it", async () => {
        render(Toggle, { leadingIcon: icon(), "aria-label": ICON_NAME });
        const button = screen.getByRole("button", { name: ICON_NAME });

        expect(button).toHaveAttribute("aria-pressed", "false");

        await userEvent.click(button);

        expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("renders a leading and a trailing icon either side of the label", () => {
        const { container } = render(Toggle, { children: label(NAME), leadingIcon: icon(), trailingIcon: icon() });

        expect(within(container).getByRole("button", { name: NAME }).querySelectorAll("svg")).toHaveLength(2);
    });

    describe("inside a group", () => {
        it("hands the state to the group rather than keeping its own", async () => {
            render(GroupHarness);
            const bold = screen.getByRole("button", { name: "Bold" });

            expect(bold).toHaveAttribute("aria-pressed", "false");
            expect(screen.getByTestId("group-value")).toHaveTextContent("");

            await userEvent.click(bold);

            expect(bold).toHaveAttribute("aria-pressed", "true");
            expect(screen.getByTestId("group-value")).toHaveTextContent("bold");

            await userEvent.click(screen.getByRole("button", { name: "Italic" }));

            expect(screen.getByTestId("group-value")).toHaveTextContent("bold,italic");
        });

        it("takes the group's size when it sets none of its own", () => {
            const { container } = render(GroupHarness, { size: "lg" });

            expect(within(container).getByRole("button", { name: "Bold" }).getBoundingClientRect().height).toBe(42);
        });

        it("takes the group's variant when it sets none of its own", () => {
            const bordered = render(GroupHarness, { variant: "outline" });
            const plain = render(GroupHarness, { variant: "default" });

            const edge = (root: HTMLElement) =>
                alphaOf(getComputedStyle(within(root).getByRole("button", { name: "Bold" })).borderTopColor);

            expect(edge(bordered.container)).toBe(1);
            expect(edge(plain.container)).toBe(0);
        });

        it("takes the group's disabled state", () => {
            render(GroupHarness, { disabled: true });

            expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
        });

        // The reference does the same: a value is what makes it a member, so a child
        // without one is simply an ungrouped toggle rather than an error.
        it("leaves a child with no value as a toggle of its own", async () => {
            render(GroupHarness, { withValuelessChild: true });
            const loose = screen.getByRole("button", { name: "Loose" });

            await userEvent.click(loose);

            expect(loose).toHaveAttribute("aria-pressed", "true");
            expect(screen.getByTestId("group-value")).toHaveTextContent("");
        });
    });

    // `shape` is not ported: a caller's class is the whole mechanism, and this is what
    // stands between that directive and a silent regression.
    it("lets a caller's rounded-full round the control", () => {
        const square = render(Toggle, { children: label(NAME) });
        const pill = render(Toggle, { children: label(NAME), class: "rounded-full" });

        const radius = (root: HTMLElement) =>
            parseFloat(getComputedStyle(within(root).getByRole("button", { name: NAME })).borderTopLeftRadius);
        const height = (root: HTMLElement) => within(root).getByRole("button", { name: NAME }).getBoundingClientRect().height;

        expect(radius(pill.container)).toBeGreaterThanOrEqual(height(pill.container) / 2);
        expect(radius(square.container)).toBeLessThan(height(square.container) / 2);
    });
});
