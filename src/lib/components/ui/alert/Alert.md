# Alert — port notes

Deliberate departures from the reference's published prop contract, and the
component-specific decisions behind them. The reference `.d.ts` is authoritative
for prop names, unions and defaults; everything below overrules it on purpose.
**Do not "fix" one back.**

The rules that hold for _every_ component — the styling contract, semantic
tokens, status roles, snap-don't-extend, the no-`pill` directive, theming, the
accessibility floor and the standing port decisions — live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of Alert alone.

## Entry motion

Alerts enter with the shared `rise` animation: opacity 0 → 1 and translateY 6px → 0, over 240ms with `ease-out-soft`.
Reduced motion keeps a 240ms opacity-only entry. The alert role and message mount immediately; no timer delays announcements.
The playground has a replay button that mounts a new alert without changing its semantics.

## Dismiss

An addition — the reference has no close button. `onDismiss` draws Toaster's close button (an `X` named "Dismiss", 32px with a 44px hit area) at the trailing edge.
The alert does not hide itself: the caller owns the state, removes the alert, and moves focus, because the button that held focus leaves with it.
Leave it off when the message is the only reason the page is stuck — checkout keeps an unknown result or an expired checkout undismissible.

| Contract                                                                                                                                                | Built as                                                                                                            | Why                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| destructive uses off-system palette colours                                                                                                             | `error-light` / `error-strong`                                                                                      | palette colours don't track the brand                                                                                                                                                                                                                                                                             |
| tint `color-mix`ed into `--surface` and border into `--border`; title on `--foreground`, body on `--foreground-muted`, `*-strong` reserved for the icon | the flat `*-light` tint, `border-{hue}/25`, and `*-strong` text throughout                                          | a `color-mix` of two tokens is an arbitrary value no utility can hold, and the repaired dark tints are already panel-dark, so nothing is left for the mix to soften. The strong colour becoming the _text_ is issue 05's call; it costs the reference's title/body contrast, which the bold title carries instead |
| `title: ReactNode`                                                                                                                                      | `title: string`                                                                                                     | it is one bold line, and a Snippet would make every call site open a snippet block for a sentence; a rich title composes into children instead                                                                                                                                                                    |
| `icon: ReactNode`, absent unless passed                                                                                                                 | `icon: Snippet ｜ false`, defaulting to the variant's Lucide glyph, the four status ones announced via `role="img"` | status must not ride on colour alone, so the glyph ships by default — which means dropping it needs a value rather than an omission — and the tint says nothing to a screen reader, so the glyph has to say it                                                                                                    |
