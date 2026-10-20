import { cleanup, render, screen } from "@testing-library/svelte";
import { userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import Switch from "./Switch.svelte";
import Harness from "./Switch.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals enabled.
afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
});

describe("Switch", () => {
    it("is a switch named by its label and described by its description", () => {
        render(Switch, { label: "Log scale", description: "Makes large moves easier to compare." });

        const control = screen.getByRole("switch", { name: "Log scale" });
        expect(control).toHaveAccessibleDescription("Makes large moves easier to compare.");
        expect(control).toHaveAttribute("aria-checked", "false");
    });

    it("toggles from a click on its label and writes the bound value back", async () => {
        render(Harness, { label: "Tooltip" });

        await userEvent.click(screen.getByText("Tooltip"));

        expect(screen.getByRole("switch", { name: "Tooltip" })).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=true");
    });

    it("does not toggle when disabled", async () => {
        render(Harness, { label: "Volume", disabled: true });

        await userEvent.click(screen.getByText("Volume"), { force: true });

        expect(screen.getByRole("switch", { name: "Volume" })).toBeDisabled();
        expect(screen.getByTestId("bound")).toHaveTextContent("checked=false");
    });

    it.each(["light", "dark"] as const)("moves the thumb and fills the track when on, in %s mode", async (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        render(Harness, { "aria-label": "Bare" });
        const control = screen.getByRole("switch", { name: "Bare" });
        const thumb = control.firstElementChild as HTMLElement;
        const offTrack = getComputedStyle(control).backgroundColor;
        const offLeft = thumb.getBoundingClientRect().left;

        await userEvent.click(control);

        await expect.poll(() => thumb.getBoundingClientRect().left - offLeft).toBe(12);
        expect(getComputedStyle(control).backgroundColor).not.toBe(offTrack);
        // The thumb stays visible against both tracks: it is not the track's colour.
        expect(getComputedStyle(thumb).backgroundColor).not.toBe(getComputedStyle(control).backgroundColor);
        expect(getComputedStyle(thumb).backgroundColor).not.toBe(offTrack);
        const box = control.getBoundingClientRect();
        expect([box.width, box.height]).toEqual([30, 18]);
    });
});
