import { cleanup, render, screen } from "@testing-library/svelte";
import { userEvent } from "@vitest/browser/context";
import { createRawSnippet, type ComponentProps } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Card from "./Card.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with
// globals enabled, which this project does not. Without this, every render
// stacks up and the region query finds several cards.
afterEach(cleanup);

/** Body copy, so the card has something to render and something to clip. */
const body = (text: string) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }));

/**
 * Renders a card as a labelled region so it can be queried the way assistive
 * technology finds it, rather than by reaching for its class or its DOM
 * position. `role` and `aria-label` travel through the component's rest props,
 * which is how a consumer would label a real panel.
 */
function renderCard(props: ComponentProps<typeof Card> = {}) {
    const label = props["aria-label"] ?? "Panel";
    render(Card, { children: body("Card body"), role: "region", ...props, "aria-label": label });
    return screen.getByRole("region", { name: label });
}

/**
 * Whether a computed box-shadow paints anything. Chromium reports Tailwind's
 * `shadow-none` as a chain of fully transparent shadows rather than the
 * keyword, because the utility zeroes the shadow variables the ring and inset
 * layers are composed from.
 */
const paints = (shadow: string) => shadow !== "none" && !/^(?:rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(?:, )?)+$/.test(shadow);

describe("Card", () => {
    it("renders its children", () => {
        renderCard();

        expect(screen.getByText("Card body")).toBeInTheDocument();
    });

    // Radius and padding are the two published geometry contracts. `soft` is
    // deliberately absent: it and `xl` are the same 16px in the reference.
    it.each([
        { radius: undefined, expected: "16px" },
        { radius: "lg", expected: "10px" },
        { radius: "xl", expected: "16px" },
        { radius: "2xl", expected: "24px" }
    ] as const)("rounds radius=$radius to $expected", ({ radius, expected }) => {
        expect(getComputedStyle(renderCard({ radius })).borderTopLeftRadius).toBe(expected);
    });

    it.each([
        { padding: undefined, expected: "32px" },
        { padding: "none", expected: "0px" },
        { padding: "sm", expected: "16px" },
        { padding: "md", expected: "24px" },
        { padding: "lg", expected: "32px" }
    ] as const)("pads padding=$padding to $expected", ({ padding, expected }) => {
        expect(getComputedStyle(renderCard({ padding })).paddingTop).toBe(expected);
    });

    // A full-bleed child has to stop at the rounded corner, or the strategy
    // cards phase 2 builds on will show square image corners over a round card.
    it("clips its content to the radius", () => {
        expect(getComputedStyle(renderCard()).overflow).toBe("hidden");
    });

    it("gives each resting treatment its own shadow", () => {
        const flat = getComputedStyle(renderCard({ flat: true, "aria-label": "Flat" })).boxShadow;
        const base = getComputedStyle(renderCard({ "aria-label": "Default" })).boxShadow;
        const elevated = getComputedStyle(renderCard({ elevated: true, "aria-label": "Elevated" })).boxShadow;

        expect(paints(flat)).toBe(false);
        expect(paints(base)).toBe(true);
        expect(elevated).not.toBe(base);
    });

    it("frosts a glass card", () => {
        const plain = getComputedStyle(renderCard({ "aria-label": "Plain" }));
        const glass = getComputedStyle(renderCard({ glass: true, "aria-label": "Frosted" }));

        expect(glass.backdropFilter).not.toBe("none");
        expect(glass.backgroundColor).not.toBe(plain.backgroundColor);
    });

    // The two hover treatments are separate props precisely because they must
    // not behave alike: one moves, the other must never move.
    it("lifts and deepens an interactive card on hover", async () => {
        const card = renderCard({ interactive: true });
        const resting = getComputedStyle(card);

        expect(resting.translate).toBe("none");
        const shadowAtRest = resting.boxShadow;

        await userEvent.hover(card);

        await vi.waitFor(() => {
            expect(getComputedStyle(card).translate).not.toBe("none");
            expect(getComputedStyle(card).boxShadow).not.toBe(shadowAtRest);
        });
    });

    it("deepens a hoverable card and accents its border without moving it", async () => {
        const card = renderCard({ hoverable: true });
        const resting = getComputedStyle(card);
        const borderAtRest = resting.borderTopColor;
        const shadowAtRest = resting.boxShadow;

        await userEvent.hover(card);

        await vi.waitFor(() => {
            expect(getComputedStyle(card).borderTopColor).not.toBe(borderAtRest);
            expect(getComputedStyle(card).boxShadow).not.toBe(shadowAtRest);
        });
        expect(getComputedStyle(card).translate).toBe("none");
    });
});
