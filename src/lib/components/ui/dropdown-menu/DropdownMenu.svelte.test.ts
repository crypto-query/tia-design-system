import { cleanup, render, screen, waitFor, within } from "@testing-library/svelte";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import Harness from "./DropdownMenu.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals enabled.
afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
});

// The primitive can run its open focus again a frame later, which would undo a key pressed in between.
function settle(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function trigger(): HTMLElement {
    return screen.getByRole("button", { name: "Settings" });
}

async function openMenu(): Promise<HTMLElement> {
    await userEvent.click(trigger());
    return screen.findByRole("menu", { name: "Settings" });
}

describe("DropdownMenu", () => {
    it("opens a named menu from the trigger, with labelled groups and a separator", async () => {
        render(Harness);
        expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
        expect(trigger()).toHaveAttribute("aria-expanded", "false");

        const menu = await openMenu();

        expect(trigger()).toHaveAttribute("aria-expanded", "true");
        expect(within(menu).getByRole("group", { name: "Actions" })).toBeInTheDocument();
        expect(within(menu).getByRole("group", { name: "Show" })).toBeInTheDocument();
        expect(within(menu).getByRole("separator")).toBeInTheDocument();
    });

    it("names an item by its label and describes it by its description", async () => {
        render(Harness);
        const menu = await openMenu();

        const clear = within(menu).getByRole("menuitem", { name: "Clear" });
        expect(clear).toHaveAccessibleDescription("Hides every line except Actual.");
        expect(within(menu).getByRole("menuitemcheckbox", { name: "Tooltip" })).toHaveAccessibleDescription(
            "Values of the day under the pointer."
        );
    });

    it("runs an action, closes, and returns focus to the trigger", async () => {
        render(Harness);
        const menu = await openMenu();

        await userEvent.click(within(menu).getByRole("menuitem", { name: "Clear" }));

        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
        expect(screen.getByTestId("state")).toHaveTextContent("selected=Clear");
        await waitFor(() => expect(trigger()).toHaveFocus());
    });

    it("toggles a checkbox item and stays open", async () => {
        render(Harness);
        const menu = await openMenu();
        const logScale = within(menu).getByRole("menuitemcheckbox", { name: "Log scale" });
        expect(logScale).toHaveAttribute("aria-checked", "false");

        await userEvent.click(logScale);

        expect(logScale).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("state")).toHaveTextContent("open=true tooltip=true logScale=true");
        expect(screen.getByRole("menu")).toBeVisible();
        // The switch is a picture, not a second control in the row.
        expect(logScale.querySelector("button, [tabindex='0'], [role=switch]")).toBeNull();
    });

    it("moves a visible highlight with the arrow keys, skips the disabled item and toggles with Space", async () => {
        render(Harness);
        // Park the pointer on the trigger, clear of where the panel opens: a row under it takes the highlight.
        await userEvent.hover(trigger());
        trigger().focus();
        await userEvent.keyboard("{Enter}");
        const menu = await screen.findByRole("menu");

        const clear = within(menu).getByRole("menuitem", { name: "Clear" });
        await waitFor(() => expect(clear).toHaveAttribute("data-highlighted"));
        await settle();
        const panelFill = getComputedStyle(menu).backgroundColor;
        expect(getComputedStyle(clear).backgroundColor).not.toBe(panelFill);

        const exportItem = within(menu).getByRole("menuitem", { name: "Export" });
        expect(exportItem).toHaveAttribute("aria-disabled", "true");
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(within(menu).getByRole("menuitem", { name: "Reset" })).toHaveAttribute("data-highlighted"));
        await settle();

        await userEvent.keyboard("{ArrowDown}");
        const tooltip = within(menu).getByRole("menuitemcheckbox", { name: "Tooltip" });
        await waitFor(() => expect(tooltip).toHaveAttribute("data-highlighted"));
        await settle();
        await userEvent.keyboard(" ");
        await waitFor(() => expect(tooltip).toHaveAttribute("aria-checked", "false"));
        expect(screen.getByRole("menu")).toBeVisible();
    });

    it("does not run a disabled action", async () => {
        render(Harness);
        const menu = await openMenu();

        await userEvent.click(within(menu).getByRole("menuitem", { name: "Export" }), { force: true });

        expect(screen.getByTestId("state")).toHaveTextContent("selected=none");
    });

    it.each(["light", "dark"] as const)(
        "keeps a 300px panel inside a 360px viewport, aligned to the trigger's end, in %s mode",
        async (theme) => {
            document.documentElement.classList.toggle("dark", theme === "dark");
            await page.viewport(360, 640);
            render(Harness);
            const menu = await openMenu();

            await waitFor(() => {
                const box = menu.getBoundingClientRect();
                expect(box.width).toBe(300);
                expect(box.left).toBeGreaterThanOrEqual(8);
                expect(box.right).toBeLessThanOrEqual(352);
            });
            // The panel stands off the page canvas in both themes.
            const canvas = document.createElement("div");
            canvas.className = "bg-background";
            document.body.append(canvas);
            expect(getComputedStyle(menu).backgroundColor).not.toBe(getComputedStyle(canvas).backgroundColor);
            canvas.remove();
        }
    );
});
