# Design System Audit — OG vs Svelte Implementation

All original design-system files under `dexterlabs-design-system/project/` (three CSS files + 22 HTML preview files) were cross-referenced against the Svelte implementation in `src/lib/`. Token values were compared verbatim; component styles were compared rule-by-rule.

---

## Summary

| Component / Area | Status |
|---|---|
| Colour tokens (phosphor + paper) | **Aligned** |
| Typography tokens + classes | **Aligned** |
| Spacing tokens | **Aligned** |
| Radius + transition tokens | **Aligned** |
| Button primitives | **Minor drift** |
| Led primitive | **Minor drift** |
| TagPill primitive | **Minor drift** |
| Card base | **Aligned** |
| ProductCard / ProjectCard | **Aligned** |
| NoteCard | **Aligned** |
| Nav | **Significant drift** |
| Breadcrumb | **Aligned** |
| Field (label + hint) | **Aligned** |
| Input / Textarea | **Minor drift** |
| InputWrap | **Minor drift** |
| Select | **Aligned** |
| Checkbox | **Minor drift** |
| Radio | **Minor drift** |
| Switch | **Minor drift** |
| RadioGroup | **Aligned** |
| Alert | **Aligned** |
| CtaBlock | **Minor drift** |
| StatCard | **Aligned** |
| KvList | **Aligned** |
| ProgressBar | **Minor drift** |
| ActivityRow | **Aligned** |
| SectionHead | **Minor drift** |
| SectionFoot | **Minor drift** |
| PageHero | **Minor drift** |
| Modal | **Significant drift** |
| Accordion | **Minor drift** |
| Tabs (underline) | **Aligned** |
| Tabs (pill variant) | **Aligned** |
| Table | **Minor drift** |
| Layout helpers (Container, Stack, Inline, Grid, Spread, Rule) | **Aligned** |
| Toast / ToastRegion | **Added in Svelte — no OG equivalent** |
| Heading / Text primitives | **Added in Svelte — no OG equivalent** |
| Checkbox / Radio / RadioGroup / Switch | **Added in Svelte — no OG equivalent** |
| Prose | **Added in Svelte — no OG equivalent** |
| Vertical tabs variant | **OG preview only — not yet in Svelte** |
| Badge / kbd / Empty-state / Tooltip | **OG preview only — not yet in Svelte** |

---

## Findings by Area

### Colour Tokens

Every phosphor and paper token value is **identical** in both files.

`tokens.css` vs `colors_and_type.css` — full diff:

| Token | OG value | Svelte value | Match? |
|---|---|---|---|
| `--bg` | `#0b0d0c` | `#0b0d0c` | yes |
| `--bg-rail` | `#0f1211` | `#0f1211` | yes |
| `--bg-elev` | `#141817` | `#141817` | yes |
| `--bg-sunken` | `#070908` | `#070908` | yes |
| `--ink` | `#d6e2dc` | `#d6e2dc` | yes |
| `--ink-dim` | `#a4b0a9` | `#a4b0a9` | yes |
| `--ink-faint` | `#7a8580` | `#7a8580` | yes |
| `--rule` | `#1d2321` | `#1d2321` | yes |
| `--rule-strong` | `#2a3330` | `#2a3330` | yes |
| `--amber` | `#ffb347` | `#ffb347` | yes |
| `--cyan` | `#7cc7d1` | `#7cc7d1` | yes |
| `--danger` | `#ff7a6b` | `#ff7a6b` | yes |
| `--ok` | `#8fd48a` | `#8fd48a` | yes |
| Paper `--amber` | `#a04e00` | `#a04e00` | yes |
| Paper `--cyan` | `#030304` | `#030304` | yes |
| Paper `--danger` | `#a83224` | `#a83224` | yes |
| Paper `--ok` | `#356b31` | `#356b31` | yes |

**No divergences.**

---

### Typography

All typography class rules in `typography.css` match `colors_and_type.css` exactly.

| Class | Property | OG | Svelte | Match? |
|---|---|---|---|---|
| `.h1` | `font-size` | `var(--t-h1)` | `var(--t-h1)` | yes |
| `.h1` | `letter-spacing` | `-0.03em` | `-0.03em` | yes |
| `.h2` | `line-height` | `1.1` | `1.1` | yes |
| `.h3` | `line-height` | `1.2` | `1.2` | yes |
| `.display-heading` | `line-height` | `0.9` | `0.9` | yes |
| `.body-text` | `line-height` | `1.65` | `1.65` | yes |
| `.body-lede` | `line-height` | `1.55` | `1.55` | yes |
| `.mono-label` | `letter-spacing` | `0.08em` | `0.08em` | yes |
| `.eyebrow` | `letter-spacing` | `0.12em` | `0.12em` | yes |

The `Heading` and `Text` Svelte primitives duplicate these rules in their own `<style>` blocks (intentional per scoped-CSS architecture). Values match.

**No divergences.**

---

### Spacing

All spacing tokens match verbatim. `Container` applies the correct `padding-bottom` per size (`80px`, `64px`, `48px`) and the correct mobile breakpoint (`max-width: 720px` -> `padding: 0 16px`). Stack, Grid, Inline, and Spread use `--u` / `--u2` token references throughout.

**No divergences.**

---

### Borders, Radius & Shadow

Radius tokens (`--radius: 2px`, `--radius-card: 4px`) and `--transition: 0.15s` are identical.

**Bug — Switch uses undefined token `var(--rail)`:** `Switch.svelte` line 72: `border: 1px solid var(--rail)`. The token `--rail` does not exist; the correct token is `--rule-strong`. The OFF-state switch border is invisible in all browsers.

**Drift — Switch track size:** OG preview (`15-components-forms.html`) shows `width: 32px; height: 18px; border-radius: 9px`. Svelte renders `width: 40px; height: 22px; border-radius: 11px` — 4px wider and 4px taller.

**Drift — Switch OFF-state knob colour:** OG `toggle::after` uses `background: var(--ink-faint)` (visible mid-tone). Svelte uses `background: var(--bg)`, making the knob invisible against the sunken background.

---

### Component State Styles

#### Button

OG uses `font-size: var(--t-mono)` (resolves to 14px) on `.btn-primary`, `.btn-cta`, `.btn-ghost`, `.btn-back`. Svelte hardcodes `font-size: 14px`. Resolved value is the same today, but is not token-driven.

OG uses `font-size: var(--t-micro)` (12px) on `.btn-del`. Svelte hardcodes `font-size: 12px`.

#### Led

OG `.led.off` explicitly sets `box-shadow: none`. Svelte `.led-off` has no `box-shadow` rule — functionally identical (no shadow without a rule).

#### TagPill

OG `.tag-pill`:
- `font-size: var(--t-micro)` = **12px**
- default `color: var(--ink-dim)` with `border: 1px solid var(--rule)`

Svelte `.pill`:
- `font-size: 11px` hardcoded — **drift: 12px -> 11px**

Svelte `.pill-default`:
- `color: var(--ink-faint)` — **drift: `--ink-dim` -> `--ink-faint`**
- `border-color: var(--ink-faint)` — **drift: `--rule` -> `--ink-faint`**

---

### Navigation

The OG nav (`12-components-nav.html`) integrates the breadcrumb path directly in the brand bar as `// ~ / CATALOGUE / CONDUIT-PDX2`. The brand div holds both the wordmark and path crumbs inline.

Svelte `Nav.svelte` has no breadcrumb slot. `Breadcrumb` is a standalone component. **Structural divergence from the OG design pattern.** Consumer must compose them manually.

Additional comparisons:
- Nav link font-size: OG HTML preview = `13px`; Svelte `.nav-links` = `12px` (minor, 1px)
- Nav inner height: OG via `padding: 14px 24px`; Svelte uses `height: 48px` with `padding: 0 24px` (functionally similar)
- Hover on nav links: neither OG CSS nor Svelte defines an explicit `:hover` colour change (consistent omission in both)

---

### Forms

#### Input / Textarea

OG `patterns.css` `.input`: `font-size: var(--t-mono)` = **14px**
Svelte `Input.svelte` and `Textarea.svelte`: `font-size: 13px` hardcoded.
**Drift: 14px -> 13px across all inputs.**

#### InputWrap

OG `.input-addon`: `font-size: var(--t-mono)` = **14px**
Svelte `.addon`: `font-size: 13px`.
**Drift: 14px -> 13px on addon labels.**

#### Checkbox

OG: `width: 15px; height: 15px`. Svelte: `16px x 16px`. Minor (1px).

OG checked checkmark: CSS border-right + border-bottom technique producing a rotated L-shape in `var(--bg)`.
Svelte: Unicode `✓` glyph. Visually equivalent, different technique.

OG label colour: `color: var(--ink-dim)`. Svelte `.checkbox-label`: `color: var(--ink)`.
**Drift: `--ink-dim` -> `--ink` on labels.**

#### Radio

OG `input[type=radio]:checked`: fills ring `var(--amber)`, places `5px x 5px` `var(--bg)` dot at centre.
Svelte: ring stays transparent, places `8px x 8px` `var(--amber)` dot at centre.

**Three drifts:**
- Ring fill on checked: OG = `var(--amber)` fill; Svelte = transparent
- Inner dot colour: OG = `var(--bg)` (white on amber ring); Svelte = `var(--amber)` (amber on transparent)
- Inner dot size: OG = 5px; Svelte = 8px

---

### Patterns

#### CtaBlock

OG `.cta-block .cta-link` always renders an amber arrow-link on the right as a fixed part of the component. Svelte `CtaBlock.svelte` exposes a `children` slot — the arrow link is not built in. Consumer must provide it. Structural difference; not a visual drift when composed correctly.

#### ProgressBar

OG `.progress-track` height: `5px` (from `patterns.css`); Svelte: `5px`. Match. (The `21-components-misc.html` preview shows `6px` — that HTML file is a prototype, not the authoritative source.)

#### SectionHead

OG `.section-head` uses `gap: 6px` on the flex column. Svelte uses `<Stack gap="xs">` = `var(--u)` = **8px**.
**Drift: 6px -> 8px.**

#### SectionFoot

OG `.section-foot`: `padding-top: 16px; margin-top: 20px`.
Svelte `.section-foot`: `padding: 12px 0; margin-top: 20px`.
**Drift: top padding 16px -> 12px.**

#### PageHero

OG `.page-hero.bordered` applies `border-bottom` as an opt-in modifier class.
Svelte `PageHero.svelte` always applies `border-bottom: 1px solid var(--rule)`.
**Drift: opt-in border -> always-on.**

---

### Modal

OG modal backdrop: `rgba(7,9,8,0.85)`. Svelte `::backdrop`: `rgba(7, 9, 8, 0.85)`. Match.

OG modal header padding: `14px 20px`. Svelte: `var(--u2) var(--u3)` = **16px 24px**.
**Drift: +2px vertical, +4px horizontal on header.**

OG modal body padding: `20px`. Svelte: `var(--u3)` = **24px**.
**Drift: 20px -> 24px on body.**

OG modal title: `font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase`.
Svelte: `<Text variant="mono" size="lg">` resolves to `var(--t-lede)` = **19px**.
**Significant drift: 12px -> 19px on modal title.**

OG destructive modal icon: `width: 36px; height: 36px; border: 1px solid var(--danger); border-radius: 50%; color: var(--danger)` — outlined danger circle.
Svelte: `width: 22px; height: 22px; background: var(--danger); color: var(--bg); border-radius: 50%` — filled circle.
**Significant drift: outlined 36px -> filled 22px.**

---

### Accordion

OG `.acc-body`: `background: var(--bg-sunken)`. Svelte: `background: var(--bg-sunken, var(--bg))` — functionally identical.

Svelte adds progressive-enhancement animation via `@supports (interpolate-size: allow-keywords)` — enhancement not in OG, not a drift.

---

### Table

OG global `th` rule (`colors_and_type.css`):
- `padding: 8px 0`
- `font-size: var(--t-mono)` = 14px (inherited from table)
- `font-weight: 500`

Svelte `Table.svelte` `.dxl-table thead th`:
- `padding: 8px 12px` — **drift: adds 12px horizontal padding**
- `font-size: 10px` — **drift: 14px -> 10px**
- `font-weight: 700` — **drift: 500 -> 700**

Svelte adds `tbody tr:hover` row highlight (`var(--bg-rail)`) — enhancement not in OG.

---

### Components Added in Svelte (no OG equivalent)

| Component | Category | Notes |
|---|---|---|
| `Heading` | primitives | Svelte wrapper for heading classes with `level`, `variant`, `color`, `size` props. OG has CSS utility classes only. |
| `Text` | primitives | Svelte wrapper for body/mono/eyebrow classes. |
| `Checkbox` | forms | OG has only raw preview-HTML CSS, no `patterns.css` rule. |
| `Radio` | forms | Same. |
| `RadioGroup` | forms | Same. |
| `Switch` | forms | OG has `.toggle` CSS in `15-components-forms.html` only (not in `patterns.css`). |
| `Toast` / `ToastRegion` | feedback | No OG equivalent anywhere. |
| `Breadcrumb` | navigation | OG integrates breadcrumbs in the Nav brand bar inline; Svelte makes it a standalone component. |
| `Prose` | layout | No OG equivalent. |
| `Container` | layout | OG has `.container` CSS utility class; Svelte wraps it as a component. |
| `Stack` / `Grid` / `Inline` / `Spread` / `Rule` | layout | OG has CSS utility classes; Svelte wraps them as components. |

---

### OG Patterns Not Yet in Svelte

| Item | OG location | Notes |
|---|---|---|
| Vertical tabs | `20-components-tabs.html` | Sidebar tabs with amber left-border active state. Svelte `Tabs` only has `underline` and `pill`. |
| Badge | `21-components-misc.html` | Outlined mono pill with more colour variants than `TagPill` (includes `ok`, `danger`, filled-amber). Not identical to TagPill. |
| Empty state | `21-components-misc.html` | `[ ]` icon + mono title + sub text in a dashed-border container. |
| Kbd | `21-components-misc.html` | `<kbd>` element: `bg-elev` background, `rule-strong` border, 11px mono text. |
| Tooltip | `21-components-misc.html` | Hover-triggered mono tooltip panel above a dashed-underline trigger. |
| Rail layout | `layout.css` | `.rail-layout` / `.rail-sidebar` / `.rail-main` CSS classes; no Svelte component wraps them. |
| Nav in-brand breadcrumb | `12-components-nav.html` | The `// ~ / path` pattern inline in the nav brand. Svelte has a separate `Breadcrumb` component instead. |

---

## Prioritised Divergences

Ordered from most impactful to least:

1. **Switch: `var(--rail)` typo bug** (`Switch.svelte` line 72) — token does not exist; should be `var(--rule-strong)`. The OFF-state border is invisible.

2. **Modal title font-size** — OG `12px`; Svelte `19px` (via `size="lg"` on mono text). Remove `size="lg"` or use `size="sm"` (14px) to approach OG intent.

3. **Destructive modal icon** — OG: outlined `36px` danger circle; Svelte: filled `22px` danger circle. Both size (36px -> 22px) and visual treatment (outlined -> filled) diverge.

4. **Input / Textarea / InputWrap font-size** — OG `var(--t-mono)` = 14px; Svelte hardcodes `13px`. All form text controls are 1px smaller than spec.

5. **TagPill default colour** — OG: `color: var(--ink-dim)`, `border: var(--rule)`; Svelte: `color: var(--ink-faint)`, `border: var(--ink-faint)`. Pills are rendered in a fainter tone than specified.

6. **TagPill font-size** — OG `var(--t-micro)` = 12px; Svelte hardcoded `11px`.

7. **Switch OFF-state knob** — OG knob is `var(--ink-faint)` (visible); Svelte `var(--bg)` (invisible on sunken background).

8. **Radio checked indicator** — OG: amber-filled ring with white inner dot; Svelte: transparent ring with amber inner dot. Checked-state visual language differs in colour, size (5px -> 8px), and fill strategy.

9. **Checkbox label colour** — OG `var(--ink-dim)`; Svelte `var(--ink)`. Labels are brighter than spec.

10. **Nav breadcrumb not in brand bar** — OG integrates path crumbs inline in the nav brand. Svelte requires manual composition via a separate component.

11. **Button / form hard-coded font sizes** — literal `14px`, `13px`, `12px`, `11px` values instead of `var(--t-mono)` / `var(--t-micro)`. Not broken today; will drift if tokens change.

12. **PageHero border always-on** — OG `.page-hero.bordered` is opt-in; Svelte always renders the bottom border.

13. **Modal padding** — OG header `14px 20px`, body `20px`; Svelte `16px 24px` / `24px`. Modals are more spacious than OG.

14. **SectionHead gap** — OG `6px`; Svelte `8px` (`var(--u)`).

15. **SectionFoot top padding** — OG `16px`; Svelte `12px`.

16. **Table th padding, size, weight** — OG `8px 0`, 14px, weight 500; Svelte `8px 12px`, 10px, weight 700.
