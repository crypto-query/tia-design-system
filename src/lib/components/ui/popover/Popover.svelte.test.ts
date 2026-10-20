import { cleanup, render, screen, waitFor, within } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, onTestFinished } from "vitest";
import Harness from "./Popover.test-harness.svelte";
import Pair from "./PopoverPair.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not — without this every render stacks up.
afterEach(cleanup);

const TITLE = "Bear years";

// The primitive can run its open focus a second time a frame later, which would undo a Tab
// pressed in between. No reader is that fast; a test is.
function settle(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function triggerEl(): HTMLElement {
    return screen.getByRole("button", { name: "Years" });
}

describe("Popover", () => {
    describe.each([false, true])("sheet=%s", (sheet) => {
        it("opens on click as a dialog named by its title, and the trigger points at it", async () => {
            render(Harness, { title: TITLE, sheet });
            const trigger = triggerEl();

            expect(trigger).toHaveAttribute("aria-expanded", "false");
            expect(trigger).not.toHaveAttribute("aria-controls");

            await userEvent.click(trigger);

            const dialog = await screen.findByRole("dialog", { name: TITLE });
            expect(dialog).toContainElement(screen.getByRole("button", { name: "2024" }));
            expect(trigger).toHaveAttribute("aria-expanded", "true");
            await waitFor(() => expect(trigger).toHaveAttribute("aria-controls", dialog.id));
            expect(dialog.id).not.toBe("");
        });

        it("closes on Escape and returns focus to the trigger", async () => {
            render(Harness, { title: TITLE, sheet });
            await userEvent.click(triggerEl());
            await screen.findByRole("dialog");

            await userEvent.keyboard("{Escape}");

            await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
            await waitFor(() => expect(triggerEl()).toHaveFocus());
            expect(screen.getByTestId("open")).toHaveTextContent("false");
        });

        it("draws the actions right of the title, centred on it, and passes native attributes to the panel", async () => {
            const actions = createRawSnippet(() => ({ render: () => `<button type="button">Include all</button>` }));
            render(Harness, { title: TITLE, sheet, open: true, actions, "data-testid": "years-panel" });

            const dialog = await screen.findByRole("dialog", { name: TITLE });
            expect(screen.getByTestId("years-panel")).toBe(dialog);
            const title = within(dialog).getByRole("heading", { name: TITLE }).getBoundingClientRect();
            const action = within(dialog).getByRole("button", { name: "Include all" }).getBoundingClientRect();
            expect(action.left).toBeGreaterThan(title.right);
            expect(Math.abs(action.top + action.height / 2 - (title.top + title.height / 2))).toBeLessThan(1);
            if (sheet) {
                expect(within(dialog).getByRole("button", { name: "Close" }).getBoundingClientRect().left).toBeGreaterThan(action.right);
            }
        });
    });

    it("closes on a click outside and returns focus to the trigger", async () => {
        render(Harness, { title: TITLE });
        await userEvent.click(triggerEl());
        await screen.findByRole("dialog");

        // Text rather than a control, so nothing else takes the focus.
        await userEvent.click(screen.getByText("Page text outside the panel."));

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await waitFor(() => expect(triggerEl()).toHaveFocus());
    });

    it("closes on a second click on its trigger", async () => {
        render(Harness, { title: TITLE });
        await userEvent.click(triggerEl());
        // Only with focus in the panel does the press on the trigger move focus outside it.
        const year = await screen.findByRole("button", { name: "2024" });
        await waitFor(() => expect(year).toHaveFocus());
        await settle();
        // A real press: focus moves on mousedown, and the click follows later.
        await userEvent.click(triggerEl(), { delay: 100 });

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(screen.getByTestId("open")).toHaveTextContent("false");
        expect(triggerEl()).toHaveAttribute("aria-expanded", "false");
    });

    it("leaves focus on a control clicked outside", async () => {
        render(Harness, { title: TITLE });
        await userEvent.click(triggerEl());
        await screen.findByRole("dialog");

        const search = screen.getByRole("textbox", { name: "Search" });
        await userEvent.click(search);

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(search).toHaveFocus();
    });

    it("returns focus to its own trigger when another popover took over", async () => {
        render(Pair);
        await userEvent.click(screen.getByRole("button", { name: "Open a" }));
        await screen.findByRole("dialog", { name: "Panel a" });

        await userEvent.click(screen.getByRole("button", { name: "Open b" }));
        await screen.findByRole("dialog", { name: "Panel b" });
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Panel a" })).toBeNull());

        await userEvent.keyboard("{Escape}");

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await waitFor(() => expect(screen.getByRole("button", { name: "Open b" })).toHaveFocus());
    });

    it("lets Tab leave the popover, which closes it and leaves focus where Tab put it", async () => {
        // The panel mounts ahead of the page here, so Tab out of it lands on the page's field.
        const root = document.createElement("div");
        document.body.prepend(root);
        onTestFinished(() => root.remove());

        render(Harness, { title: TITLE, portalTarget: root });
        await userEvent.click(triggerEl());
        const year = await screen.findByRole("button", { name: "2024" });
        await waitFor(() => expect(year).toHaveFocus());
        await settle();

        await userEvent.tab();

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus();
    });

    it("draws no close button as a popover", async () => {
        render(Harness, { title: TITLE });
        await userEvent.click(triggerEl());

        await screen.findByRole("dialog");
        expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    });

    describe("sheet", () => {
        it("draws a popover instead on a viewport of 40rem or wider", async () => {
            const { width, height } = { width: window.innerWidth, height: window.innerHeight };
            await page.viewport(1024, 768);
            onTestFinished(() => page.viewport(width, height));
            render(Harness, { title: TITLE, sheet: true });
            await userEvent.click(triggerEl());

            const dialog = await screen.findByRole("dialog");
            expect(within(dialog).queryByRole("button", { name: "Close" })).toBeNull();
            expect(dialog.getBoundingClientRect().width).toBeLessThan(400);
        });

        it("pins the panel to the bottom of the viewport across its full width", async () => {
            render(Harness, { title: TITLE, sheet: true, open: true });

            const dialog = await screen.findByRole("dialog");

            // Read inside the wait: the panel slides up from below the edge as it opens.
            await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().bottom)).toBe(window.innerHeight));
            const rect = dialog.getBoundingClientRect();
            expect(rect.left).toBe(0);
            expect(Math.round(rect.width)).toBe(document.documentElement.clientWidth);
        });

        it("keeps Tab inside the sheet", async () => {
            render(Harness, { title: TITLE, sheet: true });
            await userEvent.click(triggerEl());
            const close = await screen.findByRole("button", { name: "Close" });
            await waitFor(() => expect(close).toHaveFocus());
            await settle();

            await userEvent.tab();
            expect(screen.getByRole("button", { name: "2024" })).toHaveFocus();
            await userEvent.tab();
            expect(close).toHaveFocus();
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        it("closes on a click on the scrim and returns focus to the trigger", async () => {
            render(Harness, { title: TITLE, sheet: true });
            await userEvent.click(triggerEl());
            await screen.findByRole("dialog");

            await userEvent.click(document.querySelector("[data-popover-overlay]") as HTMLElement, { position: { x: 10, y: 10 } });

            await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
            await waitFor(() => expect(triggerEl()).toHaveFocus());
        });

        it("leaves no scrim behind when a popover closed as a popover becomes a sheet", async () => {
            const { rerender } = render(Harness, { title: TITLE });
            await userEvent.click(triggerEl());
            await screen.findByRole("dialog");
            await userEvent.keyboard("{Escape}");
            await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

            await rerender({ title: TITLE, sheet: true });
            await settle();

            expect(document.querySelector("[data-popover-overlay]")).toBeNull();
        });

        it("closes from its close button and returns focus to the trigger", async () => {
            render(Harness, { title: TITLE, sheet: true });
            await userEvent.click(triggerEl());

            const close = await screen.findByRole("button", { name: "Close" });
            expect(close.getBoundingClientRect().height).toBe(44);
            expect(close.getBoundingClientRect().width).toBe(44);

            await userEvent.click(close);

            await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
            await waitFor(() => expect(triggerEl()).toHaveFocus());
            expect(screen.getByTestId("open")).toHaveTextContent("false");
        });
    });

    describe("open from the call site", () => {
        it("places the panel against the trigger rather than off-screen", async () => {
            render(Harness, { title: TITLE, open: true });

            const dialog = await screen.findByRole("dialog");
            const wrapper = dialog.parentElement as HTMLElement;

            await waitFor(() => expect(wrapper.style.transform).not.toContain("-200%"));

            const panel = dialog.getBoundingClientRect();
            const trigger = triggerEl().getBoundingClientRect();
            expect(panel.top).toBeGreaterThanOrEqual(trigger.bottom);
            expect(panel.left).toBeLessThan(trigger.right);
        });

        it("closes when the call site sets open to false", async () => {
            const { rerender } = render(Harness, { title: TITLE, open: true });
            await screen.findByRole("dialog");

            await rerender({ title: TITLE, open: false });

            await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        });
    });
});
