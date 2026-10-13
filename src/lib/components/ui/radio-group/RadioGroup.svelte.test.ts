import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, vi } from "vitest";
import RadioGroup from "./RadioGroup.svelte";
import Harness from "./RadioGroup.test-harness.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with globals
// enabled, which this project does not — without this every render stacks up.
afterEach(cleanup);

const sessions = ["London", "New York", "Both sessions"];

const accounts = [
    { value: "cash", label: "Cash" },
    { value: "margin", label: "Margin" },
    { value: "ira", label: "Retirement" }
];

/** What the harness prints back out of its `bind:value`. */
function bound(): string | null {
    return screen.getByTestId("bound").textContent;
}

describe("RadioGroup", () => {
    it("is a radiogroup named by its label", () => {
        render(RadioGroup, { label: "Account type", items: accounts });

        expect(screen.getByRole("radiogroup", { name: "Account type" })).toBeInTheDocument();
    });

    it("takes its description from the description, not its name", () => {
        render(RadioGroup, { label: "Session filter", description: "Signals outside the window are suppressed.", items: accounts });

        expect(screen.getByRole("radiogroup", { name: "Session filter" })).toHaveAccessibleDescription(
            "Signals outside the window are suppressed."
        );
    });

    it("names each option from its label, and describes it with the meta and description", () => {
        render(RadioGroup, {
            label: "Billing period",
            items: [{ value: "annual", label: "Annual", description: "Two months free, billed today.", meta: "$1,290" }]
        });

        expect(screen.getByRole("radio", { name: "Annual" })).toHaveAccessibleDescription("$1,290 Two months free, billed today.");
    });

    describe("selection", () => {
        it("round-trips bind:value, with onValueChange firing beside it", async () => {
            const onValueChange = vi.fn();
            render(Harness, { value: "london", onValueChange });

            await userEvent.click(screen.getByRole("radio", { name: "Both sessions" }));

            expect(bound()).toBe("value=both");
            expect(onValueChange).toHaveBeenCalledWith("both");
        });

        it("reports the selected option as aria-checked, and only that one", () => {
            render(Harness, { value: "both" });

            expect(screen.getByRole("radio", { name: "Both sessions" })).toHaveAttribute("aria-checked", "true");
            expect(screen.getByRole("radio", { name: "London" })).toHaveAttribute("aria-checked", "false");
        });

        it.each([
            { orientation: "vertical" as const, key: "{ArrowDown}" },
            { orientation: "horizontal" as const, key: "{ArrowRight}" }
        ])("moves the selection with $key when $orientation, and the bound value follows", async ({ orientation, key }) => {
            render(Harness, { value: "cash", items: accounts, orientation });

            screen.getByRole("radio", { name: "Cash" }).focus();
            await userEvent.keyboard(key);

            await waitFor(() => expect(bound()).toBe("value=margin"));
            expect(screen.getByRole("radio", { name: "Margin" })).toHaveAttribute("aria-checked", "true");
        });

        it("skips a disabled option on the way past it", async () => {
            render(Harness, { value: "london" });

            screen.getByRole("radio", { name: "London" }).focus();
            await userEvent.keyboard("{ArrowDown}");

            await waitFor(() => expect(bound()).toBe("value=both"));
        });

        it("does not select a disabled option that is clicked", async () => {
            render(Harness, { value: "london" });

            // Not `userEvent`: it declines to drive a disabled element at all.
            await fireEvent.click(screen.getByRole("radio", { name: "New York" }));

            expect(bound()).toBe("value=london");
        });
    });

    describe("composed children and items", () => {
        it("renders composed <Radio> children", () => {
            render(Harness, {});

            expect(screen.getAllByRole("radio").map((radio) => radio.textContent?.trim())).toEqual(
                expect.arrayContaining([expect.stringContaining("London")])
            );
            expect(screen.getByRole("radio", { name: "Both sessions" })).toBeInTheDocument();
        });

        it("lets items beat children when both are given", () => {
            render(Harness, { items: accounts });

            expect(screen.getAllByRole("radio")).toHaveLength(accounts.length);
            expect(screen.queryByRole("radio", { name: "London" })).toBeNull();
        });
    });

    describe("disabled", () => {
        it("disables every option when the group is disabled", () => {
            render(Harness, { disabled: true });

            for (const name of sessions) {
                expect(screen.getByRole("radio", { name })).toBeDisabled();
            }
        });

        it("disables only the named option when the group is not", () => {
            render(Harness, {});

            expect(screen.getByRole("radio", { name: "New York" })).toBeDisabled();
            expect(screen.getByRole("radio", { name: "London" })).toBeEnabled();
        });

        it.each([
            { scope: "the group", props: { disabled: true }, name: "London" },
            { scope: "one option", props: {}, name: "New York" }
        ])("dims $scope to opacity-50", ({ props, name }) => {
            render(Harness, props);

            expect(getComputedStyle(screen.getByRole("radio", { name })).opacity).toBe("0.5");
        });
    });

    describe("error", () => {
        it("marks the group invalid and describes it with the message", () => {
            render(RadioGroup, {
                label: "Account type",
                items: accounts,
                error: true,
                errorMessage: "Choose an account type to continue."
            });

            const group = screen.getByRole("radiogroup", { name: "Account type" });

            expect(group).toHaveAttribute("aria-invalid", "true");
            expect(group).toHaveAccessibleDescription("Choose an account type to continue.");
        });

        it("does not announce the message a second time as an alert", () => {
            render(RadioGroup, { label: "Account type", items: accounts, error: true, errorMessage: "Choose an account type." });

            expect(screen.queryByRole("alert")).toBeNull();
        });

        it("stands the message in for the description rather than beside it", () => {
            render(RadioGroup, {
                label: "Account type",
                description: "Settled funds only, unless you have been approved.",
                items: accounts,
                error: true,
                errorMessage: "Choose an account type to continue."
            });

            expect(screen.queryByText("Settled funds only, unless you have been approved.")).toBeNull();
            expect(screen.getByRole("radiogroup", { name: "Account type" })).toHaveAccessibleDescription(
                "Choose an account type to continue."
            );
        });

        it("keeps the description when the error carries no message of its own", () => {
            render(RadioGroup, { label: "Account type", description: "Settled funds only.", items: accounts, error: true });

            expect(screen.getByRole("radiogroup", { name: "Account type" })).toHaveAccessibleDescription("Settled funds only.");
        });

        // Read against a valid render rather than a named token, so the pin holds if the
        // palette moves.
        it("leaves an option looking exactly like itself, in error or not", () => {
            const rowInk = (name: string) => {
                const row = screen.getByRole("radio", { name });
                const dial = row.querySelector("span[aria-hidden='true']") as HTMLElement;
                return {
                    tile: getComputedStyle(row).borderColor,
                    dial: getComputedStyle(dial).borderColor,
                    mark: getComputedStyle(dial.firstElementChild as Element).backgroundColor,
                    label: getComputedStyle(row.querySelector("span[id$='-label']") as HTMLElement).color
                };
            };

            render(RadioGroup, { label: "Account type", variant: "card", value: "cash", items: accounts });
            const valid = rowInk("Cash");
            cleanup();

            render(RadioGroup, {
                label: "Account type",
                variant: "card",
                value: "cash",
                items: accounts,
                error: true,
                errorMessage: "Choose an account type to continue."
            });

            expect(rowInk("Cash")).toEqual(valid);
        });

        it("puts the red on the group's own label and message instead", () => {
            render(RadioGroup, { label: "Account type", items: accounts });
            const valid = getComputedStyle(screen.getByText("Account type")).color;
            cleanup();

            render(RadioGroup, { label: "Account type", items: accounts, error: true, errorMessage: "Choose an account type." });
            const label = getComputedStyle(screen.getByText("Account type")).color;

            expect(label).not.toBe(valid);
            expect(getComputedStyle(screen.getByText("Choose an account type.")).color).toBe(label);
        });

        it("leaves the group valid when error is not set", () => {
            render(RadioGroup, { label: "Account type", items: accounts });

            expect(screen.getByRole("radiogroup", { name: "Account type" })).not.toHaveAttribute("aria-invalid");
        });
    });

    describe("name", () => {
        it("generates one when omitted, and two groups do not collide", () => {
            render(RadioGroup, { label: "One", items: accounts });
            render(RadioGroup, { label: "Two", items: accounts });

            // The hidden input is what a form actually reads.
            const names = [...document.querySelectorAll("input")].map((input) => input.name);

            expect(names).toHaveLength(2);
            expect(names.every(Boolean)).toBe(true);
            expect(new Set(names).size).toBe(2);
        });

        it("takes the name it is given", () => {
            render(RadioGroup, { label: "Billing", items: accounts, name: "billing" });

            expect(document.querySelector("input")).toHaveAttribute("name", "billing");
        });
    });

    describe("the card variant", () => {
        // Measured rather than read off a class: nothing but the browser confirms it.
        it.each(["sm", "md", "lg"] as const)("makes the whole $size tile the hit target, at 44px or more", (size) => {
            render(RadioGroup, { label: "Billing period", variant: "card", size, items: accounts });

            const tile = screen.getByRole("radio", { name: "Cash" });

            expect(tile.tagName).toBe("BUTTON");
            expect(tile.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
        });

        it("keeps the radio mark visible on the selected tile", async () => {
            render(RadioGroup, { label: "Billing period", variant: "card", value: "margin", items: accounts });

            const mark = (name: string) => screen.getByRole("radio", { name }).querySelector("span[aria-hidden='true'] > span");

            // Tailwind v4 puts a scale on its own property, not `transform`, and the mark
            // carries a transition — so the read has to settle first.
            await waitFor(() => expect(getComputedStyle(mark("Margin") as Element).scale).toBe("1"));
            expect(getComputedStyle(mark("Cash") as Element).scale).toBe("0");
        });
    });

    // The text column grows, which the reference's does not — see `RadioGroup.md`.
    it("puts the meta at the row's trailing edge, not the description's", () => {
        render(RadioGroup, {
            label: "Billing period",
            variant: "card",
            items: [{ value: "annual", label: "Annual", description: "Two months free, billed today.", meta: "$1,290" }]
        });

        const tile = screen.getByRole("radio", { name: "Annual" });
        const meta = screen.getByText("$1,290");
        const style = getComputedStyle(tile);
        // A bounding rect is the border box, so the content edge is the padding plus the
        // tile's own 1px border away from it.
        const inset = Number.parseFloat(style.paddingRight) + Number.parseFloat(style.borderRightWidth);

        expect(tile.getBoundingClientRect().right - meta.getBoundingClientRect().right).toBeCloseTo(inset, 0);
    });

    describe("the class escape hatch", () => {
        // `gap` is not ported; `class` lands on the element that carries it.
        it("puts the group's class on the element holding the gap", () => {
            render(RadioGroup, { label: "Account type", items: accounts, class: "gap-0" });

            expect(getComputedStyle(screen.getByRole("radiogroup", { name: "Account type" })).rowGap).toBe("0px");
        });

        // The tile is what draws the border, so a caller's radius reaches it.
        it("puts an option's class on the tile that draws the border", () => {
            render(Harness, { variant: "card", radioClass: "rounded-full" });

            expect(getComputedStyle(screen.getByRole("radio", { name: "London" })).borderRadius).toBe("100px");
        });
    });
});
