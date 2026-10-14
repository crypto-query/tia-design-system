import { cleanup, render, screen, waitFor, within } from "@testing-library/svelte";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
import Select, { type SelectItem } from "./Select.svelte";
import Harness from "./Select.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not — without this every render stacks up.
afterEach(cleanup);

const grouped: SelectItem[] = [
    { value: "btc", label: "Bitcoin", group: "Crypto" },
    { value: "eth", label: "Ethereum", group: "Crypto" },
    { value: "aapl", label: "Apple", group: "Stocks" },
    { value: "gold", label: "Gold", group: "Metals" }
];

const plain: SelectItem[] = [
    { value: "btc", label: "Bitcoin" },
    { value: "eth", label: "Ethereum" },
    { value: "sol", label: "Solana", disabled: true },
    { value: "ada", label: "Cardano" }
];

function trigger(): HTMLElement {
    return screen.getByRole("combobox");
}

describe("Select", () => {
    describe("naming and choosing", () => {
        it("is a combobox named by its label, showing the placeholder", () => {
            render(Select, { items: plain, label: "Asset" });

            expect(trigger()).toHaveAccessibleName("Asset");
            expect(trigger()).toHaveTextContent("Select…");
        });

        it("takes its name from aria-label when there is no label", () => {
            render(Select, { items: plain, "aria-label": "Asset", placeholder: "Pick one" });

            expect(trigger()).toHaveAccessibleName("Asset");
            expect(trigger()).toHaveTextContent("Pick one");
        });

        it("shows the clicked option's label and reports its value", async () => {
            const onValueChange = vi.fn();
            render(Select, { items: plain, label: "Asset", onValueChange });

            await userEvent.click(trigger());
            await userEvent.click(await screen.findByRole("option", { name: "Ethereum" }));

            await waitFor(() => expect(trigger()).toHaveTextContent("Ethereum"));
            expect(onValueChange).toHaveBeenCalledWith("eth");
        });

        it("shows the label of a value passed in", () => {
            render(Select, { items: plain, label: "Asset", value: "ada" });

            expect(trigger()).toHaveTextContent("Cardano");
        });
    });

    describe("groups", () => {
        it("renders each named group as a group role", async () => {
            render(Select, { items: grouped, label: "Asset" });
            await userEvent.click(trigger());

            const crypto = await screen.findByRole("group", { name: "Crypto" });
            expect(
                within(crypto)
                    .getAllByRole("option")
                    .map((option) => option.textContent?.trim())
            ).toEqual(["Bitcoin", "Ethereum"]);
            expect(screen.getByRole("group", { name: "Stocks" })).toBeInTheDocument();
            expect(screen.getByRole("group", { name: "Metals" })).toBeInTheDocument();
        });

        it("keeps items without a group outside any group", async () => {
            render(Select, { items: [{ value: "usd", label: "US Dollar" }, ...grouped], label: "Asset" });
            await userEvent.click(trigger());

            const loose = await screen.findByRole("option", { name: "US Dollar" });
            expect(loose.closest("[role=group]")).toBeNull();
            expect(screen.getAllByRole("group")).toHaveLength(3);
        });

        it("draws no group role for a list without groups", async () => {
            render(Select, { items: plain, label: "Asset" });
            await userEvent.click(trigger());

            await screen.findByRole("listbox");
            expect(screen.queryByRole("group")).toBeNull();
        });
    });

    describe("keyboard", () => {
        it("opens with Enter, moves with ArrowDown and chooses with Enter", async () => {
            const onValueChange = vi.fn();
            render(Select, { items: plain, label: "Asset", onValueChange });

            trigger().focus();
            await userEvent.keyboard("{Enter}");
            await screen.findByRole("listbox");
            await userEvent.keyboard("{ArrowDown}");
            await userEvent.keyboard("{Enter}");

            await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("eth"));
            expect(trigger()).toHaveTextContent("Ethereum");
        });

        it("opens with ArrowDown", async () => {
            render(Select, { items: plain, label: "Asset" });

            trigger().focus();
            await userEvent.keyboard("{ArrowDown}");

            expect(await screen.findByRole("listbox")).toBeInTheDocument();
        });

        it("closes on Escape without changing the value", async () => {
            const onValueChange = vi.fn();
            render(Select, { items: plain, label: "Asset", value: "btc", onValueChange });

            trigger().focus();
            await userEvent.keyboard("{Enter}");
            await screen.findByRole("listbox");
            await userEvent.keyboard("{ArrowDown}");
            await userEvent.keyboard("{Escape}");

            await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
            expect(onValueChange).not.toHaveBeenCalled();
            expect(trigger()).toHaveTextContent("Bitcoin");
        });

        it("does not choose a disabled option", async () => {
            const onValueChange = vi.fn();
            render(Select, { items: plain, label: "Asset", onValueChange });

            await userEvent.click(trigger());
            const solana = await screen.findByRole("option", { name: "Solana" });
            expect(solana).toHaveAttribute("aria-disabled", "true");

            // Forced: the driver refuses to click an `aria-disabled` element at all.
            await userEvent.click(solana, { force: true });

            expect(onValueChange).not.toHaveBeenCalled();
            expect(screen.getByRole("listbox")).toBeInTheDocument();
        });

        it("does not open when disabled", async () => {
            render(Select, { items: plain, label: "Asset", disabled: true });

            expect(trigger()).toBeDisabled();
            trigger().focus();
            await userEvent.keyboard("{Enter}");
            trigger().click();

            expect(screen.queryByRole("listbox")).toBeNull();
        });
    });

    describe("portal target", () => {
        it("mounts the listbox inside the given element", async () => {
            const root = document.createElement("div");
            document.body.append(root);
            onTestFinished(() => root.remove());

            const { container } = render(Select, { items: plain, label: "Asset", portalTarget: root });
            await userEvent.click(trigger());

            const listbox = await screen.findByRole("listbox");
            expect(root).toContainElement(listbox);
            expect(container).not.toContainElement(listbox);
        });

        it("mounts the listbox outside the component by default", async () => {
            const { container } = render(Select, { items: plain, label: "Asset" });
            await userEvent.click(trigger());

            const listbox = await screen.findByRole("listbox");
            expect(container).not.toContainElement(listbox);
            expect(document.body).toContainElement(listbox);
        });
    });

    describe("panel width", () => {
        it("caps the panel at the viewport's free width", async () => {
            await page.viewport(390, 700);
            onTestFinished(() => page.viewport(1280, 720));

            // Wider than the viewport, the way a full-width field in a Block can measure.
            render(Select, { items: plain, label: "Asset", class: "w-150" });
            await userEvent.click(trigger());

            const panel = (await screen.findByRole("listbox")).closest("[data-select-content]");
            expect(panel).toBeInstanceOf(HTMLElement);
            await waitFor(() => {
                const box = panel?.getBoundingClientRect();
                expect(box?.left).toBeGreaterThanOrEqual(0);
                expect(box?.right).toBeLessThanOrEqual(390);
            });
        });
    });

    describe("binding", () => {
        it("hands open and the chosen value back to the parent", async () => {
            render(Harness, { items: plain, label: "Asset" });
            const bound = screen.getByTestId("bound");

            await userEvent.click(trigger());
            await waitFor(() => expect(bound).toHaveTextContent("value= open=true"));

            await userEvent.click(await screen.findByRole("option", { name: "Ethereum" }));
            await waitFor(() => expect(bound).toHaveTextContent("value=eth open=false"));
        });
    });

    describe("class", () => {
        // The caller's class has to reach the bordered trigger, or a pill shape draws nothing.
        it("lets a caller's rounded-full round the trigger", () => {
            render(Select, { items: plain, label: "Asset", class: "rounded-full" });

            const radius = parseFloat(getComputedStyle(trigger()).borderTopLeftRadius);
            expect(radius).toBeGreaterThanOrEqual(trigger().getBoundingClientRect().height / 2);
        });
    });

    describe("size", () => {
        it.each([
            ["sm", 34],
            ["md", 40],
            ["lg", 46]
        ] as const)("draws the %s trigger %ipx high", (size, height) => {
            render(Select, { items: plain, label: "Asset", size });

            expect(trigger().getBoundingClientRect().height).toBe(height);
        });
    });
});
