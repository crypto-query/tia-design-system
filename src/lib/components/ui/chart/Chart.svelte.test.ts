import { cleanup, render, screen } from "@testing-library/svelte";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { getInstanceByDom, use, type ECharts, type EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { ComponentProps } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Chart from "./Chart.svelte";
import Harness from "./Chart.test-harness.svelte";
import "../../../../app.css";

use([LineChart, GridComponent, CanvasRenderer]);

afterEach(cleanup);

const line = (data: number[], id = "a"): EChartsCoreOption => ({
    xAxis: { type: "category", data: data.map((_, i) => String(i)) },
    yAxis: { type: "value" },
    series: [{ id, type: "line", data }]
});

function renderChart(props: ComponentProps<typeof Chart>) {
    return render(Chart, { "data-testid": "chart", style: "width: 400px; height: 300px", ...props });
}

const root = () => screen.getByTestId("chart");

function instance(): ECharts {
    const chart = getInstanceByDom(root());
    if (!chart) throw new Error("no ECharts instance on the root");
    return chart;
}

function seriesData(chart: ECharts): unknown[] {
    const { series } = chart.getOption() as { series: { data: unknown[] }[] };
    return series.map((s) => s.data);
}

describe("Chart", () => {
    it("draws the option onto a canvas on mount", () => {
        renderChart({ option: line([1, 2, 3]) });

        expect(root().querySelector("canvas")).not.toBeNull();
        expect(seriesData(instance())).toEqual([[1, 2, 3]]);
    });

    it("applies a new option without creating a new instance", async () => {
        const { rerender } = renderChart({ option: line([1, 2, 3]) });
        const first = instance();

        await rerender({ option: line([4, 5, 6]) });

        expect(instance()).toBe(first);
        expect(seriesData(first)).toEqual([[4, 5, 6]]);
    });

    // A plain merge keeps a series the new option no longer names, so hiding one needs replaceMerge.
    it("passes setOptionOpts to setOption, so replaceMerge drops a series", async () => {
        const two: EChartsCoreOption = {
            ...line([1, 2]),
            series: [
                { id: "a", type: "line", data: [1, 2] },
                { id: "b", type: "line", data: [3, 4] }
            ]
        };
        const { rerender } = renderChart({ option: two, setOptionOpts: { replaceMerge: ["series"] } });

        await rerender({ option: line([1, 2]) });

        expect(seriesData(instance())).toEqual([[1, 2]]);
    });

    it("resizes the instance when its container changes width", async () => {
        renderChart({ option: line([1, 2, 3]) });
        const chart = instance();
        expect(chart.getWidth()).toBe(400);

        root().style.width = "600px";

        await vi.waitFor(() => expect(chart.getWidth()).toBe(600));
    });

    it("disposes the instance on unmount", () => {
        const { unmount } = renderChart({ option: line([1]) });
        const el = root();
        const chart = instance();

        unmount();

        expect(chart.isDisposed()).toBe(true);
        expect(getInstanceByDom(el)).toBeUndefined();
    });

    it("hands the instance to a bound chart prop and clears it on teardown", async () => {
        const { rerender } = render(Harness, { option: line([1]) });
        const bound = screen.getByTestId("bound");

        expect(bound.textContent).toBe(instance().id);

        await rerender({ show: false });

        expect(bound.textContent).toBe("none");
    });

    it("puts native attributes on the root element", () => {
        renderChart({ option: line([1]), role: "img", "aria-label": "Price history" });

        expect(screen.getByRole("img", { name: "Price history" })).toBe(root());
    });
});
