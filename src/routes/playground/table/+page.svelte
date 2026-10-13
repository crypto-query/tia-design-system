<script lang="ts">
    import { Download } from "lucide-svelte";
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Button from "$lib/components/ui/button/Button.svelte";
    import Card from "$lib/components/ui/card/Card.svelte";
    import Table, { type TableColumn } from "$lib/components/ui/table/Table.svelte";

    type Invoice = {
        reference: string;
        date: string;
        label: string;
        amount: string;
        status: string;
        variant: "success" | "warning" | "error" | "neutral";
    };

    const statusStyles: Record<Invoice["variant"], string> = {
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        neutral: "text-foreground-muted"
    };

    // The account design's own fixture rows, so the columns are judged against
    // real reference lengths, real money and every status the pane can draw.
    const invoices: Invoice[] = [
        {
            reference: "#TIA-2026-0208",
            date: "12 Feb 2026",
            label: "TIA Strategies · 1 strategy",
            amount: "$149.00",
            status: "Paid",
            variant: "success"
        },
        {
            reference: "#TIA-2026-0143",
            date: "8 Nov 2025",
            label: "TIA Strategies · 3 strategies",
            amount: "$1,782.00",
            status: "Open",
            variant: "warning"
        },
        {
            reference: "#TIA-2025-0091",
            date: "17 Nov 2024",
            label: "TIA Strategies · 2 strategies",
            amount: "$1,782.00",
            status: "Failed",
            variant: "error"
        },
        {
            reference: "#TIA-2025-0044",
            date: "11 Oct 2024",
            label: "TIA Strategies · 1 strategy",
            amount: "$149.00",
            status: "Refunded",
            variant: "neutral"
        }
    ];

    // The Invoices pane's own widths — `120px 96px minmax(0,1fr) 92px 84px 34px`,
    // with the first and last carrying the table's 24px edge inset.
    const invoiceColumns: TableColumn<Invoice>[] = [
        { label: "Reference", cell: reference, class: "w-36" },
        { label: "Date", cell: date, numeric: true, class: "w-24" },
        { label: "Description", cell: description },
        { label: "Amount", cell: amount, align: "right", numeric: true, class: "w-23" },
        { label: "Status", cell: status, align: "center", class: "w-21" },
        { label: "PDF", cell: pdf, align: "right", class: "w-14.5" }
    ];

    type Ledger = { region: string; strategies: string; revenue: string };

    const ledger: Ledger[] = [
        { region: "Europe", strategies: "18", revenue: "$412,900.00" },
        { region: "North America", strategies: "7", revenue: "$98,410.50" },
        { region: "Asia Pacific", strategies: "111", revenue: "$1,004.75" }
    ];

    const alignmentColumns: TableColumn<Ledger>[] = [
        { label: "Left (default)", cell: region },
        { label: "Centre", cell: strategies, align: "center" },
        { label: "Right", cell: revenue, align: "right" }
    ];

    const numericColumns: TableColumn<Ledger>[] = [
        { label: "Region", cell: region },
        { label: "Proportional", cell: revenue, align: "right" },
        { label: "Numeric", cell: revenue, align: "right", numeric: true }
    ];
</script>

{#snippet reference(invoice: Invoice)}
    <span class="font-mono text-xs whitespace-nowrap text-foreground-muted">{invoice.reference}</span>
{/snippet}

{#snippet date(invoice: Invoice)}
    <span class="text-sm whitespace-nowrap text-foreground-muted">{invoice.date}</span>
{/snippet}

{#snippet description(invoice: Invoice)}
    <span class="block pr-2.5 text-sm/snug text-pretty text-foreground">{invoice.label}</span>
{/snippet}

{#snippet amount(invoice: Invoice)}
    <span class="text-md font-semibold text-foreground">{invoice.amount}</span>
{/snippet}

{#snippet status(invoice: Invoice)}
    <span class="text-xs font-semibold {statusStyles[invoice.variant]}">{invoice.status}</span>
{/snippet}

<!--
    Markup rather than `Button variant="ghost" size="icon"`, which is the nearest component:
    `icon` is 40px and cannot fit the 34px column the design draws. The pseudo-element is what
    still gives the 30px glyph a 44px hit target without widening that column.
-->
{#snippet pdf(invoice: Invoice)}
    <a
        href="#invoice-pdf"
        title="Download invoice {invoice.reference}"
        class="relative ml-auto grid size-7.5 place-items-center rounded-sm text-foreground-muted after:absolute after:-inset-1.75 after:content-[''] hover:bg-surface-sunken hover:text-primary">
        <Download class="size-4" aria-hidden="true" />
        <span class="sr-only">Download invoice {invoice.reference}</span>
    </a>
{/snippet}

{#snippet region(row: Ledger)}
    <span class="text-sm text-foreground">{row.region}</span>
{/snippet}

{#snippet strategies(row: Ledger)}
    <span class="text-sm text-foreground-muted">{row.strategies}</span>
{/snippet}

{#snippet revenue(row: Ledger)}
    <span class="text-sm text-foreground">{row.revenue}</span>
{/snippet}

<svelte:head>
    <title>Table — playground</title>
</svelte:head>

<div class="space-y-10 p-10">
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Table</h1>
        <p class="text-sm text-foreground-muted">
            A real <code class="font-mono">&lt;table&gt;</code> with a header row. Each column names its own alignment, its numeric flag and the
            snippet that draws its cells; the calling Section supplies the widths.
        </p>
    </header>

    <Alert variant="info" role="note" title="Table, Card rows or Timeline?">
        Reach for <strong>Table</strong> when the rows share a set of fields and a reader compares one field down the column — an invoice
        history, a ledger, a rate card. A stack of <strong>Card</strong> rows is the right pick when each entry is read on its own and
        carries its own actions, the way the subscription list does. <strong>Timeline</strong> is for entries whose order is the point, and
        <strong>Pagination</strong> is the separate control for when the rows outrun one page.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <p class="max-w-prose text-sm/relaxed text-foreground-muted">
            Table draws tabular data with column semantics assistive technology can follow — every header is a
            <code class="font-mono">th scope="col"</code>, so a screen reader can name the column a cell belongs to. The threshold is the
            comparison: if a reader scans <em>down</em> a column, it is a table. If every entry is a self-contained block with a heading and buttons,
            it is a list of cards, and a table will fight you. It ships no sorting, no selection and no sticky header — a screen that needs those
            wants a data grid, not this.
        </p>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">The Invoices pane</h2>
        <p class="max-w-prose text-sm text-foreground-muted">
            Six columns inside a <code class="font-mono">Card</code> with no padding, so each row's rule reaches both card edges. The widths come
            from the Section; the alignment, the tabular figures and the header row come from the component.
        </p>
        <Card padding="none" elevated class="max-w-3xl">
            <div class="flex items-baseline justify-between gap-3.5 px-6 pt-5 pb-4">
                <span class="text-xl font-semibold tracking-tight">Invoice history</span>
                <span class="text-xs text-foreground-subtle">Last 12 months</span>
            </div>
            <Table columns={invoiceColumns} rows={invoices} aria-label="Invoice history" />
            <div class="flex justify-center px-6 pt-3.5 pb-4.5">
                <Button variant="ghost" size="sm" href="#all-invoices">View all invoices</Button>
            </div>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Column alignment</h2>
        <p class="max-w-prose text-sm text-foreground-muted">
            A column's <code class="font-mono">align</code> moves its header and its cells together, so the header always sits over the edge its
            figures line up on.
        </p>
        <Card padding="none" class="max-w-2xl pt-5">
            <Table columns={alignmentColumns} rows={ledger} aria-label="Column alignment" />
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">The numeric flag</h2>
        <p class="max-w-prose text-sm text-foreground-muted">
            <code class="font-mono">numeric</code> sets <code class="font-mono">tabular-nums</code> on the column's cells — the digits take one
            shared width, so the decimal points stack. Compare the two right-hand columns: same figures, only the second one lines up.
        </p>
        <Card padding="none" class="max-w-2xl pt-5">
            <Table columns={numericColumns} rows={ledger} aria-label="The numeric flag" />
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">No rows</h2>
        <p class="max-w-prose text-sm text-foreground-muted">
            Without an <code class="font-mono">empty</code> snippet, an empty <code class="font-mono">rows</code> array draws the header alone.
            The Section can place its empty-state copy outside the table.
        </p>
        <Card padding="none" class="max-w-3xl pt-5">
            <Table columns={invoiceColumns} rows={[]} aria-label="No invoices" />
            <p class="px-6 py-6.5 text-center text-sm text-foreground-subtle">
                No invoices yet — your first one appears here after the first charge.
            </p>
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Body message</h2>
        <p class="max-w-prose text-sm text-foreground-muted">
            Supply an <code class="font-mono">empty</code> snippet to keep the headers and show a message inside the table body. The message spans
            all columns and disappears when rows exist.
        </p>
        <Card padding="none" class="max-w-3xl pt-5">
            <Table columns={invoiceColumns} rows={[]} aria-label="Invoice history unavailable">
                {#snippet empty()}
                    <span class="text-sm text-foreground-muted">We couldn't load your invoices.</span>
                {/snippet}
            </Table>
        </Card>
    </section>
</div>
