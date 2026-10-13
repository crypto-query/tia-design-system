# Kbd

One keycap. `<Kbd>esc</Kbd>` draws the chip that Command's footer, Command's row
shortcuts, Search's `ESC` hint and `SearchTrigger`'s hotkey hint all show.

Not a ported component — there is no `Kbd` in the reference. It is the extraction
`Command.md` and `Tooltip.md` both recorded as owed: the same chip had been written
out four times, and the copies had already drifted.

## The API takes children, not a `key` prop

It shipped inside `command/` as `<Kbd key="esc" />`. Children read better at every
call site and match what `shadcn-svelte`'s `Kbd` does, which is the nearest thing
to a convention here. `key` also reads badly beside Svelte's `{#each … (key)}`.

There is deliberately **no `Kbd.Group`**, which `shadcn-svelte` does ship. Both
places that draw more than one chip interleave them with label text — `↑ ↓ move`,
`↵ run` — so a pure key-group wrapper would not replace either, and the TIA
reference draws `SearchTrigger`'s hotkey as one chip reading `⌘K` rather than two.
Add it when a third case wants it, not before. There is no barrel file either, per
`components/CLAUDE.md`: import `kbd/Kbd.svelte` directly.

## The geometry is a fixed height, not padding

`inline-grid h-4.5 min-w-4.5 place-items-center align-middle` rather than the
`px … py …` the reference uses. A chip sits inline beside body type, and a padded
chip takes its height from its own line box — at the page's inherited line-height
of 1.5 that box is taller than the type beside it, so the chip rather than the type
sets the row's height. Measured on `SearchTrigger`, where it made an `md` button
**48px with a chip against 45px without**, so `size` had stopped being the only
thing setting the button's height.

`align-middle` is the second half and was found by the test below, not by reading:
a fixed height alone still left the chip an inline-level box sitting on the
baseline, so its descender space pushed a prose row 0.44px taller. Aligning to the
middle drops that to about 1/32px, which is rounding. It does nothing at the two
call sites that are flex rows — flex items ignore `vertical-align` — and everything
in prose, which is where `Kbd` mostly gets used.

## The chip is flat, and `shadow-kbd` does not come back

| Reference               | Here | Why                                                                                                                                                                                                                                                          |
| ----------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `font-mono` on the chip | kept | `<kbd>` is monospace by UA default, so naming the family looks redundant — but the UA default varies by platform and the token does not. Search's port had dropped it for that reason and was the only one of the four that had; it is back for consistency. |

The chip carried `shadow-kbd` — a 2px keycap lip — from the extraction until the owner
rejected it on 2026-08-21: a key that reads as physically raised is wrong for a design
system whose surfaces are otherwise flat. The border and the `--background-subtle` fill
are what define the chip, which is also what the reference draws, so this is no longer a
departure at all.

**Do not restore it from `Command.md` or `Tooltip.md`.** Those two argued the lip in
between issues 41 and 52 and each still carries that reasoning; both now note it was
reversed, but the original argument is the longer text and reads like a live decision.
`--shadow-kbd` is still defined in `theme.css` in both themes with no consumer — which is
exactly how it sat before the extraction, so an unused token here is the resting state
rather than something this change orphaned.

## Every call site, and there are no others

`Command`, `CommandItem`, `Search`, `SearchTrigger`, `Tooltip`, `Dropdown` and the
toast playground's prose. **`Dropdown` covers `Menubar` as well** — `MenubarItem`
reads its row type off `Dropdown` and renders every menu through it, so Menubar's
shortcuts are these chips and it has no chip code of its own.

Folding Dropdown in is now visually a no-op, and was not always. Its hand-rolled copy
was the one that had **never** carried `shadow-kbd`, so the consolidation first gave its
rows — and every Menubar shortcut with them — a lip they had not had. Dropping the lip
took that back: what Dropdown draws today differs from its pre-consolidation copy only
by `align-middle`, which a flex row ignores. Read the other way round, Dropdown had been
right about this all along.

If a sweep is ever needed again, **do not grep `shadow-kbd`**: that token is
precisely what a drifted copy is missing, so the search cannot find the thing it is
looking for. `grep -rn "<kbd" src/` plus `grep -rn "shortcut\|hotkey"` is what found
all eight.

One cosmetic inconsistency this extraction makes visible rather than causes:
Command's footer reads `esc` and Search's overlay reads `ESC`. Both match their own
reference. Left alone — it is text content, not the chip.
