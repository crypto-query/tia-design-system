import type { SliderDataZoomComponentOption, TooltipComponentOption } from "echarts";
import { color as echartsColor } from "echarts/core";

interface ChartText {
    color: string;
    fontFamily: string;
    fontSize: number;
}

interface ChartLine {
    lineStyle: { color: string };
}

export interface ChartTheme {
    color: string[];
    textStyle: ChartText;
    axis: { axisLine: ChartLine; axisTick: ChartLine; axisLabel: ChartText; splitLine: ChartLine };
    tooltip: TooltipComponentOption;
    dataZoom: SliderDataZoomComponentOption;
}

/** Option fragments drawn from the tokens resolved on `root`; read once, then spread into an option. */
export function chartTheme(root: Element): ChartTheme {
    const style = getComputedStyle(root);
    const token = (name: string) => style.getPropertyValue(name).trim();
    const font = { fontFamily: style.fontFamily, fontSize: Number.parseFloat(token("--text-xs")) };
    const text = (color: string): ChartText => ({ color: token(color), ...font });
    const border = token("--border");
    const primary = token("--primary");

    return {
        color: Array.from({ length: 11 }, (_, i) => token(`--chart-${i + 1}`)),
        textStyle: text("--foreground"),
        axis: {
            axisLine: { lineStyle: { color: border } },
            axisTick: { lineStyle: { color: border } },
            axisLabel: text("--foreground-muted"),
            splitLine: { lineStyle: { color: token("--border-muted") } }
        },
        tooltip: {
            backgroundColor: token("--popover-background"),
            borderColor: token("--popover-border"),
            borderWidth: 1,
            textStyle: text("--popover-foreground")
        },
        dataZoom: {
            borderColor: border,
            fillerColor: echartsColor.modifyAlpha(primary, 0.12),
            handleStyle: { color: token("--card-background"), borderColor: primary },
            moveHandleStyle: { color: border },
            dataBackground: { lineStyle: { color: border }, areaStyle: { color: echartsColor.modifyAlpha(border, 0.4) } },
            selectedDataBackground: { lineStyle: { color: primary }, areaStyle: { color: echartsColor.modifyAlpha(primary, 0.2) } },
            textStyle: text("--foreground-muted")
        }
    };
}
