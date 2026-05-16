# B8: Modal

## Context

B8 delivers the `Modal` dialog component — a full-overlay dialog with a structured
header/body/footer layout, two variants (default and destructive/confirm), a backdrop
overlay, and correct keyboard behaviour. It is the first component in the `feedback/`
layer, which sits above cards, navigation, and forms in the build pyramid.

The modal pattern is used on dexterlabs.nl wherever an action requires confirmation
before execution (delete hardware item, confirm order) or where a compact form overlay
is needed without navigating away.

The visual reference for the component is:
- `dexterlabs-design-system/project/preview/21-components-misc.html` — HTML prototype
- Design tokens defined in `src/lib/tokens/tokens.css` — both Phosphor and Paper
  palettes

Related wiki pages:
- [requirements.md](../requirements.md) — R7 (Modal), R1 (design tokens), constraints
  (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TypeScript)
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style,
  scoped CSS, polymorphic `as` prop, `...rest` forwarding, Svelte 5 runes)
- [decisions.md](../decisions.md) — D1 (tests = Story play functions), D5 (no global
  utility classes — CSS scoped to components), D4 (Chakra-style composability), D7
  (SSR-safe browser API access via `$effect` + `browser` guard)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function
  rules

### Layer position

`Modal` is the first component in the `feedback/` layer. It may import from:
- `src/lib/components/primitives/` — `Button`, `Led`, `TagPill`
- `src/lib/components/layout/` — `Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule`

It must not import from cards, navigation, forms, patterns, or data layers.

---

## Files produced

| File | Role |
|---|---|
| `src/lib/components/feedback/Modal.svelte` | Modal dialog component |
| `src/lib/components/feedback/Modal.stories.svelte` | Modal stories + tests |
| `src/lib/components/feedback/index.ts` | Barrel export for the feedback layer |
| `src/lib/index.ts` | Updated to re-export `Modal` from `$lib` |

---

## Props interface

```ts
import type { HTMLDialogAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

type ModalVariant = 'default' | 'confirm' | 'destructive'

interface Props extends HTMLDialogAttributes {
  open?: boolean            // controlled open state; defaults to false
  title: string             // dialog title rendered in header; required
  variant?: ModalVariant    // 'default' | 'confirm' | 'destructive'; defaults to 'default'
  onclose?: () => void      // called when the dialog is closed (Escape, close button,
                            // or backdrop click); the consumer closes by setting open=false
  children?: Snippet        // body content
  footer?: Snippet          // named snippet for footer buttons area
}

let {
  open = false,
  title,
  variant = 'default',
  onclose,
  children,
  footer,
  ...rest
}: Props = $props()
```

Notes:
- `open` is the controlled prop. The component is not self-managing its open state; the
  consumer owns state and passes it down. This is intentional — modals typically need
  to be closed from outside (after an async operation completes, for example).
- `onclose` is a plain callback (not a DOM event). The component calls it whenever any
  internal close path fires (Escape key, close button, backdrop click). The consumer
  is responsible for setting `open = false` in response.
- `footer` is a named snippet. If not provided, the footer section is omitted from the
  rendered DOM entirely.
- `...rest` is spread onto the `<dialog>` root element, forwarding attributes such as
  `aria-describedby`, `class`, and `data-testid`.
- No `as` polymorphic prop — `Modal` always renders as `<dialog>`. The `<dialog>` element
  is the only semantically correct root for this pattern.

---

## HTML structure

```
<dialog
  class="modal modal--{variant}"
  aria-modal="true"
  aria-labelledby="modal-title"
  {...rest}
>
  <div class="modal-inner">

    <header class="modal-header">
      {#if variant === 'destructive' || variant === 'confirm'}
        <span class="modal-icon" aria-hidden="true">!</span>
      {/if}
      <h2 class="modal-title" id="modal-title">{title}</h2>
      <button
        class="modal-close"
        type="button"
        aria-label="Close dialog"
        onclick={handleClose}
      >×</button>
    </header>

    <div class="modal-body">
      {@render children?.()}
    </div>

    {#if footer}
      <footer class="modal-footer">
        {@render footer()}
      </footer>
    {/if}

  </div>
</dialog>
```

Structure notes:
- The root element is `<dialog>`. The native element provides `role="dialog"` implicitly
  per the HTML specification; no explicit `role` attribute is needed.
- `aria-modal="true"` is added explicitly because some screen readers do not fully honour
  the native dialog role without it.
- `aria-labelledby="modal-title"` links the dialog's accessible name to the `<h2>` title.
  The `id="modal-title"` value is static on this component. If multiple modals are
  mounted simultaneously (unlikely, but possible), each would have the same `id` — see
  Open Questions OQ-1.
- The danger/confirm icon is a `<span>` with `aria-hidden="true"`. The icon is purely
  decorative; the `variant` is communicated visually by colour and the `title` text
  communicates the purpose to screen readers.
- The close button uses `type="button"` to prevent accidental form submission if the
  dialog is wrapped in a form. Its accessible name is `"Close dialog"` via `aria-label`.
- `.modal-inner` is a non-semantic wrapper div that provides the white/surface background,
  padding, and max-width constraint. The `<dialog>` root itself provides the full-screen
  positioning.
- The `footer` snippet is conditionally rendered — when omitted, no `<footer>` element
  appears in the DOM.

---

## CSS rules

All styles are scoped inside `<style>` in `Modal.svelte`. No global classes. All colour
values use CSS custom properties.

### Backdrop

The `<dialog>` element, when opened via `showModal()`, creates a native backdrop via the
`::backdrop` pseudo-element. This is the preferred approach because it:
- Is inert to pointer events outside the dialog automatically
- Is accessible by default (focus is trapped inside the dialog by the browser)
- Does not require an extra DOM element

```css
.modal::backdrop {
  background: rgba(7, 9, 8, 0.85);
}
```

The backdrop colour `rgba(7, 9, 8, 0.85)` is the value specified in R7 and matches the
Phosphor `--bg` base colour at high opacity. It is hardcoded rather than a token because
CSS custom properties are not inherited through the `::backdrop` pseudo-element in most
browsers (a known platform limitation).

### Positioning and sizing

| Selector | Property | Value | Reason |
|---|---|---|---|
| `.modal` | `position` | `fixed` | Full viewport overlay (browser sets this for `<dialog>` in modal mode, but explicit for clarity) |
| `.modal` | `inset` | `0` | Stretch to viewport edges |
| `.modal` | `display` | `flex` | Enable centering of `.modal-inner` |
| `.modal` | `align-items` | `center` | Vertical centre |
| `.modal` | `justify-content` | `center` | Horizontal centre |
| `.modal` | `border` | `none` | Remove default `<dialog>` border |
| `.modal` | `padding` | `0` | Remove default `<dialog>` padding |
| `.modal` | `background` | `transparent` | The backdrop handles the overlay |
| `.modal` | `max-width` | `100vw` | Fill viewport in dialog mode |
| `.modal` | `max-height` | `100vh` | Fill viewport in dialog mode |
| `.modal-inner` | `background` | `var(--bg-elev)` | Elevated surface colour |
| `.modal-inner` | `border` | `1px solid var(--rule-strong)` | Single visible border |
| `.modal-inner` | `width` | `100%` | Fill horizontal space up to max-width |
| `.modal-inner` | `max-width` | `480px` | Dialog max-width cap |
| `.modal-inner` | `max-height` | `80vh` | Prevents overflow on small viewports |
| `.modal-inner` | `overflow-y` | `auto` | Scroll long body content within the box |
| `.modal-inner` | `display` | `flex` | Column layout for header/body/footer |
| `.modal-inner` | `flex-direction` | `column` | Stack sections vertically |

### Header

| Selector | Property | Value |
|---|---|---|
| `.modal-header` | `display` | `flex` |
| `.modal-header` | `align-items` | `center` |
| `.modal-header` | `gap` | `var(--u)` (8px) |
| `.modal-header` | `padding` | `var(--u2) var(--u3)` (16px 24px) |
| `.modal-header` | `border-bottom` | `1px solid var(--rule)` |
| `.modal-title` | `font-family` | `var(--mono)` |
| `.modal-title` | `font-size` | `var(--t-lede)` |
| `.modal-title` | `text-transform` | `uppercase` |
| `.modal-title` | `letter-spacing` | `0.08em` |
| `.modal-title` | `color` | `var(--ink)` |
| `.modal-title` | `margin` | `0` |
| `.modal-title` | `flex` | `1` (takes remaining space, pushing close button right) |
| `.modal-close` | `font-family` | `var(--mono)` |
| `.modal-close` | `font-size` | `18px` |
| `.modal-close` | `line-height` | `1` |
| `.modal-close` | `color` | `var(--ink-faint)` |
| `.modal-close` | `background` | `transparent` |
| `.modal-close` | `border` | `none` |
| `.modal-close` | `cursor` | `pointer` |
| `.modal-close` | `padding` | `0 var(--u)` |
| `.modal-close:hover` | `color` | `var(--ink)` |

### Variant icon (confirm / destructive)

| Selector | Property | Value |
|---|---|---|
| `.modal-icon` | `display` | `inline-flex` |
| `.modal-icon` | `align-items` | `center` |
| `.modal-icon` | `justify-content` | `center` |
| `.modal-icon` | `width` | `22px` |
| `.modal-icon` | `height` | `22px` |
| `.modal-icon` | `border-radius` | `50%` |
| `.modal-icon` | `font-family` | `var(--mono)` |
| `.modal-icon` | `font-size` | `13px` |
| `.modal-icon` | `font-weight` | `700` |
| `.modal-icon` | `flex-shrink` | `0` |
| `.modal--confirm .modal-icon` | `background` | `var(--amber)` |
| `.modal--confirm .modal-icon` | `color` | `var(--bg)` |
| `.modal--destructive .modal-icon` | `background` | `var(--danger)` |
| `.modal--destructive .modal-icon` | `color` | `var(--bg)` |

### Body

| Selector | Property | Value |
|---|---|---|
| `.modal-body` | `padding` | `var(--u3)` (24px) |
| `.modal-body` | `flex` | `1` |
| `.modal-body` | `font-size` | `var(--t-body)` |
| `.modal-body` | `color` | `var(--ink-dim)` |
| `.modal-body` | `line-height` | `1.5` |

### Footer

| Selector | Property | Value |
|---|---|---|
| `.modal-footer` | `padding` | `var(--u2) var(--u3)` (16px 24px) |
| `.modal-footer` | `border-top` | `1px solid var(--rule)` |
| `.modal-footer` | `display` | `flex` |
| `.modal-footer` | `justify-content` | `flex-end` |
| `.modal-footer` | `gap` | `var(--u)` (8px) |

---

## State and behaviour

### SSR safety

The `<dialog>` element is always present in the server-rendered DOM. `open` state is
managed exclusively through the DOM API (`showModal()` / `close()`) called inside a
`$effect`, which only runs in the browser.

```ts
// Inside Modal.svelte <script lang="ts">
let dialogElement: HTMLDialogElement | undefined = $state()

$effect(() => {
  if (!dialogElement) return
  if (open) {
    dialogElement.showModal()
  } else {
    dialogElement.close()
  }
})
```

The `<dialog>` element does NOT use the HTML `open` attribute directly (that attribute
puts the dialog in non-modal mode without the backdrop). `showModal()` is the only
correct path for the modal mode with backdrop and focus trap.

On the server, `dialogElement` is `undefined` and the `$effect` never runs. The
rendered `<dialog>` is closed by default.

### Controlled open/close lifecycle

1. Consumer sets `open = true` → `$effect` fires → `showModal()` is called.
2. User presses **Escape** → browser fires `cancel` event on `<dialog>` → component
   calls `onclose?.()` → consumer sets `open = false` → `$effect` fires → `close()` is
   called.
3. User clicks **close button** → `handleClose()` calls `onclose?.()` → same flow as 2.
4. User clicks **backdrop** → detected via `click` on the `<dialog>` element (when the
   click target IS the `<dialog>` itself, not `.modal-inner`) → `handleClose()` fires.
5. `close()` is also called if `open` becomes `false` while the dialog is still open
   (e.g. the consumer closes it programmatically after an async operation).

The `cancel` event must be listened to via `oncancelCapture` or `oncancel` on the
`<dialog>` element. When the browser fires `cancel` (on Escape), the dialog's default
behaviour is to close and remove the `open` attribute — the component calls
`event.preventDefault()` to prevent the browser from closing the dialog itself, then
calls `onclose?.()` so the consumer can update its state and allow the controlled
`$effect` to close it cleanly.

### Backdrop click detection

Backdrop click is detected on the `<dialog>` element directly:

```ts
function handleDialogClick(event: MouseEvent) {
  // The ::backdrop is outside the dialog element in the box model,
  // but clicks on it bubble up with the dialog as the target.
  if (event.target === dialogElement) {
    handleClose()
  }
}
```

### Scroll lock

While the modal is open, body scroll is locked to prevent the page behind from
scrolling. This is handled inside `$effect`:

```ts
$effect(() => {
  if (!dialogElement) return
  if (open) {
    dialogElement.showModal()
    document.body.style.overflow = 'hidden'
  } else {
    dialogElement.close()
    document.body.style.overflow = ''
  }
})
```

The `overflow` reset must be paired with cleanup in the `$effect` return function:

```ts
$effect(() => {
  if (!dialogElement) return
  if (open) {
    dialogElement.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  } else {
    dialogElement.close()
  }
})
```

### Focus management

The native `<dialog>` element opened via `showModal()` automatically moves focus to the
first focusable element inside the dialog, or to the dialog itself if no focusable
element is present. This is the browser's built-in focus management and requires no
additional JavaScript.

Focus is trapped inside the dialog while it is open (browser native behaviour for
modal dialogs opened with `showModal()`). When the dialog closes, focus is returned to
the element that was focused before the dialog opened (also browser native).

No additional focus management JavaScript is required for this component.

### Keyboard behaviour

| Key | Behaviour |
|---|---|
| `Escape` | Closes the dialog — native `<dialog>` fires `cancel` event; component intercepts, calls `onclose?.()` |
| `Tab` / `Shift+Tab` | Cycles focus through focusable elements inside the dialog (browser native focus trap) |
| `Enter` / `Space` on close button | Fires the close button's `onclick` → `handleClose()` |

---

## Barrel exports

### `src/lib/components/feedback/index.ts`

```ts
export { default as Modal } from './Modal.svelte'
```

### `src/lib/index.ts`

Add to existing exports:

```ts
export { Modal } from './components/feedback/index.js'
```

---

## Story specifications

All stories live in `src/lib/components/feedback/Modal.stories.svelte` using the Svelte
CSF format. The mandatory rules from `wiki/stories-guide.md` apply:

- `<script module lang="ts">` with `lang="ts"`
- `import { defineMeta } from "@storybook/addon-svelte-csf"`
- `import { expect, within, userEvent } from "storybook/test"` (no `@` prefix)
- `component: Modal` in `defineMeta`
- Play functions inline in the `play={...}` attribute on each `<Story>` tag
- No TypeScript type annotations inside `play={...}`
- No null checks (queries throw if element is missing)

### `Modal.stories.svelte` — title: `'Feedback/Modal'`

Because `Modal` wraps a `<dialog>` with internal header/body/footer structure, most
stories need a wrapper that manages `open` state. The story slot is used to provide
body content while props (including `open`, `title`, `variant`, `onclose`) go in
`args`.

However, since the `Modal` with `component:` in `defineMeta` wraps the story slot
with the `Modal` component itself, the body content can be placed in the story slot
while `open`, `title`, `variant`, and `footer` props are passed via `args`. The `footer`
snippet prop cannot be set via `args` (it is a Svelte snippet, not a serialisable value)
— stories requiring a footer must use a composition-style approach.

**Primary story file** (`Modal.stories.svelte`): stories without a footer snippet, using
`component:` in `defineMeta`.

**Composition story file** (`Modal.composition.stories.svelte`): stories that require a
footer snippet (confirm and destructive variants), without `component:` in `defineMeta`.
This follows the pattern established in D9 for stories rendering complex snippet props.

---

### Story: "Default Open" (`Modal.stories.svelte`)

Args: `{ open: true, title: '// CONFIRM ACTION' }`

Slot content: A `<p>` element with text "This action cannot be undone. Are you sure you
want to proceed?".

Play:
- Query `getByRole('dialog')` — assert it is visible.
- Assert `getByRole('heading', { level: 2, name: /CONFIRM ACTION/ })` is visible.
- Assert `getByRole('button', { name: /Close dialog/i })` is visible and enabled.
- Assert `getByText('This action cannot be undone.')` is visible (partial text match
  acceptable via regex: `getByText(/This action cannot be undone/i)`).
- Assert the dialog element has `aria-modal="true"` attribute.
- Assert the dialog element has `aria-labelledby` attribute (value `"modal-title"`).

### Story: "Closed" (`Modal.stories.svelte`)

Args: `{ open: false, title: '// SETTINGS' }`

Slot content: A `<p>` with text "Settings content here.".

Play:
- Assert `queryByRole('dialog')` returns null OR assert that the dialog element is
  not visible (dialogs in closed state are hidden by the browser — `toBeVisible()`
  returns false).
- Note: `queryByRole` may still find the `<dialog>` element in the DOM even when
  closed; use `not.toBeVisible()` instead of checking for absence.

### Story: "Close Button" (`Modal.stories.svelte`)

Args: `{ open: true, title: '// CLOSE TEST' }`

This story requires managed state to verify the close callback. Since `args` cannot
hold reactive state in this context, the story uses a `$state` variable defined in
the story template to track whether `onclose` was called.

Play:
- Assert dialog is visible.
- Click `getByRole('button', { name: /Close dialog/i })`.
- The story cannot directly assert that the dialog closed (since `onclose` just
  fires the callback — the consumer must update `open`). Instead assert that the
  close button is present and fires a click without throwing.
- Assert `getByRole('button', { name: /Close dialog/i })` is clickable (enabled,
  visible, type="button").

### Story: "Confirm Variant" (`Modal.composition.stories.svelte`)

This story renders Modal directly (no `component:` in `defineMeta`), so the full
component including footer snippet is mounted:

```svelte
<Story name="Confirm Variant">
  <Modal
    open={true}
    title="// CONFIRM PURCHASE"
    variant="confirm"
    onclose={() => {}}
  >
    {#snippet footer()}
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    {/snippet}
    <p>You are about to place an order for 1× Conduit PDX-2 at €200. Proceed?</p>
  </Modal>
</Story>
```

Play:
- Assert `getByRole('dialog')` is visible.
- Assert there exists a visible element with the text `"!"` (the danger icon circle).
- Assert the icon element has `aria-hidden="true"`.
- Verify that the icon's computed `background-color` resolves to `var(--amber)` (using
  the `resolveTokenColor` helper or a probe div).
- Assert `getByRole('button', { name: 'Confirm' })` is visible.
- Assert `getByRole('button', { name: 'Cancel' })` is visible.
- Assert `getByRole('heading', { level: 2, name: /CONFIRM PURCHASE/i })` is visible.

### Story: "Destructive Variant" (`Modal.composition.stories.svelte`)

```svelte
<Story name="Destructive Variant">
  <Modal
    open={true}
    title="// DELETE ITEM"
    variant="destructive"
    onclose={() => {}}
  >
    {#snippet footer()}
      <Button variant="ghost">Cancel</Button>
      <Button variant="del">Delete</Button>
    {/snippet}
    <p>This will permanently delete the item. This action cannot be undone.</p>
  </Modal>
</Story>
```

Play:
- Assert `getByRole('dialog')` is visible.
- Assert there exists a visible element with text `"!"` (the danger icon circle).
- Assert the icon element has `aria-hidden="true"`.
- Verify the icon's computed `background-color` resolves to `var(--danger)`.
- Assert `getByRole('button', { name: 'Delete' })` is visible.
- Assert `getByRole('button', { name: 'Cancel' })` is visible.
- Assert `getByRole('heading', { level: 2, name: /DELETE ITEM/i })` is visible.

### Story: "No Footer" (`Modal.stories.svelte`)

Args: `{ open: true, title: '// INFO' }`

Slot content: `<p>` with informational text. No `footer` prop.

Play:
- Assert `getByRole('dialog')` is visible.
- Assert no `<footer>` element is rendered inside the dialog
  (`canvasElement.querySelector('footer')` returns null).
- Assert `getByRole('button', { name: /Close dialog/i })` is present (the close button
  in the header is always present regardless of footer).

### Story: "Escape Closes" (`Modal.stories.svelte`)

This story uses a `$state`-managed wrapper to verify that Escape firing calls `onclose`.

Args: `{ open: true, title: '// KEYBOARD TEST' }`

Play:
- Assert `getByRole('dialog')` is visible.
- Call `userEvent.keyboard('{Escape}')`.
- This fires the `cancel` event on the dialog. Since the story's `onclose` is a no-op
  (`() => {}`), the dialog will remain open (the consumer must update `open`). Assert
  that no JavaScript error is thrown during the Escape key press.
- Assert the close button (`getByRole('button', { name: /Close dialog/i })`) is still
  rendered (the dialog DOM did not crash).

---

## Acceptance criteria

### File existence and exports

1. `src/lib/components/feedback/Modal.svelte` exists.
2. `src/lib/components/feedback/Modal.stories.svelte` exists.
3. `src/lib/components/feedback/Modal.composition.stories.svelte` exists.
4. `src/lib/components/feedback/index.ts` exists and exports `Modal` as a named export.
5. `src/lib/index.ts` exports `Modal` so that `import { Modal } from '$lib'` resolves
   without error in a SvelteKit consumer.
6. `pnpm check` passes with zero errors on `Modal.svelte`, `index.ts`, and
   `src/lib/index.ts`.

### Svelte 5 runes compliance

7. `Modal.svelte` uses `$props()` for all prop declarations — no `export let`.
8. `Modal.svelte` uses `$state()` for the `dialogElement` binding.
9. `Modal.svelte` uses `$effect()` to call `showModal()` / `close()` and to manage
   `document.body.style.overflow`. No `onMount` import.
10. No `import { browser } from '$app/environment'` is required if the `$effect` body
    checks `dialogElement` for existence before calling browser APIs. (Either guard
    pattern is acceptable: `browser` import OR null-check of `dialogElement`.)

### HTML structure

11. The root element rendered by `Modal` is a `<dialog>` element (not a `<div>` or
    `<section>`).
12. The `<dialog>` element has `aria-modal="true"`.
13. The `<dialog>` element has `aria-labelledby="modal-title"`.
14. The dialog header contains an `<h2>` element with `id="modal-title"` and text
    matching the `title` prop.
15. The dialog header contains a close button with `type="button"` and
    `aria-label="Close dialog"`.
16. Body content passed via the `children` snippet is rendered inside `.modal-body`.
17. When a `footer` snippet is provided, a `<footer>` element is rendered inside the
    dialog containing the snippet output.
18. When no `footer` snippet is provided, no `<footer>` element is rendered.

### SSR safety

19. `Modal.svelte` does not reference `document`, `window`, or `HTMLDialogElement`
    at module level or in the component script body outside of `$effect`. All browser
    API calls are inside `$effect` callbacks.
20. `dialogElement` is bound to the `<dialog>` via `bind:this={dialogElement}` (Svelte
    5 rune-compatible binding).
21. On initial render with `open = false`, the dialog is not visible (closed state).
22. Setting `open = true` causes `showModal()` to be called (verifiable by asserting
    the dialog is visible via `getByRole('dialog')` after the state change).

### Open / close behaviour

23. When `open = true` and the user clicks the close button, `onclose` is called.
24. When `open = true` and the user presses Escape, the `cancel` event fires,
    `event.preventDefault()` is called (preventing the browser from removing the
    `open` attribute), and `onclose` is called.
25. When `open = true` and the user clicks the backdrop (the `<dialog>` element
    itself, outside `.modal-inner`), `handleClose()` is called and `onclose` fires.
26. When `open` transitions from `true` to `false`, `dialogElement.close()` is called.
27. When `open` transitions from `false` to `true`, `dialogElement.showModal()` is
    called.

### Scroll lock

28. When `open = true`, `document.body.style.overflow` is `"hidden"`.
29. When `open` transitions from `true` to `false` (or the component is destroyed while
    open), `document.body.style.overflow` is reset to `""`.

### Focus management

30. When the dialog opens (`open = true`), focus moves into the dialog — verifiable by
    asserting `document.activeElement` is the close button or the dialog element itself
    after `showModal()` is called.
31. After the dialog closes, focus returns to the previously focused element (native
    `<dialog>` behaviour — no additional assertion required in play functions; this is
    a code-review constraint: no manual `focus()` calls that could break native
    restoration).

### Variants

32. When `variant = 'default'` (or omitted), no icon element (`.modal-icon`) is rendered.
33. When `variant = 'confirm'`, a `.modal-icon` element is rendered in the header with
    `aria-hidden="true"` and `text-content` of `"!"`.
34. When `variant = 'confirm'`, the `.modal-icon` element's computed `background-color`
    matches `var(--amber)`.
35. When `variant = 'destructive'`, a `.modal-icon` element is rendered in the header
    with `aria-hidden="true"` and `text-content` of `"!"`.
36. When `variant = 'destructive'`, the `.modal-icon` element's computed
    `background-color` matches `var(--danger)`.

### CSS and visual

37. `.modal::backdrop` has a dark semi-transparent background (`rgba(7, 9, 8, 0.85)`).
    This is verifiable by code inspection of the component `<style>` block (computed
    style on `::backdrop` is not accessible via JavaScript in most environments).
38. `.modal-inner` has `background-color` matching `var(--bg-elev)`.
39. `.modal-inner` has `border: 1px solid` and `border-color` matching
    `var(--rule-strong)`.
40. `.modal-header` has a `border-bottom: 1px solid` with `border-color` matching
    `var(--rule)`.
41. `.modal-footer` has a `border-top: 1px solid` with `border-color` matching
    `var(--rule)`.
42. `.modal-title` uses `font-family: var(--mono)` and `text-transform: uppercase`.
43. No hardcoded hex or rgb colour values appear in the component `<style>` block, except
    the `::backdrop` background which is `rgba(7, 9, 8, 0.85)` (a documented exception
    per OQ-2 below).
44. No global CSS classes are used; all styles are scoped to `Modal.svelte`.

### Attribute forwarding

45. Attributes passed via `...rest` (e.g. `data-testid`, `class`) are forwarded to the
    `<dialog>` root element.

### Accessibility (WCAG 2.1 AA)

46. `getByRole('dialog')` resolves the modal — the `<dialog>` element has the implicit
    ARIA role `"dialog"`.
47. The dialog has `aria-modal="true"` (AC 12 — repeated here as an a11y criterion).
48. The dialog has `aria-labelledby` pointing to the `<h2>` title element (AC 13).
49. The close button is accessible by keyboard (Tab reaches it, Enter/Space fires it).
50. `@storybook/addon-a11y` reports no accessibility violations on any story in
    `Modal.stories.svelte` or `Modal.composition.stories.svelte`.

### Stories

51. `Modal.stories.svelte` exists at
    `src/lib/components/feedback/Modal.stories.svelte`, uses `<script module lang="ts">`,
    imports `defineMeta` from `"@storybook/addon-svelte-csf"`, imports `expect` and
    `within` from `"storybook/test"`, and sets `component: Modal` in `defineMeta`.
52. `Modal.composition.stories.svelte` exists at
    `src/lib/components/feedback/Modal.composition.stories.svelte`, uses
    `<script module lang="ts">`, and does NOT set `component:` in `defineMeta`.
53. Named stories in `Modal.stories.svelte`: "Default Open", "Closed", "Close Button",
    "No Footer", "Escape Closes". Each has a `play` function that passes under
    `pnpm test`.
54. Named stories in `Modal.composition.stories.svelte`: "Confirm Variant",
    "Destructive Variant". Each has a `play` function that passes under `pnpm test`.
55. No play function contains TypeScript type annotations (`: Type` syntax) inside the
    `play={...}` attribute.
56. No play function contains null-guard checks before querying elements; `getByRole` and
    `getByText` throw on absence, making guards redundant.

---

## Out of scope

- **Self-managed open state** — the component does not manage its own `open` state
  internally. The consumer always controls `open`. A self-contained `useModal` pattern
  or `bind:open` two-way binding may be added in a follow-up item.
- **Nested / stacked modals** — rendering one modal on top of another is unsupported.
  The `id="modal-title"` static ID conflict (OQ-1) would need resolution before stacking.
- **`<form method="dialog">` pattern** — the native `<form method="dialog">` inside
  `<dialog>` (which closes the dialog and sets `returnValue`) is not used. B8 uses
  explicit callback-driven close instead.
- **Animation / transitions** — no enter/exit transitions on the dialog or backdrop.
  CSS transitions may be added in B11 or a future enhancement item.
- **Size variants** — only one size (max-width 480px). Small/large/full-screen size
  variants are out of scope.
- **Alert dialog variant** — `role="alertdialog"` (for urgent messages that must
  acknowledge) is distinct from `role="dialog"`. This variant is not in R7 and is
  out of scope for B8.
- **Arrow-key focus cycling within modal** — the browser's native Tab focus trap
  handles all focus cycling. Custom focus management (e.g. looping from last to first
  element) relies on the browser's native modal behaviour and requires no additional
  implementation.
- **Palette toggle testing** — verifying the modal renders correctly in Paper palette
  is a visual review concern; it is not covered by B8 play functions.
- **`returnValue` on close** — the `onclose` callback does not pass a return value
  (e.g. button clicked). If distinguishing confirm from cancel in the callback is
  needed, the footer snippet's button `onclick` handlers can call separate callbacks.
  This is a consumer responsibility.

---

## Open questions

**OQ-1 (non-blocking): Static `id="modal-title"` uniqueness.**
The `aria-labelledby` attribute references `id="modal-title"`. If two `Modal` components
are mounted in the DOM simultaneously (even if only one is open), the `id` is duplicated,
which is invalid HTML. In practice, pages typically mount only one modal at a time.
A safer approach would be to generate a unique ID per instance (e.g. using a counter or
`crypto.randomUUID()`). This is deferred for simplicity in B8; the implementer may
choose to generate a unique ID using a module-level counter (`let idCounter = 0`) and
set `id="modal-title-{++idCounter}"` in the component script. Either approach is
acceptable — the spec does not mandate one, but the uniqueness issue is documented here.

**OQ-2 (non-blocking): `::backdrop` background as a hardcoded value.**
CSS custom properties are not inherited into `::backdrop` in most browsers as of 2026.
The backdrop colour `rgba(7, 9, 8, 0.85)` is therefore hardcoded. If browser support
for `::backdrop` custom property inheritance improves, this should be updated to
`var(--backdrop-color)` or similar. This does not block implementation.

**OQ-3 (non-blocking): Backdrop click detection reliability.**
The click detection approach (`event.target === dialogElement`) relies on the click
event's `target` being set to the `<dialog>` element when the user clicks the
`::backdrop` area. This is the correct DOM behaviour per spec (clicks on `::backdrop`
target the `<dialog>` element) and is well-tested in browsers, but may behave
differently in Playwright's simulated click environment. If backdrop-click tests are
fragile in Playwright, the play function for that scenario should be omitted or marked
with a skip comment. This does not block the rest of B8.

**OQ-4 (non-blocking): `footer` snippet prop in `defineMeta` args.**
Svelte snippet props cannot be passed as `args` in Storybook CSF because they are
functions, not serialisable values. The `footer` prop is therefore only testable in
composition stories (no `component:` in `defineMeta`). This is a known constraint of
the stories-guide pattern (D9); the spec reflects it by splitting into two story files.
Not blocking.

No open questions block implementation. B8 is ready for `test-writer`.
