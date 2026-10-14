# Combobox — component notes

A port. It picks one value from a list and filters the list as you type, on
bits-ui `Popover` over `Command`. It is the Select with a search box in the
panel: same trigger, same rows, same data form. The source is the Combobox of
the trading-strategies app, cut down to its panel search mode and its `items`
form.

The rules that hold for _every_ component live in
`.agents/skills/tia-design-system/SKILL.md`. This file is only what is true of
Combobox alone.

## API

| Prop                            | Type                   | Default         | Notes                                                                   |
| ------------------------------- | ---------------------- | --------------- | ----------------------------------------------------------------------- |
| `items`                         | `ComboboxItem[]`       | —               | required; see the data form below                                       |
| `value`                         | `string`, `$bindable`  | `""`            | `""` means nothing is chosen                                            |
| `open`                          | `boolean`, `$bindable` | `false`         |                                                                         |
| `label`                         | `string`               | —               | visible label above the trigger; without it, pass `aria-label`          |
| `placeholder`                   | `string`               | `"Select…"`     | drawn in `text-foreground-subtle` while nothing is chosen               |
| `searchPlaceholder`             | `string`               | `"Search…"`     | the search box's placeholder and its accessible name                    |
| `emptyMessage`                  | `string`               | `"No results."` | shown, as `role="status"`, when the query matches nothing               |
| `size`                          | `"sm" \| "md" \| "lg"` | `"md"`          | trigger 34 ｜ 40 ｜ 46px, rows 32 ｜ 36 ｜ 42px, as the Select          |
| `disabled`                      | `boolean`              | `false`         |                                                                         |
| `portalTarget`                  | `PortalProps["to"]`    | body            | as the Select: mounts the panel inside a scoped root                    |
| `onValueChange`, `onOpenChange` | callbacks              | —               |                                                                         |
| `class`                         | `string`               | —               | lands on the bordered trigger, for width and shape; `w-full` by default |
| everything else                 | button attributes      | —               | spread onto the trigger: `aria-label`, `id`, `data-*`                   |

Import the item type from the component: `import Combobox, { type ComboboxItem } from ".../Combobox.svelte"`.

## The data form

```ts
type ComboboxItem = { value: string; label: string; group?: string; disabled?: boolean };
```

Rows bucket by `group` name in first-seen order, as in the Select. Every bucket
is a `Command.Group`, headed or not: while a query is typed, `Command` sorts
grouped rows below ungrouped ones, and wrapping all of them keeps the declared
order. `Command` hides a group the query has emptied, heading and all.

## Filtering

`fuzzy-match.ts` matches the query's letters in order, not adjacent, against the
row's `label`. `Command` wants a score, so the filter returns 1 or 0: a graded
score would let `Command` re-sort the rows under the cursor.

## The panel is capped at the free width

The panel takes the trigger's width (`--bits-popover-anchor-width`) but never
more than floating-ui's available width (`--bits-popover-content-available-width`).
Without the cap, a full-width trigger on a 390px viewport pushed the panel past
the right edge once the 12px collision padding shifted it, and the page scrolled
sideways. The Select still has that defect.

## Accessibility

| Decision                                        | Why                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| trigger is a button with `role="combobox"`      | the ARIA select-only pattern. The trigger is rendered through `child` so it can override the popover's `aria-haspopup="dialog"` with `"listbox"` |
| `aria-labelledby` to the label                  | as the source; it names the trigger from the visible label                                                                                       |
| `Command.Root`'s `label` is `searchPlaceholder` | `Command` points the input's `aria-labelledby` at that hidden label, so this is the search box's name                                            |
| empty message is `role="status"`                | a panel that shrinks to nothing reads as the list being gone, not the query missing                                                              |
| `pointer-coarse` lifts trigger and rows to 44px | the touch floor                                                                                                                                  |

## Departures from the source

| Source                                                                | Here                                                                             | Why                                                                |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `search="field"` mode on the combobox primitive                       | panel mode only                                                                  | no caller needs it yet                                             |
| `children` form with `ComboboxItem`, `ComboboxGroup` and a context    | data form only, one file                                                         | the context existed only for the children form; one export entry   |
| `description`, `meta`, `icon`, `keywords` on a row; `filter` override | none                                                                             | no caller needs them yet; the filter reads `label` only            |
| `error`, `errorMessage`, `helperText`                                 | none                                                                             | not needed yet, as in the Select                                   |
| `width`, `menuWidth`, `maxMenuHeight`, `side`, `align`, `offset`      | trigger width from `class`, panel capped as above, `max-h-72`, below, start, 6px | no caller needs them yet                                           |
| `value: string \| number \| null`                                     | `value: string`, `""` for nothing                                                | the Select's type                                                  |
| highlighted row in `primary` text                                     | `accent-foreground` text and check                                               | `primary` reads at 2.9:1 on the dark accent fill; the Select's fix |
