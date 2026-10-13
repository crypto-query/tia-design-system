<script lang="ts">
    import Alert from "$lib/components/ui/alert/Alert.svelte";
    import Card from "$lib/components/ui/card/Card.svelte";
    import Chart from "$lib/components/ui/chart/Chart.svelte";
    import { chartTheme, type ChartTheme } from "$lib/components/ui/chart/chart-theme";
    import { LineChart } from "echarts/charts";
    import { DataZoomComponent, GridComponent, TooltipComponent } from "echarts/components";
    import { use, type EChartsCoreOption } from "echarts/core";
    import { CanvasRenderer } from "echarts/renderers";

    use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

    // Full class strings, so Tailwind finds every swatch colour when it scans this file.
    const SLOTS = [
        { slot: 1, role: "Actual", swatch: "bg-(--chart-1)" },
        { slot: 2, role: "All", swatch: "bg-(--chart-2)" },
        { slot: 3, role: "Y1", swatch: "bg-(--chart-3)" },
        { slot: 4, role: "Y2", swatch: "bg-(--chart-4)" },
        { slot: 5, role: "Y3", swatch: "bg-(--chart-5)" },
        { slot: 6, role: "Y4", swatch: "bg-(--chart-6)" },
        { slot: 7, role: "Decade offsets", swatch: "bg-(--chart-7)" },
        { slot: 8, role: "20 & 60", swatch: "bg-(--chart-8)" },
        { slot: 9, role: "Bear", swatch: "bg-(--chart-9)" },
        { slot: 10, role: "Bull", swatch: "bg-(--chart-10)" },
        { slot: 11, role: "Halving", swatch: "bg-(--chart-11)" }
    ];

    const POINTS = 120;
    const days = Array.from({ length: POINTS }, (_, i) => `Day ${i + 1}`);

    function sampleOption(theme: ChartTheme): EChartsCoreOption {
        return {
            color: theme.color,
            textStyle: theme.textStyle,
            tooltip: { ...theme.tooltip, trigger: "axis" },
            grid: { left: 48, right: 24, top: 24, bottom: 72 },
            xAxis: { ...theme.axis, type: "category", data: days },
            yAxis: { ...theme.axis, type: "value" },
            dataZoom: [{ ...theme.dataZoom, type: "slider", bottom: 16 }],
            series: SLOTS.map(({ slot, role }) => ({
                name: role,
                type: "line",
                showSymbol: false,
                lineStyle: { width: slot === 1 ? 3 : 2 },
                data: days.map((_, i) => Math.round((slot * 8 + 20 * Math.sin(i / 12 + slot)) * 10) / 10)
            }))
        };
    }

    let theme = $state<ChartTheme>();
    const option = $derived(theme && sampleOption(theme));
</script>

<svelte:head>
    <title>Chart — playground</title>
</svelte:head>

<div
    class="space-y-10 p-10"
    {@attach (root) => {
        theme = chartTheme(root);
    }}>
    <header class="space-y-1">
        <h1 class="text-2xl font-bold">Chart</h1>
        <p class="max-w-200 text-sm text-foreground-muted">
            One ECharts instance on a <code class="font-mono">div</code>, styled from the tokens through
            <code class="font-mono">chartTheme</code>. The component registers no ECharts parts — this page registers the line chart, grid,
            tooltip, data zoom and canvas renderer it draws. The theme is read once, after mount, from this page's root element. The chart
            tokens have no dark values yet, so read this page in light mode.
        </p>
    </header>

    <Alert class="max-w-200" variant="info" role="note" title="Chart, table or plain value?">
        Reach for a <strong>Chart</strong> when the shape of the data over time or across series is the point. A single number with a label
        reads faster as a <strong>plain value</strong> in text, and exact values the reader compares row by row belong in a
        <strong>Table</strong>.
    </Alert>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">When to use it</h2>
        <ul class="max-w-200 list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
                <span class="font-medium text-foreground">A Block that plots data.</span> It owns its series, formatters and interaction; Chart
                owns mounting, resizing and teardown.
            </li>
            <li>
                <span class="font-medium text-foreground">A series that can disappear.</span> Pass
                <code class="font-mono">setOptionOpts</code> with <code class="font-mono">replaceMerge</code>, or the old series stays
                drawn.
            </li>
            <li>
                <span class="font-medium text-foreground">Not for a single number.</span> A value with a label reads faster as text than as a
                chart.
            </li>
        </ul>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Eleven series, one per slot</h2>
        <Card padding="md">
            {#if option}
                <Chart {option} class="h-120 w-full" role="img" aria-label="Sample chart with one line per chart colour slot" />
            {/if}
        </Card>
    </section>

    <section class="space-y-3">
        <h2 class="text-lg font-semibold">Series slots</h2>
        <Card padding="md">
            <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {#each SLOTS as { slot, role, swatch } (slot)}
                    <li class="flex items-center gap-3">
                        <span aria-hidden="true" class={["size-8 shrink-0 rounded-md", swatch]}></span>
                        <span class="text-sm">
                            <span class="font-medium">{slot}. {role}</span>
                            <code class="block font-mono text-xs text-foreground-muted">--chart-{slot} {theme?.color[slot - 1]}</code>
                        </span>
                    </li>
                {/each}
            </ul>
        </Card>
    </section>
</div>
