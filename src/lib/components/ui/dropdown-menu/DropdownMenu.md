# DropdownMenu — notes

A new component, not a port. It came from the Predictive Cycles Block, which
needs a "Settings" menu: two actions and three on/off settings, each with an
icon and a line of help.

The rules that hold for _every_ component live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of DropdownMenu alone.

## Four parts

| Part                    | Renders                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `DropdownMenu`          | root, the caller's `trigger` snippet, portal and the panel. Rest props reach the panel  |
| `DropdownMenuGroup`     | a group, named by its optional small uppercase `heading`                                |
| `DropdownMenuItem`      | an action, or with `bind:checked` a `menuitemcheckbox` with a switch picture at its end |
| `DropdownMenuSeparator` | a 1px rule, edge to edge                                                                |

One item component picks its primitive the way `Toggle` does: `checked`
undefined is a bits-ui `Item`, a boolean is a `CheckboxItem`. Both share one row
layout. The checkbox item sets `closeOnSelect={false}`, so toggling leaves the
menu open; an action closes it, the bits-ui default.

## The look

The panel and rows are Select's recipe: `rounded-lg`, `border-border-muted`,
`bg-surface`, `shadow-medium`, `p-1.25`, rows `min-h-9` (`pointer-coarse:min-h-11`)
filled `bg-accent` / `text-accent-foreground` while `data-highlighted`. The
highlight fill is the keyboard focus indicator, as in Select; rows take
`outline-hidden`. The panel is `w-75` (the mockup's 300px), capped by the room
floating-ui reports. A call site may pass a width class.

With a `description` a row aligns to the top and adds `py-2`. The label is the
item's name (`aria-labelledby`), the description its `aria-describedby`.

## Placement and portal

`align="end"`, `side="bottom"`, `sideOffset` 6 and `collisionPadding` 8, so the
300px panel keeps 8px off each edge of a 360px viewport. It portals to `<body>`
unless `portalTarget` is passed. A WordPress Block passes its scoped root, as for
Popover. `preventScroll` is off: the bits-ui scroll lock pads and freezes the
page, which shifts a WordPress page under the menu.

## The trigger is the caller's

`trigger` gets the primitive's props to spread on its own element. There is no
icon-button component yet; the playground draws the Block's round `size-7.5`
button inline. Name the menu with `aria-label` on `DropdownMenu`; bits-ui does
not label the menu from its trigger.
