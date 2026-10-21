import { afterEach, describe, expect, it } from "vitest";
import { chartTheme } from "./chart-theme";
import "../../../../app.css";

const SLOTS = ["#008ffb", "#00e396", "#feb019", "#ff4560", "#775dd0", "#f86624", "#2b908f", "#c7f464", "#03a9f4", "#546e7a", "#a5978b"];

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let mounted: HTMLElement[] = [];

function block(style: string): HTMLElement {
    const el = document.createElement("div");
    el.style.cssText = style;
    document.body.append(el);
    mounted.push(el);
    return el;
}

afterEach(() => {
    mounted.forEach((el) => el.remove());
    mounted = [];
});

describe("chartTheme", () => {
    it("lists the eleven chart slots in order", () => {
        expect(chartTheme(document.documentElement).color.map((c) => c.toLowerCase())).toEqual(SLOTS);
    });

    it("reads from the root it is given", () => {
        const root = block("--chart-1: #123456");

        expect(chartTheme(root).color[0]).toBe("#123456");
        expect(chartTheme(document.documentElement).color[0].toLowerCase()).toBe(SLOTS[0]);
    });

    it("takes the font family from the root, not from a token", () => {
        const theme = chartTheme(block("font-family: Georgia, serif"));

        expect(theme.textStyle.fontFamily).toBe("Georgia, serif");
        expect(theme.axis.axisLabel.fontFamily).toBe("Georgia, serif");
        expect(theme.tooltip.textStyle?.fontFamily).toBe("Georgia, serif");
        expect(theme.textStyle.fontSize).toBe(12);
    });

    it("styles axes, tooltip and data zoom from their tokens", () => {
        const theme = chartTheme(document.documentElement);

        expect(theme.textStyle.color).toBe(token("--foreground"));
        expect(theme.axis.axisLabel.color).toBe(token("--foreground-muted"));
        expect(theme.axis.axisLine.lineStyle.color).toBe(token("--border"));
        expect(theme.axis.splitLine.lineStyle.color).toBe(token("--border-muted"));
        expect(theme.tooltip.backgroundColor).toBe(token("--popover-background"));
        expect(theme.tooltip.borderColor).toBe(token("--popover-border"));
        expect(theme.dataZoom.borderColor).toBe(token("--border"));
    });
});
