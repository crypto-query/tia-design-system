import { cdp } from "@vitest/browser/context";
import type {} from "@vitest/browser/providers/playwright";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import Checkbox from "./Checkbox.svelte";
import Harness from "./Checkbox.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not — without this every render stacks up.
afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
});

/** WCAG relative luminance of an `rgb(…)` string the browser has already resolved. */
function luminance(colour: string): number {
    const [r, g, b] = (colour.match(/\d+(\.\d+)?/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
            const srgb = channel / 255;
            return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
        }) as [number, number, number];

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
    const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];

    return (lighter + 0.05) / (darker + 0.05);
}

/** What a utility paints, read off a throwaway element — the harness leaves `body` unpainted,
    so reading a canvas colour off it scores every ink against black. */
function paints(className: string): string {
    const probe = document.createElement("div");

    probe.className = className;
    document.body.append(probe);

    const painted = getComputedStyle(probe).backgroundColor;

    probe.remove();
    return painted;
}

describe("Checkbox", () => {
    it.each(["light", "dark"] as const)("draws selectable and locked cards distinctly in %s mode", async (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        const view = render(Harness, { variant: "card", label: "Strategy", description: "Details" });
        const box = screen.getByRole("checkbox", { name: "Strategy" });
        const row = screen.getByText("Strategy").closest("label");
        if (!row) throw new Error("Missing checkbox label");
        const fill = getComputedStyle(row).backgroundColor;
        const border = getComputedStyle(row).borderTopColor;
        expect(getComputedStyle(row).borderTopWidth).toBe("1px");
        expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
        await fireEvent.click(screen.getByText("Details"));
        expect(box).toBeChecked();
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=true");
        expect(getComputedStyle(row).backgroundColor).not.toBe(fill);
        expect(getComputedStyle(row).borderTopColor).not.toBe(border);
        const selectedFill = getComputedStyle(row).backgroundColor;
        await view.rerender({ disabled: true, locked: true });
        expect(box).toBeDisabled();
        expect(box).toHaveAccessibleDescription("Details");
        expect(getComputedStyle(box).opacity).toBe("0.5");
        expect(getComputedStyle(row).backgroundColor).not.toBe(selectedFill);
        expect(row.querySelector(":scope > svg[aria-hidden=true]")).not.toBeNull();
        await fireEvent.click(screen.getByText("Details"));
        expect(box).toBeChecked();
        await view.rerender({ locked: false });
        expect(row.querySelector(":scope > svg")).toBeNull();
        document.documentElement.classList.remove("dark");
    });

    it("keeps mixed and error states on a card and forwards its outer radius", async () => {
        render(Harness, { variant: "card", label: "Strategies", indeterminate: true, error: true, locked: true, class: "rounded-full" });
        const box = screen.getByRole("checkbox", { name: "Strategies" });
        const row = screen.getByText("Strategies").closest("label");
        if (!row) throw new Error("Missing checkbox label");
        expect(box).toHaveAttribute("aria-checked", "mixed");
        expect(box).toHaveAttribute("aria-invalid", "true");
        expect(row.querySelector("svg")).toBeNull();
        expect(parseFloat(getComputedStyle(row).borderTopLeftRadius)).toBeGreaterThanOrEqual(row.getBoundingClientRect().height / 2);
        await fireEvent.keyDown(box, { key: " " });
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=true indeterminate=false");
        expect(getComputedStyle(box).backgroundColor).toBe(getComputedStyle(screen.getByText("Strategies")).color);
        expect(box).toBeEnabled();
    });

    it("is a checkbox named by its label", () => {
        render(Checkbox, { label: "Email alerts" });

        expect(screen.getByRole("checkbox", { name: "Email alerts" })).toBeInTheDocument();
    });

    it("takes its description from the description, not its name", () => {
        render(Checkbox, { label: "Email alerts", description: "Get notified the moment a strategy fires a signal." });

        expect(screen.getByRole("checkbox", { name: "Email alerts" })).toHaveAccessibleDescription(
            "Get notified the moment a strategy fires a signal."
        );
    });

    it("renders optional trailing card content without changing the lock fallback", () => {
        const { rerender } = render(Checkbox, {
            variant: "card",
            label: "Strategy",
            trailing: createRawSnippet(() => ({ render: () => "<span>$990/yr</span>" }))
        });

        const row = screen.getByText("Strategy").closest("label");
        if (!row) throw new Error("Missing card row");
        expect(screen.getByText("$990/yr")).toBeVisible();
        expect(row.querySelector(":scope > svg[aria-hidden=true]")).toBeNull();

        rerender({ variant: "card", label: "Strategy", disabled: true, locked: true, trailing: undefined });
        expect(screen.getByRole("checkbox", { name: "Strategy" })).toBeDisabled();
        expect(row.querySelector(":scope > svg[aria-hidden=true]")).not.toBeNull();
    });

    it("shares a narrow card row between the label and a long trailing note", () => {
        const narrow = document.createElement("div");
        narrow.style.width = "200px";
        document.body.append(narrow);
        try {
            render(Checkbox, {
                target: narrow,
                props: {
                    variant: "card",
                    label: "Momentum strategy",
                    trailing: createRawSnippet(() => ({ render: () => "<span>You already have this</span>" }))
                }
            });
            const label = screen.getByText("Momentum strategy").getBoundingClientRect();
            const note = screen.getByText("You already have this").getBoundingClientRect();

            expect(label.width).toBeGreaterThan(40);
            expect(label.right).toBeLessThanOrEqual(note.left);
            expect(note.right).toBeLessThanOrEqual(narrow.getBoundingClientRect().right);
        } finally {
            narrow.remove();
        }
    });

    it.each([
        { state: "unchecked", props: {}, aria: "false" },
        { state: "checked", props: { checked: true }, aria: "true" },
        { state: "indeterminate", props: { indeterminate: true }, aria: "mixed" }
    ])("reports $state as aria-checked=$aria", ({ props, aria }) => {
        render(Checkbox, { label: "Select all", ...props });

        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", aria);
    });

    it("draws a dash for the mixed state where checked draws a check", () => {
        const { container: mixed } = render(Checkbox, { indeterminate: true });
        const { container: checked } = render(Checkbox, { checked: true });

        expect(mixed.querySelector("svg")).toBeNull();
        expect(checked.querySelector("svg")).not.toBeNull();
    });

    it("holds no mark at all until it is checked", () => {
        const { container } = render(Checkbox);

        expect(container.querySelector("[role=checkbox] > *")).toBeNull();
    });

    it("draws the check when selected and removes it when cleared", async () => {
        render(Harness, { label: "Select" });
        await fireEvent.click(screen.getByRole("checkbox"));
        const path = screen.getByRole("checkbox").querySelector("path");
        if (!path) throw new Error("Missing check");
        expect(getComputedStyle(path).strokeDasharray).toBe("24px");
        expect(getComputedStyle(path).transitionDuration).toBe("0.3s");
        expect(getComputedStyle(path).transitionTimingFunction).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
        const animation = path.getAnimations()[0];
        if (!animation) throw new Error("Missing check transition");
        animation.pause();
        animation.currentTime = 0;
        expect(parseFloat(getComputedStyle(path).strokeDashoffset)).toBe(24);
        animation.currentTime = 150;
        expect(parseFloat(getComputedStyle(path).strokeDashoffset)).toBeGreaterThan(0);
        expect(parseFloat(getComputedStyle(path).strokeDashoffset)).toBeLessThan(24);
        animation.finish();
        await waitFor(() => expect(getComputedStyle(path).strokeDashoffset).toBe("0px"));
        await fireEvent.click(screen.getByRole("checkbox"));
        expect(screen.getByRole("checkbox").querySelector("path")).toBeNull();
    });

    it("shows the full check immediately under reduced motion", async () => {
        await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        try {
            render(Harness, { label: "Select" });
            await fireEvent.click(screen.getByRole("checkbox"));
            const path = screen.getByRole("checkbox").querySelector("path");
            if (!path) throw new Error("Missing check");
            expect(getComputedStyle(path).strokeDashoffset).toBe("0px");
            expect(path.getAnimations()).toHaveLength(0);
        } finally {
            await cdp().send("Emulation.setEmulatedMedia", { features: [] });
        }
    });

    it("toggles on space and hands the new value back to the binding", async () => {
        render(Harness, { label: "Remember me" });
        const box = screen.getByRole("checkbox", { name: "Remember me" });

        await fireEvent.keyDown(box, { key: " " });

        expect(box).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=true");
    });

    it("resolves the mixed state to checked when toggled", async () => {
        render(Harness, { label: "All strategies", indeterminate: true });
        const box = screen.getByRole("checkbox", { name: "All strategies" });

        await fireEvent.keyDown(box, { key: " " });

        expect(box).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=true indeterminate=false");
    });

    it("toggles when the label is clicked", async () => {
        render(Harness, { label: "Remember me" });

        await fireEvent.click(screen.getByText("Remember me"));

        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=true");
    });

    it("toggles when the description is clicked", async () => {
        render(Harness, { label: "Email alerts", description: "Get notified the moment a strategy fires a signal." });

        await fireEvent.click(screen.getByText("Get notified the moment a strategy fires a signal."));

        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
    });

    it("does not toggle while disabled", async () => {
        render(Harness, { label: "Locked", disabled: true });
        const box = screen.getByRole("checkbox", { name: "Locked" });

        await fireEvent.click(box);
        await fireEvent.keyDown(box, { key: " " });
        await fireEvent.click(screen.getByText("Locked"));

        expect(box).toBeDisabled();
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=false");
    });

    it("paints the error state's box and label apart from the default", () => {
        render(Checkbox, { label: "Terms", "data-testid": "plain" });
        render(Checkbox, { label: "Terms unaccepted", error: true, "data-testid": "invalid" });

        expect(getComputedStyle(screen.getByTestId("invalid")).borderTopColor).not.toBe(
            getComputedStyle(screen.getByTestId("plain")).borderTopColor
        );
        expect(getComputedStyle(screen.getByText("Terms unaccepted")).color).not.toBe(getComputedStyle(screen.getByText("Terms")).color);
    });

    // Read in both themes: the two reds are only far enough apart to tell on the
    // navy canvas, which is how the mismatch shipped in the first place.
    it.each(["light", "dark"] as const)("draws the empty error box in the colour of its label in %s mode", (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        render(Checkbox, { label: "Accept the terms", error: true, "data-testid": "box" });

        const border = getComputedStyle(screen.getByTestId("box")).borderTopColor;
        const ink = getComputedStyle(screen.getByText("Accept the terms")).color;

        document.documentElement.classList.remove("dark");
        expect(border).toBe(ink);
    });

    it.each(["light", "dark"] as const)("fills a checked error box in the colour of its label in %s mode", (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        render(Checkbox, { label: "Accept the terms", error: true, checked: true, "data-testid": "box" });

        const style = getComputedStyle(screen.getByTestId("box"));
        const ink = getComputedStyle(screen.getByText("Accept the terms")).color;

        document.documentElement.classList.remove("dark");
        expect({ fill: style.backgroundColor, border: style.borderTopColor }).toEqual({ fill: ink, border: ink });
    });

    // The four colours are one decision, and it holds inside a theme rather than across the
    // two: box, label and mark move together, or the red reads as a fill in one place and as
    // a message in another. The label is scored on `--surface`, which is the box's own empty
    // fill and the panel a form sits on.
    it.each(["light", "dark"] as const)("ties the error box, its mark and its label to one red in %s mode", (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        const { container } = render(Checkbox, { label: "Accept the terms", error: true, checked: true, "data-testid": "box" });

        const box = getComputedStyle(screen.getByTestId("box"));
        const fill = box.backgroundColor;
        const ink = getComputedStyle(screen.getByText("Accept the terms")).color;
        const mark = getComputedStyle(container.querySelector("path") as SVGPathElement).stroke;
        const surface = paints("bg-surface");

        document.documentElement.classList.remove("dark");
        expect({
            border: box.borderTopColor,
            fill,
            markOnFill: contrast(mark, fill) >= 3,
            inkOnSurface: contrast(ink, surface) >= 4.5
        }).toEqual({ border: ink, fill: ink, markOnFill: true, inkOnSurface: true });
    });

    // Stops the mark drifting back to `--surface`: navy in dark, 2.9:1 on the fill.
    it.each(["light", "dark"] as const)("keeps the error check legible on its own fill in %s mode", (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        const { container } = render(Checkbox, { error: true, checked: true, "aria-label": "Terms", "data-testid": "box" });

        const path = container.querySelector("path");
        const mark = getComputedStyle(path as SVGPathElement).stroke;
        const fill = getComputedStyle(screen.getByTestId("box")).backgroundColor;

        document.documentElement.classList.remove("dark");
        expect(contrast(mark, fill)).toBeGreaterThanOrEqual(3);
    });

    it("reports the error state as invalid", () => {
        render(Checkbox, { label: "Accept the terms", error: true });

        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("leaves a checkbox that is not in error unmarked", () => {
        render(Checkbox, { label: "Accept the terms" });

        expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-invalid");
    });

    // A name from the call site has to survive the rest spread rather than be
    // blanked by the explicit attribute that follows it.
    it("keeps a name the call site supplied", () => {
        render(Checkbox, { "aria-label": "Select every row" });

        expect(screen.getByRole("checkbox", { name: "Select every row" })).toBeInTheDocument();
    });

    it("keeps an aria-labelledby the call site supplied", () => {
        const heading = document.createElement("span");
        heading.id = "external-name";
        heading.textContent = "Select every row";
        document.body.append(heading);

        render(Checkbox, { "aria-labelledby": "external-name" });

        expect(screen.getByRole("checkbox", { name: "Select every row" })).toBeInTheDocument();
        heading.remove();
    });

    it("fills the box once it is checked", () => {
        render(Checkbox, { "data-testid": "off" });
        render(Checkbox, { checked: true, "data-testid": "on" });

        expect(getComputedStyle(screen.getByTestId("on")).backgroundColor).not.toBe(
            getComputedStyle(screen.getByTestId("off")).backgroundColor
        );
    });

    it.each([
        { size: "sm", box: 16 },
        { size: "md", box: 20 },
        { size: "lg", box: 24 }
    ] as const)("draws the $size box $box px square", ({ size, box }) => {
        render(Checkbox, { size, "data-testid": "box" });

        const rect = screen.getByTestId("box").getBoundingClientRect();

        expect([rect.width, rect.height]).toEqual([box, box]);
    });

    // The reference's own `round(box * 0.8)` widths. Sized as a percentage the mark
    // drew a whole step small, and the box test above stayed green throughout.
    it.each([
        { size: "sm", mark: 13 },
        { size: "md", mark: 16 },
        { size: "lg", mark: 19 }
    ] as const)("draws the $size check $mark px across", ({ size, mark }) => {
        const { container } = render(Checkbox, { size, checked: true });
        const svg = container.querySelector("svg");

        expect(svg).not.toBeNull();
        expect((svg as SVGSVGElement).getBoundingClientRect().width).toBe(mark);
    });

    it.each([
        { size: "sm", dash: 7 },
        { size: "md", dash: 9 },
        { size: "lg", dash: 11 }
    ] as const)("draws the $size mixed dash $dash px across", ({ size, dash }) => {
        const { container } = render(Checkbox, { size, indeterminate: true });
        const bar = container.querySelector("[role=checkbox] > span");

        expect(bar).not.toBeNull();
        expect((bar as HTMLSpanElement).getBoundingClientRect().width).toBe(dash);
    });

    it("lets a forwarded class beat the component's own", () => {
        render(Checkbox, { "data-testid": "box", class: "rounded-none" });

        expect(getComputedStyle(screen.getByTestId("box")).borderTopLeftRadius).toBe("0px");
    });
});
