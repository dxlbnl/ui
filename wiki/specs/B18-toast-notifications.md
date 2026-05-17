# B18: Toast notifications

## Context

B18 delivers a transient notification system — the counterpart to the static `Alert`
component (B9). `Alert` is an inline, persistent banner that the page author places in
markup. `Toast` is a programmatic, auto-dismissing notification that appears in a
fixed viewport corner, stacks multiple messages, and disappears after a timeout or on
manual close. It is used on dexterlabs.nl for operation confirmations, warning
messages, and error notifications that must not interrupt the user's flow.

The system has three distinct parts:
1. **`toast` store** — the public API; consumers call `toast.push(…)` and `toast.dismiss(…)`.
2. **`ToastRegion`** — a Svelte component that reads the store, renders all active toasts,
   and is mounted once at the app root. It handles SSR-safe portal mounting and corner
   positioning.
3. **`Toast`** — an internal visual component for a single toast item, driven entirely by
   `ToastRegion` from the store data; not meant to be used directly by consumers.

Related wiki pages:
- [requirements.md](../requirements.md) — R9 (feedback layer), R1 (design tokens),
  constraints (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TypeScript)
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style,
  scoped CSS, `$effect` SSR pattern, Svelte 5 runes)
- [decisions.md](../decisions.md) — D1 (tests = Story play functions), D5 (no global
  utility classes), D7 (SSR-safe via `$effect`), D12 (modal SSR-safe mount pattern)
- [specs/B9-pattern-components.md](B9-pattern-components.md) — `Alert` for visual variant
  reference (ok/amber/danger colors, icon glyphs, border-left treatment)
- [specs/B8-modal.md](B8-modal.md) — `$effect`-based SSR-safe mount pattern
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function rules

### Layer position

`Toast` and `ToastRegion` live in `src/lib/components/feedback/`. They may import from:
- `src/lib/components/primitives/` — `Button`
- `src/lib/components/layout/` — `Stack`, `Inline`, `Spread`
- `src/lib/stores/toast.ts` — the toast store

They must not import from cards, navigation, forms, patterns, or data layers.

---

## Files produced

| File | Role |
|---|---|
| `src/lib/stores/toast.ts` | Toast store — public API: `push`, `dismiss`, store value |
| `src/lib/components/feedback/Toast.svelte` | Single toast visual component (internal) |
| `src/lib/components/feedback/ToastRegion.svelte` | Portal container — SSR-safe, fixed viewport anchor |
| `src/lib/components/feedback/index.ts` | Updated barrel export — adds Toast, ToastRegion |
| `src/lib/index.ts` | Updated package barrel — exports Toast, ToastRegion, and toast store |
| `src/lib/components/feedback/Toast.stories.svelte` | Single toast stories + tests |
| `src/lib/components/feedback/ToastRegion.stories.svelte` | Region/stack stories + tests |

---

## Store API

### `src/lib/stores/toast.ts`

```ts
import { writable } from 'svelte/store'

export type ToastVariant = 'ok' | 'amber' | 'danger'

export interface ToastItem {
  id: string            // unique identifier, auto-generated on push
  message: string       // displayed message text
  variant: ToastVariant // defaults to 'ok' if not provided
  duration: number      // ms before auto-dismiss; defaults to 5000
}

export interface ToastOptions {
  variant?: ToastVariant   // defaults to 'ok'
  duration?: number        // ms; defaults to 5000; pass 0 to disable auto-dismiss
}

// Internal writable store — consumers interact via the `toast` object below
const _store = writable<ToastItem[]>([])

let _idCounter = 0

function push(message: string, options?: ToastOptions): string {
  const id = `toast-${++_idCounter}`
  const item: ToastItem = {
    id,
    message,
    variant: options?.variant ?? 'ok',
    duration: options?.duration ?? 5000,
  }
  _store.update((items) => {
    const next = [...items, item]
    return next
  })
  return id
}

function dismiss(id: string): void {
  _store.update((items) => items.filter((t) => t.id !== id))
}

// The public API — a readable store plus push/dismiss methods
export const toast = {
  subscribe: _store.subscribe,
  push,
  dismiss,
}
```

Notes:
- The internal `_store` is not exported; consumers use `toast.subscribe`, `toast.push`,
  and `toast.dismiss` only.
- IDs are generated from a module-level counter. They are unique within the lifetime of
  the page but not across page reloads. This is sufficient for the notification use case.
- Stack limit enforcement (default max 5) is handled by `ToastRegion`, not the store.
  The store holds all active toasts; `ToastRegion` slices the visible window and
  dismisses the oldest when the limit is exceeded.
- Auto-dismiss timers are managed by `ToastRegion` (inside `$effect`), not the store.
  This keeps the store free of browser APIs and SSR-safe.

---

## Component specifications

---

### `Toast.svelte` — single toast visual component

This component renders one toast item. It is rendered exclusively by `ToastRegion`
and is not part of the public API. The consumer never uses `Toast` directly.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { ToastVariant } from '$lib/stores/toast.js'

interface Props extends HTMLAttributes<HTMLDivElement> {
  id: string              // toast ID — forwarded to the close button handler
  message: string         // displayed message text
  variant?: ToastVariant  // 'ok' | 'amber' | 'danger'; defaults to 'ok'
  ondismiss: (id: string) => void  // called when the close button is clicked
}

let {
  id,
  message,
  variant = 'ok',
  ondismiss,
  ...rest
}: Props = $props()
```

#### ARIA role

- `variant === 'danger'` → `role="alert"` (assertive live region, interrupts screen reader)
- `variant === 'ok'` or `variant === 'amber'` → `role="status"` (polite live region)

The role is computed: `const role = $derived(variant === 'danger' ? 'alert' : 'status')`

This resolves the open question (OQ-1) from B9 — toasts, unlike static Alert banners,
are transient and the `danger` urgency warrants assertive announcement.

#### HTML structure

```html
<div
  class="toast toast--{variant}"
  role={role}
  aria-live={role === 'alert' ? 'assertive' : 'polite'}
  aria-atomic="true"
  {...rest}
>
  <span class="toast-icon" aria-hidden="true">{ICON_GLYPH}</span>
  <span class="toast-message">{message}</span>
  <Button
    variant="ghost"
    class="toast-close"
    type="button"
    aria-label="Dismiss notification"
    onclick={() => ondismiss(id)}
  >×</Button>
</div>
```

Icon glyphs by variant (`aria-hidden="true"` — decorative):
- `ok` → `"ok"`
- `amber` → `"!!"`
- `danger` → `"err"`

Structure notes:
- `aria-atomic="true"` ensures the entire toast content is read as a unit when the
  live region updates (not just the changed portion).
- The close button uses the `Button` primitive with `variant="ghost"` per the design
  requirement. Its accessible name is `"Dismiss notification"`.
- `...rest` forwards onto the root `<div>`. Consumers (i.e. `ToastRegion`) can pass
  `data-testid` and other attributes.
- No `as` prop — the root is always `<div>`.

#### CSS rules (scoped to `Toast.svelte`)

All colours via CSS custom properties. No hardcoded hex values. Toasts use the same
color vocabulary as `Alert` but in a floating card format rather than a border-left bar.

```css
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  min-width: 260px;
  max-width: 400px;
  border: 1px solid;
  background: var(--bg-elev);
  font-size: var(--t-body);
  line-height: 1.4;
  pointer-events: all;
}

/* Variant border colors */
.toast--ok     { border-color: var(--ok); }
.toast--amber  { border-color: var(--amber); }
.toast--danger { border-color: var(--danger); }

/* Icon */
.toast-icon {
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.toast--ok     .toast-icon { color: var(--ok); }
.toast--amber  .toast-icon { color: var(--amber); }
.toast--danger .toast-icon { color: var(--danger); }

/* Message */
.toast-message {
  flex: 1;
  color: var(--ink-dim);
}

/* Close button override — ghost Button reset */
.toast-close {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0 4px;
  font-size: 16px;
  color: var(--ink-faint);
  line-height: 1;
}
.toast-close:hover {
  color: var(--ink);
}
```

#### CSS transitions (slide-in / fade-out)

Toasts animate using CSS transitions only — no JavaScript animation. The animation
strategy uses CSS classes toggled by `ToastRegion` on mount/dismiss:

- On mount: the toast slides in from the anchor edge. For `bottom-right` / `bottom-left`,
  it slides up from below. For `top-right` / `top-left`, it slides down from above.
- On dismiss: the toast fades out and collapses in height before being removed from the DOM.

The animation is driven by a CSS `entering` class applied by `ToastRegion` via a
`$state` flag, and a `leaving` class set just before removal. Implementation detail
left to the implementer, but CSS must be the animation mechanism (no JS `animate()`
or `setTimeout` for visual transitions).

**CSS transitions are not asserted by play functions** — they are a visual review
concern. Play functions assert the DOM state after transitions complete.

---

### `ToastRegion.svelte` — portal container

`ToastRegion` is mounted once, typically in `+layout.svelte`. It reads the `toast`
store, enforces the stack limit, manages auto-dismiss timers, and renders `Toast`
components in a fixed-position container.

#### Props interface

```ts
interface Props {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  // Corner to anchor the toast stack. Default: 'bottom-right'

  limit?: number
  // Maximum number of toasts visible simultaneously. Default: 5.
  // When a new toast arrives that would exceed the limit, the oldest is dismissed first.

  defaultDuration?: number
  // Fallback auto-dismiss duration in ms for any toast with duration = 0.
  // Not used when a toast sets its own duration explicitly. Default: 5000.
  // (This prop is optional; individual toast duration from push() takes precedence.)
}

let {
  position = 'bottom-right',
  limit = 5,
}: Props = $props()
```

Notes:
- No `...rest` spread — `ToastRegion` renders a portal div not tied to any parent DOM
  structure. The component is a singleton; there should be only one `ToastRegion` in the
  app. There is no `as` prop.
- The `defaultDuration` prop is informational; per-toast `duration` from `toast.push()`
  always takes precedence.

#### SSR-safe mounting

`ToastRegion` must not render its fixed-position container on the server, because:
1. `fixed` positioning is viewport-relative and meaningless in SSR HTML.
2. Auto-dismiss timers use `setTimeout`, which must only run in the browser.

The region mounts client-side using `$effect`, mirroring the Modal pattern (D12):

```ts
// Inside ToastRegion.svelte <script lang="ts">
let mounted = $state(false)

$effect(() => {
  mounted = true
})
```

The template renders the container only when `mounted` is true:

```svelte
{#if mounted}
  <div class="toast-region toast-region--{position}" aria-label="Notifications">
    {#each visibleToasts as item (item.id)}
      <Toast
        id={item.id}
        message={item.message}
        variant={item.variant}
        ondismiss={handleDismiss}
      />
    {/each}
  </div>
{/if}
```

#### Stack limit enforcement

`ToastRegion` computes `visibleToasts` from the store. When the store contains more
items than `limit`, the oldest items (lowest index in the array) are dismissed first:

```ts
// Derived state inside ToastRegion — auto-dismiss oldest when limit is exceeded
$effect(() => {
  const all = $toast  // value from toast.subscribe (or use $state + subscribe)
  if (all.length > limit) {
    const toRemove = all.slice(0, all.length - limit)
    toRemove.forEach((t) => toast.dismiss(t.id))
  }
})
```

The `visibleToasts` shown in the template is `all.slice(-limit)` (the newest `limit`
items), but the excess items are also actively dismissed from the store to cancel
their timers.

#### Auto-dismiss timer management

Each toast that has `duration > 0` receives a `setTimeout` inside a `$effect` keyed to
its `id`. When the effect's cleanup runs (because the toast was dismissed or the
component unmounted), `clearTimeout` is called:

```ts
// Conceptual pattern — one $effect per toast item
$effect(() => {
  const timers: ReturnType<typeof setTimeout>[] = []
  for (const item of visibleToasts) {
    if (item.duration > 0) {
      const t = setTimeout(() => toast.dismiss(item.id), item.duration)
      timers.push(t)
    }
  }
  return () => timers.forEach(clearTimeout)
})
```

The implementer may choose any equivalent reactive pattern (e.g. a Map of timers
keyed by ID) as long as timers are cleared on manual dismiss and component teardown.

**Pause on hover is optional** — `ToastRegion` may pause the dismiss timer while the
pointer is over a toast. If implemented, it must resume the remaining duration (not
restart the full duration) on pointer leave. This is an enhancement; the spec does not
require it.

#### Positioning CSS

The region is `position: fixed` and anchored to one of four corners via CSS modifiers.
The toast stack grows towards the centre of the viewport (bottom-right and bottom-left
grow upward; top-right and top-left grow downward):

```css
.toast-region {
  position: fixed;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  pointer-events: none;  /* region itself is not a click target */
  max-width: 440px;
}

.toast-region--bottom-right {
  bottom: 0;
  right: 0;
  align-items: flex-end;
}

.toast-region--bottom-left {
  bottom: 0;
  left: 0;
  align-items: flex-start;
}

.toast-region--top-right {
  top: 0;
  right: 0;
  align-items: flex-end;
  flex-direction: column-reverse;  /* newest at the top */
}

.toast-region--top-left {
  top: 0;
  left: 0;
  align-items: flex-start;
  flex-direction: column-reverse;
}
```

The region has `pointer-events: none` so it does not block interaction with page
content. Individual `.toast` elements have `pointer-events: all` to restore
clickability on the toasts themselves.

---

## Story specifications

All stories follow the rules in `wiki/stories-guide.md`:
- `<script module lang="ts">` with `lang="ts"`
- `defineMeta` from `"@storybook/addon-svelte-csf"`, `component:` set in primary files
- `expect`, `within`, `userEvent` imported from `"storybook/test"` (no `@` prefix)
- Play functions inline in `play={...}`, no TypeScript type annotations in template
  expressions, no null-guard checks
- `resolveTokenColor` probe pattern for CSS custom property colour assertions

---

### `Toast.stories.svelte` — title: `'Feedback/Toast'`

The primary file sets `component: Toast`. Because `Toast` requires an `ondismiss`
callback, `args` must include `ondismiss: () => {}`. Individual stories provide
`id`, `message`, and `variant` via `args`.

**Story: "Ok"** — args: `{ id: 'toast-1', message: 'Build completed successfully.', variant: 'ok', ondismiss: () => {} }`

Play:
- `getByRole('status')` is visible.
- `getByText('Build completed successfully.')` is visible.
- `getByRole('button', { name: /Dismiss notification/i })` is visible and enabled.
- The root element's computed `border-color` matches `var(--ok)`.
- A `.toast-icon` element is present with `aria-hidden="true"` and text content `"ok"`.

**Story: "Amber"** — args: `{ id: 'toast-2', message: '+12V rail at 88% capacity.', variant: 'amber', ondismiss: () => {} }`

Play:
- `getByRole('status')` is visible.
- `getByText(/12V rail at 88%/i)` is visible.
- Root element's computed `border-color` matches `var(--amber)`.
- `.toast-icon` text content is `"!!"`.

**Story: "Danger"** — args: `{ id: 'toast-3', message: 'Thermal protection triggered.', variant: 'danger', ondismiss: () => {} }`

Play:
- `getByRole('alert')` is visible (not `getByRole('status')` — danger uses assertive role).
- `getByText('Thermal protection triggered.')` is visible.
- Root element's computed `border-color` matches `var(--danger)`.
- `.toast-icon` text content is `"err"`.
- Root element has `aria-live="assertive"`.

**Story: "Manual Close"** — args: `{ id: 'toast-4', message: 'Click × to dismiss.', variant: 'ok', ondismiss: () => {} }`

Play:
- `getByRole('status')` is visible.
- `getByRole('button', { name: /Dismiss notification/i })` is visible.
- Click `getByRole('button', { name: /Dismiss notification/i })`.
- Assert the button click does not throw (the `ondismiss` is a no-op in the story;
  actual removal is managed by `ToastRegion` in real use).

**Story: "Long Message"** — args: `{ id: 'toast-5', message: 'This is a longer notification message that tests how the toast handles wrapping text within its maximum width constraint.', variant: 'amber', ondismiss: () => {} }`

Play:
- `getByRole('status')` is visible.
- The toast message text is visible and present in the DOM (no truncation assertion needed
  — this story is primarily for visual review).
- Root element's computed `max-width` is `"400px"` (or matches the CSS value).

**Story: "Aria Attributes"** — args: `{ id: 'toast-6', message: 'ARIA check.', variant: 'ok', ondismiss: () => {} }`

Play:
- `getByRole('status')` has `aria-live="polite"`.
- `getByRole('status')` has `aria-atomic="true"`.
- The icon element (`canvasElement.querySelector('.toast-icon')`) has `aria-hidden="true"`.

---

### `ToastRegion.stories.svelte` — title: `'Feedback/ToastRegion'`

Because `ToastRegion` renders a portal and reads the `toast` store, stories must
manipulate the store in their play functions. The primary file does NOT set
`component:` in `defineMeta` (composition-only), since `ToastRegion` is typically a
layout-level singleton rather than a slot-content component.

All `ToastRegion` stories render `<ToastRegion>` directly in the story slot and
call `toast.push(…)` / `toast.dismiss(…)` from the play function.

**Story: "Single Toast"**

Slot content:
```svelte
<ToastRegion position="bottom-right" />
```

Play:
- Call `toast.push('Hello from ToastRegion.', { variant: 'ok' })` in the play function.
- Wait for `getByRole('status')` to appear and be visible.
- `getByText('Hello from ToastRegion.')` is visible.
- `getByRole('button', { name: /Dismiss notification/i })` is visible.
- After the story, call `toast.dismiss` for all pushed IDs to clean up store state.

**Story: "Three Variants"**

Slot content: `<ToastRegion position="bottom-right" />`

Play:
- Push three toasts in sequence: ok (`'Build passed.'`), amber (`'Memory at 85%.'`), danger (`'Connection lost.'`).
- Assert `getAllByRole('status')` returns 2 elements (ok + amber).
- Assert `getAllByRole('alert')` returns 1 element (danger).
- All three toast messages are visible in the DOM.
- Dismiss all pushed IDs after assertions.

**Story: "Stack Limit"**

Slot content: `<ToastRegion position="bottom-right" limit={3} />`

Play:
- Push 5 toasts with messages `'Toast 1'` through `'Toast 5'` (all `variant: 'ok'`).
- Wait for DOM to settle.
- Assert only 3 toasts are visible (oldest two were dismissed when limit was exceeded).
- The visible toasts show messages `'Toast 3'`, `'Toast 4'`, `'Toast 5'` (the newest 3).
- Dismiss all remaining IDs.

**Story: "Auto-Dismiss"**

Slot content: `<ToastRegion position="bottom-right" />`

Play:
- Push a toast with `duration: 1000` (1 second): `toast.push('Short-lived.', { duration: 1000 })`.
- Assert `getByText('Short-lived.')` is visible immediately after push.
- Wait 1200ms (use `await new Promise((r) => setTimeout(r, 1200))`).
- Assert `queryByText('Short-lived.')` returns null (toast has been auto-dismissed).

**Story: "Manual Dismiss via Button"**

Slot content: `<ToastRegion position="bottom-right" />`

Play:
- Push a toast with `duration: 0` (no auto-dismiss): `toast.push('Manual dismiss only.', { duration: 0, variant: 'amber' })`.
- Assert `getByText('Manual dismiss only.')` is visible.
- Click `getByRole('button', { name: /Dismiss notification/i })`.
- Assert `queryByText('Manual dismiss only.')` returns null after click.

**Story: "Position Top-Left"**

Slot content: `<ToastRegion position="top-left" />`

Play:
- Push a toast: `toast.push('Top-left toast.', { variant: 'ok' })`.
- Assert `getByText('Top-left toast.')` is visible.
- Assert `canvasElement.querySelector('.toast-region--top-left')` is not null.
- Dismiss all.

**Story: "No Toasts"**

Slot content: `<ToastRegion position="bottom-right" />`

Play:
- Do not push any toasts.
- The toast region container (`.toast-region`) is either not present (because `mounted`
  state adds it on client mount) or is present and empty.
- Assert `canvasElement.querySelectorAll('[role="status"], [role="alert"]').length` is `0`.

**CSS-only (not play-function testable):**
- Slide-in animation on toast mount (CSS transition from off-screen to in-view).
- Fade-out animation on toast dismiss (CSS transition before DOM removal).
- These are visual review items — play functions do not assert transitions.

---

## Acceptance criteria

### File existence and exports

1. `src/lib/stores/toast.ts` exists and exports `toast` (the public store object) and
   `ToastItem`, `ToastVariant`, `ToastOptions` as named TypeScript types.
2. `src/lib/components/feedback/Toast.svelte` exists.
3. `src/lib/components/feedback/ToastRegion.svelte` exists.
4. `src/lib/components/feedback/index.ts` exports `Toast` and `ToastRegion` as named exports.
5. `src/lib/index.ts` exports `Toast`, `ToastRegion`, and `toast` so that
   `import { Toast, ToastRegion, toast } from '$lib'` resolves without error in a
   SvelteKit consumer.
6. `src/lib/components/feedback/Toast.stories.svelte` exists.
7. `src/lib/components/feedback/ToastRegion.stories.svelte` exists.
8. `pnpm check` passes with zero TypeScript errors across all toast-related files.

### Store API

9. `toast.push('msg')` returns a unique string ID of the form `"toast-{n}"`.
10. `toast.push('msg', { variant: 'danger' })` returns an ID and, when subscribed,
    the store value contains a `ToastItem` with `variant: 'danger'`.
11. `toast.push('msg')` with no options creates a `ToastItem` with `variant: 'ok'` and
    `duration: 5000` (defaults).
12. `toast.push('msg', { duration: 2000 })` creates a `ToastItem` with `duration: 2000`.
13. `toast.dismiss(id)` removes the item with the matching `id` from the store. Calling
    `toast.dismiss` with an ID that does not exist is a no-op (no error thrown).
14. Two successive calls to `toast.push` produce two items in the store with different IDs.
15. The internal `_store` writable is NOT exported from `toast.ts`. Only `toast.subscribe`,
    `toast.push`, and `toast.dismiss` are accessible to consumers.

### Toast component — ARIA and structure

16. `Toast` with `variant="ok"` renders a root element with `role="status"`.
17. `Toast` with `variant="amber"` renders a root element with `role="status"`.
18. `Toast` with `variant="danger"` renders a root element with `role="alert"`.
19. `Toast` root element has `aria-live="polite"` when `variant` is `"ok"` or `"amber"`.
20. `Toast` root element has `aria-live="assertive"` when `variant` is `"danger"`.
21. `Toast` root element has `aria-atomic="true"`.
22. `Toast` renders a `.toast-icon` element with `aria-hidden="true"`.
23. `.toast-icon` text content is `"ok"` when `variant="ok"`.
24. `.toast-icon` text content is `"!!"` when `variant="amber"`.
25. `.toast-icon` text content is `"err"` when `variant="danger"`.
26. `Toast` renders a `.toast-message` element containing the `message` prop text.
27. `Toast` renders a close button with `aria-label="Dismiss notification"` and
    `type="button"` using the `Button` primitive with `variant="ghost"`.
28. Clicking the close button calls `ondismiss` with the `id` prop value.

### Toast component — visual (play-function testable)

29. `Toast` with `variant="ok"` has computed `border-color` matching `var(--ok)`.
30. `Toast` with `variant="amber"` has computed `border-color` matching `var(--amber)`.
31. `Toast` with `variant="danger"` has computed `border-color` matching `var(--danger)`.
32. `Toast` root element has computed `background-color` matching `var(--bg-elev)`.
33. `Toast` root element has computed `max-width` that limits toast width (≤ 400px).

### Toast component — visual (CSS-only, not play-function testable)

34. Toasts slide in from the anchor edge on mount (CSS transition — visual review only).
35. Toasts fade out on dismiss before DOM removal (CSS transition — visual review only).

### ToastRegion — SSR safety

36. `ToastRegion.svelte` does not reference `document`, `window`, `setTimeout`, or
    `clearTimeout` at module level or in the component script body outside of `$effect`.
    All browser API calls are inside `$effect` callbacks.
37. `ToastRegion` uses a `$state` flag (`mounted`) set to `true` inside `$effect` as its
    SSR guard. The region container is conditionally rendered only when `mounted` is true.
38. On the server (SSR), `ToastRegion` renders nothing — no `<div>` with `position: fixed`
    appears in the server-rendered HTML.

### ToastRegion — rendering and stack

39. `ToastRegion` renders one `Toast` component per active item in the `toast` store.
40. When `toast.push` is called, the new toast appears in `ToastRegion`'s output.
41. When `toast.dismiss(id)` is called, the corresponding `Toast` is removed from `ToastRegion`'s output.
42. `ToastRegion` with `limit={3}` and 5 items in the store shows only 3 toasts (the
    newest 3). The oldest 2 are also removed from the store (their timers are cleared).
43. `ToastRegion` with `limit={5}` (default) and 3 items in the store shows all 3 toasts.

### ToastRegion — auto-dismiss

44. A toast pushed with `duration: 1000` is removed from the DOM approximately 1000ms
    after being added, without any user interaction. (Test with 1200ms assertion window.)
45. A toast pushed with `duration: 0` is NOT auto-dismissed — it remains in the DOM until
    the user clicks the close button or `toast.dismiss(id)` is called programmatically.
46. When a user manually dismisses a toast (via close button), its auto-dismiss timer is
    cancelled and does not fire after the toast has been removed.
47. When `ToastRegion` is unmounted, all pending auto-dismiss timers are cleared (no
    `clearTimeout` calls throw after unmount). This is a code-review constraint — the
    `$effect` cleanup function must call `clearTimeout` for all active timers.

### ToastRegion — positioning

48. `ToastRegion` with `position="bottom-right"` renders the region container with CSS
    class `toast-region--bottom-right`. The container's computed `bottom` and `right`
    CSS properties are not `"auto"`.
49. `ToastRegion` with `position="bottom-left"` renders the region container with CSS
    class `toast-region--bottom-left`. The container's computed `bottom` and `left`
    CSS properties are not `"auto"`.
50. `ToastRegion` with `position="top-right"` renders the region container with CSS
    class `toast-region--top-right`. The container's computed `top` and `right`
    CSS properties are not `"auto"`.
51. `ToastRegion` with `position="top-left"` renders the region container with CSS
    class `toast-region--top-left`. The container's computed `top` and `left`
    CSS properties are not `"auto"`.
52. The region container has `position: fixed` and `z-index: 9000` (or higher).
53. The region container has `pointer-events: none`. Individual `Toast` elements have
    `pointer-events: all`.

### Svelte 5 runes compliance

54. `Toast.svelte` uses `$props()` for all prop declarations — no `export let`.
55. `Toast.svelte` uses `$derived` to compute `role` from `variant`.
56. `ToastRegion.svelte` uses `$props()` for all prop declarations.
57. `ToastRegion.svelte` uses `$state(false)` for the `mounted` flag.
58. `ToastRegion.svelte` uses `$effect` for SSR guard, timer management, and stack-limit
    enforcement. No `onMount` import.
59. No component uses `any`, `@ts-ignore`, or `as any`.

### CSS and visual constraints

60. No component in `src/lib/components/feedback/` added or modified by B18 contains
    global CSS selectors — all styles are scoped to the component `<style>` block.
61. No hardcoded hex, rgb, or hsl colour values appear in `Toast.svelte`'s `<style>` block.
    All colours use `var(--…)` CSS custom properties.
62. The `toast` store module (`toast.ts`) contains no CSS.

### Accessibility (WCAG 2.1 AA)

63. `Toast` with `variant="danger"` has `role="alert"` — the assertive live region
    interrupts screen reader narration to announce critical errors immediately.
64. `Toast` with `variant="ok"` or `variant="amber"` has `role="status"` — the polite
    live region announces when the screen reader is idle.
65. The close button on each toast is keyboard-accessible: it receives Tab focus and
    activates with Enter or Space (native `<button>` behaviour via the `Button` primitive).
66. The region container has `aria-label="Notifications"` so screen reader users can
    identify the landmark region.
67. `@storybook/addon-a11y` reports no accessibility violations on any story in
    `Toast.stories.svelte` or `ToastRegion.stories.svelte` under `pnpm test`.

### Stories

68. `Toast.stories.svelte` uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, imports `expect` and `within` from `"storybook/test"`,
    and sets `component: Toast` in `defineMeta`.
69. `ToastRegion.stories.svelte` uses `<script module lang="ts">` and does NOT set
    `component:` in `defineMeta` (composition-only — `ToastRegion` is a singleton portal).
70. Every story has a `play` function. Every play function passes under `pnpm test` with
    zero assertion failures.
71. No play function contains TypeScript type annotations (`: Type` syntax) inside the
    `play={...}` template attribute.
72. No play function contains null-guard checks before querying elements.
73. Stories that push toasts in their play function clean up the store state (call
    `toast.dismiss(id)` for all pushed IDs) to prevent store state leaking between tests.
74. Named stories in `Toast.stories.svelte`: "Ok", "Amber", "Danger", "Manual Close",
    "Long Message", "Aria Attributes".
75. Named stories in `ToastRegion.stories.svelte`: "Single Toast", "Three Variants",
    "Stack Limit", "Auto-Dismiss", "Manual Dismiss via Button", "Position Top-Left",
    "No Toasts".

---

## Out of scope

- **Pause on hover** — pausing the dismiss timer when the pointer is over a toast is
  optional. The spec does not mandate it; the implementer may add it as an enhancement.
- **Progress bar countdown** — a visual countdown bar showing remaining dismiss time is
  not required. The dismiss happens invisibly after the configured duration.
- **Custom icons** — the icon glyph is fixed to the monospaced string per variant
  (`"ok"`, `"!!"`, `"err"`). Passing a custom icon via a snippet prop is out of scope.
- **`duration: 0` vs `duration: Infinity`** — the sentinel value for "never auto-dismiss"
  is `duration: 0`. The implementer treats any `duration <= 0` as disabled (no timer set).
- **Action buttons inside toasts** — a primary action button (e.g. "Undo") inside the
  toast body is not in scope. The toast surface is message-only plus the close button.
- **Persistent toasts (no auto-dismiss by default on danger)** — all three variants use
  the consumer-supplied `duration` (default 5000ms). The spec does not special-case
  `danger` to be non-dismissing. Consumers may pass `duration: 0` explicitly.
- **Queue beyond the limit** — when the stack limit is exceeded, the oldest toast is
  dismissed. There is no queue of waiting toasts; items dismissed by the limit enforcement
  are gone, not held back.
- **Multiple `ToastRegion` instances** — the design is a singleton pattern. Mounting
  two `ToastRegion` components would result in duplicate toast rendering from the same
  store. This is a consumer error; the component does not guard against it.
- **SvelteKit `goto` navigation clearing toasts** — toasts persist across client-side
  navigation. Clearing toasts on route change is a consumer responsibility.
- **Stacked toasts with identical messages** — duplicate detection (de-duplication by
  message content) is out of scope.
- **`ToastRegion` body scroll lock** — unlike `Modal`, `ToastRegion` does not lock body
  scroll. Toasts are non-blocking overlays.
- **Palette toggle testing** — verifying both Phosphor and Paper palettes is a visual
  review concern and is not covered by B18 play functions.

---

## Open questions

**OQ-1 (non-blocking): Store cleanup on SSR / module teardown.**
The `_idCounter` is a module-level variable. In SSR with Vite's module cache, it
persists across requests within a server process. Because IDs only need to be unique
within a single browser session (the store is browser-side only), this is not a
functional problem — the counter resets on page load in the browser. No action needed.

**OQ-2 (non-blocking): Story store isolation.**
All `ToastRegion` stories share the same imported `toast` store module. If stories run
in parallel or one story leaves items in the store, subsequent stories may see unexpected
toasts. The spec requires stories to clean up by calling `toast.dismiss(id)` for all
pushed IDs. The `test-writer` should verify that play functions execute cleanup reliably.
If isolation proves fragile (e.g. if Vitest browser mode reuses the module across story
files), an alternative approach is to reset the store at the start of each play function
via a store reset API. A `toast.reset()` function is not specified here but the
`test-writer` may add it if needed.

**OQ-3 (non-blocking): CSS animation testability.**
The slide-in and fade-out CSS transitions (AC 34–35) cannot be asserted by play
functions. They are visual-review concerns. The `@storybook/addon-a11y` check and the
presence of the component in the correct DOM state is the limit of automated coverage.
If the implementer omits animations, no play function will fail. Animations are a
design quality item, not a correctness item.

**OQ-4 (non-blocking): `ToastRegion` `aria-label` landmark.**
AC 66 requires `aria-label="Notifications"` on the region container. Some screen reader
setups may not expose a `role="region"` landmark without an explicit `role` attribute,
because `<div>` has no implicit landmark role. The implementer should add
`role="region"` alongside `aria-label="Notifications"` to ensure the region is exposed
as a landmark. The play function can assert `getByRole('region', { name: 'Notifications' })`.
This does not block implementation but clarifies the required HTML.

No open questions block implementation. B18 is ready for `test-writer`.
