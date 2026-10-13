# Card — port notes

Deliberate departures from the reference's published prop contract, and the
component-specific decisions behind them. The reference `.d.ts` is authoritative
for prop names, unions and defaults; everything below overrules it on purpose.
**Do not "fix" one back.**

The rules that hold for _every_ component — the styling contract, semantic
tokens, status roles, snap-don't-extend, the no-`pill` directive, theming, the
accessibility floor and the standing port decisions — live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of Card alone.

| Contract                                                                                 | Built as                                                 | Why                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `radius: soft｜lg｜xl｜2xl`                                                              | `lg｜xl｜2xl`, default `xl`                              | `soft` and `xl` are the same value in the reference, and no design passes `soft`                                                                                                       |
| `backdropFilter: var(--glass-blur)`                                                      | `backdrop-blur-sm`                                       | the token holds a whole filter function, which no Tailwind namespace can hold, so no class can read it; the stock utility matches its 8px, and the two have to be kept in step by hand |
| shadow and transform on `--duration-300`, border-colour on `--duration-200`, two easings | `transition-all duration-300 ease-out-soft`              | same reason as Button's row above: one `transition-property` and one easing per element                                                                                                |
| `elevated` and `interactive` composed freely with `flat` and `hoverable`                 | `flat` beats `elevated`; `interactive` beats `hoverable` | the resting and hover treatments are each a pick-one; the reference says so in prose and then lets both apply                                                                          |
