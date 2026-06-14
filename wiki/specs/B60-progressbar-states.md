# B60: ProgressBar progress states (over-budget)

## Context

This item ENHANCES the existing linear `ProgressBar`
(`src/lib/components/patterns/ProgressBar.svelte`) — it does **not** create a new
component. It ports the new "over-budget" progress state from the design system:
`wiki/specs/_design-refs/B60/preview-32-progress-states.html` +
`wiki/specs/_design-refs/B60/ProgressBar.jsx` (reference only — downstream React).

The design demos four bars: normal (ok 42%), warn (amber 78%), full (amber 100%), and
**over-budget** (ok tone, 112%). The new behaviour: when progress exceeds 100%, the fill
turns `--danger` (overriding the tone), the fill width clamps at 100%, a 3px `--danger`
notch is pinned to the right edge to signal overflow, and the percentage readout shows
the real rounded percent in `--danger`.

Relevant wiki pages:
- Item card: `wiki/backlog/doing/B60-progressbar-states.md`
- `wiki/requirements.md` R8 (Progress bar: track + fill; fill colors ok/amber/danger),
  Constraints (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TS).
- `wiki/architecture.md` (tests = Storybook `.stories.svelte` play functions only).
- `wiki/stories-guide.md` (Story format, token-colour resolution).
- `wiki/decisions.md` D45 (native CSS nesting), D58 (Gauge — `role="progressbar"`,
  `aria-valuenow/min/max` clamped 0–100, ProgressBar's a11y sibling), D62 (only existing
  tokens; micro px literals OK).

### Existing component API (MUST be preserved)

The current `ProgressBar` takes:
- `value: number` (0–100, **clamped** via `Math.min(100, Math.max(0, value))`),
- `label?: string`,
- `color?: 'ok' | 'amber' | 'danger'` (default `'ok'`),
- `...rest` spread onto the root `.progress-bar` div.

It uses a `clampedValue` derived, renders a mono micro label row (label `faint`, percent
`color`-toned, both inside a `Spread aria-hidden="true"`), and a `.progress-track` with
`role="progressbar"`, `aria-valuenow={clampedValue}`, `aria-valuemin=0`,
`aria-valuemax=100`, `aria-label={label ?? 'Progress'}`. The fill width is the inline
`style="width: {clampedValue}%"`; fill colour is `var(--ok|--amber|--danger)` via
`.progress-fill--{color}`. Track is `height: 5px`, `bg: var(--bg-sunken)`,
`border: 1px solid var(--rule)`.

The existing stories that **MUST keep passing** (no regression): `Ok 68 Percent`,
`Amber 88 Percent`, `Danger 97 Percent`, `No Label`, `Clamped at 100` (value 150 →
`aria-valuenow="100"`, readout `"100%"`), `Clamped at 0`, `No Inline Width Style`.

### Reconciling the design's `pct` with the existing `value` API

The existing component keeps `value` (NOT `pct`, NOT `value`/`max`). The design's
"over-budget" (the React `over = pct > 100`) is **opt-in** behind a new boolean prop so
the default API and the existing `Clamped at 100` story (which clamps both readout and
aria to 100 with no notch) stay byte-for-byte intact:

- New prop **`overflow?: boolean`** (default `false`).
- `overflow = false` → today's behaviour exactly: `value` clamps to 0–100 for the fill
  width, the readout, and `aria-valuenow`; no notch; no danger override.
- `overflow = true` → the component accepts `value > 100`. The readout shows the real
  rounded percent (may exceed 100); when `value > 100` the fill colour switches to
  `--danger` overriding `color`, the fill width clamps at 100%, the notch appears, and the
  readout text colour is `--danger`. At/below 100% with `overflow = true` the bar renders
  exactly like the default (tone fill, tone readout, no notch).

The "over" condition is **derived** (`value > 100`), not a separate prop. `overflow`
only enables the over-budget rendering path; it does not by itself force danger styling.

### Aria decision for values > 100 (consistent with B52 Gauge, D58)

`aria-valuemax` stays `100` and `aria-valuenow` is **capped at 100** even when
`overflow = true` and `value > 100`. Rationale: ARIA requires `aria-valuenow` to lie
within `[aria-valuemin, aria-valuemax]`; a value above `aria-valuemax` is invalid and
AT-unfriendly. D58 already pins Gauge (the radial sibling) to `aria-valuenow` clamped to
0–100 with `aria-valuemax=100`; keeping ProgressBar identical preserves cross-sibling
consistency for AT users. The over-budget magnitude is conveyed visually (danger fill +
notch) and through the **visible** readout text (e.g. `112%`), which is the user-facing
channel; the label row remains `aria-hidden="true"` as today, so the readout text is not
double-announced.

## Acceptance criteria

Inputs are component props; outputs are rendered DOM/CSS asserted via Storybook play
functions (utils from `storybook/test`; token colours via `resolveTokenColor` /
`resolveTokenFgColor` from `$lib/storybook-utils.js`). NEVER import `vitest` (B61).

### Over-budget behaviour (new)

1. **AC-1 — overflow opt-in.** A new prop `overflow?: boolean` defaults to `false`. With
   `overflow` unset/false the component behaves exactly as before this item (all clamping,
   readout, and aria unchanged).

2. **AC-2 — over condition.** "Over-budget" rendering is active iff `overflow === true`
   **and** `value > 100`. (`overflow = true` with `value <= 100` is NOT over-budget.)

3. **AC-3 — fill colour overrides tone when over.** When over-budget, the fill
   (`.progress-fill`) computed `background-color` equals `resolveTokenColor('--danger')`
   regardless of the `color` prop (test with `color="ok"` and `value=112` → danger fill).

4. **AC-4 — fill width clamps at 100%.** When over-budget, the fill's inline
   `style.width` is exactly `"100%"` (the fill never overflows the track). Assert the
   inline `style.width` string, not the fractional computed pixel width.

5. **AC-5 — right-edge notch appears only when over.** When over-budget, exactly one notch
   element is rendered inside the track, pinned to the right edge:
   `position: absolute`, `top: -1px`, `bottom: -1px`, `right: 0`, `width: 3px`,
   `background: var(--danger)`. Its computed `background-color` equals
   `resolveTokenColor('--danger')`. The notch is **absent** (query returns null) whenever
   not over-budget (i.e. `overflow=false`, or `overflow=true` with `value <= 100`). Give
   the notch a stable structural hook so tests target it without DOM-order coupling
   (e.g. `data-part="notch"`, per the D59 `data-part` convention) — implementer's choice,
   but it must be queryable.

6. **AC-6 — readout colour is danger when over.** When over-budget, the percentage
   readout text computed `color` equals `resolveTokenFgColor('--danger')`.

7. **AC-7 — readout shows real rounded percent when over.** When over-budget, the readout
   text is `Math.round(value)%` and MAY exceed 100 (e.g. `value=112` → `"112%"`,
   `value=99.6` is not over so excluded; `value=100.4` → over, `"100%"`). For the canonical
   demo case `value=112, overflow=true` the readout text is `"112%"`.

8. **AC-8 — fill width is the clamped percent below 100 with overflow on.** When
   `overflow=true` and `value <= 100`, the fill inline `style.width` is
   `"{Math.min(100, Math.max(0, value))}%"` and the readout is `Math.round(value)%`
   (no rounding error widening) — i.e. overflow mode does not change sub-100 widths.

### Preserved behaviour (no regression)

9. **AC-9 — default (overflow off) is unchanged.** With `overflow` unset, for any
   `value`: fill `background-color` is `var(--{color})` (ok/amber/danger), readout colour
   is the tone colour, no notch element exists, and `value` clamps to 0–100 for fill
   width, readout, and `aria-valuenow`. The existing `Clamped at 100` story (`value: 150`,
   no `overflow`) still yields `aria-valuenow="100"` and readout `"100%"` with no notch.

10. **AC-10 — at/below 100 with overflow on is tone-styled.** With `overflow=true` and
    `value <= 100`: fill `background-color` is `var(--{color})` (NOT danger), readout
    colour is the tone colour, no notch. Test `value=100, color="amber", overflow=true`
    (the design "full" case) → amber fill, amber readout, no notch, readout `"100%"`.

11. **AC-11 — all existing stories pass.** The seven existing stories listed in Context
    (`Ok 68 Percent`, `Amber 88 Percent`, `Danger 97 Percent`, `No Label`,
    `Clamped at 100`, `Clamped at 0`, `No Inline Width Style`) continue to pass without
    modification. (`No Inline Width Style` asserts the root carries no `style=` attribute —
    the new notch/overflow markup must not add an inline style on the component root.)

12. **AC-12 — aria semantics preserved & capped.** The track keeps `role="progressbar"`,
    `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label={label ?? 'Progress'}`.
    `aria-valuenow` is always the 0–100-clamped value, including when over-budget
    (`value=112, overflow=true` → `aria-valuenow="100"`). `aria-valuenow` never exceeds
    `aria-valuemax`.

### Visual / token criteria

13. **AC-13 — track geometry unchanged.** The `.progress-track` is `height: 5px`,
    `background: var(--bg-sunken)`, `border: 1px solid var(--rule)`. The track is the
    notch's positioning context (`position: relative`) so the absolutely-positioned notch
    pins to its right edge.

14. **AC-14 — label row typography.** The mono micro label row keeps: label in
    `--ink-faint`, percent value in the tone colour (or `--danger` when over), mono 10px
    (`size="xs"` → `--t-micro`) uppercase, `Spread` with `aria-hidden="true"`. Rendered
    via the existing `Text variant="mono"` usage; the percent `Text`'s `color` switches to
    `danger` when over-budget.

15. **AC-15 — tokens only.** All colours reference existing tokens
    (`--danger`, `--ok`, `--amber`, `--bg-sunken`, `--rule`, `--ink-faint`). Notch
    geometry (`top: -1px`, `bottom: -1px`, `right: 0`, `width: 3px`) and track
    `height: 5px` are literal px (allowed micro px per D62). No new tokens.

16. **AC-16 — SSR-safe, runes, strict TS, scoped CSS.** No `window`/`document`/
    `localStorage` in the render path. Svelte 5 runes (`$props`, `$derived`). `overflow`
    typed `boolean`; `over` derived. Scoped CSS with native nesting only (D45) — no flat
    `.host :global(child)` selectors. WCAG 2.1 AA (a11y addon clean on all stories).

## Storybook story plan

Stories live in `src/lib/components/patterns/ProgressBar.stories.svelte` (extend the
existing file — keep all current stories). New stories, each with an inline `play`
(imports from `storybook/test`; token resolvers from `$lib/storybook-utils.js`):

1. **Normal (below 100, overflow on)** — `args={{ value: 42, color: 'ok', overflow: true,
   label: 'Groceries' }}`. Assert: fill `style.width === "42%"`; fill bg ===
   `resolveTokenColor('--ok')` (tone, NOT danger); no `[data-part="notch"]` element;
   readout text `"42%"`; readout colour === `resolveTokenFgColor('--ok')`;
   `aria-valuenow="42"`.

2. **Full (exactly 100, overflow on)** — `args={{ value: 100, color: 'amber',
   overflow: true, label: 'Utilities' }}`. Assert: fill bg === `resolveTokenColor('--amber')`
   (tone, NOT danger); fill `style.width === "100%"`; no notch element; readout `"100%"`;
   `aria-valuenow="100"`.

3. **Over-budget (>100)** — `args={{ value: 112, color: 'ok', overflow: true,
   label: 'Dining — over budget' }}`. Assert: fill bg === `resolveTokenColor('--danger')`
   (danger overrides ok); fill `style.width === "100%"` (clamped, assert the inline string);
   exactly one `[data-part="notch"]` present with bg === `resolveTokenColor('--danger')`;
   readout text `"112%"` (rounded, exceeds 100); readout colour ===
   `resolveTokenFgColor('--danger')`; `aria-valuenow="100"`, `aria-valuemax="100"`.

4. **Over-budget regression — default unchanged** — `args={{ value: 150, color: 'danger',
   label: 'Overflow' }}` (NO `overflow` prop; mirrors the existing `Clamped at 100`
   intent). Assert: `aria-valuenow="100"`; readout `"100%"`; no `[data-part="notch"]`
   element; fill `style.width === "100%"`; fill bg === `resolveTokenColor('--danger')`
   (because `color="danger"`, not because of overflow). This pins that the default path is
   untouched by the new feature.

### Testing gotchas (this batch)

- Assert the fill clamp via the **inline `style.width` string** (`"100%"`), not the
  fractional computed pixel width — avoid brittle fractional-px assertions.
- Resolve token colours via `resolveTokenColor` (background channel: fill/notch
  background) and `resolveTokenFgColor` (foreground channel: readout text colour). Do not
  hard-code RGB strings.
- Query the notch by its stable hook (`[data-part="notch"]`), not by DOM order or a fragile
  class chain. Assert it is `null` when not over-budget rather than counting children.
- The `No Inline Width Style` story still asserts no `style=` on the root — keep any new
  inline styling on inner elements (fill width, notch geometry can be inline or scoped),
  never on the `.progress-bar` root.

## Out of scope

- Indeterminate / striped / animated-loading progress states (the design reference only
  introduces the over-budget state; the card's "indeterminate/success/..." guess is
  superseded by the actual reference).
- Changing the public `value` / `color` / `label` API, or switching to a `pct` or
  `value`/`max` API — the existing `value` (0–100) API is preserved; over-budget is the
  only addition (`overflow`).
- The `showPct` prop from the React reference (the Svelte component shows the readout iff a
  `label` is present, per the existing `No Label` story; this item does not add `showPct`).
- Gauge / ProportionBar / CompareBars (separate components/items).
- Vertical orientation, tooltips, value formatting beyond `Math.round`.

## Open questions

None blocking. Resolved during writing:
- *How to avoid breaking `Clamped at 100`?* → over-budget is opt-in behind `overflow`
  (default false); the existing story has no `overflow` prop and is unchanged (AC-1, AC-9,
  AC-11).
- *Should `aria-valuenow` show the real >100 value?* → No; cap at 100 with
  `aria-valuemax=100` for ARIA validity and B52/D58 consistency; magnitude conveyed by the
  visible readout text (AC-12). Logged to `decisions.md`.
