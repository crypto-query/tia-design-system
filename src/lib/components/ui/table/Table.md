# Table — component notes

**A `ui/` member with no reference.** The TIA Strategies reference never drew a
table, so there is no published prop contract to depart from. What follows is
departures from the design system's _own_ rules, and the decisions behind them.
**Do not "fix" one back.**

The rules that hold for _every_ component — the styling contract, semantic
tokens, status roles, snap-don't-extend, the no-`pill` directive, theming, the
accessibility floor and the standing port decisions — live in
`.agents/skills/tia-design-system/SKILL.md`. Read that first; this file is only
what is true of Table alone.

## It renders a `<table>`, and the design does not

The Invoices pane draws its history as a six-column CSS grid of `div`s and
`span`s. That markup has no table semantics at all: a screen reader gets a run of
text with no column association, no row count, and no way to move by cell. The
component renders `<table>`, `<thead>`, `<th scope="col">`, `<tbody>`, `<tr>` and
`<td>` instead, and the grid's `grid-template-columns` becomes a `<colgroup>`
under `table-fixed`, which lays out identically. **Accessibility is not
simplified away** — this departure is directed, not an oversight.

## It lives in `ui/` with one call site

The call-site count sends a single-caller component to a sub-part inside the
calling Section's directory, and `sections/account/invoice-history/` is the only
caller. **The owner overruled the count by name** — _"file `ui/table/` and build
the pane on it"_. Moving this into the Section is undoing a decision, not
correcting a mistake.

| Rule                                     | Built as                                                                           | Why                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reuse before you build                   | a new component; nothing in `ui/` was close                                        | `Card` rows, `Timeline` and `Separator` all draw lists, and none of them emits a header row, a column, or an alignment that a header and its cells share. The nearest thing to a table in `ui/` was a `div` grid on a page                                                                                 |
| the component owns its geometry          | the **widths** are the caller's: each column's `class` lands on its `<col>`        | directed division of labour. Alignment and the numeric flag are table behaviour and repeat everywhere; `120px 96px minmax(0,1fr) 92px 84px 34px` is one pane's layout and would be a lie in the next one. A column with no `class` takes the leftover space, which is what `minmax(0,1fr)` did             |
| a component draws its own content        | every cell comes from the caller, as a `Snippet<[Row]>` on the column              | a cell holds a `Badge`, a mono reference, a download link — components and markup the table must not know about. Putting the snippet on the _column_ rather than on the row is what keeps one column's alignment, width and rendering in one place, and is why the header and its cells cannot drift apart |
| snap, don't extend                       | the header's 10.5px/0.09em becomes `text-2xs` (11px) and `tracking-widest` (0.1em) | both sit within half a step of the design, and neither concept is new to the scale                                                                                                                                                                                                                         |
| no arbitrary values                      | the design's per-cell `padding-right` gutters are **not** shipped                  | they are content spacing inside one pane's column widths. The caller's cell snippet is where a gutter belongs, and a default one would misalign every right-aligned column                                                                                                                                 |
| —                                        | the 24px edge inset is baked as `first:pl-6 last:pr-6` on the cells, not passed in | a `<tr>` border has to reach both card edges, so padding on the table or on a wrapper would pull the rule in with it. The consequence to accept: a fixed column width supplied for the first or last column is a **content** width, and the caller adds the 24px                                           |
| status is never conveyed by colour alone | not this component's job                                                           | Table has no status of its own. The Invoices pane's per-row state arrives as a `Badge` inside a cell snippet, with its own text                                                                                                                                                                            |
| —                                        | keyed by index, rows and columns alike                                             | both arrays are whole replacements per load. A row carries no id the component can see, since it is generic over `Row`                                                                                                                                                                                     |

## A body message keeps the headers

The Invoices pane's failed query has to keep its header row and put one line in
the table body — a message beside the table would leave the columns standing over
nothing. That requirement is why the optional `empty` snippet exists.

It renders only when `rows` is empty. It sits inside one body row, in a cell that
spans all columns. Table owns the cell's padding and centre alignment. The caller
supplies the message and its text style. Without the snippet, an empty array still
renders the header alone, so a Section that wants its empty-state line outside the
table keeps that option.

## The caller supplies the room above the header

The header row has bottom padding only. In the Invoices pane the title row above
the table gives it its top space, and a header with its own top padding would
double that gap. A table placed at the top of a `padding="none"` Card therefore
needs a top padding on the Card (`pt-5`, the title row's own), or its labels sit
against the card's edge. Top padding is safe there: only side padding pulls the
row rules in from the card edges.

## What it deliberately does not do

No sorting, no selection, no pagination, no sticky header, and no horizontal
scroll wrapper. The Section still draws the _View all invoices_ link outside the
table, and it can still draw an empty-state line there too. `Pagination` already exists for a caller that needs it.
