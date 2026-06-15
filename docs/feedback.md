# Feedback

Feedback components communicate system state to the user: blocking dialogs, inline status banners, non-blocking toast notifications, floating popovers, status pills, a notification inbox, and lightweight data-viz (gauge, proportion bar, comparison bars).

## Modal

A native `<dialog>`-based modal with header, body, and optional footer snippet. Three variants cover neutral, confirm, and destructive intents.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Controls whether the dialog is open. |
| `title` | `string` | — | Dialog title text. Rendered as an h2 in the header. |
| `variant` | `'default' \| 'confirm' \| 'destructive'` | `'default'` | Visual intent. `confirm` shows an amber `!` icon; `destructive` shows a danger `!` icon. |
| `onclose` | `() => void` | `undefined` | Callback fired when the dialog is closed (via close button, backdrop click, or Escape key). |
| `children` | `Snippet` | `undefined` | Body content rendered inside the modal. |
| `footer` | `Snippet` | `undefined` | Footer content rendered in a right-aligned spread below the body. |
| `...rest` | `HTMLDialogAttributes` | — | All native HTML dialog attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Modal, Button } from '@dxlbnl/ui'

  let open = $state(false)
</script>

<Button onclick={() => { open = true }}>Open dialog</Button>

<Modal
  {open}
  title="Confirm action"
  variant="confirm"
  onclose={() => { open = false }}
>
  Are you sure you want to proceed?

  {#snippet footer()}
    <Button variant="ghost" onclick={() => { open = false }}>Cancel</Button>
    <Button variant="primary" onclick={() => { open = false }}>Confirm</Button>
  {/snippet}
</Modal>
```

### Notable behaviour

- Uses native `<dialog>` opened via `dialogElement.showModal()` inside a `$effect`. The effect is SSR-safe: it only runs on the client after hydration.
- The native `::backdrop` pseudo-element provides the dark overlay (`rgba(7, 9, 8, 0.85)`).
- Clicking the backdrop (the `<dialog>` element itself, outside the inner content box) fires `onclose`.
- The Escape key fires `onclose` via the native `cancel` event, which is intercepted with `event.preventDefault()` to prevent the dialog closing without the parent being notified.
- `document.body.style.overflow = 'hidden'` is set while the dialog is open and restored on close.
- `aria-modal="true"` and `aria-labelledby="modal-title"` are always present.
- The inner content box has `max-width: 480px` and `max-height: 80vh` with `overflow-y: auto`.

---

## Alert

Static inline status banner with a left accent border and variant icon glyph. Use for persistent inline feedback that does not require user dismissal.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'ok' \| 'amber' \| 'danger' \| 'info'` | `'info'` | Determines border colour, background tint, and icon glyph colour. |
| `title` | `string` | — | Alert title. Displayed in uppercase mono in the variant colour. |
| `message` | `string` | `undefined` | Optional body text below the title. Rendered in `--ink-dim`. |
| `children` | `Snippet` | `undefined` | Optional slot content rendered below `message`. Use one or the other, not both. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Alert } from '@dxlbnl/ui'
</script>

<Alert variant="ok" title="Build succeeded" message="All 42 tests passed." />
<Alert variant="danger" title="Upload failed" message="Maximum file size exceeded." />
<Alert variant="info" title="Maintenance window" >
  The service will be unavailable on Saturday 08:00–10:00 UTC.
</Alert>
```

### Notable behaviour

- `role="status"` is always present (polite live region). For urgent alerts that must interrupt screen readers, override with `role="alert"` via `...rest`.
- Icon glyphs: `ok` → `ok`; `amber` → `!!`; `danger` → `err`; `info` → `inf`. These are mono text labels, not SVG icons.
- Background tint uses `color-mix(in srgb, var(--variantToken) 8%, transparent)`.
- The left border is 2px solid in the variant colour; padding is 12px 16px.
- `Alert` lives in `src/lib/components/feedback/` and is exported from `'@dxlbnl/ui'`.

---

## Toast

Individual toast notification. Internal component — in normal usage, push toasts via the `toast` store rather than rendering `Toast` directly.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Unique toast identifier. Passed back to `ondismiss`. |
| `message` | `string` | — | Notification message text. |
| `variant` | `'success' \| 'warning' \| 'error'` | `'success'` | Determines border colour and icon glyph. |
| `ondismiss` | `(id: string) => void` | — | Callback fired when the close button is clicked. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { toast } from '@dxlbnl/ui'
</script>

<!-- Preferred: use the store -->
<button onclick={() => toast.push('Build complete', { variant: 'success' })}>
  Notify
</button>
```

### Notable behaviour

- `error` variant uses `role="alert"` (assertive live region) so screen readers interrupt immediately.
- `success` and `warning` variants use `role="status"` (polite live region).
- `aria-atomic="true"` is always set.
- Icon glyphs: `success` → `ok`; `warning` → `!!`; `error` → `err`.
- Minimum width 260px, maximum width 400px.

---

## ToastRegion

Viewport-fixed portal that renders the active toast stack. Mount once at the app root in `+layout.svelte`. SSR-safe via a `mounted` flag set in `$effect`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Corner of the viewport where toasts appear. |
| `limit` | `number` | `5` | Maximum number of toasts shown simultaneously. Oldest are dismissed when exceeded. |

### Usage

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { ToastRegion } from '@dxlbnl/ui'
</script>

<slot />
<ToastRegion position="bottom-right" limit={5} />
```

### Notable behaviour

- Renders nothing on the server (SSR-safe): the region div is only inserted after hydration via a `mounted` flag set in `$effect`.
- Auto-dismiss: each toast with `duration > 0` gets a `setTimeout`. Timers are cleared in the effect cleanup when `visibleToasts` changes.
- Stack limit: when `$toast.length > limit`, the oldest toasts are dismissed via `toast.dismiss()` automatically.
- Top-position variants (`top-right`, `top-left`) use `flex-direction: column-reverse` so new toasts appear at the top of the stack.
- `role="region"` with `aria-label="Notifications"` is set on the container div.
- `z-index: 9000` — renders above all other components including modals.

---

## toast store

The `toast` store is a plain Svelte store (not a component) that manages the active toast queue. Import and call it from anywhere in the application.

### API

```ts
import { toast } from '@dxlbnl/ui'

// Push a toast and get back its id
const id = toast.push('Operation complete')

// Push with options
const id2 = toast.push('Upload failed', {
  variant: 'error',    // 'success' | 'warning' | 'error' — default 'success'
  duration: 8000,      // milliseconds before auto-dismiss — default 5000
})

// Disable auto-dismiss (duration 0)
const id3 = toast.push('Persistent message', { duration: 0 })

// Dismiss a specific toast
toast.dismiss(id)

// Subscribe to the active toast list (standard Svelte store)
const unsubscribe = toast.subscribe((toasts) => {
  console.log(toasts) // ToastItem[]
})
```

### Notable behaviour

- `toast.push` returns a `string` id (`toast-1`, `toast-2`, …) that can be passed to `toast.dismiss`.
- `duration` defaults to `5000`ms. Pass `0` to create a persistent toast that only dismisses on user action or an explicit `toast.dismiss(id)` call.
- The store is a standard Svelte writable store. It can be used with `$toast` in Svelte components or `.subscribe()` in plain TypeScript.
- Exported types: `ToastItem`, `ToastVariant`, `ToastOptions` from `'@dxlbnl/ui'`.

---

## Popover

Anchored floating-panel primitive. Controlled via `open`; dismisses itself on outside mouse-down and the Escape key by calling `onclose`. Positions absolutely within its nearest positioned ancestor, so the parent must establish a positioning context (`position: relative`). Used internally by `StatusPill` and `Inbox`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Whether the panel is rendered/visible. Bindable. |
| `onclose` | `() => void` | `undefined` | Called when the popover requests dismissal (outside mouse-down or Escape). The parent flips `open`. |
| `align` | `'left' \| 'right'` | `'right'` | Which edge the panel aligns to within the positioned parent. |
| `width` | `number \| string` | `280` | Panel width — a number (px) or any CSS length string. |
| `top` | `number \| string` | `'100%'` | Vertical offset of the panel top relative to the parent. |
| `as` | `string` | `'div'` | Polymorphic root element of the panel. |
| `children` | `Snippet` | `undefined` | Panel contents. |
| `...rest` | `HTMLAttributes<HTMLElement>` | — | All native HTML attributes forwarded to the panel element. |

### Usage

```svelte
<script>
  import { Popover } from '@dxlbnl/ui'

  let open = $state(false)
</script>

<div style="position: relative; display: inline-block">
  <button onclick={() => (open = !open)}>Details</button>
  <Popover bind:open onclose={() => (open = false)} align="left" width={320}>
    <div style="padding: 12px">Panel contents</div>
  </Popover>
</div>
```

### Notable behaviour

- Renders nothing when `open` is `false` (`{#if open}`), so it is absent from the DOM when closed.
- Dismissal is the parent's responsibility: the component only *requests* close via `onclose`. It does not mutate `open` on outside-click itself.
- The outside-click / Escape listeners are registered in an `$effect` only while `open` is true and torn down on close — SSR-safe (the effect runs client-only).
- Absolutely positioned: `position: absolute` with `right: 0` (align `right`) or `left: 0` (align `left`), `top` per the prop. The parent must be positioned.
- `z-index: 150`; `box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4)`; `--bg` background with a `--rule-strong` border.

---

## StatusPill

Compact status indicator: a coloured `Led` plus an uppercase mono label, optionally with a faint ` · detail` suffix. When `children` are provided it becomes a button that toggles a `Popover` with detail content.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `'ok' \| 'amber' \| 'cyan' \| 'danger' \| 'off'` | `'ok'` | Drives the LED colour and, for non-`ok` tones, the label and border colour. |
| `label` | `string` | — | Pill label text. Rendered uppercase mono. |
| `detail` | `string` | `undefined` | Optional ` · <detail>` suffix after the label, in faint ink. |
| `blink` | `boolean` | `false` | Whether the LED blinks. Forwarded to `Led`. |
| `children` | `Snippet` | `undefined` | Detail-panel contents. When absent, clicking does **not** open a Popover. |
| `align` | `'left' \| 'right'` | `'right'` | Popover edge alignment, forwarded to `Popover`. |
| `width` | `number \| string` | `300` | Popover panel width, forwarded to `Popover`. |
| `as` | `string` | `'button'` | Polymorphic trigger element. |
| `...rest` | `HTMLButtonAttributes` | — | All native HTML button attributes forwarded to the trigger. |

### Usage

```svelte
<script>
  import { StatusPill } from '@dxlbnl/ui'
</script>

<!-- Static pill -->
<StatusPill tone="ok" label="Operational" />
<StatusPill tone="danger" label="Degraded" detail="3 incidents" blink />

<!-- With a detail popover -->
<StatusPill tone="amber" label="Queued" align="left">
  <div style="padding: 12px">142 jobs waiting · est. 4m</div>
</StatusPill>
```

### Notable behaviour

- `aria-haspopup="dialog"` and `aria-expanded` are set **only** when `children` are provided; a pill without children is a plain status indicator.
- Non-`ok` tones (`amber` / `cyan` / `danger`) colour both the pill border and the label; `ok` / `off` keep the neutral `--ink-dim` label.
- The trigger stops `mousedown` propagation so the Popover's outside-click handler does not immediately re-close it on the opening click.
- The wrapper is `position: relative; display: inline-block` so the Popover anchors to the pill.

---

## Inbox

Notification centre: a bell button with an unread-count badge that toggles a `Popover` containing a scrollable notification list and an optional "Mark all read" action.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `InboxItem[]` | `[]` | Notification items rendered in the panel list. |
| `onOpen` | `(item: InboxItem) => void` | `undefined` | Called with the clicked item when a list row is activated. |
| `onMarkAll` | `() => void` | `undefined` | Called when "Mark all read" is clicked (only shown when unread > 0). |
| `glyph` | `string` | `'◔'` | Glyph shown inside the bell button. |
| `label` | `string` | `'Notifications'` | Accessible base name for the bell trigger. |
| `align` | `'left' \| 'right'` | `'right'` | Popover edge alignment, forwarded to `Popover`. |
| `width` | `number \| string` | `320` | Popover panel width, forwarded to `Popover`. |
| `as` | `string` | `'button'` | Polymorphic trigger element. |
| `...rest` | `HTMLButtonAttributes` | — | All native HTML button attributes forwarded to the bell. |

`InboxItem` shape: `{ id: string | number; tone: string; title: string; body: string; time: string; unread: boolean }`. `tone` is a `Led` colour.

### Usage

```svelte
<script>
  import { Inbox } from '@dxlbnl/ui'

  let items = $state([
    { id: 1, tone: 'danger', title: 'Build failed', body: 'main @ a1b2c3', time: '2m', unread: true },
    { id: 2, tone: 'ok', title: 'Deploy complete', body: 'production', time: '1h', unread: false },
  ])
</script>

<Inbox
  {items}
  onOpen={(item) => goto(`/notifications/${item.id}`)}
  onMarkAll={() => (items = items.map((i) => ({ ...i, unread: false })))}
/>
```

### Notable behaviour

- The unread count is derived from `items.filter((i) => i.unread).length`. When > 0, an amber count badge is shown, the bell glyph turns amber, and the trigger's `aria-label` becomes `"<label>, <n> unread"`.
- "Mark all read" is rendered only when unread > 0.
- Each row's `Led` blinks when the item is `unread` and its `tone` is not `ok`.
- Unread rows get a `--bg-rail` background and a bolder title; a visually-hidden "unread" label is added for screen readers.
- The list scrolls at `max-height: 360px`. The trigger stops `mousedown` propagation like `StatusPill`.

---

## Gauge

Radial SVG dial that renders a single 0–100 value as an arc — the radial sibling of `ProgressBar`. Intrinsically an SVG, so there is no polymorphic `as` prop.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `pct` | `number` | — | Value 0–100. Clamped to that range (`<0` → 0, `>100` → 100). |
| `size` | `number` | `42` | SVG width/height in px. |
| `tone` | `string` | `'amber'` | Token **name** for the arc colour, rendered as `var(--{tone})` (e.g. `'ok'`, `'danger'`). |
| `track` | `string` | `'var(--rule-strong)'` | Track (background ring) stroke — a full CSS colour/var string. |
| `width` | `number` | `4` | Stroke width of both circles. |
| `label` | `string` | `'Progress'` | Accessible name. |
| `...rest` | `SVGAttributes<SVGSVGElement>` | — | All native SVG attributes forwarded to the `<svg>` element. |

### Usage

```svelte
<script>
  import { Gauge } from '@dxlbnl/ui'
</script>

<Gauge pct={72} label="CPU" />
<Gauge pct={94} tone="danger" size={56} label="Memory" />
```

### Notable behaviour

- `role="progressbar"` with `aria-valuenow` (the clamped value), `aria-valuemin={0}`, `aria-valuemax={100}`.
- The SVG is rotated `-90deg` so the arc starts at 12 o'clock; the arc length animates via `stroke-dasharray` transitions.
- `tone` is a token **name** (`var(--{tone})`), whereas `track` is a complete CSS value — they take different forms by design.

---

## ProportionBar

A single horizontal stacked bar showing part-to-whole segments, with a legend below. Intrinsically an SVG, so there is no polymorphic `as` prop.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `segments` | `Segment[]` | — | Ordered segments, laid left-to-right. |
| `height` | `number` | `14` | SVG height in px (the bar thickness). |
| `label` | `string` | `'Proportion'` | Accessible name for the whole bar. |
| `...rest` | `SVGAttributes<SVGSVGElement>` | — | All native SVG attributes forwarded to the `<svg>` element. |

`Segment` shape: `{ label: string; value: number; color: string; valueLabel?: string }`. `color` is any CSS colour/var, applied as both the rect fill and the legend swatch. `valueLabel` is an optional per-segment caption (e.g. `"42%"`).

### Usage

```svelte
<script>
  import { ProportionBar } from '@dxlbnl/ui'
</script>

<ProportionBar
  label="Traffic sources"
  segments={[
    { label: 'Direct', value: 52, color: 'var(--amber)', valueLabel: '52%' },
    { label: 'Search', value: 31, color: 'var(--cyan)', valueLabel: '31%' },
    { label: 'Referral', value: 17, color: 'var(--ink-faint)', valueLabel: '17%' },
  ]}
/>
```

### Notable behaviour

- Segment widths are normalised to the sum of all values, so they always fill the bar regardless of scale (percentages, counts, etc.).
- Negative values are clamped to 0 before any geometry is computed; a 2px gap separates adjacent segments.
- `role="img"` with the `label` as `aria-label`; the legend renders a swatch, an uppercase mono label, and the optional `valueLabel` per segment.

---

## CompareBars

Stacked rows comparing an actual `value` against a `target`, with a ghost target-fill behind the actual-fill. The actual-fill turns red (`--danger`) when over target, green (`--ok`) when within.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `CompareRow[]` | — | Ordered rows, stacked top-to-bottom. |
| `label` | `string` | `'Comparison'` | Accessible name for the whole chart. |
| `as` | `string` | `'div'` | Polymorphic root element. |
| `...rest` | `HTMLAttributes<HTMLElement>` | — | All native HTML attributes forwarded to the root element. |

`CompareRow` shape: `{ label: string; value: number; target: number; valueLabel?: string }`. `valueLabel` is an optional caption shown at the row's right edge (e.g. `"€240 / 320"`).

### Usage

```svelte
<script>
  import { CompareBars } from '@dxlbnl/ui'
</script>

<CompareBars
  label="Budget vs spend"
  rows={[
    { label: 'Compute', value: 240, target: 320, valueLabel: '€240 / 320' },
    { label: 'Storage', value: 410, target: 300, valueLabel: '€410 / 300' },
  ]}
/>
```

### Notable behaviour

- Bar widths are scaled to the maximum of all `value`/`target` across rows, so rows share one axis.
- Per row, `value > target` flips the actual-fill and the caption to `--danger`; otherwise the fill is `--ok`.
- The root is `role="group"` with the `label` as `aria-label`; each row is `role="img"` with a descriptive label like `"Compute: 240 of 320, within target"`.
- The actual-fill width is capped at 100% of the axis and animates via a width transition.
