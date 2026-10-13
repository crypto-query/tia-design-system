<script module lang="ts">
    import type { Snippet } from "svelte";

    /** One column: its header label, how it aligns, and how it draws a row's cell. */
    export type TableColumn<Row> = {
        /** Header text, rendered in a `th scope="col"`. */
        label: string;
        /** Draws one row's cell in this column. */
        cell: Snippet<[Row]>;
        /** Cell and header alignment. */
        align?: "left" | "center" | "right";
        /** Figures line up across rows — for money, dates and counts. */
        numeric?: boolean;
        /** Width class for this column's `col`, supplied by the calling Section. */
        class?: string;
    };
</script>

<script lang="ts" generics="Row">
    import type { HTMLTableAttributes } from "svelte/elements";
    import { cn } from "../../../utils/cn";

    type Props = Omit<HTMLTableAttributes, "children"> & {
        columns: TableColumn<Row>[];
        rows: Row[];
        empty?: Snippet;
    };

    let { columns, rows, empty, class: className, ...restProps }: Props = $props();

    const alignStyles = {
        left: "text-left",
        center: "text-center",
        right: "text-right"
    } as const;

    const alignOf = (column: TableColumn<Row>) => alignStyles[column.align ?? "left"];

    // The edge inset is the table's own, and a first or last column's width is
    // therefore a content width — see Table.md.
    const cellStyles = "first:pl-6 last:pr-6";
</script>

<table class={cn("w-full table-fixed border-collapse", className)} {...restProps}>
    <colgroup>
        {#each columns as column, i (i)}
            <col class={column.class} />
        {/each}
    </colgroup>
    <thead>
        <tr class="border-b border-border">
            {#each columns as column, i (i)}
                <th
                    scope="col"
                    class={cn("pb-2.25 text-2xs font-bold tracking-widest text-foreground-subtle uppercase", alignOf(column), cellStyles)}
                    >{column.label}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each rows as row, r (r)}
            <tr class="border-b border-border-muted">
                {#each columns as column, i (i)}
                    <td class={cn("py-3.25", alignOf(column), column.numeric && "tabular-nums", cellStyles)}>{@render column.cell(row)}</td>
                {/each}
            </tr>
        {:else}
            {#if empty}
                <tr>
                    <td colspan={columns.length} class={cn("py-6.5 text-center", cellStyles)}>{@render empty()}</td>
                </tr>
            {/if}
        {/each}
    </tbody>
</table>
