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

The palette of the original Predictive Cycles chart, the same in both themes. A chart takes the slots in order.

| Slot         | Hex       | On white | On the dark card |
| ------------ | --------- | -------- | ---------------- |
| `--chart-1`  | `#008ffb` | 3.32:1   | 4.12:1           |
| `--chart-2`  | `#00e396` | 1.69:1   | 8.11:1           |
| `--chart-3`  | `#feb019` | 1.84:1   | 7.46:1           |
| `--chart-4`  | `#ff4560` | 3.35:1   | 4.09:1           |
| `--chart-5`  | `#775dd0` | 4.93:1   | 2.78:1           |
| `--chart-6`  | `#f86624` | 3.04:1   | 4.51:1           |
| `--chart-7`  | `#2b908f` | 3.83:1   | 3.58:1           |
| `--chart-8`  | `#c7f464` | 1.27:1   | 10.8:1           |
| `--chart-9`  | `#03a9f4` | 2.63:1   | 5.21:1           |
| `--chart-10` | `#546e7a` | 5.40:1   | 2.54:1           |
| `--chart-11` | `#a5978b` | 2.84:1   | 4.83:1           |

The palette is kept for its match with the original, not for contrast: several slots are under 3:1 in one theme.
Under a Machado 2009 full-severity dichromacy, slots 4 and 6 come within 4.5 ΔE2000 and slots 1 and 9 within 6.0, so
a chart names its series in chips, a tooltip or labels as well. Slots 10 and 11 are not in the original.
