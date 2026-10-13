# Spinner — port notes

Ported from `components/feedback/Spinner.{d.ts,jsx}` and `spinner.card.html` in
the live Claude Design project (issue 40). There is no `.prompt.md` for this one,
so the `.jsx` and its card preview are the whole visual spec.

The rules that hold for _every_ component — the styling contract, semantic
tokens, snap-don't-extend, theming, the accessibility floor and the standing port
decisions — live in `.agents/skills/tia-design-system/SKILL.md`. Read that first;
this file is only what is true of Spinner alone.

## Reduced motion slows this component down; it does not stop it

**This is the one place in the library where `prefers-reduced-motion` does not
mean less motion, and it is deliberate.** The reference freezes: its stylesheet
sets `animation-duration: 0s !important` and `animation-iteration-count: 1` on
every part of every mark. What that leaves on screen is a static ring, or three
dots at 55% scale and 35% opacity, sitting there claiming to report progress and
reporting nothing — a worse thing than the animation it replaced, because a
reader who cannot tell it apart from a decorative glyph has lost the only signal
the component exists to send.

So every variant instead collapses under `prefers-reduced-motion` to a single
slow opacity breathe (`spinner-breathe`, 2.4s, still divided by `speed`), and the
children of the four multi-element marks have their own animations dropped so the
whole mark fades as one thing. **No transform at all** on that path, which is the
point rather than a side effect: what the media query is asking to be spared is
movement — travel, scaling, parallax — and an opacity cycle is the one motion it
is not asking anyone to remove.

Two mechanical notes on where that lives, both of which look like the wrong
choice until the alternative is tried:

- **The media query is nested inside each mark's own `@utility` in `theme.css`,
  not a `motion-reduce:` class on the component.** The override has to reach
  `& > *` — the dots, the bars, the two ripples, the eight spokes — and a
  separate utility doing that would tie with the variant it is meant to beat on
  specificity (`.spinner-still > *` against `.spinner-dots > *`, both 0-1-1) and
  be settled by whichever Tailwind happens to emit second. Nested, it is the
  later declaration in the same rule and cannot lose.
- **`animate-none` is never emitted**, for the reason above and for the one the
  token layer already records over `animation-paused`: it does not slow an
  animation, it removes it, and the element snaps back to frame one.

The unit test cannot cover this — `@vitest/browser` has no media emulation — so
it is verified in the browser pass instead, with Chromium launched under
`--force-prefers-reduced-motion`.

## `decorative` closes a trap, and is not an optimisation

A spinner is very often mounted **inside** something that is already a live
region — a Command palette's input, a Toast, an Alert being swapped in. Two
nested live regions announce the same wait twice, and the second one is this
component. `decorative` swaps `role="status"` and the accessible name for
`aria-hidden="true"`, and that is the fix.

**The rule for a call site: if the thing around the spinner already says what is
happening, the spinner is decorative.** A spinner in a Button beside the word
"Placing order" is decorative. A spinner standing in for a whole panel's content
is not. Issue 52's palette is the case this was written for, and the playground
route marks every mark in its matrices decorative for the same reason — fifty
live regions on one page is not a demo, it is a denial of service on a screen
reader.

## `role="status"` names from author only, so `showLabel` leaves the region unnamed

With `showLabel` the `aria-label` is dropped, per the ticket — carrying both
would put one copy of the string on the element and a second inside it. What that
means precisely, and it is worth knowing before someone "fixes" it: `status` is a
**name-from-author** role, so the visible text does **not** become the region's
accessible name. The region ends up unnamed, and the text becomes the
announcement instead, which is the same string reaching the reader by the other
of the two routes. `Spinner.svelte.test.ts` asserts it in that shape rather than
through `getByRole("status", { name })`, which does not match and should not.

## Departures from the published contract

| Contract                                         | Built as                                                | Why                                                                                                                                                                                                                                                               |
| ------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `thickness?: number`                             | dropped, always derived                                 | the reference already defaults it to ~11% of the extent, so the shape has one correct stroke and the prop exists only to let a caller get it wrong                                                                                                                |
| `tone?: … ｜ (string & {})`                      | closed set only                                         | an arbitrary colour string is the raw-token-as-ink bug with a prop in front of it — `#0a1f6b` passed in gets something that does not flip under `.dark`. The closed set maps to semantic tokens; `current` is `currentColor` and stays the default                |
| `aria-live="polite"` beside `role="status"`      | dropped                                                 | `status` already implies `aria-live="polite"` and `aria-atomic="true"`                                                                                                                                                                                            |
| fixed stagger offsets (`i * 0.14s`)              | divided by `speed` too                                  | the reference scales the duration and leaves the delays alone, so at `speed={2}` the phase between the three dots doubles from 13% to 25% of a cycle and the mark reads as a different mark. The stagger is the character; `speed` is meant to move only the pace |
| per-element inline `style` for every measurement | `--spinner-size` and `--spinner-speed`, read by classes | the runtime-value exception, twice. See below                                                                                                                                                                                                                     |

## One extent, one rate, and everything else a fraction of them

The mark's geometry is not a size table. Every measurement — stroke, dot
diameter, dot gap, bar width, bar gap, spoke width, spoke length, the transform
origin, and the gap to a visible label — is a `calc()` off `--spinner-size` in
`theme.css`. That is what lets the two halves of `size` share one mechanism: the
five named steps are classes that set `--spinner-size` and nothing else, and an
explicit px number sets the same property inline. There is no second code path
for the open arm, so a numeric size cannot drift from a named one.

**The stroke ramp reaches the reference's numbers without a `round()`.** The
reference computes `max(2, round(size * 0.11))` → 2 · 2 · 2 · 3 · 4 across the
five steps. The CSS leaves the fraction exact (`max(2px, calc(size * 0.11))` →
1.54 · 1.76 · 2.2 · 3.08 · 4.4px) and the engine floors a border width to whole
pixels, which lands on the same five numbers. This is a coincidence worth one
test rather than one comment, so `Spinner.svelte.test.ts` pins the whole ramp —
CSS `round()` was the alternative and was not taken, its Chromium support (125)
sitting above Tailwind v4's own baseline (111).

**That coincidence is the stroke's alone, and the other rounded measures do
differ.** Only a border width is floored to a whole pixel; a width, a height and
a gap are not, so wherever the reference wrapped the fraction in `Math.round` the
CSS now renders the fraction itself. The differences are all sub-pixel — the dot
at `md` is 5.6px against the reference's 6, the bar at `sm` 2.56px against 3, the
label gap at `lg` 12.6px against 13 — and they are the true ratio rather than a
rounded one, which is what makes an arbitrary px `size` scale smoothly instead of
stepping. Recorded because "matches the reference" is otherwise the natural
reading of the paragraph above, and it holds exactly once.

**Timing is `@utility`, never `@theme --animate-*`.** `speed` is a runtime value,
and an `--animate-*` entry naming `var(--spinner-speed)` is a custom property
declared on `:root` — it substitutes its own `var()`s there, where no spinner has
declared one, so the declaration is invalid at computed-value time and
`animation-name` computes to `none` while lint, `check` and the compiled
stylesheet all look correct. `theme.css` carries the long-form note over the
keyframes. The test asserts a real duration off `getComputedStyle`, which is the
only thing that catches it — and it is worth keeping, because the failure has no
other symptom: a spinner that computes `animation-name: none` looks exactly like
a spinner whose animation has not started.

The neighbouring `--animate-accordion-*` block is the instructive contrast rather
than a counter-example: it holds a runtime value (`--bits-accordion-content-height`)
and works, because that value sits inside the _keyframes_, which are evaluated on
the animating element. A duration is not, so it cannot.

`speed` floors at 0.1, the reference's own guard: at 0 the duration divides by
zero, which is an invalid `animation` and so, again, a spinner standing still.

## Nothing hand-rolls this ring any more

This component arrived after three call sites that had nowhere to reuse from,
each drawing `ring` by hand — a `rounded-full` box with a translucent border,
`border-t-current`, and `animate-spin`. All three are gone: `Video` was swapped,
`ButtonProgress` was deleted rather than swapped — its consumers now compose
`Button` + this component — and `Hero` was swapped last. Each one is an
import now, and the import is the record.

**`Hero` does still refuse this component's reduced-motion answer**, which
is a different charge and still standing: it hangs `motion-reduce:hidden` on the
spinner and shows a static `Clock` in its place. At hero scale a slowly cycling
ring reads as the surface itself pulsing rather than as work running, so the
breathe above is the wrong mark for the one place the spinner is the whole
screen. See `Hero.md`.

What a swap costs, measured: the hand-rolled track was 22% against this
component's 18%, and a flat `border-2` becomes `max(2px, --spinner-size * 0.11)`
— so adopting `Spinner` is a visible recolouring rather than a like-for-like, and
neither value is reachable by prop.

## What `class` reaches, and what it does not

`class` lands on the root and is passed last through `cn()`, so a call site's
classes win — but the root is a layout box, not the mark. Two consequences:

- **`text-*` on it works and is a real escape hatch.** The mark paints in
  `currentColor`, so `class="text-info"` tones a spinner to something outside the
  closed `tone` set without opening the arbitrary-colour arm.
- **`size-*` on it does nothing to the mark.** The extent comes from
  `--spinner-size`; a `size-8` sets the root's own box and leaves the ring at 20px
  inside it. Use `size`, which takes a number precisely so that no one needs to
  reach for a class here.
