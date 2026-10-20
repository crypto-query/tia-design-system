# Switch — notes

A new component, not a port. It came from the Predictive Cycles Settings menu,
which draws a switch at the end of each "Show" row.

The rules that hold for _every_ component live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of Switch alone.

| Decision                      | Why                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| one size, 30 × 18px           | the menu mockup's size. A second size waits for a call site that wants one                                                                                                             |
| thumb `bg-primary-foreground` | white in both themes. `--surface` goes navy in dark and sinks into the `--background-emphasis` track                                                                                   |
| naming as Checkbox            | `label` names the control through `aria-labelledby`, `description` describes it, and `<label for>` forwards a click from the whole block                                               |
| `trackStyles`, `thumbStyles`  | exported from the module script. `DropdownMenuItem` draws the same switch as a picture inside a `menuitemcheckbox`, where a real switch would be a second focusable control in the row |
| touch floor                   | a labelled switch's row is `pointer-coarse:min-h-11`. A bare switch misses 44px, as Checkbox's box does, for the reason in `Checkbox.md`                                               |
| focus                         | the global `:focus-visible` outline on the `<button role="switch">`; the border does not move on focus                                                                                 |
