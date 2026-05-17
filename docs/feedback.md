# Feedback

Feedback components communicate system state to the user: blocking dialogs, inline status banners, and non-blocking toast notifications.

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
  import { Modal, Button } from 'dxlb-design'

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
  import { Alert } from 'dxlb-design'
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
- `Alert` lives in the patterns layer (`src/lib/components/patterns/`) but is exported directly from `'dxlb-design'` alongside feedback components.

---

## Toast

Individual toast notification. Internal component — in normal usage, push toasts via the `toast` store rather than rendering `Toast` directly.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Unique toast identifier. Passed back to `ondismiss`. |
| `message` | `string` | — | Notification message text. |
| `variant` | `'ok' \| 'amber' \| 'danger'` | `'ok'` | Determines border colour and icon glyph. |
| `ondismiss` | `(id: string) => void` | — | Callback fired when the close button is clicked. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { toast } from 'dxlb-design'
</script>

<!-- Preferred: use the store -->
<button onclick={() => toast.push('Build complete', { variant: 'ok' })}>
  Notify
</button>
```

### Notable behaviour

- `danger` variant uses `role="alert"` (assertive live region) so screen readers interrupt immediately.
- `ok` and `amber` variants use `role="status"` (polite live region).
- `aria-atomic="true"` is always set.
- Icon glyphs: `ok` → `ok`; `amber` → `!!`; `danger` → `err`.
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
  import { ToastRegion } from 'dxlb-design'
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
import { toast } from 'dxlb-design'

// Push a toast and get back its id
const id = toast.push('Operation complete')

// Push with options
const id2 = toast.push('Upload failed', {
  variant: 'danger',   // 'ok' | 'amber' | 'danger' — default 'ok'
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
- Exported types: `ToastItem`, `ToastVariant`, `ToastOptions` from `'dxlb-design'`.
