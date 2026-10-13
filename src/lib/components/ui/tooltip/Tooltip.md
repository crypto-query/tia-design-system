# Tooltip — port notes

Ported from `components/feedback/Tooltip.{d.ts,jsx}` and `tooltip.card.html` in
the live Claude Design project (issue 41). There is no `.prompt.md` for this one,
so the `.jsx` and its card preview are the whole visual spec.

The rules that hold for _every_ component — the styling contract, semantic
tokens, snap-don't-extend, theming, the accessibility floor and the standing port
decisions — live in `.agents/skills/tia-design-system/SKILL.md`. Read that first;
this file is only what is true of Tooltip alone.

## The panel is a floating surface, not the reference's inverted chip

| Reference                                                                                                                                                  | Built as                                                                                   | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| panel `background: var(--midnight-blue)`, ink `var(--white)`, edge `color-mix(in srgb, var(--white) 12%, transparent)`, `box-shadow: var(--shadow-medium)` | `bg-popover-background text-popover-foreground border border-popover-border shadow-medium` | the reference pins one dark chip for both canvases, and `--midnight-blue` (`#04273f`) against the dark theme's `--navy-950` canvas (`#04141f`) is the tooltip-invisible-in-dark defect the issue names. The two ways out are to **invert** — `bg-foreground text-background`, which flips to a near-white panel on navy — or to take a floating-surface role, which is what shipped. Two things decided against inverting: the issue's own browser-pass criterion looks for "a dark tooltip on a dark surface", which reads a dark panel as intended rather than a flipped one; and the `<kbd>` chips below need a surface their own tokens make sense on, where `bg-background-subtle` is nonsense on an inverted panel                                                                                                                                                                                                           |
| —                                                                                                                                                          | `--popover-*` rather than Dropdown's `--surface`                                           | **the panel is not Dropdown's, and the difference is deliberate.** Dropdown draws `border-border-muted bg-surface shadow-medium` (`Dropdown.svelte:243`), and this shares the bordered-floating-surface language and the same `shadow-medium` the reference names — but not the fill. A menu is anchored to a control on the page; a tooltip lands _on top of_ whatever is there, which is very often a `--surface` card. In dark that would put `--navy-800` on `--navy-800`, separated only by `--border-muted` at `rgba(255,255,255,0.09)` and a navy-tinted shadow that does not read on navy — the collapse this whole row exists to avoid. `--popover-background` is `--navy-700`, one step lighter than both the canvas and `--surface`, and `--popover-border` is `rgba(255,255,255,0.16)`, so the panel reads as raised over either without a `dark:` anywhere. Verified in a headed browser on both canvases, 2026-08-18 |

The cost is real and worth stating: in light mode the panel is white on white
cards, separated by its border and `shadow-medium` rather than by the reference's
strong dark chip. If the inverted look is wanted back, it is one line — swap the
three panel tokens for `bg-foreground text-background` and give the chips the
opposite treatment.

## Departures from the published contract

| Contract                                                        | Built as                                                                                            | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxWidth?: number` (240)                                       | dropped; fixed at `max-w-60`                                                                        | 240px exactly on Tailwind's 0.25rem multiplier. A hint that needs a different width is a hint that should be shorter, and `class` is the escape hatch for the case that genuinely is not                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `closeDelay?: number` (80)                                      | **dropped**                                                                                         | bits-ui 2.18.1 has no close-delay knob anywhere in the tooltip: `TooltipRootState.handleClose` clears the timer and sets `open` false in the same tick, and `delayDuration` / `skipDelayDuration` are both open-side. What the reference's 80ms buys — the pointer surviving the gap between trigger and panel — the primitive buys instead with a safe polygon (`transitIntentTimeout: 180`) that is on whenever `interactive` is, so the behaviour is covered even though the number is not. Implementing it here would mean intercepting the primitive's own write to `open` and re-opening what it just closed, which is taking the state machine away from the primitive to honour one number |
| `content?: React.ReactNode`                                     | `content: string`, **required**                                                                     | a Snippet would make every call site open a snippet block for a phrase, and the standing decision is that one short line is a `string`. Required rather than optional because a tooltip with no hint has nothing to say                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `children: React.ReactElement`, cloned with handlers            | `trigger: Snippet<[{ props }]>`                                                                     | Svelte has no `cloneElement`. **Named `trigger`, not `children`**, to match Dropdown — the one component in this library that already solved this. A snippet taking parameters cannot be written as implicit tag content anyway, so `children` would buy none of its usual ergonomics while meaning something vaguer than the job                                                                                                                                                                                                                                                                                                                                                                  |
| `className`, `style`, `open` ｜ `defaultOpen` ｜ `onOpenChange` | `class` through `cn()` last; `style` dropped; `open` as `$bindable()` with `onOpenChange` beside it | the standing decisions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## The provider is mounted per instance

bits-ui requires a `Tooltip.Provider` above every `Tooltip.Root` — without one it
throws at render. The alternative to the wrapper below is a single provider in
`src/routes/+layout.svelte`, which is an app-wide mount added for one component's
convenience; this keeps the component self-contained at the cost of one extra
element per tooltip.

What that costs, and it is not nothing: `skipDelayDuration` is **provider**-level,
and it is the grace window in which moving from one trigger to a neighbouring one
opens the second instantly. With a provider per instance no two tooltips ever
share one, so a row of icon buttons makes the reader wait the full `delay` at
every stop rather than only at the first. If a dense toolbar ever wants the
sweep, that is the reason to hoist a provider — and hoisting one is compatible
with these: a nested provider simply shadows the outer one.

## `Tooltip.Content` is rendered through its `child` snippet, for its id

The panel carries an id this component generates, and the only way to put one on
the element is to render it ourselves.

bits-ui 2.18.1 drops `Tooltip.Content`'s id before it reaches the DOM:
`popper-layer.svelte` destructures `id` out of the props and hands it to the
positioning layer, and the props it forwards to the `popper` snippet — the ones
that land on the content element — no longer contain it. The trigger's
`aria-describedby` is filled from `contentNode.id`, so it resolves to the **empty
string** and the hint describes nothing.

Measured 2026-08-18 in the client vitest project, against a bare
`Provider → Root → Trigger → Portal → Content` with no wrapper of ours: the
trigger renders `aria-describedby=""` and the content element carries no `id`
attribute at all. So this is upstream, not something this component's spread
caused. `Tooltip.svelte.test.ts` pins the fix.

**`role="tooltip"` is ours for a related reason.** bits-ui puts no role on the
content at all — `TooltipContentState.props` carries `data-state`, the transition
attributes and the id, and nothing else — so the panel would be an unlabelled
`<div>` in the accessibility tree. It is passed to `Tooltip.Content` rather than
set on the div, so it goes through the primitive's own `mergeProps` where a
future part-level role would win over it rather than silently colliding.

The same layer leaks `forceMount` onto the element as a stray `forcemount="false"`
attribute. That is upstream too, it is inert, and every other bits-ui floating
panel in this repo already ships it — so it is left alone rather than stripped
here, which would make this one component differ for no reader-visible reason.

## The arrow is drawn here too, for a second upstream defect

`Tooltip.Arrow`'s own markup is an `<svg>` inside a `<span>`, and that svg is an
**inline** child — so the span's line box adds the font's leading above it and the
triangle paints about 6px clear of the panel. What renders is a balloon and a
separate chip floating under it. Reported 2026-08-19 and fixed here.

Handing the Arrow a child replaces the svg outright — the primitive renders
`children` instead of its own svg when given one — and the shape that shipped is a
`size-2` square rotated 45° and pulled up by half its height:

- the primitive's `arrowStyle` anchors the span to the panel's edge and rotates it
  per placed side, so in the span's **local** frame "down" always points away from
  the panel. One shape therefore serves all four sides and follows a flip for free;
- `-translate-y-1/2` puts the square's centre _on_ the panel's edge rather than
  below it, so its upper half sits inside the panel. The span is a positioned child
  of the panel, so it paints over the panel's own background and border: the fill
  covers the border across the arrow's mouth, and that is what makes the two read
  as one outline rather than a chip stuck to a box;
- a 45° rotation leaves the square's **right** and **bottom** edges as the pair
  below that line, so `border-r border-b` is exactly the visible two, and they
  carry `--popover-border` on from where the panel's border stops.

**Do not add `relative` to the panel to "tidy" the anchoring.** The arrow's `left`
is computed by floating-ui against the wrapper's border box, which already
coincides with the panel's; `relative` re-resolves `left` and `bottom` against the
panel's _padding_ box instead and shifts the arrow by the border width.

The square is 8px, so it reads 11.3px across and protrudes 5.7px — near enough to
the primitive's own 10 × 5 default. The span still measures 8px, which is what
`arrowPadding` clamps and the arrow middleware centres, but the square's centre is
the span's centre, so centring is unaffected.

Verified in a headed browser on both canvases, 2026-08-19, all four sides.

## `open` is deferred a tick, for a third upstream defect

**bits-ui cannot place a panel that is already open on the root's first render.**
Its floating layer attaches before the trigger has registered as the anchor, so
the wrapper keeps floating-ui's own holding position — `translate(0, -200%)`, the
off-page parking spot it uses while measuring — and nothing ever recomputes it.
Every middleware value stays `undefined`: the position is not computed once, not
computed wrongly. The panel is in the DOM, it is in the accessibility tree, and it
is nowhere on screen. A call site doing the obvious thing —

```svelte
<Tooltip bind:open={shown} content="…">   <!-- with `shown` starting true -->
```

— would draw an invisible hint, and nothing in `lint`, `check` or a DOM-reading
test would say so.

What the layer needs is the root's `open` going **false → true with the trigger
already in the DOM**, which is what every other open does. So the primitive is
handed `mounted && open` rather than the caller's value directly, and `mounted`
flips in `onMount`. One tick, invisible to a call site that starts closed.

Two consequences worth knowing:

- **The primitive is controlled, not bound.** `bind:open` cannot express "the
  caller's value, but not yet", so `Root` takes `open={mounted && open}` and
  `onOpenChange` writes the primitive's own opens and closes back to the
  `$bindable`. The caller's `bind:open` is unaffected.
- **Deferring the portal instead does not work**, and it is the obvious thing to
  try. Holding back `Tooltip.Portal` for a tick — or a frame — leaves the root
  open from its first render, which is the condition that breaks. It is the root's
  open that has to transition, not the content's mount.

Pinned by `Tooltip.svelte.test.ts`, which asserts a call-site-opened panel lands
against its trigger rather than off-page; the test fails against the primitive's
plain wiring. Verified in a headed browser on both canvases, 2026-08-19, with four
tooltips opened from the call site on all four sides.

The same trap applies to every bits-ui floating component — Popover, Dropdown,
Menubar — anywhere a call site opens one from the start.

## What the caller's element receives, and the two attributes to know about

The `trigger` snippet's `props` is the primitive's, spread onto whatever element
the call site wants. Alongside the handlers, the id and the ref attachment it
carries `type="button"` and `tabindex="0"`:

- **`tabindex` is a feature.** It is what makes a non-focusable trigger — a
  `<span>`, a Badge — reachable by keyboard, which a tooltip needs, since focus is
  the only way anyone without a pointer opens one.
- **`type` is for the `<button>` the primitive assumes.** Spread onto a `<span>`
  it renders a `type` attribute the element has no use for. Browsers ignore it; a
  call site that minds can write `type={undefined}` after the spread.

## Two failure modes, neither visible in the component

**A tooltip on a `disabled` control never opens.** A disabled element fires no
pointer or focus events, so nothing reaches the trigger's handlers — this is the
platform, not the primitive, and no amount of wiring here changes it. The fix is
a focusable wrapper that takes the props, with the disabled control inside it,
and it is the caller's to write. The playground route draws the broken case and
the wrapped one side by side.

**A tooltip is unreachable on touch.** There is no hover and no focus on a tap.
Anything a tooltip says must therefore be available another way as well — a
tooltip is never the only place information lives, and a hint that fails that test
is content that belongs on the page.

## Never a control in the panel

`content` is a `string` and there is no children snippet, which is the type doing
what it can — but the rule is wider than the type enforces, and it is a rule:
nothing focusable, nothing clickable, nothing a reader must act on. `interactive`
exists so the pointer can **rest** on a hint — to finish reading a long one, or to
select its text — not so the panel can hold a link.

A hint that genuinely needs a link, a button or a form is a **Popover** (issue
42). The give-away is a panel someone has to travel to on purpose.

## The `<kbd>` chip comes from `ui/kbd/`

`shortcut` renders each key as a `Kbd`. The treatment was Dropdown's row shortcut
class-for-class plus `shadow-kbd`, the keycap token the layer had carried since
issue 01 with nothing using it, reconciled on 2026-08-18 with issue 52 (Command),
whose reference draws the same bordered chip — bordered, because a 2px 7%-alpha
shadow is the lip on the chip rather than the thing that defines it, and the
border reads on every surface.

**The lip is gone as of 2026-08-21**, dropped by the owner as too raised for this
design system. The sentence above is why it survived the border argument the first
time; it is not a reason to put it back. What the chip keeps is exactly the part
that was doing the defining.

That treatment now lives in `ui/kbd/Kbd.svelte` and this component imports it. The
local `chipStyles` const is gone: it was a byte-identical second copy of the same
string, which is exactly what the extraction was owed for. **Do not reintroduce
one** — a chip that needs to look different here is a change to `Kbd.md`'s
geometry or a `class` passed at this call site, not a private copy.

The extraction landed with issue 57, which folded in all four call sites: this
one, `command/`, `search/` and `Dropdown`'s row shortcut. Dropdown's had been the
same string **minus `shadow-kbd`**; it briefly gained the shadow, which is what
this file and `Command.md` had agreed was correct — and then the shadow was
dropped from `Kbd` for everyone, which settled it Dropdown's way instead.

## `portalTarget` mounts the panel inside a scoped root

The panel portals to `<body>` by default. A consumer that scopes the design
system's styles under its own root — a WordPress Block, for one — passes that
root (an element or a selector) as `portalTarget`. Otherwise the panel lands
outside the scope and draws unstyled. The prop goes straight to
`Tooltip.Portal`'s `to`.
