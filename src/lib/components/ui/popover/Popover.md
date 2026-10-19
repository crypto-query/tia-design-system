# Popover — notes

A new component, not a port: the reference never drew one. It came from the
Predictive Cycles Block, which needs a year popover (a grid of year toggles, two
action buttons and a note) and a "How to use this chart" panel, both drawn as a
bottom sheet on a narrow card.

The rules that hold for _every_ component live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of Popover alone. `Tooltip.md` is the sibling, and two of its
upstream workarounds apply here unchanged.

## One component with a `sheet` prop, not a Popover and a Sheet

The popover and the sheet hold the same content and answer to the same trigger.
Two components would make every call site render the content twice and pick
one by width. One component keeps the content in one place, and the call site
passes `sheet` from **its own** container width. The component does not measure
anything: a Block knows its card width, and a viewport media query would be wrong
inside a narrow card on a wide screen.

Both modes use the same bits-ui `Popover.Root` and `Popover.Trigger`, so the
trigger always carries `aria-haspopup="dialog"`, `aria-expanded` and, while open,
`aria-controls`. Only the content differs:

| Mode    | How the panel renders                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| popover | `Content`'s `child` snippet with the floating wrapper, so floating-ui places it against the trigger and flips it                                  |
| sheet   | the same snippet **without** the wrapper. floating-ui then has no element to place, and `fixed inset-x-0 bottom-0` pins the panel to the viewport |

Dropping `wrapperProps` is all it takes: the content's own props still carry the
ref, the dismiss and escape layers, and the id the trigger points at. A
`Dialog` for the sheet would lose `aria-expanded` / `aria-controls` on the trigger,
and the trigger would differ between modes.

## The look

| Part       | Popover                                                                       | Sheet                                                                                  |
| ---------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| surface    | `bg-popover-background`, `border-popover-border`, `shadow-medium`, as Tooltip | same                                                                                   |
| shape      | `rounded-md`, `w-80` (the call site may pass `class="w-85"`)                  | full width, `rounded-t-2xl`, no side or bottom border, `max-h-dvh` with its own scroll |
| title      | `h3`, `text-lg` semibold                                                      | `text-xl` semibold                                                                     |
| close      | none — Esc and a click outside are enough                                     | ghost icon `Button`, `size-11` (44px), `aria-label="Close"`                            |
| decoration | none                                                                          | grab bar (`bg-border`, `h-1 w-10`) and a `bg-scrim` backdrop, both on existing tokens  |

The mockup's values snap to the scale: title 15px is `text-lg`, 17px snaps to
`text-xl`, and the sheet's 20px corner snaps to `rounded-t-2xl` (24px).

The panel sets no body text size. The content is the call site's, and the year
grid and the help list want different type.

## Focus

| Event                                       | Where focus goes                                                 |
| ------------------------------------------- | ---------------------------------------------------------------- |
| open                                        | the first tabbable in the panel, else the panel itself (bits-ui) |
| Esc, the close button, a click on the scrim | the trigger                                                      |
| a click outside on plain page               | the trigger                                                      |
| a click outside on another control          | stays on that control                                            |
| Tab out of a popover                        | where Tab put it; the popover closes                             |
| one popover hands off to another            | the second one; on its close, **its own** trigger                |

Two decisions make this table true:

- **`onCloseAutoFocus` is ours.** bits-ui refocuses the element that held focus
  when the panel opened. After a hand-off between two popovers that is the first
  popover's trigger, so Esc in the second would send focus to the wrong button.
  The component focuses its own trigger instead, but only when focus is in the
  panel or on `<body>`. Focus the reader moved on purpose stays where it is.
- **Focus is trapped in the sheet only.** The sheet covers the page with a scrim,
  so it is modal in effect. The popover is not: with the bits-ui default trap a
  click on a field outside would lose its focus back to the trigger. The popover closes
  on focus outside instead, so a Tab out does not leave it open behind.

Tab order is a known cost of a portalled, non-modal panel: the panel sits at the
end of its portal target, so Tab from its last control goes to whatever follows
that target, not to the control after the trigger.

## `open` is deferred a tick

Same upstream trap as `Tooltip.md` describes: a panel open on the root's first
render is never placed. The primitive gets `mounted && open` and writes its own
changes back through `onOpenChange`. The call site owns `open` — it is how one
Block closes the year popover when the help panel opens.

## `portalTarget`

The panel portals to `<body>` by default. A WordPress Block passes its scoped
root, or the panel draws unstyled. The sheet's `fixed` positioning still pins to
the viewport from inside that root, unless an ancestor sets a `transform`.
