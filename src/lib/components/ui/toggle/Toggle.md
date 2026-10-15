# Toggle — port notes

**This file covers two components.** `Toggle` and `ToggleGroup` ship as one
family and share one set of decisions, the way `TimelineItem` shares
`timeline/Timeline.md`. `Toggle`'s departures are first; `ToggleGroup`'s are under
its own heading at the end.

Deliberate departures from the reference's published prop contract, and the
component-specific decisions behind them. The reference `.d.ts` is authoritative
for prop names, unions and defaults; everything below overrules it on purpose.
**Do not "fix" one back.**

The rules that hold for _every_ component — the styling contract, semantic
tokens, status roles, snap-don't-extend, the no-`pill` directive, theming, the
accessibility floor and the standing port decisions — live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of Toggle alone.

| Contract                                                                                           | Built as                                                                                                                                           | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shape` of `square` ｜ `pill`, defaulting to `square` and inheritable from the group               | not ported — `class="rounded-full"` is the whole mechanism                                                                                         | the standing no-`pill` directive, in its clearest form: the skill names `shape` explicitly among the aliases the silhouette must not come back under. `cn()` already puts the incoming class last, and `Toggle.svelte.test.ts` pins it — a caller's `rounded-full` rounds the control, a plain one does not. The consequence to accept is that the component keeps **one** geometry: the side padding does not widen with the radius the way the reference's `pill` did                                                                                                                                                                                                                                                                                                         |
| `pressed` ｜ `defaultPressed` ｜ `onPressedChange`, controlled or uncontrolled                     | `bind:pressed`, with the primitive's `onPressedChange` beside it                                                                                   | `bind:` is what the React controlled/uncontrolled split maps onto — the same call Checkbox, Switch, Input, InputOTP and Slider all made. The callback survives for a call site that needs to compute from the change rather than hold the state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `value?: string \| number`                                                                         | `value?: string`                                                                                                                                   | bits-ui's `ToggleGroup.Item` takes a `string`. Accepting a number and stringifying it would round-trip a caller's `1` back through the group's bound value as `"1"`, which is a silent type change at the call site rather than a convenience. A `value` outside a group stays inert, as the contract says — it is not forwarded to the DOM and it does not throw                                                                                                                                                                                                                                                                                                                                                                                                               |
| one component that reads a React context for the group's state, roving index, `type` and behaviour | **two bits-ui primitives**, picked at render: `ToggleGroup.Item` when a group context is present _and_ a `value` is given, `Toggle.Root` otherwise | `Toggle.Root` and `ToggleGroup.Item` are separate primitives with separate state models — `Root` owns its pressed state, `Item` reads the group's — so there is no single primitive to configure. Everything the reference's context carried as _behaviour_ is bits-ui's: `role="radio"` + `aria-checked` for a single-select group against `aria-pressed` for a multiple one, the roving tabindex, the arrow keys, and the `data-state` this component styles off. What is left is presentation, which is what `ToggleGroupContext` carries — `variant`, `size` and `disabled`, set by `ToggleGroup` (issue 35) through `setToggleGroupContext`, exported from this component's module script. It is passed as a **getter** so the group's props stay reactive in its children |
| `pressed` and `onPressedChange` inside a group                                                     | ignored, as the reference ignores them                                                                                                             | the group owns the state. `bind:pressed` on a grouped Toggle reads its initial value and never moves; bind the group's own value instead                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| pressed capsule `color-mix(in srgb, var(--primary) 12%, transparent)`                              | `bg-primary/12`                                                                                                                                    | the same static translucent tint the Tabs `pills` rail already paints for its selected trigger, which is the point the reference makes in prose — "a pressed toggle and a selected tab read as one idea". A slash on a _fill role's_ hover step is the thing the skill bans; this is a wash over the canvas, of a piece with Alert's `border-error/25`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| hover surface `color-mix(in srgb, var(--foreground) 5%, transparent)` on `default` and `solid`     | `bg-background-muted`                                                                                                                              | a neutral hover wash that stays neutral on both canvases, where an opacity slash would let the navy through and change hue. It is exactly the pairing Tabs `pills` ships — `hover:bg-background-muted` under a `bg-primary/12` selected state — so hover cannot be mistaken for pressed on the two variants whose pressed state _is_ the blue tint                                                                                                                                                                                                                                                                                                                                                                                                                              |
| hover surface `var(--accent)` on `outline`                                                         | `bg-accent`, unchanged                                                                                                                             | the reference's own token, and what Button's `ghost` already paints. `outline` can afford the blue-tinted hover the other two cannot, because its pressed state additionally moves the border to `--primary`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ink `var(--foreground-subtle)` whenever the control is off _or_ disabled                           | `disabled:text-foreground-subtle`, with the pressed ink guarded by `enabled:`                                                                      | `disabled:text-foreground-subtle` and `data-[state=on]:text-primary` are the same specificity, so which one paints a disabled _pressed_ toggle would be decided by stylesheet order. `data-[state=on]:enabled:text-primary` settles it in the selector instead: the reference's rule is that disabled wins, in whichever state the toggle is parked                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `boxShadow: var(--focus-ring)`, tracked in React state through `onFocus`/`onBlur`                  | nothing at all                                                                                                                                     | the reference tracks focus by hand and `--focus-ring` has no dark value. Both primitives put focus on the `<button>` itself, which is where the base layer's global `:focus-visible` outline lands — the same call Checkbox, Switch and Slider made                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `border: 1.5px solid`                                                                              | `border`                                                                                                                                           | the standing 1px snap. `default` and `solid` keep a `border-transparent` so all three variants draw the same box                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `WebkitTapHighlightColor: transparent`                                                             | dropped                                                                                                                                            | no utility or token holds it, and nothing else in this library suppresses the platform's tap highlight. Restoring it would be a one-component exception to a platform default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `flex: 1` for full width; positioned text above a group capsule                                    | `min-w-0 flex-1`; `relative z-10` when `indicator="sliding"` is active                                                                             | The group owns geometry. Its optional capsule needs text above it, without a second selected fill.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Resting `default` and resting `solid` are identical, on purpose

This looks like a bug and is not. The reference computes one surface for the whole
control, and at rest — not pressed, not hovered — it is `"transparent"` for all
three variants; only `outline` differs, by drawing a border. So two of the three
variants are indistinguishable across half their state space, in the reference as
much as here.

The variant is a statement about how the toggle says _pressed_, not about how it
looks idle: `default` gains a tint, `solid` gains a fill, `outline` moves its
border. The ticket's prose calls `default` "a tinted capsule that darkens when
pressed", which reads as though a resting tint were being deepened — the `.jsx`
is the visual spec and it has no resting tint, and the ticket itself says to read
the pressed appearance off the `.jsx` for each variant. Do not add one.

`Toggle.svelte.test.ts` pins the distinction that does exist, per variant: the
pressed surface is translucent for the two tinted variants and opaque for `solid`,
the ink moves with it, and only `outline`'s edge changes.

## Two harnesses, doing two different jobs

`Toggle.test-harness.svelte` is the `$bindable` one: the pressed state is
round-tripped by bits-ui, so what needs asserting is that the _primitive's_ write
reaches the parent.

`ToggleInGroup.test-harness.svelte` is the "needs a sibling mounted" one. It sets
this component's context over a bits-ui `ToggleGroup.Root` — the smallest stand-in
for issue 35's `ToggleGroup` — because the `ToggleGroup.Item` half of the
component is unreachable without one, and a seam that has never been rendered is
a seam nobody has checked. It pins four things the real group will depend on: the
group owns the state, `variant`/`size`/`disabled` reach the buttons through the
context, and a child with no `value` stays a standalone toggle rather than
throwing. It is now redundant — `ToggleGroup` exists and plays the same part —
but deleting a source file unasked is barred, so it stays until someone asks.
Only `Toggle.svelte.test.ts` imports it.

## The 44px touch floor, and the one size that misses it

`md` and `lg` **meet it**, through `pointer-coarse:h-11` (and
`pointer-coarse:min-w-11` on the icon-only square). The library-wide gap recorded
in the skill does not apply here: it exists because a 44px hit area on a 16–26px
checkbox or switch overlaps its neighbours in a stacked settings list and the
later element wins the overlap, so a tap toggles the wrong row. This grows the
button itself rather than hanging an invisible pseudo-element over its
neighbours, so no two toggles can ever overlap — a touch layout simply reflows,
which is what a touch layout should do.

`sm` is the deliberate exception and stays 30px on every pointer. Reaching 44
would grow it by nearly half and collapse it onto `md`'s touch height, which
erases the size prop on exactly the devices it was picked for. `sm` is the
toolbar density case; a call site that needs a touch target should use `md`.

Nothing about this is visible on a desktop pointer, so it is invisible to `lint`,
`check` and the test suite alike — the client tests run in a plain Chromium,
where `pointer: fine` matches and the heights read 30 / 36 / 42. Verify it by
emulating a touch device, not by reading the class.

## Geometry, and why the test asserts it

The size table — 30 / 36 / 42px tall, `px-2` / `px-3` / `px-4`, square at its own
height when icon-only — is a published contract: a row of icon-only toggles is
meant to line up on one grid. `Toggle.svelte.test.ts` reads the computed heights
back for that reason, and because `text-sm` beside a `leading-*` autofixes to
`text-md/snug` and silently resizes the control. The slash form (`text-sm/snug`)
is written directly here so the hazard cannot arise.

## An icon-only toggle still needs a name

The component cannot invent one — `aria-label` is the caller's to pass, and it
reaches the button through the rest props. `aria-pressed` is the only thing a
screen reader has to go on for the state, which is why the test asserts it moves
on the name the caller gave rather than on the icon.

# ToggleGroup — port notes

`ToggleGroup` shares this file with `Toggle`, the way `TimelineItem` shares
`timeline/Timeline.md`: the two ship as one family and their decisions are one
set. Everything above still applies to the buttons inside a group.

| Contract                                                                 | Built as                                        | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shape` of `square` ｜ `pill`, forwarded to every button                 | not ported                                      | the standing no-`pill` directive, which names `shape` as one of the aliases the silhouette must not return under. The group forwards no shape, and the reference's `shape="pill"` attached track — which rounds the track _and_ its buttons together — has no replacement. A caller who wants the round track passes `class="rounded-full"`; the buttons keep `rounded-md`, because a class on the group reaches the group. For a full pill, pass `class="rounded-full"` on each `<Toggle>` too; the sliding capsule follows the selected item's radius |
| `gap?: number`, px, default 6                                            | hardcoded `gap-1.5`                             | 6px exactly, on Tailwind's 0.25rem multiplier. A caller wanting another gap passes `class="gap-3"` and `cn()` puts it last, which `ToggleGroup.svelte.test.ts` pins. An open px number is not the runtime-value exception — that is for a value no class can hold                                                                                                                                                                                                                                                                                       |
| `value` ｜ `defaultValue` ｜ `onValueChange`, controlled or uncontrolled | `bind:value`, with `onValueChange` beside it    | the standing `bind:` decision. `value` is typed by `type` — `string[]` under `multiple`, `string \| null` under `single` — as a discriminated union, which is the same split bits-ui's `ToggleGroup.Root` draws across two type parameters                                                                                                                                                                                                                                                                                                              |
| `value?: (string \| number)[] \| string \| number \| null`               | the `number` half dropped                       | for the reason `Toggle`'s own `value` drops it: bits-ui's item value is a `string`, and stringifying a caller's `1` would round-trip it back as `"1"`                                                                                                                                                                                                                                                                                                                                                                                                   |
| nothing selected under `single` is `null`                                | `null` at this component's edge, `""` inside it | bits-ui spells the empty single selection `""`. `ToggleGroup.svelte`'s two setters are the only place the vocabularies meet, so no call site ever sees the primitive's spelling                                                                                                                                                                                                                                                                                                                                                                         |
| `role="radiogroup"` under `single`                                       | the same, through `child` delegation            | `ToggleGroup.Root` hardcodes `role="group"` and wins its own `mergeProps`, so nothing passed in can change it. Its `Item` still renders `role="radio"` under `single` — and a `radio` with no `radiogroup` to own it is a structural ARIA error every automated checker flags. Render delegation is the sanctioned escape hatch: the component spreads the primitive's props on its own `<div>` and writes `role` after them                                                                                                                            |
| `aria-orientation="vertical"` on either role                             | only on the `radiogroup`                        | ARIA 1.2 lists no `aria-orientation` for `role="group"`, so emitting it there is a conformance error for an attribute nothing reads. `radiogroup` supports it, and that is the group whose arrow axis has actually moved                                                                                                                                                                                                                                                                                                                                |
| `style={{…}}` merged over the computed layout                            | dropped                                         | the standing "`className` and `style` are React spellings" decision. Layout is `class`, which `cn()` puts last                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## The group-owned capsule and motion are opt-in

`indicator="sliding"` on a single-select group draws one primary capsule under the selected item.
It adds a bordered `surface-sunken` track, without requiring `attached`.
The capsule uses `shadow-btn-default`; `shadow-primary` alone only sets a shadow colour.
Selected text stays above the capsule. The button draws no second selected fill or edge.
The capsule slides on both axes over 300ms with `ease-snap`. Labels change colour over 200ms.
Reduced motion changes position immediately; labels keep their colour transition. Width and height remain measured, without animation.

An attachment measures the selected direct child using bounding rectangles, so fractional widths and vertical offsets remain accurate.
ResizeObserver follows the track and items. MutationObserver follows selection, disabled state, and added or removed items.
The capsule also copies the selected item's computed border radius, so a `rounded-full` item gets a `rounded-full` capsule with no shape prop.
Both observers disconnect when the attachment stops. Only measured geometry uses inline custom properties.
The capsule stays hidden until measurement, and when no selected item exists.
Before measurement, the selected button paints the fill itself. Server-rendered selected text therefore stays visible.
A disabled selection keeps the primary fill and full-opacity primary-foreground text, without a shadow even on hover.
The selected state stays visible while other disabled items remain dimmed.

`multiple` ignores the indicator and keeps its existing presentation. Groups without the option also stay unchanged.
Child variant and size still take precedence over group defaults; the opt-in indicator owns only selected surface and stacking.
Keyboard behavior and nullable controlled values remain with the existing primitive bindings.

## The attached track is `--background-subtle`, not the reference's `--background-muted`

One step off the scale, and the reason is a collision this port created rather
than one the reference has. The reference's Toggle hovers to
`color-mix(in srgb, var(--foreground) 5%, transparent)` — a _translucent_ wash,
which darkens whatever it sits on, including a `--background-muted` track. This
port swapped that for the opaque `bg-background-muted` (see the table above, and
the reason: an opacity slash lets the navy through and shifts hue). Opaque against
an identical track is invisible: hovering a segment of an attached group painted
`--background-muted` changes nothing at all, in **both** themes, since the two
tokens are `--grey-100` and `--navy-800` in each.

`--background-subtle` is the adjacent step — `--grey-50` light, `--navy-900` dark —
so the track still reads as sunken under the buttons and the hover wash lands one
step darker than it. Verified in the browser in both themes; it is not visible to
`lint`, `check` or the test suite.

## What the group reaches into its buttons with

`ToggleGroupContext` — declared in `Toggle.svelte`'s module script and set here —
carries `variant`, `size` and `disabled`, and issue 35 added the two the reference
sets on a grouped Toggle from its own context:

- **`attached` → `border-transparent`** on the button. The reference does not do
  this and shows doubled 1.5px edges between the segments of an attached
  `outline` group; the issue asked for the buttons to lose their own edges, which
  is what a segmented control looks like. It sits after the variant map in
  `cn()`, so the resting border is neutralised while
  `data-[state=on]:border-primary` — a different variant, and so a different
  `tailwind-merge` group — still paints the pressed segment's edge.
- **`fullWidth` → `min-w-0 flex-1`**. `flex-1` is the reference's `flex: 1`.
  `min-w-0` is its `minWidth: 0`, and without it a flex item will not shrink below
  its own content, so "an equal share" quietly becomes "as wide as the longest
  label". It sits _before_ the size map, so an icon-only button keeps the
  `min-w-9` that makes it square. A vertical group skips both: there `flex-1`'s
  zero basis sits on the height and collapses each item to its text line, while
  the group's `items-stretch` already gives every item the full width.

A `variant` or `size` set on an individual `<Toggle>` still **wins** over the
group's — and this one is an **open question, not a settled departure.** Issue 35
decided the opposite in writing: "A `variant` on an individual `<Toggle>` inside a
group is ignored — say so in `Toggle.md`, which is what the reference's 'Inherited
from the group' means." That reading does not survive the reference's own `.jsx`,
which computes `variant || (group && group.variant) || "default"` — child first,
group second. "Inherited from the group" describes what happens when the child
sets _nothing_.

It was left as the reference has it because no code in issue 35 implements the
precedence either way: it is `Toggle`'s resolution, shipped in 34 and reviewed
then, and inverting it would make `<Toggle variant="outline">` inside a group
silently do nothing. But the issue's Decision was not withdrawn by anyone with the
standing to withdraw it, so **this paragraph records a disagreement rather than a
ruling.** If the group should win, the change is three `??` chains in
`Toggle.svelte` and a test; ask before making it.

`disabled` is not part of this question — see below, it is enforced by the
primitive regardless.

The group's `disabled` is enforced twice over, and deliberately: through this
context, which is what dims the button to `opacity-50`, and through
`ToggleGroup.Root`'s own `disabled`, which bits-ui ORs into every item's
`disabled` attribute. A child cannot escape a disabled group by passing
`disabled={false}`.

## Arrow keys move focus, not the selection

Both under `multiple` and under `single`. `ToggleGroup.Root`'s roving focus group
handles ← → ↑ ↓ plus Home and End, loops by default, and follows `orientation`;
Space and Enter are what press the focused button. The issue's acceptance criteria
describe the arrows as moving "the pressed selection" under `single`, which is the
WAI-ARIA radio-group pattern but is **not** what either bits-ui or the reference
does — the reference's own `onKeyDown` ends in `next.focus()` and never toggles.
The issue also says, in the same breath, not to add key handlers. Left as the
primitive and the reference agree; `ToggleGroup.svelte.test.ts` pins it.

The tab stop of a `single` group is the **pressed** button, as in the reference and
the WAI-ARIA radio group: Tab into a segmented control lands on the current mode.
With nothing pressed, or the pressed button disabled, it is the first enabled
button. After that it follows the button focused last, and a new value from the
parent moves it to the new pressed button. bits-ui alone puts the stop on the
**first** button until something is focused, and gives no way to set it. So
`ToggleGroup` holds the stop and hands it down through the group context, and
`Toggle` writes `tabindex` after the primitive's own. The arrow keys stay
bits-ui's; `multiple` keeps bits-ui's tab stop unchanged.

## `label` is optional in the type and not in practice

It lands as `aria-label` on the group. A group without one is a run of unnamed
buttons to a screen reader — under `single` it is worse, an unnamed `radiogroup` —
so every example on the playground route passes one. It is typed optional because
the reference types it optional.

The group names the _set_; it does not name the buttons. An icon-only `<Toggle>`
inside a group still needs its own `aria-label`, per the section above.
