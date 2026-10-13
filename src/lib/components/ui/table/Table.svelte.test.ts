import { cleanup, render, screen, within } from "@testing-library/svelte";
import { createRawSnippet, type Component, type Snippet } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import Table, { type TableColumn } from "./Table.svelte";
import "../../../../app.css";

// Testing Library's automatic cleanup only registers when vitest runs with
// globals enabled, which this project does not.
afterEach(cleanup);

type Invoice = { reference: string; date: string; label: string; amount: string };

const text = (read: (invoice: Invoice) => string) =>
    createRawSnippet<[Invoice]>((invoice) => ({ render: () => `<span>${read(invoice())}</span>` }));

const columns: TableColumn<Invoice>[] = [
    { label: "Reference", cell: text((i) => i.reference), class: "w-30" },
    { label: "Date", cell: text((i) => i.date), numeric: true, class: "w-24" },
    { label: "Description", cell: text((i) => i.label) },
    { label: "Amount", cell: text((i) => i.amount), align: "right", numeric: true, class: "w-23" }
];

const rows: Invoice[] = [
    { reference: "TIA-2026-0042", date: "4 Mar 2026", label: "Trend Following — annual", amount: "$1,782.00" },
    { reference: "TIA-2026-0031", date: "4 Mar 2025", label: "Trend Following — annual", amount: "$1,782.00" }
];

// `render()` instantiates a component's generic as `unknown`, so the row type is
// pinned here instead. A real call site infers it from the props it passes.
const InvoiceTable = Table as Component<{ columns: TableColumn<Invoice>[]; rows: Invoice[]; empty?: Snippet }>;

describe("Table", () => {
    it("renders a real table with a header cell per column", () => {
        render(InvoiceTable, { columns, rows });

        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getAllByRole("columnheader")).toHaveLength(columns.length);
        for (const column of columns) {
            expect(screen.getByRole("columnheader", { name: column.label })).toBeInTheDocument();
        }
    });

    // The design draws a div grid. Without `scope` the association between a
    // header and its column is a guess a screen reader has to make.
    it("scopes every header cell to its column", () => {
        render(InvoiceTable, { columns, rows });

        for (const header of screen.getAllByRole("columnheader")) {
            expect(header).toHaveAttribute("scope", "col");
        }
    });

    it("draws one row per entry, in the order it was given", () => {
        render(InvoiceTable, { columns, rows });
        const [, first, second] = screen.getAllByRole("row");

        expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
        expect(within(first).getByText(rows[0].reference)).toBeInTheDocument();
        expect(within(second).getByText(rows[1].reference)).toBeInTheDocument();
    });

    it("renders the header alone when there are no rows", () => {
        render(InvoiceTable, { columns, rows: [] });

        expect(screen.getAllByRole("row")).toHaveLength(1);
        expect(screen.getAllByRole("columnheader")).toHaveLength(columns.length);
    });

    it("renders an empty snippet across the body only when there are no rows", async () => {
        const empty = createRawSnippet(() => ({ render: () => "<span>No matching entries.</span>" }));
        const { rerender } = render(InvoiceTable, { columns, rows: [], empty });

        for (const column of columns) {
            expect(screen.getByRole("columnheader", { name: column.label })).toBeInTheDocument();
        }
        const cell = screen.getByRole("cell", { name: "No matching entries." });
        expect(cell).toHaveAttribute("colspan", String(columns.length));
        expect(cell.parentElement?.tagName).toBe("TR");
        expect(cell.parentElement?.parentElement).toBe(screen.getByRole("table").querySelector("tbody"));
        expect(screen.getAllByRole("row")).toHaveLength(2);
        expect(screen.getAllByRole("cell")).toHaveLength(1);

        await rerender({ rows });

        expect(screen.queryByText("No matching entries.")).not.toBeInTheDocument();
        expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
        expect(screen.getAllByRole("cell")).toHaveLength(rows.length * columns.length);
    });

    // Alignment and the numeric flag are the component's whole contract, so they
    // are read off the browser rather than off a class string.
    it("aligns a column's header and its cells together", () => {
        render(InvoiceTable, { columns, rows });

        expect(getComputedStyle(screen.getByRole("columnheader", { name: "Amount" })).textAlign).toBe("right");
        expect(getComputedStyle(screen.getAllByRole("cell")[3]).textAlign).toBe("right");
        expect(getComputedStyle(screen.getAllByRole("cell")[0]).textAlign).toBe("left");
    });

    it("lines up the figures in a numeric column and nowhere else", () => {
        render(InvoiceTable, { columns, rows });
        const [reference, date] = screen.getAllByRole("cell");

        expect(getComputedStyle(date).fontVariantNumeric).toContain("tabular-nums");
        expect(getComputedStyle(reference).fontVariantNumeric).not.toContain("tabular-nums");
    });

    it("puts a column's width class on its col, so the Section supplies the widths", () => {
        const { container } = render(InvoiceTable, { columns, rows });
        const cols = container.querySelectorAll("col");

        expect(getComputedStyle(cols[0]).width).toBe("120px");
        expect(getComputedStyle(cols[1]).width).toBe("96px");
    });
});
