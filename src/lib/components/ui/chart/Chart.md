# Chart — component notes

A new component, not a port. It holds the chart mechanics every chart Block shares,
on ECharts 6. Series, formatters and interaction stay with the Block that draws them.

| Export           | Does                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Chart.svelte`   | Mounts one ECharts instance on a `div`, re-applies `option` when it changes, follows the container's size, and disposes on teardown |
| `chart-theme.ts` | `chartTheme(root)` returns option fragments — `color`, `textStyle`, `axis`, `tooltip`, `dataZoom` — read from the tokens on `root`  |

## Chart

| Prop            | Use                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `option`        | The ECharts option. A new object re-runs `setOption`; it never re-creates the instance                                             |
| `setOptionOpts` | Passed to every `setOption`. Use `replaceMerge: ["series"]` when a series can disappear — a plain merge keeps it                   |
| `bind:chart`    | The instance, for `dispatchAction`, `on`, `convertToPixel` and graphic drag. `undefined` before mount and after teardown           |
| `class`, rest   | Land on the root `div`. Give the chart its height through `class`, and its name through `role`, `aria-label` or `aria-describedby` |

- **Resize is silent.** `Chart` resizes itself and does not tell the consumer. Code
  that keeps pixel positions, such as a Graphic drag handle, re-reads them on the
  instance's `finished` event.
- **Pass a fresh option.** `setOption` runs in an effect, so a deep `$state` option
  re-applies on every nested change. Pass a new object, for example from `$derived`,
  or use `$state.raw`.

## The consumer registers its own ECharts parts

`Chart` imports from `echarts/core` and calls no `use()`, so a Block ships only the
chart types it draws. Register them once, at module level:

```ts
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, DataZoomComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);
```

## chartTheme reads once, from the Block root

Call it once after mount with the Block's root element, then spread its parts into
the option (`xAxis: { ...theme.axis, type: "time" }`). It reads the root's computed
style one time and does not watch it. The font family comes from the root's own
`font-family`, not from a token, because a Block inherits its type from the editor
or the theme around it.

## Series slots

| Slot         | Role           | Hex       |
| ------------ | -------------- | --------- |
| `--chart-1`  | Actual         | `#cf801d` |
| `--chart-2`  | All            | `#0a315a` |
| `--chart-3`  | Y1             | `#235af3` |
| `--chart-4`  | Y2             | `#659f6a` |
| `--chart-5`  | Y3             | `#c92b75` |
| `--chart-6`  | Y4             | `#826d0f` |
| `--chart-7`  | Decade offsets | `#137d8e` |
| `--chart-8`  | 20 & 60        | `#6e12a9` |
| `--chart-9`  | Bear           | `#8c1e00` |
| `--chart-10` | Bull           | `#1f6b40` |
| `--chart-11` | Halving        | `#a184d3` |

Each pair that shares a chart stays at least 11.45 ΔE2000 apart (worst: Actual and Y4 under protanopia) under every
dichromacy. Slots 7–8 never share a chart with slots 9–11. Each slot is at least
3:1 on white. Re-check both before you change one value.

## Light only

The chart tokens have no `.dark` values, which breaks the rule that a new token is
defined in both themes. That is deliberate: the Blocks that draw charts render on a
light theme only. Add the dark values when dark mode comes into scope — not before.
