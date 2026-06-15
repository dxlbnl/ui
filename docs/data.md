# Data

Data display components for structured content: collapsible sections, tabbed panels, and tabular data.

## Accordion

Thin wrapper that adds a shared border around a group of `AccordionItem` children. Optionally coordinates **sticky section headers** across its items.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `sticky` | `boolean` | `false` | Enable sticky section headers. Each `AccordionItem` summary sticks below the headers above it and above the headers below it. |
| `fallbackHeaderHeight` | `number` | `46` | Per-header height (px) used for offset maths before live measurement / during SSR. |
| `children` | `Snippet` | — | One or more `AccordionItem` components. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Accordion, AccordionItem } from '@dxlbnl/ui'
</script>

<!-- Default -->
<Accordion>
  <AccordionItem label="Specifications">
    <p>4HP, 40mm depth, +12V 35mA / -12V 10mA</p>
  </AccordionItem>
  <AccordionItem label="Downloads" open>
    <p>Schematic and panel files available on GitHub.</p>
  </AccordionItem>
</Accordion>

<!-- Sticky headers — summaries pin while their section scrolls -->
<Accordion sticky>
  <AccordionItem label="Overview"><p>…</p></AccordionItem>
  <AccordionItem label="Details"><p>…</p></AccordionItem>
</Accordion>
```

### Notable behaviour

- Renders as a `Stack gap="none"` with `border: 1px solid var(--rule)` wrapping all items.
- Does not manage open/closed state across items — multiple items can be open simultaneously (native `<details>` behaviour).
- **Sticky mode (`sticky`):** the Accordion provides a shared registry over context that `AccordionItem`s register with. Each item's `<summary>` becomes `position: sticky` with a computed `top` (sum of header heights above it) and `bottom` (sum of header heights below it), plus a tiered `z-index` so earlier headers stack above later ones. Header heights are measured live with a `ResizeObserver`; `fallbackHeaderHeight` is used until measured and during SSR. When `sticky` is false (default), summaries are plain and no context/observer is created.

---

## AccordionItem

A single collapsible section using native `<details>`/`<summary>`. No JavaScript required for expand/collapse — fully SSR-safe.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Summary text shown in the trigger row. |
| `open` | `boolean` | `false` | Initial open state. Sets the `open` attribute on the `<details>` element. |
| `children` | `Snippet` | — | Content shown when the item is expanded. |

### Usage

```svelte
<script>
  import { AccordionItem } from '@dxlbnl/ui'
</script>

<AccordionItem label="Technical details" open>
  <p>Content visible by default.</p>
</AccordionItem>
```

### Notable behaviour

- Uses native `<details>` and `<summary>` — browser handles toggle with no JS event handlers.
- The chevron icon (`›`) rotates 90° and turns `--amber` when the item is open.
- A `border-bottom: 1px solid var(--rule)` separates items; the last child has no bottom border.
- On browsers that support `interpolate-size: allow-keywords`, the body height animates open/closed using `@starting-style` and `height: auto` transitions. On unsupported browsers the content appears/disappears instantly (progressive enhancement).
- The trigger row uses `list-style: none` and hides the native `<details>` marker (`::-webkit-details-marker { display: none }`).

---

## Tabs

Tabbed panel interface with full ARIA tab pattern and keyboard navigation. Supports underline and pill visual variants.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `{ id: string; label: string; panel: Snippet }[]` | — | Array of tab definitions. Each item provides a unique id, label text, and a panel snippet. |
| `active` | `string` | First tab id | Initially active tab id. |
| `variant` | `'underline' \| 'pill'` | `'underline'` | Visual style of the tab bar. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Tabs } from '@dxlbnl/ui'
</script>

<Tabs
  tabs={[
    {
      id: 'overview',
      label: 'Overview',
      panel: overview,
    },
    {
      id: 'specs',
      label: 'Specifications',
      panel: specs,
    },
  ]}
/>

{#snippet overview()}
  <p>Product overview content.</p>
{/snippet}

{#snippet specs()}
  <p>Technical specifications.</p>
{/snippet}
```

### Notable behaviour

- Each tab button is `<button role="tab">` with `aria-selected` and `aria-controls="panel-{id}"`.
- Each panel is `<div role="tabpanel">` with `aria-labelledby="tab-{id}"` and the `hidden` attribute when inactive.
- Keyboard navigation: `ArrowRight` / `ArrowLeft` cycle tabs and activate them immediately (automatic activation model). `Home` activates the first tab; `End` activates the last. Focus is programmatically moved to the newly active tab button.
- `underline` variant: active tab has `border-bottom: 2px solid var(--amber)` and `color: --ink`. Inactive tabs are `--ink-faint`.
- `pill` variant: active tab has amber background (`--amber`) with dark (`--bg`) text. The tab bar itself has a `--bg-rail` background and `--rule` border.
- Internal `activeId` state is initialised from the `active` prop. Changes to the `active` prop after mount are not reflected (uncontrolled after initialisation).

---

## Table

Semantic HTML table with mono uppercase headers, dashed row rules, and hover row highlight.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `headers` | `string[]` | — | Column header labels. Rendered as `<th scope="col">` in uppercase mono. |
| `rows` | `string[][]` | `undefined` | Optional 2D array of cell values for simple automatic rendering. |
| `children` | `Snippet` | `undefined` | Optional custom `<tr>` markup rendered inside `<tbody>`. Use when cells need custom content. |
| `caption` | `string` | `undefined` | Optional table caption rendered above the headers. |
| `...rest` | `HTMLTableAttributes` | — | All native HTML table attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Table } from '@dxlbnl/ui'

  const headers = ['Module', 'HP', 'Current +12V', 'Status']
  const rows = [
    ['DXLB-VCO', '4', '35mA', 'In stock'],
    ['DXLB-VCF', '8', '45mA', 'Coming soon'],
  ]
</script>

<!-- Automatic cell rendering -->
<Table {headers} {rows} caption="Module catalogue" />

<!-- Custom row rendering -->
<Table {headers}>
  {#snippet children()}
    <tr>
      <td>DXLB-VCO</td>
      <td>4</td>
      <td>35mA</td>
      <td><span style="color: var(--ok)">In stock</span></td>
    </tr>
  {/snippet}
</Table>
```

### Notable behaviour

- When both `rows` and `children` are provided, `children` takes precedence (the `{#if children}` branch is evaluated first).
- Headers are 10px mono uppercase with `color: --ink-faint` and `border-bottom: 1px solid var(--rule-strong)`.
- Body cells are 12px mono `--ink-dim` with `border-bottom: 1px dashed var(--rule)`.
- Row hover applies `background: var(--bg-rail)` to all `<td>` elements in the row.
- Caption is rendered with `text-align: left` in 10px uppercase mono `--ink-faint`.
- `width: 100%; border-collapse: collapse` is always applied.
