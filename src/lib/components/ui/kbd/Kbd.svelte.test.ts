import { cleanup, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import Harness from "./Kbd.test-harness.svelte";
import "../../../../app.css";

afterEach(cleanup);

describe("Kbd", () => {
    it("draws a real `<kbd>` carrying its children", () => {
        render(Harness);

        const chip = screen.getByTestId("escaped");

        expect(chip.tagName).toBe("KBD");
        expect(chip).toHaveTextContent("esc");
    });

    it("lets a caller's class reach the element it draws", () => {
        render(Harness);

        expect(getComputedStyle(screen.getByTestId("escaped")).borderRadius).toBe("100px");
    });

    // The whole reason for the fixed height, grid centring and `align-middle` rather than
    // the reference's padding: a padded chip's line box is taller than the type beside it,
    // so the chip — not the type — sets the row's height. Measured on `SearchTrigger`
    // before the fix, at 48px with a chip against 45px without. See `Kbd.md`.
    //
    // Under a pixel rather than equal: centring an 18px box on the x-height leaves about
    // 1/32px of rounding, which no one can see. The bound is what distinguishes that from
    // a real regression — dropping `align-middle` alone puts it back over 0.4px, and
    // going back to padding puts it over 3px.
    it("does not set the height of a row it sits in", () => {
        render(Harness);

        const bare = screen.getByTestId("bare").getBoundingClientRect().height;
        const chipped = screen.getByTestId("chipped").getBoundingClientRect().height;

        expect(Math.abs(chipped - bare)).toBeLessThan(1);
    });
});
