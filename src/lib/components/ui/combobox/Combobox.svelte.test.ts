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

        expect(screen.getAllByRole("option")).toHaveLength(5);
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

    it.each([
        ["sm", 34],
        ["md", 40],
        ["lg", 46]
    ] as const)("draws the %s trigger %ipx high", (size, height) => {
        render(Combobox, { items: instruments, label: "Instrument", size });

        expect(trigger().getBoundingClientRect().height).toBe(height);
    });
});
