# B22: Modal story improvements

## Context

The current `src/lib/components/feedback/Modal.stories.svelte` opens all stories with
`args={{ open: true, ... }}`. On the Storybook autodocs page every story is mounted
simultaneously, which causes multiple overlapping `<dialog>` elements to appear at once
and makes the docs page unusable.

The fix is to restructure every story so that it owns its own `open` state internally
(via Svelte 5 `$state`) and provides a `<Button>` trigger. The docs page then starts
clean (all dialogs closed); a user or a play function clicks the trigger to open the
specific modal they want to inspect.

A secondary issue is that the existing "Escape Closes" story uses `userEvent.keyboard`
to send `{Escape}` without first focusing the `<dialog>` — this is unreliable in
Vitest browser mode because the dialog must hold focus for the browser to deliver the
`cancel` event. The replacement play functions click the trigger to open the dialog
first, then test close paths that do not depend on implicit focus (close button click,
backdrop click).

Relevant wiki pages: `wiki/stories-guide.md` (story format and play-function rules),
`wiki/architecture.md` (Svelte 5 runes, Storybook test setup),
`wiki/specs/B8-modal.md` (Modal component spec),
`wiki/specs/B12-story-rewrite.md` (story structural conventions).

---

## File to change

**One file only**: `src/lib/components/feedback/Modal.stories.svelte`

No new files are created. No `Modal.composition.stories.svelte` is introduced.

---

## Story structure

### Module `<script module lang="ts">` block

`defineMeta` must **not** include a `component:` key. Because each story renders both a
`<Button>` trigger and a `<Modal>` in its slot, setting `component: Modal` would
double-render the `<Modal>` — once from `args` and once from the explicit slot markup.

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';
  import Modal from './Modal.svelte';
  import Button from '../primitives/Button.svelte';
  import { resolveTokenColor } from '$lib/storybook-utils.js';

  const { Story } = defineMeta({
    title: 'Feedback/Modal',
    tags: ['autodocs'],
  });
</script>
```

Note: `component:` is absent. `title` and `tags` are retained from the current file.

### Non-module `<script lang="ts">` block

One `$state(false)` variable per story, named after the story:

```svelte
<script lang="ts">
  let openDefault      = $state(false);
  let openConfirm      = $state(false);
  let openDestructive  = $state(false);
  let openWithFooter   = $state(false);
  let openBackdrop     = $state(false);
  let openNoFooter     = $state(false);
</script>
```

No other logic in this block. All story template markup is inline in the `<Story>` tags.

### Per-story template pattern

Each story slot renders:
1. A `<Button>` trigger that sets its state variable to `true`.
2. A `<Modal>` bound to that state variable with an `onclose` handler that sets it back
   to `false`.

```svelte
<Story name="Default"
  play={async ({ canvasElement, userEvent }) => { /* ... */ }}>
  <Button onclick={() => openDefault = true}>Open Modal</Button>
  <Modal
    open={openDefault}
    title="// CONFIRM ACTION"
    onclose={() => openDefault = false}
  >
    <p>This action cannot be undone. Are you sure you want to proceed?</p>
  </Modal>
</Story>
```

---

## Story plan

| # | Story name | State var | Modal props | Close path tested |
|---|-----------|-----------|-------------|------------------|
| 1 | Default | `openDefault` | `title="// CONFIRM ACTION"` | Close button click |
| 2 | Confirm Variant | `openConfirm` | `title="// CONFIRM PURCHASE"`, `variant="confirm"` | Close button click |
| 3 | Destructive Variant | `openDestructive` | `title="// DELETE ITEM"`, `variant="destructive"` | Close button click |
| 4 | With Footer | `openWithFooter` | `title="// WITH FOOTER"`, `footer` snippet | Close button click |
| 5 | Backdrop Close | `openBackdrop` | `title="// BACKDROP TEST"` | Backdrop click |
| 6 | No Footer | `openNoFooter` | `title="// NO FOOTER"` (no footer prop) | Close button click |

---

## Acceptance criteria

**AC-1** — `defineMeta` in `Modal.stories.svelte` does NOT contain a `component:` key.
`title` is `"Feedback/Modal"` and `tags` includes `"autodocs"`.

**AC-2** — The module `<script>` block imports `Modal` from `./Modal.svelte`, `Button`
from `../primitives/Button.svelte`, and `resolveTokenColor` from
`$lib/storybook-utils.js`. No other component or helper is imported.

**AC-3** — A non-module `<script lang="ts">` block declares exactly six `$state(false)`
variables: `openDefault`, `openConfirm`, `openDestructive`, `openWithFooter`,
`openBackdrop`, `openNoFooter`. No other logic appears in this block.

**AC-4** — Every story slot contains exactly one `<Button>` trigger element and exactly
one `<Modal>` element. No story renders `open={true}` as a static literal — the `open`
prop is always bound to a `$state` variable.

**AC-5** — Before the trigger button is clicked in any story, the `<dialog>` element is
not visible (queried with `getByRole('dialog', { hidden: true })` and asserted
`not.toBeVisible()`).

**AC-6** — After clicking the trigger button, the `<dialog>` element becomes visible
(asserted with `getByRole('dialog')` and `toBeVisible()`).

**AC-7** — **Default story**: after the trigger click the dialog is visible and the
following ARIA attributes are present: `aria-modal="true"`,
`aria-labelledby="modal-title"`. The heading level-2 with text matching `/CONFIRM ACTION/`
is visible. The close button (`getByRole('button', { name: /Close dialog/i })`) is
visible and enabled. After clicking the close button the dialog is no longer visible
(`getByRole('dialog', { hidden: true })` asserts `not.toBeVisible()`).

**AC-8** — **Confirm Variant story**: after the trigger click the dialog is visible. An
element with class `.modal-icon` is visible, has `aria-hidden="true"`, its text content
trims to `"!"`, and its `backgroundColor` computed style matches the resolved value of
the `--amber` CSS custom property (resolved via `resolveTokenColor('--amber')`). After
clicking the close button the dialog is not visible.

**AC-9** — **Destructive Variant story**: after the trigger click the dialog is visible.
An element with class `.modal-icon` is visible, has `aria-hidden="true"`, its text
content trims to `"!"`, and its `backgroundColor` computed style matches the resolved
value of the `--danger` CSS custom property (resolved via `resolveTokenColor('--danger')`).
After clicking the close button the dialog is not visible.

**AC-10** — **With Footer story**: after the trigger click a `<footer>` element is
present inside the dialog (`canvasElement.querySelector('footer')` is not null and
`toBeInTheDocument()`). At least one interactive element (button or link) is visible
inside the footer. After clicking the close button the dialog is not visible.

**AC-11** — **Backdrop Close story**: after the trigger click the dialog is visible.
A `userEvent.click` on the `<dialog>` element itself (not its inner content panel)
triggers the `onclose` callback and the dialog becomes not visible.

Implementation note for the test writer: clicking the backdrop programmatically requires
dispatching a click at coordinates that land on the `<dialog>` element but outside the
`.modal-inner` panel. The simplest approach is `userEvent.click(dialogElement)` where
`dialogElement` is the `<dialog>` node obtained via `getByRole('dialog')` — the Modal
component's `handleDialogClick` fires when `event.target === dialogElement`, which is
the case when the click lands on the backdrop area rather than a child node. In browser
mode this may require `{ position: { x: 0, y: 0 } }` if the click defaults to centre.
If dispatching directly to the `<dialog>` element is unreliable, the play function may
instead `await userEvent.click(dialog, { clientX: 5, clientY: 5 })` to target the top-left
corner, which is guaranteed to be outside the centred inner panel.

**AC-12** — **No Footer story**: after the trigger click `canvasElement.querySelector('footer')`
is `null` (asserted with `toBeNull()`). The close button is visible and enabled.
After clicking the close button the dialog is not visible.

**AC-13** — The close button (`getByRole('button', { name: /Close dialog/i })`) in every
story has `type="button"` (asserted via `getAttribute('type') === 'button'`). This
prevents accidental form submission.

**AC-14** — `open` is `false` by default. This is verified structurally: no `<Story>`
tag passes `open={true}` as a static value anywhere in the file.

**AC-15** — `pnpm check` reports 0 TypeScript errors after the rewrite.

**AC-16** — `pnpm test` passes all six story play functions. No existing passing test
is regressed.

**AC-17** — `@storybook/addon-a11y` reports no violations on any of the six stories
when viewed in Storybook. A `<dialog>` with `aria-modal="true"` and
`aria-labelledby="modal-title"` pointing to an existing `id="modal-title"` element
satisfies the ARIA dialog pattern.

**AC-18** — No story in the file contains the pattern `args={{ open: true` — all
`open` state is managed by the non-module `$state` variables, not by `args`.

---

## Out of scope

- Changing `Modal.svelte` itself — the component implementation is not modified.
- Adding a backdrop-click close path to every story — one dedicated story (Backdrop
  Close) is sufficient to cover that code path.
- Testing Escape-key close — this close path is intentionally omitted from play
  functions because it requires the `<dialog>` to hold OS-level focus, which is not
  reliable in Vitest browser mode. The `handleCancel` handler in `Modal.svelte` is
  already exercised indirectly by the modal's native `cancel` event wiring, which is
  tested by the existing B8 spec.
- Creating `Modal.composition.stories.svelte` — all stories live in the single
  `Modal.stories.svelte` file.
- Changing any other stories file — only `Modal.stories.svelte` is in scope.
- Adding new `Modal` variants beyond those covered by the existing stories.

---

## Open questions

**OQ-1 (non-blocking)** — Backdrop click reliability. The `handleDialogClick` in
`Modal.svelte` fires only when `event.target === dialogElement` (i.e. the click lands
directly on the `<dialog>` backdrop, not on any child element). In Vitest browser mode,
`userEvent.click(dialogElement)` dispatches the click at the element's centre, which is
occupied by the `.modal-inner` panel; the click therefore lands on a child, not on the
backdrop, and the handler will not fire. The play function for Backdrop Close must use
coordinates outside the centre panel (e.g. top-left corner of the dialog, or a specific
`clientX/clientY` that is guaranteed to be on the transparent backdrop area).

The test writer must verify empirically which coordinate strategy works in the
`@vitest/browser-playwright` environment. If no coordinate-based approach is reliable,
this story's close assertion can be relaxed to: trigger the close by directly calling
`userEvent.click(within(canvasElement).getByRole('button', { name: /Close dialog/i }))`,
which would duplicate Default's close path. If the backdrop click cannot be reliably
tested, OQ-1 should be escalated to the manager to decide whether Backdrop Close merges
with Default or is dropped.

This does NOT block writing the other five stories. It blocks only the Backdrop Close
play function's close assertion.
