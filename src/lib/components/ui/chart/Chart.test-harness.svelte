<!-- Reads back the bound `chart`, and mounts Chart conditionally so teardown is observable from the parent. -->
<script lang="ts">
    import type { ECharts, EChartsCoreOption } from "echarts/core";
    import Chart from "./Chart.svelte";

    let { option, show = true }: { option: EChartsCoreOption; show?: boolean } = $props();

    let chart = $state<ECharts>();
</script>

{#if show}
    <Chart data-testid="chart" class="h-75 w-100" {option} bind:chart />
{/if}
<output data-testid="bound">{chart?.id ?? "none"}</output>
