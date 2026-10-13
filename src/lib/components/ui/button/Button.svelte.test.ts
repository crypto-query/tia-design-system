import { cleanup, render, screen } from "@testing-library/svelte";
import type {} from "@vitest/browser/providers/playwright";
import { cdp, userEvent } from "@vitest/browser/context";
import { createRawSnippet } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Button from "./Button.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with
// globals enabled, which this project does not. Without this, every render
// stacks up and the role queries find several buttons.
afterEach(cleanup);

/** A label snippet, so the button gets a real accessible name to query by. */
const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

/**
 * Renders both brand fills under one theme and reads back what the browser
 * actually paints. `default` follows `--primary`, which lifts to a readable
 * mid-blue on the navy dark canvas; `accent` follows `--secondary`, which is
 * the yellow CTA in both themes. The pair must stay distinct in each theme —
 * that they once collided is why these assertions exist.
 */
function brandFills(theme: "light" | "dark"): { default: string; accent: string } {
    document.documentElement.classList.toggle("dark", theme === "dark");

    render(Button, { children: label("Default fill"), variant: "default" });
    render(Button, { children: label("Accent fill"), variant: "accent" });

    const read = (name: string) => getComputedStyle(screen.getByRole("button", { name })).backgroundColor;
    const fills = { default: read("Default fill"), accent: read("Accent fill") };

    cleanup();
    document.documentElement.classList.remove("dark");
    return fills;
}

/** Splits a computed colour into its channels; alpha defaults to 1. */
function channels(colour: string) {
    const parts = (colour.match(/[\d.]+/g) ?? []).map(Number);
    return { rgb: parts.slice(0, 3), alpha: parts[3] ?? 1 };
}

/** WCAG relative luminance. */
function luminance(rgb: number[]): number {
    const [r, g, b] = rgb.map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe("Button", () => {
    it("gives movement and background their own 200ms easing", () => {
        render(Button, { children: label("Subscribe"), variant: "accent" });
        const style = getComputedStyle(screen.getByRole("button"));
        const properties = style.transitionProperty.split(", ");
        const easings = style.transitionTimingFunction.match(/cubic-bezier\([^)]*\)|ease-in-out/g) ?? [];
        expect(properties).not.toContain("all");
        for (const property of ["transform", "translate", "scale", "box-shadow"]) {
            expect(properties).toContain(property);
            expect(easings[properties.indexOf(property)]).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
        }
        expect(easings[properties.indexOf("background-color")]).toBe("ease-in-out");
        expect(style.transitionDuration.split(", ").every((duration) => duration === "0.2s")).toBe(true);
    });

    it("does not lift or shrink under reduced motion", async () => {
        await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        try {
            render(Button, { children: label("Subscribe"), variant: "accent" });
            const button = screen.getByRole("button");
            await userEvent.hover(button);
            expect(getComputedStyle(button).translate).toBe("none");
            const bounds = button.getBoundingClientRect();
            await cdp().send("Input.dispatchMouseEvent", {
                type: "mousePressed",
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2,
                button: "left",
                clickCount: 1
            });
            expect(getComputedStyle(button).scale).toBe("none");
            expect(getComputedStyle(button).transform).toBe("none");
            await cdp().send("Input.dispatchMouseEvent", {
                type: "mouseReleased",
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2,
                button: "left",
                clickCount: 1
            });
        } finally {
            await cdp().send("Emulation.setEmulatedMedia", { features: [] });
        }
    });

    it("takes its accessible name from its label", () => {
        render(Button, { children: label("Save") });

        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("activates on Enter and on Space", async () => {
        const onclick = vi.fn();
        render(Button, { children: label("Save"), onclick });

        screen.getByRole("button", { name: "Save" }).focus();
        await userEvent.keyboard("{Enter}");
        await userEvent.keyboard("{Space}");

        expect(onclick).toHaveBeenCalledTimes(2);
    });

    it("is neither activatable nor focusable when disabled", async () => {
        const onclick = vi.fn();
        render(Button, { children: label("Save"), disabled: true, onclick });
        const button = screen.getByRole("button", { name: "Save" });

        expect(button).toBeDisabled();

        await userEvent.tab();
        await userEvent.keyboard("{Enter}");

        expect(button).not.toHaveFocus();
        expect(onclick).not.toHaveBeenCalled();
    });

    it("renders a link when given an href", () => {
        render(Button, { children: label("Home"), href: "/home" });

        expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    });

    it("renders a disabled link that cannot navigate or take focus", async () => {
        render(Button, { children: label("Home"), href: "/home", disabled: true });
        const link = screen.getByRole("link", { name: "Home" });

        expect(link).not.toHaveAttribute("href");
        expect(link).toHaveAttribute("aria-disabled", "true");

        await userEvent.tab();

        expect(link).not.toHaveFocus();
    });

    it("renders the icon snippets around the label", () => {
        render(Button, {
            children: label("Continue"),
            leadingIcon: label("lead"),
            trailingIcon: label("trail")
        });

        expect(screen.getByRole("button").textContent?.split(/\s+/).filter(Boolean)).toEqual(["lead", "Continue", "trail"]);
    });

    // The size ramp is only a ramp if every step is distinct. `text-md`
    // generated no CSS until the token layer was repaired, which collapsed two
    // of these steps onto whatever the button inherited — invisible to lint, to
    // check, and to the eye.
    it.each([
        { size: "sm", height: 36, padding: "16px", font: "13px" },
        { size: "md", height: 40, padding: "22px", font: "14px" },
        { size: "lg", height: 44, padding: "28px", font: "15px" },
        { size: "xl", height: 52, padding: "32px", font: "16px" }
    ] as const)("sizes $size to a ${height}px box with $padding padding and $font text", ({ size, height, padding, font }) => {
        render(Button, { children: label("Go"), size });
        const button = screen.getByRole("button", { name: "Go" });
        const style = getComputedStyle(button);

        expect({ height: button.getBoundingClientRect().height, padding: style.paddingLeft, font: style.fontSize }).toEqual({
            height,
            padding,
            font
        });
    });

    it("gives the icon size a padding-free square box", () => {
        render(Button, { children: label("Go"), size: "icon" });
        const button = screen.getByRole("button", { name: "Go" });
        const box = button.getBoundingClientRect();

        expect([box.width, box.height]).toEqual([40, 40]);
        expect(getComputedStyle(button).paddingLeft).toBe("0px");
    });

    it("drops the size box on the link variant", () => {
        render(Button, { children: label("Go"), variant: "link", size: "lg" });
        const style = getComputedStyle(screen.getByRole("button", { name: "Go" }));

        expect(style.paddingLeft).toBe("0px");
        // Still the size's font — link opts out of the box, not the ramp.
        expect(style.fontSize).toBe("15px");
    });

    it("lifts the default fill on dark and holds the accent fill steady", () => {
        const light = brandFills("light");
        const dark = brandFills("dark");

        expect(dark.default).not.toBe(light.default);
        expect(dark.accent).toBe(light.accent);
    });

    it("keeps the default and accent fills distinct in both themes", () => {
        expect(brandFills("light").default).not.toBe(brandFills("light").accent);
        expect(brandFills("dark").default).not.toBe(brandFills("dark").accent);
    });

    it.each(["light", "dark"] as const)("paints the success tint with readable ink on the %s canvas", (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");

        try {
            render(Button, { children: label("Switch"), variant: "success", class: "transition-none" });
            const style = getComputedStyle(screen.getByRole("button", { name: "Switch" }));
            const [ink, fill] = [style.color, style.backgroundColor].map((colour) => luminance(channels(colour).rgb));
            const contrast = (Math.max(ink, fill) + 0.05) / (Math.min(ink, fill) + 0.05);

            expect(contrast).toBeGreaterThanOrEqual(4.5);
        } finally {
            document.documentElement.classList.remove("dark");
        }
    });

    // `transition-none` is the point of the class prop: the fill animates over 200ms,
    // so an unsuppressed read lands mid-flight and passes on a colour neither state
    // paints. The opacity half is what catches `bg-destructive/90` — a slash modifier
    // moves the alpha and leaves the channels, so the fill still reads as a colour it
    // never actually paints. Which way it steps is the canvas's business, not the red's:
    // down from the light one, up from the dark one, as --primary-hover already does.
    it.each([
        { theme: "light", lighter: false },
        { theme: "dark", lighter: true }
    ] as const)("steps the destructive fill away from the $theme canvas on hover", async ({ theme, lighter }) => {
        document.documentElement.classList.toggle("dark", theme === "dark");

        try {
            render(Button, { children: label("Delete"), variant: "destructive", class: "transition-none" });
            const button = screen.getByRole("button", { name: "Delete" });
            const fill = () => channels(getComputedStyle(button).backgroundColor);
            const resting = luminance(fill().rgb);

            await userEvent.hover(button);
            const hovered = luminance(fill().rgb);

            expect({ moved: lighter ? hovered > resting : hovered < resting, opaque: fill().alpha === 1 }).toEqual({
                moved: true,
                opaque: true
            });
        } finally {
            document.documentElement.classList.remove("dark");
        }
    });
});
