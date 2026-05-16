# B10: Accordion, Tabs, Table

## Context

B10 delivers three data-display components that complete the core component vocabulary of
the Dexterlabs design system: an expandable `Accordion`, a panel-switching `Tabs` set,
and a semantic `Table` wrapper.

Reference HTML prototypes live in the design bundle:
- `dexterlabs-design-system/project/preview/17-components-accordion.html`
- `dexterlabs-design-system/project/preview/20-components-tabs.html`
- `dexterlabs-design-system/project/preview/19-components-table.html`

All three components live in `src/lib/components/data/`. They may import from:
- `src/lib/components/primitives/` — `Button`, `Led`, `TagPill`
- `src/lib/components/layout/` — layout primitives

They must not import from cards, navigation, forms, feedback, or patterns layers.

Related wiki pages:
- [requirements.md](../requirements.md) — R10 (Accordion, Tabs, Table), R1 (design tokens),
  constraints (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TypeScript, no external UI)
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style,
  scoped CSS, `...rest` forwarding, Svelte 5 runes, snippets for slots)
- [decisions.md](../decisions.md) — D1 (tests = Story play functions), D4 (Chakra-style
  composability), D5 (no global utility classes), D16 (Accordion uses native `<details>`)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function rules

---

## Files produced

| File | Role |
|---|---|
| `src/lib/components/data/Accordion.svelte` | Accordion wrapper component |
| `src/lib/components/data/AccordionItem.svelte` | Single accordion item (trigger + panel) |
| `src/lib/components/data/Accordion.stories.svelte` | Accordion stories + tests |
| `src/lib/components/data/Tabs.svelte` | Tabs component (tab bar + panels) |
| `src/lib/components/data/Tabs.stories.svelte` | Tabs stories + tests |
| `src/lib/components/data/Table.svelte` | Table wrapper component |
| `src/lib/components/data/Table.stories.svelte` | Table stories + tests |
| `src/lib/components/data/index.ts` | Barrel export for the data layer |
| `src/lib/index.ts` | Updated to re-export `Accordion`, `AccordionItem`, `Tabs`, `Table` |

---

## Component specifications

---

### 1. Accordion

An expandable/collapsible list of items. Uses the native `<details>`/`<summary>` HTML
elements for the SSR-safe expand/collapse mechanic — no JavaScript is required for basic
open/close, and the open state survives server-render without layout shift on hydration.

The compound pattern is `<Accordion>` wrapper + `<AccordionItem>` children. This keeps
the API composable and avoids prop-drilling an items array while still enforcing the
border/gap structure via the wrapper.

#### Design reference

From `17-components-accordion.html`:
- Wrapper: `border: 1px solid var(--rule)`, flex column, no gap
- Item divider: `border-bottom: 1px solid var(--rule)` (last item: none)
- Trigger background: `var(--bg-rail)`; hover/open: `var(--bg-elev)`
- Title: `font-family: var(--mono)`, 12px, `letter-spacing: 0.08em`, ALL CAPS, `color: var(--ink)`
- Icon: `›` glyph (U+203A), `color: var(--ink-faint)`; when open: `transform: rotate(90deg)`, `color: var(--amber)`
- Body: `padding: 14px 16px`, `font-size: 13px`, `line-height: 1.6`, `color: var(--ink-dim)`,
  `border-top: 1px solid var(--rule)`, `background: var(--bg-sunken)` (note: `--bg-sunken`
  must exist in tokens; fall back to `var(--bg)` if absent)

#### Accordion wrapper props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  children: Snippet   // AccordionItem children
}

let { children, ...rest }: AccordionProps = $props()
```

Root element: `<div class="accordion" {...rest}>`.

#### AccordionItem props interface

```ts
import type { Snippet } from 'svelte'

interface AccordionItemProps {
  label: string         // trigger text (rendered as-is; consumer adds "// 0x01 ·" prefix)
  open?: boolean        // initial open state; defaults to false
  children: Snippet     // panel body content
}

let { label, open = false, children }: AccordionItemProps = $props()
```

Root element: `<details class="acc-item" open={open}>`.
- The `open` HTML attribute on `<details>` controls initial state without JS.
- Do NOT spread `...rest` on `<details>` — `AccordionItem` has no `...rest` because
  `open` conflicts with `HTMLDetailsAttributes.open`. The consumer controls state only
  via the `open` prop.

#### HTML structure

```html
<!-- Accordion (wrapper) -->
<div class="accordion">
  <!-- AccordionItem (repeated) -->
  <details class="acc-item">
    <summary class="acc-trigger">
      <span class="acc-title">{label}</span>
      <span class="acc-icon" aria-hidden="true">›</span>
    </summary>
    <div class="acc-body">
      {@render children()}
    </div>
  </details>
</div>
```

The `<summary>` element is natively keyboard-accessible (Space/Enter toggles, role
`button` is implied). No manual ARIA is needed when using `<details>`/`<summary>`.
The `<summary>` must not receive `role="button"` explicitly — browsers already assign it.

#### CSS rules (AccordionItem scoped style)

| Selector | Key rules |
|---|---|
| `.acc-item` | `border-bottom: 1px solid var(--rule)` |
| `.acc-item:last-child` | `border-bottom: none` |
| `.acc-trigger` | `display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; background: var(--bg-rail); transition: background var(--transition); user-select: none; list-style: none` |
| `.acc-trigger:hover` | `background: var(--bg-elev)` |
| `details[open] .acc-trigger` | `background: var(--bg-elev)` |
| `.acc-title` | `font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink)` |
| `.acc-icon` | `font-family: var(--mono); font-size: 14px; color: var(--ink-faint); transition: transform var(--transition); flex-shrink: 0` |
| `details[open] .acc-icon` | `transform: rotate(90deg); color: var(--amber)` |
| `.acc-body` | `padding: 14px 16px; font-size: 13px; line-height: 1.6; color: var(--ink-dim); border-top: 1px solid var(--rule); background: var(--bg-sunken, var(--bg))` |

Note on `<summary>` default marker: set `list-style: none` and `::-webkit-details-marker { display: none }` on `.acc-trigger` to suppress the browser default disclosure triangle.

#### CSS rules (Accordion wrapper scoped style)

| Selector | Key rules |
|---|---|
| `.accordion` | `display: flex; flex-direction: column; gap: 0; border: 1px solid var(--rule)` |

#### State and behaviour

- Open/close is handled by the browser's native `<details>` toggle — no `$state` is
  required in `AccordionItem` for the basic expand/collapse.
- The `open` prop initialises the `<details>` `open` attribute. After first render,
  open state is owned by the browser DOM; there is no controlled/uncontrolled split at
  the Svelte level. This is intentional for SSR safety.
- Consumers who need programmatic control (e.g. "expand all") can set `open` on each
  item reactively; a `$derived` or `$state` in the parent achieves this.
- The `›` icon rotates 90° via CSS `details[open] .acc-icon` — no JS needed.
- The `toggle` DOM event fires on `<details>` natively; consumers can bind it via
  `ontoggle` on `AccordionItem` (forwarded as part of normal DOM event flow; no explicit
  event prop is needed).

#### Story specifications

File: `src/lib/components/data/Accordion.stories.svelte`

`defineMeta` must NOT set `component:` — Accordion stories always render multiple
`AccordionItem` children (composition pattern). Use a wrapper approach.

Stories:

1. **"Default"** — Three items, first item `open={true}`, others closed. Play: verify
   first `<details>` has `open` attribute; second and third `<details>` lack it; `<summary>`
   elements are all visible; the icon inside the open item has amber color resolved to
   `var(--amber)`.

2. **"All Closed"** — Three items, all `open={false}`. Play: verify all `<details>`
   elements lack the `open` attribute.

3. **"Toggle Interaction"** — One item, `open={false}`. Play: click the `<summary>`,
   then verify the parent `<details>` now has the `open` attribute and the body text is
   visible; click again, verify `<details>` no longer has `open` attribute.

4. **"Rich Body"** — One item open, body contains a `<dl>`-style key-value list (plain
   HTML snippet). Play: verify the body is visible and contains the expected text.

---

### 2. Tabs

A tab bar with panel switching. The default variant uses the underline pattern from the
reference (`20-components-tabs.html`): mono ALL-CAPS tab labels, active tab has a 2px
amber bottom border, only the active panel is shown.

Two variants are specified: **underline** (default, `variant="underline"`) and **pill**
(`variant="pill"`). The vertical variant in the reference is out of scope for B10.

#### Design reference

**Underline tabs** (from `20-components-tabs.html`):
- Tab bar: `display: flex; border-bottom: 1px solid var(--rule); gap: 0`
- Tab: `font-family: var(--mono)`, 12px, `letter-spacing: 0.08em`, ALL CAPS,
  `padding: 10px 18px`, `color: var(--ink-faint)`,
  `border-bottom: 2px solid transparent`, `margin-bottom: -1px`
- Tab hover: `color: var(--ink)`
- Active tab: `color: var(--ink)`, `border-bottom-color: var(--amber)`
- Panel: `padding: 16px; background: var(--bg-rail); border: 1px solid var(--rule); border-top: none; font-size: 13px; line-height: 1.6; color: var(--ink-dim)`

**Pill tabs** (`variant="pill"`):
- Container: `display: flex; gap: 4px; padding: 4px; background: var(--bg-rail); border: 1px solid var(--rule); width: fit-content`
- Tab: 11px, `padding: 5px 14px`, `color: var(--ink-faint)`
- Active: `background: var(--amber); color: var(--bg)`

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

type TabsVariant = 'underline' | 'pill'

interface TabItem {
  id: string          // unique tab identifier
  label: string       // tab label text
  panel: Snippet      // snippet rendered as tab panel content
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[]           // ordered list of tabs; must contain at least one entry
  active?: string           // id of the initially active tab; defaults to tabs[0].id
  variant?: TabsVariant     // defaults to 'underline'
}

let { tabs, active = tabs[0]?.id, variant = 'underline', ...rest }: TabsProps = $props()
```

Internal state:

```ts
let activeId = $state(active)
```

Root element: `<div class="tabs tabs--{variant}" {...rest}>`

#### HTML structure

```html
<div class="tabs tabs--underline" role="presentation">
  <!-- Tab bar -->
  <div class="tab-bar" role="tablist" aria-label="...">
    {#each tabs as tab}
      <button
        class="tab"
        class:tab--active={activeId === tab.id}
        role="tab"
        id="tab-{tab.id}"
        aria-selected={activeId === tab.id}
        aria-controls="panel-{tab.id}"
        onclick={() => activeId = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Panels -->
  {#each tabs as tab}
    <div
      class="tab-panel"
      role="tabpanel"
      id="panel-{tab.id}"
      aria-labelledby="tab-{tab.id}"
      hidden={activeId !== tab.id}
    >
      {@render tab.panel()}
    </div>
  {/each}
</div>
```

Use `<button>` (not `<div>`) for tab elements to get native keyboard access and
`role="tab"` semantics. The `hidden` attribute on panels hides them from both visual
and accessibility trees; no CSS `display:none` class is needed.

For the `pill` variant, render `.tab-bar` as `.pill-bar` and `.tab` as `.pill-tab` via
the variant class on the root — or use a single class that BEM-varies per variant.
The pill variant does not render a `.tab-panel` region (it only controls which panel is
shown); the same panel markup is shared.

#### CSS rules (scoped)

**Underline variant:**

| Selector | Key rules |
|---|---|
| `.tabs` | `display: flex; flex-direction: column` |
| `.tab-bar` | `display: flex; border-bottom: 1px solid var(--rule); gap: 0` |
| `.tab` | `font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; padding: 10px 18px; cursor: pointer; color: var(--ink-faint); border: none; background: transparent; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color var(--transition), border-color var(--transition); white-space: nowrap` |
| `.tab:hover` | `color: var(--ink)` |
| `.tab--active` | `color: var(--ink); border-bottom-color: var(--amber)` |
| `.tab-panel` | `padding: 16px; background: var(--bg-rail); border: 1px solid var(--rule); border-top: none; font-size: 13px; line-height: 1.6; color: var(--ink-dim)` |

**Pill variant:**

| Selector | Key rules |
|---|---|
| `.tabs--pill .tab-bar` | `gap: 4px; padding: 4px; background: var(--bg-rail); border: 1px solid var(--rule); width: fit-content; border-bottom: 1px solid var(--rule)` |
| `.tabs--pill .tab` | `font-size: 11px; padding: 5px 14px; border-bottom: none; margin-bottom: 0` |
| `.tabs--pill .tab--active` | `background: var(--amber); color: var(--bg); border-bottom-color: transparent` |

#### State and behaviour

- `activeId` is `$state(active)` — initialised from the `active` prop.
- Clicking a tab sets `activeId` to that tab's `id`.
- Only the panel matching `activeId` is shown; all others are hidden via the `hidden`
  attribute (not via CSS display toggling).
- The `active` prop is read once at initialisation and is not reactive after mount.
  If the consumer needs to control the active tab externally, they should manage state
  in the parent and pass a writable store binding (out of scope for B10 — see Open
  questions OQ-1).
- **Keyboard navigation (optional, best-effort):** If implemented, left/right arrow
  keys while focus is on a tab move focus to the previous/next tab and activate it.
  Home/End move to first/last tab. If not implemented in B10, this is a known gap
  (see Open questions OQ-2). The a11y addon may flag missing keyboard nav.

#### Story specifications

File: `src/lib/components/data/Tabs.stories.svelte`

`defineMeta` sets `component: Tabs` (no children in slot, tabs data passed via `args`).
Because `TabItem.panel` is a `Snippet`, stories cannot pass panel content through plain
`args` objects — use the composition pattern: build the `tabs` array inside the story
slot, which means `component:` should be omitted and the full component rendered in the slot.

Stories:

1. **"Underline"** — Three tabs (Overview / Specs / Notes), active defaults to first.
   Play: `getByRole('tablist')` exists; `getByRole('tab', { name: 'OVERVIEW' })` has
   `aria-selected="true"`; `getByRole('tab', { name: 'SPECS' })` has
   `aria-selected="false"`; the panel for Overview is visible; the panel for Specs is
   not visible (has `hidden` attribute).

2. **"Pill variant"** — Three tabs, `variant="pill"`. Play: tab bar has class
   `tabs--pill`; active tab has amber background resolving to `var(--amber)`; inactive
   tabs do not.

3. **"Tab switch interaction"** — Underline, three tabs. Play: click the "SPECS" tab;
   verify its `aria-selected` becomes `"true"`; verify the Specs panel becomes visible;
   verify the Overview panel is no longer visible.

4. **"Second tab initially active"** — Pass `active` set to the second tab's id. Play:
   second tab has `aria-selected="true"` and its panel is visible on initial render.

---

### 3. Table

A semantic HTML table with design system styling. Wraps `<table>`, `<thead>`, `<tbody>`,
`<tr>`, `<th>`, and `<td>` into a styled shell. The component accepts structured data
via props for the common case, but also exposes a `rows` snippet for consumers who need
full control over cell content (badges, LEDs, links, etc.).

#### Design reference

From `19-components-table.html`:
- `table`: `width: 100%; border-collapse: collapse; font-family: var(--mono)`
- `thead th`: `text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--rule-strong); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); font-weight: 700; white-space: nowrap`
- `tbody td`: `padding: 8px 12px; border-bottom: 1px dashed var(--rule); color: var(--ink-dim); vertical-align: middle`
- Row hover: `background: var(--bg-rail)` on all `td` in hovered `tr`

#### Props interface

```ts
import type { HTMLTableAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface TableProps extends HTMLTableAttributes {
  headers: string[]           // column header labels (rendered ALL CAPS mono)
  rows?: string[][]           // plain text data rows (optional — use when cells are text-only)
  children?: Snippet          // custom <tr> rows (rendered inside <tbody>; overrides `rows`)
  caption?: string            // optional <caption> element for a11y
}

let { headers, rows, children, caption, ...rest }: TableProps = $props()
```

Root element: `<table class="dxl-table" {...rest}>`.

When `children` is provided, it is rendered inside `<tbody>` and `rows` is ignored.
When only `rows` is provided, plain `<td>` cells are rendered for each string entry.

#### HTML structure

```html
<table class="dxl-table">
  {#if caption}
    <caption class="dxl-table-caption">{caption}</caption>
  {/if}
  <thead>
    <tr>
      {#each headers as header}
        <th scope="col">{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if children}
      {@render children()}
    {:else if rows}
      {#each rows as row}
        <tr>
          {#each row as cell}
            <td>{cell}</td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
```

#### CSS rules (scoped)

| Selector | Key rules |
|---|---|
| `.dxl-table` | `width: 100%; border-collapse: collapse; font-family: var(--mono)` |
| `.dxl-table-caption` | `font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); text-align: left; padding-bottom: 6px` |
| `.dxl-table thead th` | `text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--rule-strong); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); font-weight: 700; white-space: nowrap` |
| `.dxl-table tbody td` | `padding: 8px 12px; border-bottom: 1px dashed var(--rule); color: var(--ink-dim); vertical-align: middle; font-size: 12px` |
| `.dxl-table tbody tr:hover td` | `background: var(--bg-rail)` |

#### State and behaviour

- `Table` is a pure presentational component — no internal `$state`.
- When `children` snippet is present, `rows` is ignored regardless of value.
- The `caption` prop renders a `<caption>` element (not a heading above the table), which
  is the correct semantic association for screen readers.
- `...rest` spreads onto `<table>` — consumers can pass `aria-label`, `aria-describedby`,
  class overrides, etc.

#### Story specifications

File: `src/lib/components/data/Table.stories.svelte`

`defineMeta` sets `component: Table, tags: ['autodocs']`.

Because `headers` and `rows` are plain arrays they can be passed as `args`.
For the custom-rows story, use a snippet/composition approach.

Stories:

1. **"Basic"** — `headers={['ID', 'Product', 'Category']}`,
   `rows={[['CONDUIT-PDX2', 'Conduit PDX-2', 'Power'], ['DISTRANS-AR1', 'Distrans AR-1', 'Envelope']]}`.
   Play: `getByRole('table')` exists; `getByRole('columnheader', { name: 'ID' })` is
   visible; first `getByRole('cell', { name: 'CONDUIT-PDX2' })` is visible; there are
   exactly 3 `<th>` elements and 6 `<td>` elements.

2. **"With Caption"** — adds `caption="Product inventory"`. Play: `<caption>` element is
   present in the DOM with text "Product inventory".

3. **"Empty rows"** — `headers={['Col A', 'Col B']}`, no `rows`. Play: `<tbody>` is
   empty (no `<tr>` children); headers still render correctly.

4. **"Custom rows (snippet)"** — no `component:` in `defineMeta` for this story; render
   `<Table headers={...}>` with `<tr>` children including `<TagPill>` in a cell to
   verify snippet slot renders. Play: `getByRole('table')` exists; the TagPill text is
   visible inside a cell.

---

## Acceptance criteria

### Accordion

1. `Accordion` renders a `<div>` with class `accordion` as its root element.
2. `AccordionItem` renders a `<details>` element with class `acc-item` as its root.
3. The `<details>` element contains a `<summary>` child with class `acc-trigger` as the
   first child.
4. The `<summary>` element contains a `<span class="acc-title">` with the `label` prop
   text.
5. The `<summary>` element contains a `<span class="acc-icon" aria-hidden="true">` with
   the `›` glyph (U+203A single right-pointing angle quotation mark).
6. The body content snippet is rendered inside a `<div class="acc-body">` that is a
   sibling of `<summary>` within `<details>`.
7. When `open={true}` is passed, the `<details>` element has the `open` attribute set
   on initial render without any JavaScript executing.
8. When `open` is omitted or `open={false}`, the `<details>` element does not have the
   `open` attribute on initial render.
9. When a user clicks the `<summary>`, the browser toggles the `<details>` `open`
   attribute natively (verified by: click closed item → `<details>` gains `open`;
   click again → `<details>` loses `open`).
10. The body content is accessible (visible in the DOM) only when `<details>` has `open`;
    when closed, the body content is not visible to the user (native `<details>` hiding).
11. The `›` icon (`acc-icon`) has `transform: rotate(90deg)` applied when
    `details[open]` is in effect, verified via `getComputedStyle`.
12. The `acc-icon` colour resolves to `var(--amber)` when the item is open, and to
    `var(--ink-faint)` when closed, verified by probing the CSS custom property.
13. The `.acc-trigger` background resolves to `var(--bg-elev)` when the item is open
    (via `details[open] .acc-trigger`), and to `var(--bg-rail)` when closed.
14. The last `AccordionItem` in an `Accordion` has no bottom border (`border-bottom: none`
    via the `:last-child` selector).
15. Non-last `AccordionItem` children have `border-bottom: 1px solid` resolving to
    `var(--rule)`.
16. The `Accordion` wrapper has a 1px solid border resolving to `var(--rule)` on all
    four sides.
17. The `<summary>` element does not render the browser default disclosure triangle
    (verified by: `list-style` is `none` and the WebKit marker is suppressed).
18. `Accordion` accepts and forwards `...rest` HTML attributes (e.g. `id`, `aria-label`)
    onto its root `<div>`.
19. `AccordionItem` is correctly typed in TypeScript: `label` is required `string`,
    `open` is optional `boolean`, `children` is required `Snippet`. No TypeScript errors
    on valid usage (`pnpm check` passes).
20. A Storybook story named "Default" exists for Accordion with three items, the first
    open, and its play function passes assertions on the open/closed state of each item.
21. A Storybook story named "Toggle Interaction" exists and its play function clicks a
    closed `<summary>`, then verifies the parent `<details>` has the `open` attribute.
22. The a11y addon reports zero violations for all Accordion stories.
23. `Accordion` and `AccordionItem` are exported from `src/lib/components/data/index.ts`
    and re-exported from `src/lib/index.ts`.

### Tabs

24. `Tabs` renders a root `<div>` with class `tabs` and a variant modifier class
    (`tabs--underline` or `tabs--pill`).
25. The tab bar renders as an element with `role="tablist"`.
26. Each tab renders as a `<button>` element with `role="tab"`.
27. Each tab button has an `id` attribute equal to `"tab-{tab.id}"`.
28. Each tab button has `aria-controls` equal to `"panel-{tab.id}"`.
29. The initially active tab (first tab by default) has `aria-selected="true"`.
30. All inactive tabs have `aria-selected="false"`.
31. Each panel renders as a `<div>` with `role="tabpanel"`, `id="panel-{tab.id}"`, and
    `aria-labelledby="tab-{tab.id}"`.
32. The panel corresponding to the active tab is visible (does not have the `hidden`
    attribute).
33. All inactive panels have the `hidden` attribute set.
34. Clicking an inactive tab sets that tab's `aria-selected` to `"true"` and removes
    `"true"` from the previously active tab.
35. After clicking an inactive tab, that tab's panel becomes visible (loses `hidden`)
    and the previously active panel gains `hidden`.
36. When no `active` prop is passed, the first tab in the `tabs` array is active by
    default.
37. When `active` is passed with the id of the second tab, the second tab has
    `aria-selected="true"` and its panel is visible on initial render.
38. For `variant="underline"`: the active tab's computed `border-bottom-color` resolves
    to `var(--amber)` (probed via a CSS custom property probe element).
39. For `variant="underline"`: inactive tabs have `border-bottom-color: transparent`.
40. For `variant="pill"`: the active tab's computed `background-color` resolves to
    `var(--amber)`.
41. For `variant="pill"`: the active tab's computed `color` resolves to `var(--bg)`.
42. Tab labels are rendered as ALL CAPS (`text-transform: uppercase` in computed style).
43. Tab labels use `font-family: var(--mono)` (JetBrains Mono) in computed style.
44. `Tabs` accepts and forwards `...rest` HTML attributes onto its root `<div>`.
45. `Tabs` is correctly typed: `tabs` is `TabItem[]` (required), `active` is optional
    `string`, `variant` is optional `'underline' | 'pill'`. No TypeScript errors on
    valid usage.
46. A Storybook story named "Underline" exists with play function assertions on
    `aria-selected`, panel visibility, and tablist role.
47. A Storybook story named "Tab switch interaction" exists whose play function clicks
    a non-active tab and asserts the new active state and panel visibility.
48. A Storybook story named "Pill variant" exists and its play function verifies the
    `tabs--pill` class and amber background on the active tab.
49. The a11y addon reports zero violations for all Tabs stories.
50. `Tabs` is exported from `src/lib/components/data/index.ts` and re-exported from
    `src/lib/index.ts`.

### Table

51. `Table` renders a `<table>` element with class `dxl-table` as its root.
52. The `<table>` element has `border-collapse: collapse` in its computed style.
53. The `<table>` element uses `font-family: var(--mono)` (JetBrains Mono).
54. `headers` prop renders each string as a `<th scope="col">` inside `<thead> > <tr>`.
55. Header cells have `text-transform: uppercase` and `font-weight: 700` in computed style.
56. Header cells have `color` resolving to `var(--ink-faint)`.
57. Header cells have `border-bottom: 1px solid` resolving to `var(--rule-strong)`.
58. Header cells have `font-size: 10px` and `letter-spacing: 0.1em`.
59. When `rows` is provided, each sub-array is rendered as a `<tr>` in `<tbody>`, with
    each string rendered as a `<td>`.
60. Body `<td>` cells have `border-bottom: 1px dashed` resolving to `var(--rule)`.
61. Body `<td>` cells have `color` resolving to `var(--ink-dim)`.
62. Body `<td>` cells have `vertical-align: middle`.
63. Hovering a `<tbody> <tr>` causes all its `<td>` cells to have `background-color`
    resolving to `var(--bg-rail)` (verified by `userEvent.hover`).
64. When `caption` is provided, a `<caption>` element is rendered as the first child of
    `<table>` with the caption text.
65. When `caption` is omitted, no `<caption>` element is present in the DOM.
66. When `children` snippet is provided, it is rendered inside `<tbody>` and the `rows`
    prop is not rendered (children override rows).
67. When neither `rows` nor `children` is provided, `<tbody>` is rendered empty (no
    `<tr>` children).
68. `Table` accepts and forwards `...rest` HTML attributes onto the root `<table>` (e.g.
    `aria-label`, `class`).
69. `Table` is correctly typed: `headers` is `string[]` (required), `rows` is optional
    `string[][]`, `children` is optional `Snippet`, `caption` is optional `string`.
    Props extend `HTMLTableAttributes`. No TypeScript errors.
70. A Storybook story named "Basic" exists with at least two data rows, and its play
    function verifies `getByRole('table')`, column header count, and cell content.
71. A Storybook story named "With Caption" exists and its play function finds the
    `<caption>` element in the DOM.
72. A Storybook story named "Empty rows" exists and its play function verifies that
    `<tbody>` contains no `<tr>` elements.
73. The a11y addon reports zero violations for all Table stories.
74. `Table` is exported from `src/lib/components/data/index.ts` and re-exported from
    `src/lib/index.ts`.

---

## Out of scope

- **Controlled Accordion**: programmatic open/close from a parent's `$state` (i.e.
  "expand all" / "collapse all" buttons) is achievable by passing a reactive `open`
  prop, but no explicit controlled-mode API is added in B10.
- **Accordion animation**: height/opacity transition on open/close. The `<details>`
  element's native expand/collapse is instant. CSS `interpolate-size` or
  `@starting-style` animations are a follow-up item.
- **Vertical Tabs** (`vtab` pattern from the reference): out of scope for B10.
  The `variant` prop type can be extended in a follow-up.
- **Tabs keyboard navigation**: left/right arrow, Home/End key handling between tabs
  (see OQ-2). The current `<button role="tab">` approach provides Enter/Space activation
  for free; full ARIA tab-panel keyboard pattern is a follow-up.
- **Table sorting**: the reference shows sortable column headers (`.sort-col`,
  `.sort-active`). Sorting state and interaction is out of scope for B10.
- **Table pagination**: the footer pagination row shown in the reference is out of scope.
- **Table zebra rows**: alternating row backgrounds are not specified; they may be added
  by consumers via the `children` snippet.
- **Tabs `active` prop reactivity**: the `active` prop sets initial state only;
  two-way binding or reactive external control is out of scope (see OQ-1).

---

## Open questions

**OQ-1** (non-blocking): Should `Tabs` support a `$bindable` `active` prop so a parent
can read or set the active tab after mount? The current spec treats `active` as an
initialiser only. If required, `active` would be declared with `$bindable()` and the
parent could use `bind:active`. This can be added without a spec revision — it is an
additive change.

**OQ-2** (non-blocking): Full ARIA tab-panel keyboard navigation requires that arrow
keys move focus between tabs and activate them (WAI-ARIA 1.2 Tabs pattern). The
current spec satisfies WCAG 2.1 AA via `<button role="tab">` (Space/Enter work), but
the a11y addon may still flag the absence of arrow-key navigation. If it does, the
implementer should add a `keydown` handler to each tab button for B10 without a spec
revision.

**OQ-3** (non-blocking): `--bg-sunken` is referenced in the accordion body background
but may not be defined in the current token set. The implementer should verify its
presence in `src/lib/tokens/tokens.css` and fall back to `var(--bg)` if absent
(the CSS fallback `var(--bg-sunken, var(--bg))` handles this at the CSS level).

**OQ-4** (non-blocking): The `<summary>` element in `AccordionItem` suppresses the
default browser disclosure triangle via `list-style: none`. This works in all
major browsers for `<details>/<summary>` but may need the additional
`::-webkit-details-marker { display: none }` pseudo-element rule in some WebKit
versions. The implementer should include both.
