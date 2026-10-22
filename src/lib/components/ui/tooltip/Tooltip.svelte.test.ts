import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import { userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, onTestFinished } from "vitest";
import Harness from "./Tooltip.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not — without this every render stacks up.
afterEach(cleanup);

const HINT = "Signals resume when the London session opens.";

function triggerEl(): HTMLElement {
    return screen.getByRole("button", { name: "Copy webhook URL" });
}

// Puts the trigger below the fold, so focusing it scrolls the window.
function pushBelowFold(behavior: "auto" | "smooth" = "auto") {
    const spacer = document.createElement("div");
    spacer.style.height = "200vh";
    document.body.prepend(spacer);
    document.documentElement.style.scrollBehavior = behavior;
    onTestFinished(() => {
        spacer.remove();
        document.documentElement.style.scrollBehavior = "";
        window.scrollTo({ top: 0, behavior: "instant" });
    });
}

const scrollEnd = () => new Promise((resolve) => window.addEventListener("scrollend", resolve, { once: true }));
const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

describe("Tooltip", () => {
    describe("focus", () => {
        it("opens the hint with no delay, and the hint describes the trigger", async () => {
            render(Harness, { content: HINT });
            const trigger = triggerEl();

            expect(trigger).not.toHaveAccessibleDescription();

            trigger.focus();

            const hint = await screen.findByRole("tooltip");
            expect(hint).toHaveTextContent(HINT);
            await waitFor(() => expect(trigger).toHaveAccessibleDescription(HINT));
        });

        it("describes the trigger rather than naming it", async () => {
            render(Harness, { content: HINT });
            const trigger = triggerEl();

            trigger.focus();
            await screen.findByRole("tooltip");

            await waitFor(() => expect(trigger).toHaveAccessibleDescription(HINT));
            expect(trigger).toHaveAccessibleName("Copy webhook URL");
        });

        it("closes on Escape, and the description goes with it", async () => {
            render(Harness, { content: HINT });
            const trigger = triggerEl();

            trigger.focus();
            await screen.findByRole("tooltip");

            await userEvent.keyboard("{Escape}");

            await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
            expect(trigger).not.toHaveAccessibleDescription();
        });

        it.each(["auto", "smooth"] as const)("stays open after the %s scroll that focus causes", async (behavior) => {
            render(Harness, { content: HINT });
            pushBelowFold(behavior);
            const trigger = triggerEl();
            const scrolled = scrollEnd();

            trigger.focus();
            await scrolled;
            await settle();

            expect(window.scrollY).toBeGreaterThan(0);
            expect(screen.getByRole("tooltip")).toHaveTextContent(HINT);
            expect(trigger).toHaveAccessibleDescription(HINT);
        });

        it("does not open when focus leaves before the scroll ends", async () => {
            render(Harness, { content: HINT });
            pushBelowFold("smooth");
            const trigger = triggerEl();
            const scrolled = scrollEnd();

            trigger.focus();
            trigger.blur();
            await scrolled;
            await settle();

            expect(screen.queryByRole("tooltip")).toBeNull();
        });
    });

    describe("disabled", () => {
        it("never opens on focus", async () => {
            render(Harness, { content: HINT, disabled: true });
            const trigger = triggerEl();

            trigger.focus();

            await waitFor(() => expect(trigger).toHaveFocus());
            expect(screen.queryByRole("tooltip")).toBeNull();
            expect(trigger).not.toHaveAccessibleDescription();
        });

        it("suppresses a panel the call site opened itself", async () => {
            render(Harness, { content: HINT, disabled: true, open: true });

            await waitFor(() => expect(triggerEl()).toBeInTheDocument());
            expect(screen.queryByRole("tooltip")).toBeNull();
        });
    });

    describe("open from the call site", () => {
        it("places the panel against the trigger rather than off-screen", async () => {
            render(Harness, { content: HINT, open: true });

            const hint = await screen.findByRole("tooltip");
            const wrapper = hint.parentElement as HTMLElement;

            // Off-page is how the primitive parks a panel it never placed. `Tooltip.md`.
            await waitFor(() => expect(wrapper.style.transform).not.toContain("-200%"));

            const panel = hint.getBoundingClientRect();
            const trigger = triggerEl().getBoundingClientRect();

            expect(panel.width).toBeGreaterThan(0);
            expect(panel.left).toBeLessThan(trigger.right);
            expect(panel.right).toBeGreaterThan(trigger.left);
        });

        it("waits for a window scroll that starts with the open, then stays open", async () => {
            const { rerender } = render(Harness, { content: HINT });
            pushBelowFold("smooth");
            const scrolled = scrollEnd();

            triggerEl().scrollIntoView();
            await rerender({ content: HINT, open: true });
            await scrolled;
            await settle();

            expect(window.scrollY).toBeGreaterThan(0);
            expect(screen.getByRole("tooltip")).toHaveTextContent(HINT);
        });
    });

    describe("portal target", () => {
        it("mounts the panel inside the target rather than on the body", async () => {
            const root = document.createElement("div");
            document.body.append(root);
            onTestFinished(() => root.remove());

            render(Harness, { content: HINT, portalTarget: root });
            triggerEl().focus();

            const hint = await screen.findByRole("tooltip");

            expect(root).toContainElement(hint);
        });
    });

    describe("shortcut", () => {
        it("draws one chip for a single key", async () => {
            render(Harness, { content: HINT, shortcut: "S" });
            triggerEl().focus();

            const hint = await screen.findByRole("tooltip");
            const chips = hint.querySelectorAll("kbd");

            expect(chips).toHaveLength(1);
            expect(chips[0]).toHaveTextContent("S");
        });

        it("draws one chip per key of an array, in order", async () => {
            render(Harness, { content: HINT, shortcut: ["⌘", "C"] });
            triggerEl().focus();

            const hint = await screen.findByRole("tooltip");
            const chips = [...hint.querySelectorAll("kbd")].map((chip) => chip.textContent?.trim());

            expect(chips).toEqual(["⌘", "C"]);
        });

        it("draws no chip row without a shortcut", async () => {
            render(Harness, { content: HINT });
            triggerEl().focus();

            const hint = await screen.findByRole("tooltip");

            expect(hint.querySelectorAll("kbd")).toHaveLength(0);
        });
    });
});
