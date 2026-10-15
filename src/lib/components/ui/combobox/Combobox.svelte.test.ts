import { cleanup, render, screen, waitFor, within } from "@testing-library/svelte";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
import Combobox, { type ComboboxItem } from "./Combobox.svelte";
import Harness from "./Combobox.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not — without this every render stacks up.
afterEach(cleanup);

const instruments: ComboboxItem[] = [
    { value: "es", label: "E-mini S&P 500", group: "Futures" },
    { value: "nq", label: "E-mini Nasdaq 100", group: "Futures" },
    { value: "eurusd", label: "EUR / USD", group: "Forex" },
    { value: "btc", label: "Bitcoin", group: "Crypto" },
    { value: "sol", label: "Solana", group: "Crypto", disabled: true }
];

function trigger(): HTMLElement {
    return screen.getByRole("combobox", { name: "Instrument" });
}

function search(): HTMLElement {
    return screen.getByRole("combobox", { name: "Search…" });
}

function panelElement(): HTMLElement {
    const panel = screen.getByRole("listbox").closest<HTMLElement>("[data-popover-content]");
    if (!panel) throw new Error("no open panel");
    return panel;
}

function panelBox(): DOMRect {
    return panelElement().getBoundingClientRect();
}

function radii(element: HTMLElement, side: "top" | "bottom"): number[] {
    const style = getComputedStyle(element);
    return side === "top"
        ? [parseFloat(style.borderTopLeftRadius), parseFloat(style.borderTopRightRadius)]
        : [parseFloat(style.borderBottomLeftRadius), parseFloat(style.borderBottomRightRadius)];
}

async function openPanel() {
    await userEvent.click(trigger());
    await screen.findByRole("listbox");
}

async function expectOnlyRow(name: RegExp) {
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option", { name })).toBeInTheDocument();
}

describe("Combobox", () => {
    it("is a combobox named by its label, showing the placeholder", () => {
        render(Combobox, { items: instruments, label: "Instrument" });

        expect(trigger()).toHaveTextContent("Select…");
    });

    it("shows the label of a value passed in", () => {
        render(Combobox, { items: instruments, label: "Instrument", value: "btc" });

        expect(trigger()).toHaveTextContent("Bitcoin");
    });

    it("opens a listbox of options under their group headings, with a named search box", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        expect(within(screen.getByRole("listbox", { name: "Instrument" })).getAllByRole("option")).toHaveLength(5);
        expect(
            within(screen.getByRole("group", { name: "Futures" }))
                .getAllByRole("option")
                .map((option) => option.textContent?.trim())
        ).toEqual(["E-mini S&P 500", "E-mini Nasdaq 100"]);
        await waitFor(() => expect(search()).toHaveFocus());
    });

    it("filters by letters in order and hides the headings it empties", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        await userEvent.type(search(), "mnq");

        await expectOnlyRow(/E-mini Nasdaq 100/);
        expect(screen.getByRole("group", { name: "Futures" })).toBeVisible();
        expect(screen.queryByRole("group", { name: "Crypto" })).toBeNull();
        expect(screen.queryByRole("group", { name: "Forex" })).toBeNull();
    });

    it("keeps the declared order while filtering", async () => {
        render(Combobox, { items: [{ value: "all", label: "All markets" }, ...instruments], label: "Instrument" });
        await openPanel();

        await userEvent.type(search(), "e");

        await waitFor(() =>
            expect(screen.getAllByRole("option").map((option) => option.textContent?.trim())).toEqual([
                "All markets",
                "E-mini S&P 500",
                "E-mini Nasdaq 100",
                "EUR / USD"
            ])
        );
    });

    it("shows an announced empty message for a query that matches nothing", async () => {
        render(Combobox, { items: instruments, label: "Instrument", emptyMessage: "No instrument by that name" });
        await openPanel();

        await userEvent.type(search(), "zzzz");

        expect(await screen.findByRole("status")).toHaveTextContent("No instrument by that name");
        expect(screen.queryAllByRole("option")).toHaveLength(0);
    });

    it("commits the clicked row, reports it and closes", async () => {
        const onValueChange = vi.fn();
        render(Harness, { items: instruments, label: "Instrument", onValueChange });
        await openPanel();

        await userEvent.click(screen.getByRole("option", { name: /EUR \/ USD/ }));

        await waitFor(() => expect(screen.getByTestId("bound")).toHaveTextContent("value=eurusd open=false"));
        expect(onValueChange).toHaveBeenCalledWith("eurusd");
        expect(trigger()).toHaveTextContent("EUR / USD");
    });

    it("commits the highlighted row on Enter", async () => {
        const onValueChange = vi.fn();
        render(Harness, { items: instruments, label: "Instrument", onValueChange });
        await openPanel();

        await userEvent.type(search(), "btc");
        await expectOnlyRow(/Bitcoin/);
        await userEvent.keyboard("{Enter}");

        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("btc"));
        expect(screen.getByTestId("bound")).toHaveTextContent("value=btc open=false");
    });

    it.each(["{ArrowDown}", "{ArrowUp}"])("opens on %s from the closed trigger, focus in the search box", async (key) => {
        render(Combobox, { items: instruments, label: "Instrument" });
        trigger().focus();

        await userEvent.keyboard(key);

        await screen.findByRole("listbox");
        await waitFor(() => expect(search()).toHaveFocus());
    });

    it("highlights the chosen row on open", async () => {
        render(Combobox, { items: instruments, label: "Instrument", value: "btc" });
        await openPanel();

        await waitFor(() => expect(screen.getByRole("option", { name: /Bitcoin/ })).toHaveAttribute("data-selected"));
    });

    it("highlights the first row on open when nothing is chosen", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        await waitFor(() => expect(screen.getByRole("option", { name: /E-mini S&P 500/ })).toHaveAttribute("data-selected"));
    });

    it("highlights the first enabled row on open when the chosen row is disabled", async () => {
        const onValueChange = vi.fn();
        render(Harness, { items: instruments, label: "Instrument", value: "sol", onValueChange });
        await openPanel();

        await waitFor(() => expect(screen.getByRole("option", { name: /E-mini S&P 500/ })).toHaveAttribute("data-selected"));
        expect(screen.getByRole("option", { name: /Solana/ })).not.toHaveAttribute("data-selected");

        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(screen.getByRole("option", { name: /E-mini Nasdaq 100/ })).toHaveAttribute("data-selected"));
        await userEvent.keyboard("{Enter}");

        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("nq"));
        expect(onValueChange).not.toHaveBeenCalledWith("sol");
    });

    it("never lands the keyboard on a disabled row", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        // One key per call: a bits-ui list ignores the second arrow sent in one `keyboard()` call.
        for (let step = 0; step < 6; step += 1) {
            await userEvent.keyboard("{ArrowDown}");
            const active = screen.getAllByRole("option").find((option) => option.hasAttribute("data-selected"));
            expect(active).toBeDefined();
            expect(active).not.toHaveTextContent("Solana");
        }
    });

    it("draws no focus outline on the search box", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();
        await waitFor(() => expect(search()).toHaveFocus());

        const style = getComputedStyle(search());
        expect(style.outlineStyle === "none" || style.outlineColor === "rgba(0, 0, 0, 0)").toBe(true);
    });

    it("does not open when disabled", async () => {
        render(Combobox, { items: instruments, label: "Instrument", disabled: true });

        expect(trigger()).toBeDisabled();
        trigger().click();

        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("mounts the panel inside the portal target", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        onTestFinished(() => root.remove());

        const { container } = render(Combobox, { items: instruments, label: "Instrument", portalTarget: root });
        await openPanel();

        const listbox = screen.getByRole("listbox");
        expect(root).toContainElement(listbox);
        expect(container).not.toContainElement(listbox);
    });

    it("caps the panel at the viewport's free width", async () => {
        await page.viewport(390, 700);
        onTestFinished(() => page.viewport(1280, 720));

        // Wider than the viewport, the way a full-width field in a Block can measure.
        render(Combobox, { items: instruments, label: "Instrument", class: "w-150" });
        await openPanel();

        const panel = screen.getByRole("listbox").closest("[data-popover-content]");
        expect(panel).toBeInstanceOf(HTMLElement);
        await waitFor(() => {
            const box = panel?.getBoundingClientRect();
            expect(box?.left).toBeGreaterThanOrEqual(0);
            expect(box?.right).toBeLessThanOrEqual(390);
        });
    });

    it("attaches the panel under the trigger, edge to edge, even with the trigger at the viewport's left edge", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        const box = trigger().getBoundingClientRect();
        expect(box.left).toBe(0);
        await waitFor(() => {
            const panel = panelBox();
            expect(Math.abs(panel.left - box.left)).toBeLessThanOrEqual(0.5);
            expect(Math.abs(panel.right - box.right)).toBeLessThanOrEqual(0.5);
            expect(Math.abs(panel.top - box.bottom)).toBeLessThanOrEqual(0.5);
        });
    });

    it("squares the corners where trigger and panel meet, and rounds them again on close", async () => {
        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        const panel = getComputedStyle(panelElement());
        await waitFor(() => expect(radii(trigger(), "bottom")).toEqual([0, 0]));
        expect(radii(trigger(), "top")).not.toContain(0);
        expect(radii(panelElement(), "top")).toEqual([0, 0]);
        expect(radii(panelElement(), "bottom")).not.toContain(0);
        // The trigger's bottom border is the only line at the join.
        expect(panel.borderTopWidth).toBe("0px");

        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
        expect(radii(trigger(), "bottom")).not.toContain(0);
    });

    it("follows the panel above the trigger when there is no room below", async () => {
        await page.viewport(1280, 300);
        onTestFinished(() => page.viewport(1280, 720));
        const spacer = document.createElement("div");
        spacer.style.height = "220px";
        document.body.prepend(spacer);
        onTestFinished(() => spacer.remove());

        render(Combobox, { items: instruments, label: "Instrument" });
        await openPanel();

        await waitFor(() => expect(panelElement()).toHaveAttribute("data-side", "top"));
        await waitFor(() => expect(radii(trigger(), "top")).toEqual([0, 0]));
        expect(radii(trigger(), "bottom")).not.toContain(0);
        expect(radii(panelElement(), "bottom")).toEqual([0, 0]);
        expect(getComputedStyle(panelElement()).borderBottomWidth).toBe("0px");
        expect(Math.abs(panelBox().bottom - trigger().getBoundingClientRect().top)).toBeLessThanOrEqual(0.5);
    });

    it.each([
        ["sm", 34],
        ["md", 40],
        ["lg", 46]
    ] as const)("draws the %s trigger %ipx high", (size, height) => {
        render(Combobox, { items: instruments, label: "Instrument", size });

        expect(trigger().getBoundingClientRect().height).toBe(height);
    });
});
