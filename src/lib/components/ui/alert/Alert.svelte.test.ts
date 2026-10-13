import { cdp } from "@vitest/browser/context";
import type {} from "@vitest/browser/providers/playwright";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Alert from "./Alert.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with
// globals enabled, which this project does not. Without this, every render
// stacks up and the alert queries find several.
afterEach(cleanup);

/** Body copy, so the alert has something under its title. */
const body = (text: string) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }));

const variants = ["default", "info", "success", "warning", "destructive"] as const;
type Variant = (typeof variants)[number];

type Paint = { background: string; text: string; border: string };

/**
 * What the browser actually paints for each variant under one theme. The tints
 * and their strong text are semantic tokens that flip on their own, so this
 * reads the same component twice rather than looking for `dark:` classes —
 * which is exactly what the component must not have.
 */
function palette(theme: "light" | "dark"): Record<Variant, Paint> {
    document.documentElement.classList.toggle("dark", theme === "dark");

    const entries = variants.map((variant) => {
        render(Alert, { variant, title: variant, children: body("Body") });
        const style = getComputedStyle(screen.getByRole("alert", { name: variant }));
        return [variant, { background: style.backgroundColor, text: style.color, border: style.borderTopColor }] as const;
    });

    cleanup();
    document.documentElement.classList.remove("dark");
    return Object.fromEntries(entries) as Record<Variant, Paint>;
}

/** The glyph a variant draws, as the shapes a sighted user sees. */
function glyph(variant: Variant): string {
    const { container } = render(Alert, { variant, children: body("Body") });
    return container.querySelector("svg")?.innerHTML ?? "";
}

describe("Alert", () => {
    it("rises on entry while its message is already announced", async () => {
        render(Alert, { title: "Payment failed", children: body("Try another card.") });
        const alert = screen.getByRole("alert", { name: "Payment failed" });
        expect(alert).toHaveTextContent("Try another card.");
        const style = getComputedStyle(alert);
        expect(style.animationDuration).toBe("0.24s");
        expect(style.animationTimingFunction).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
        const animation = alert.getAnimations()[0];
        if (!animation) throw new Error("Missing entry animation");
        animation.pause();
        animation.currentTime = 0;
        expect(getComputedStyle(alert).opacity).toBe("0");
        expect(getComputedStyle(alert).transform).toBe("matrix(1, 0, 0, 1, 0, 6)");
        animation.finish();
        await waitFor(() => expect(getComputedStyle(alert).opacity).toBe("1"));
        expect(alert).toBeVisible();
    });

    it("keeps the message visible without travel under reduced motion", async () => {
        await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        try {
            render(Alert, { title: "Payment failed" });
            const alert = screen.getByRole("alert", { name: "Payment failed" });
            expect(getComputedStyle(alert).animationName).toBe("none");
            expect(getComputedStyle(alert).transform).toBe("none");
            await waitFor(() => expect(getComputedStyle(alert).opacity).toBe("1"));
            expect(alert).toBeVisible();
        } finally {
            await cdp().send("Emulation.setEmulatedMedia", { features: [] });
        }
    });

    it("renders with an alert role", () => {
        render(Alert);
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("renders its children", () => {
        render(Alert, { children: body("Signals resume when the session reopens.") });

        expect(screen.getByText("Signals resume when the session reopens.")).toBeInTheDocument();
    });

    // The title is what tells assistive technology which notice this is, so it
    // has to name the alert rather than merely sit inside it.
    it("takes its accessible name from its title", () => {
        render(Alert, { variant: "destructive", title: "Subscription failed", children: body("Please enter a valid email address.") });

        expect(screen.getByRole("alert", { name: "Subscription failed" })).toBeInTheDocument();
    });

    it("has no accessible name without a title", () => {
        render(Alert, { children: body("A plain notice with no title.") });

        expect(screen.getByRole("alert")).not.toHaveAccessibleName();
    });

    it("renders the title above the body", () => {
        render(Alert, { title: "Markets closed", children: body("Signals resume when the session reopens.") });
        const title = screen.getByText("Markets closed");
        const copy = screen.getByText("Signals resume when the session reopens.");

        expect(title.compareDocumentPosition(copy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    // Colour is not the only carrier: each variant draws its own shape, so the
    // five stay apart for a reader who cannot distinguish the tints.
    it("draws a different default icon for each variant", () => {
        expect(new Set(variants.map(glyph)).size).toBe(variants.length);
    });

    // The tint says nothing to a screen reader, so the glyph that stands in for
    // it has to be announced rather than hidden as decoration.
    it.each([
        { variant: "info", status: "Information" },
        { variant: "success", status: "Success" },
        { variant: "warning", status: "Warning" },
        { variant: "destructive", status: "Error" }
    ] as const)("announces the $variant glyph as $status", ({ variant, status }) => {
        render(Alert, { variant, children: body("Body") });

        expect(screen.getByRole("img", { name: status })).toBeInTheDocument();
    });

    it("leaves the default variant's bell decorative, having no status to announce", () => {
        render(Alert, { children: body("Body") });

        expect(screen.queryByRole("img")).toBeNull();
    });

    it("renders the given icon instead of the variant default", () => {
        const { container } = render(Alert, {
            variant: "success",
            icon: createRawSnippet(() => ({ render: () => `<span>custom</span>` })),
            children: body("Body")
        });

        expect(screen.getByText("custom")).toBeInTheDocument();
        expect(container.querySelector("svg")).toBeNull();
    });

    it("renders no icon at all when icon is false", () => {
        const { container } = render(Alert, { variant: "warning", icon: false, children: body("Body") });

        expect(container.querySelector("svg")).toBeNull();
        expect(screen.getByText("Body")).toBeInTheDocument();
    });

    it("has no close button unless it can be dismissed", () => {
        render(Alert, { variant: "destructive", children: body("Body") });

        expect(screen.queryByRole("button")).toBeNull();
    });

    it("draws a named close button that calls onDismiss", async () => {
        const onDismiss = vi.fn();
        render(Alert, { variant: "destructive", onDismiss, children: body("Body") });
        const close = screen.getByRole("button", { name: "Dismiss" });

        await fireEvent.click(close);

        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(close.getBoundingClientRect().width).toBe(32);
    });

    it("keeps a one-line alert at its own height with a close button", () => {
        render(Alert, { variant: "destructive", children: body("One line") });
        render(Alert, { variant: "destructive", onDismiss: () => {}, children: body("One line") });

        const [plain, closable] = screen.getAllByRole("alert").map((alert) => alert.getBoundingClientRect().height);
        expect(closable).toBe(plain);
    });

    // Five variants that share a tint, a text colour or a border are four
    // variants with a spare name. Read in both themes because the tints are only
    // distinct in dark mode since the token layer was repaired — before that
    // they were defined for light alone.
    it.each(["light", "dark"] as const)("gives every variant its own tint, text colour and border in %s mode", (theme) => {
        const painted = Object.values(palette(theme));

        expect(new Set(painted.map((p) => p.background)).size).toBe(variants.length);
        expect(new Set(painted.map((p) => p.text)).size).toBe(variants.length);
        expect(new Set(painted.map((p) => p.border)).size).toBe(variants.length);
    });

    // `src/tokens.svelte.test.ts` pins that the tints themselves flip. This pins
    // the separate thing: that the component is on those tints rather than on
    // the off-system palette colours it used to carry, which stayed light-mode
    // pale and needed a `dark:` override to compensate.
    it("repaints the status tints between themes", () => {
        const light = palette("light");
        const dark = palette("dark");

        for (const variant of variants) {
            expect(dark[variant].background).not.toBe(light[variant].background);
        }
    });
});
