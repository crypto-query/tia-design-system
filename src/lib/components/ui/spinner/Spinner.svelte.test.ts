import { cleanup, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import Spinner from "./Spinner.svelte";
import "../../../../app.css";

// No globals here, so Testing Library never auto-cleans and a second render would
// leave two spinners answering the same query.
afterEach(cleanup);

function renderSpinner(props: Record<string, unknown> = {}) {
    return render(Spinner, { "data-testid": "spinner", ...props });
}

const root = () => screen.getByTestId("spinner");

/** The mark is the root's first child; a visible label, when there is one, is the second. */
const mark = () => root().firstElementChild as HTMLElement;

/** `ring` and `arc` animate the mark itself; the other four animate its children. */
const moving = () => (mark().firstElementChild ?? mark()) as HTMLElement;

/**
 * Resolves a token to the rgb the browser computes, so a tone is asserted against the
 * token it names rather than a hex this file would have to keep in step. The variant
 * map is a plain object literal that `better-tailwindcss` cannot see into, so a tone
 * naming a deleted token renders nothing while lint exits 0; this is what catches it.
 */
function tokenColour(token: string): string {
    const probe = document.createElement("span");
    probe.style.color = `var(${token})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
}

describe("Spinner", () => {
    it("is a status region named by its label", () => {
        renderSpinner();

        expect(screen.getByRole("status", { name: "Loading" })).toBe(root());
    });

    it("takes a caller's label as the accessible name", () => {
        renderSpinner({ label: "Fetching signals" });

        expect(screen.getByRole("status", { name: "Fetching signals" })).toBe(root());
    });

    // Closes the nested-live-region trap: see Spinner.md.
    it("leaves the accessibility tree entirely when decorative", () => {
        renderSpinner({ decorative: true });

        expect(screen.queryByRole("status")).toBeNull();
        expect(root().getAttribute("aria-hidden")).toBe("true");
        expect(root().getAttribute("aria-label")).toBeNull();
    });

    // `status` names from author only, so the visible text is the announcement rather
    // than the region's name, and an `aria-label` beside it would be a second copy.
    it("renders the label on screen when showLabel, and does not also carry it as an aria-label", () => {
        renderSpinner({ label: "Loading signals", showLabel: true });

        expect(screen.getByRole("status")).toBe(root());
        expect(screen.getByText("Loading signals")).toBeVisible();
        expect(screen.getAllByText("Loading signals")).toHaveLength(1);
        expect(root().getAttribute("aria-label")).toBeNull();
    });

    // The published extents. Lint and `check` both read a size class that generates
    // nothing as perfectly correct, so the contract needs an assertion.
    it.each([
        ["xs", "14px"],
        ["sm", "16px"],
        ["md", "20px"],
        ["lg", "28px"],
        ["xl", "40px"]
    ])("draws the %s step at %s", (size, extent) => {
        renderSpinner({ size });

        const box = getComputedStyle(mark());

        expect(box.width).toBe(extent);
        expect(box.height).toBe(extent);
    });

    it("takes an explicit px extent outside the five steps", () => {
        renderSpinner({ size: 52 });

        expect(getComputedStyle(mark()).width).toBe("52px");
    });

    // The ramp reaches the reference's `max(2, round(size * 0.11))` without a
    // `round()`: the fraction is left exact and the engine floors a border width to
    // whole pixels, landing on the same five numbers. Pinned, being a coincidence.
    it.each([
        ["xs", "2px"],
        ["sm", "2px"],
        ["md", "2px"],
        ["lg", "3px"],
        ["xl", "4px"]
    ])("strokes the %s ring at %s", (size, stroke) => {
        renderSpinner({ size });

        expect(getComputedStyle(mark()).borderTopWidth).toBe(stroke);
    });

    it.each(["ring", "arc", "dots", "bars", "pulse", "spokes"])("keeps %s moving", (variant) => {
        renderSpinner({ variant });

        const animation = getComputedStyle(moving());

        expect(animation.animationName).not.toBe("none");
        expect(Number.parseFloat(animation.animationDuration)).toBeGreaterThan(0);
        expect(animation.animationIterationCount).toBe("infinite");
    });

    // The half of the contract a stylesheet can get wrong silently: an `--animate-*`
    // holding a runtime value computes `animation-name` to `none` and every other
    // assertion here still passes.
    it.each([
        ["ring", 1, "0.7s"],
        ["ring", 2, "0.35s"],
        ["arc", 1, "0.85s"],
        ["dots", 2, "0.55s"],
        ["pulse", 0.5, "2.8s"]
    ])("scales %s's duration by speed %s", (variant, speed, duration) => {
        renderSpinner({ variant, speed });

        expect(getComputedStyle(moving()).animationDuration).toBe(duration);
    });

    it.each([
        ["brand", "--primary"],
        ["muted", "--foreground-subtle"],
        ["success", "--success"],
        ["warning", "--warning"],
        ["destructive", "--destructive"]
    ])("paints tone %s from %s", (tone, token) => {
        renderSpinner({ tone });

        expect(getComputedStyle(root()).color).toBe(tokenColour(token));
    });

    // Why a spinner dropped into a filled Button needs no prop at all.
    it("inherits the surrounding ink by default", () => {
        const { container } = renderSpinner();
        container.style.color = "rgb(12, 34, 56)";

        expect(getComputedStyle(root()).color).toBe("rgb(12, 34, 56)");
        expect(getComputedStyle(mark()).borderTopColor).toBe("rgb(12, 34, 56)");
    });

    // The mark is `shrink-0` on its own, so a squeezed root leaves it drawing outside its own box.
    it("keeps its whole box in a narrow flex row, and still lets a label wrap", () => {
        const { container } = renderSpinner({ size: "md" });
        container.style.cssText = "display: flex; width: 24px";

        expect(root().offsetWidth).toBe(mark().offsetWidth);
        expect(getComputedStyle(root()).flexShrink).toBe("0");

        cleanup();

        renderSpinner({ size: "md", showLabel: true });

        expect(getComputedStyle(root()).minWidth).toBe("0px");
    });

    it("drops the visible label a step at the two smallest extents", () => {
        renderSpinner({ size: "sm", showLabel: true });
        expect(getComputedStyle(screen.getByText("Loading")).fontSize).toBe("13px");

        cleanup();

        renderSpinner({ size: "md", showLabel: true });
        expect(getComputedStyle(screen.getByText("Loading")).fontSize).toBe("14px");
    });
});
