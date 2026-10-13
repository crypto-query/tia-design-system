# Select — component notes

A new component, not a port. It picks one value from a fixed list, on the bits-ui
`Select` primitive with `type="single"`. "The Combobox" below is the design
system's searchable select, whose panel-mode trigger and rows this one copies,
without the search box.

The rules that hold for _every_ component live in
`.agents/skills/tia-design-system/SKILL.md`. This file is only what is true of
Select alone.

## API

| Prop                            | Type                   | Default     | Notes                                                                    |
| ------------------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------ |
| `items`                         | `SelectItem[]`         | —           | required; see the data form below                                        |
| `value`                         | `string`, `$bindable`  | `""`        | `""` means nothing is chosen, as in bits-ui                              |
| `open`                          | `boolean`, `$bindable` | `false`     |                                                                          |
| `label`                         | `string`               | —           | visible `<label for>` above the trigger; without it, pass `aria-label`   |
| `placeholder`                   | `string`               | `"Select…"` | drawn in `text-foreground-subtle` while nothing is chosen                |
| `size`                          | `"sm" \| "md" \| "lg"` | `"md"`      | trigger 34 ｜ 40 ｜ 46px, rows 32 ｜ 36 ｜ 42px, the Combobox's geometry |
| `disabled`                      | `boolean`              | `false`     |                                                                          |
| `portalTarget`                  | `PortalProps["to"]`    | body        | see below                                                                |
| `onValueChange`, `onOpenChange` | callbacks              | —           |                                                                          |
| `class`                         | `string`               | —           | lands on the bordered trigger, for width and shape; `w-full` by default  |
| everything else                 | button attributes      | —           | spread onto the trigger: `aria-label`, `id`, `data-*`                    |

Import the item type from the component: `import Select, { type SelectItem } from ".../Select.svelte"`.

## The data form

```ts
type SelectItem = { value: string; label: string; group?: string; disabled?: boolean };
```

Rows are bucketed by `group` name in first-seen order, so two rows sharing a name
land under one heading even when a third sits between them. Each named bucket is a
`Select.Group` with a `Select.GroupHeading`, which gives the group its accessible
name. Rows with no `group` form one bucket with no heading and no group wrapper.

## `portalTarget` mounts the panel inside a scoped root

The panel portals to `<body>` by default. A consumer that scopes the design
system's styles under its own root — a WordPress Block, for one — passes that
root (an element or a selector) as `portalTarget`. Otherwise the panel lands
outside the scope and draws unstyled. The prop goes straight to `Select.Portal`'s
`to`.

## Two attributes added to the primitive

| Added                                    | Why                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="combobox"` on the trigger         | bits-ui 2.19.2 renders the trigger as a plain button with `aria-haspopup="listbox"` and no role. The ARIA select-only combobox pattern names it a combobox |
| `aria-disabled="true"` on a disabled row | bits-ui marks a disabled option only with `data-disabled`, which no reader announces                                                                       |

## Departures from the Combobox

| Combobox                                                         | Select                                                                                  | Why                                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| search box, `filter`, empty message                              | none                                                                                    | a fixed list; bits-ui typeahead jumps to a row by its `label` |
| `error`, `errorMessage`, `helperText`                            | none                                                                                    | not needed yet                                                |
| `width`, `menuWidth`, `maxMenuHeight`, `side`, `align`, `offset` | fixed: trigger width from `class`, panel at the trigger's width, `max-h-72`, below, 6px | no caller needs them yet                                      |
| `children` form with `ComboboxItem`, `ComboboxGroup`             | data form only, one file                                                                | one export entry                                              |
| `value: string \| number \| null`                                | `value: string`, `""` for nothing                                                       | the primitive's own type                                      |

Only the highlighted row gets the accent fill, with `accent-foreground` text
and check. The Combobox uses `primary` text there, which reads at 2.9:1 on the
dark accent fill. In bits-ui Select,
`data-selected` marks the chosen row, so it gets no fill: its label is
`font-semibold` and it shows the check mark. The check is always rendered
with an opacity toggle so the text does not shift.
