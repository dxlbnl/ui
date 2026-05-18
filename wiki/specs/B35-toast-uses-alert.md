# B35: Alert → feedback, aligned variants, Toast uses Alert with title+message

## Context

`Alert.svelte` exists in `src/lib/components/patterns/` but belongs in `feedback/`
alongside `Modal`, `Toast`, and `ToastRegion`. Moving it also unlocks `Toast.svelte`
using it for visual consistency.

Three coupled changes:

1. **Move `Alert` to `feedback/`** — file move + export updates only; no API change
   beyond variant rename.
2. **Rename Alert variants** — `'ok' | 'amber' | 'danger' | 'info'` →
   `'success' | 'warning' | 'error' | 'info'`. The underlying tokens (`--ok`, `--amber`,
   `--danger`, `--cyan`) do not change.
3. **Remove `role="status"` from Alert** — Alert becomes a pure visual primitive.
   The live-region role stays on Toast's wrapper, which is the correct owner.
4. **Alert gains optional `ondismiss`** — when provided, Alert renders a dismiss ×
   button inside its own flex row (ink-faint, 18px, `margin-left: auto`). This keeps
   the button inside the bordered container for both Alert and Toast.
5. **Toast gains `title` + uses Alert** — `Toast.svelte` gets an optional `title`
   prop, and delegates its visual chrome to `<Alert variant={variant} {title} {message}
   ondismiss={() => ondismiss(id)} />`. The dismiss button is owned by Alert.
   `role`, `aria-live`, and `aria-atomic` stay on Toast's own wrapper div.
6. **Toast store gains optional `title`** — `ToastOptions.title?: string`; existing
   `toast.push()` call sites are unchanged (title defaults to `''`).

Related pages: [architecture.md](../architecture.md), [stories-guide.md](../stories-guide.md).
Item card: [wiki/backlog/ready/B35-toast-uses-alert.md](../backlog/ready/B35-toast-uses-alert.md).

---

## Acceptance criteria

### Group A — Alert move + variant rename

**AC-1** `Alert.svelte` is located at `src/lib/components/feedback/Alert.svelte`.
No `Alert.svelte` exists under `src/lib/components/patterns/`.

**AC-2** `Alert.stories.svelte` is located at
`src/lib/components/feedback/Alert.stories.svelte` with `title: 'Feedback/Alert'` in
`defineMeta`. No `Alert.stories.svelte` exists under `src/lib/components/patterns/`.

**AC-3** `src/lib/components/feedback/index.ts` exports `Alert` as a named export.
`src/lib/components/patterns/index.ts` does NOT export `Alert`.

**AC-4** `Alert.svelte`'s `AlertVariant` type is `'success' | 'warning' | 'error' | 'info'`.
`pnpm check` reports no TypeScript errors after the rename.

**AC-5** The Alert `Ok` story uses `variant: 'success'` and asserts
`borderLeftColor` matches `resolveTokenFgColor('--ok')`.

**AC-6** The Alert `Amber` story uses `variant: 'warning'` and asserts
`borderLeftColor` matches `resolveTokenFgColor('--amber')`.

**AC-7** The Alert `Danger` story uses `variant: 'error'` and asserts
`borderLeftColor` matches `resolveTokenFgColor('--danger')`.

**AC-8** The Alert `Info` story uses `variant: 'info'` and asserts
`borderLeftColor` matches `resolveTokenFgColor('--cyan')`.

**AC-9** Alert's root element does NOT have a `role` attribute after the move.
(Verified by `canvasElement.querySelector('.alert').getAttribute('role')` returning
`null`.)

---

### Group B — Toast title prop + uses Alert

**AC-10** `Toast.svelte` accepts an optional `title?: string` prop. Passing a non-string
is a TypeScript error (`pnpm check`).

**AC-11** When `title` is provided, the rendered DOM contains a visible `.alert-title`
element with that text. When `title` is absent (or empty string), no `.alert-title`
text is visible.

**AC-12** The Toast root element (the element carrying `role="status"` or
`role="alert"`) still has `role`, `aria-live`, and `aria-atomic` attributes. These are
NOT inside Alert. The existing `Toast / Aria Attributes` story assertions continue to
pass.

**AC-13** The `Toast / Success` story is updated to pass `title="Build complete"`.
The DOM contains `.alert-tag` with text `"ok"` (rendered by Alert). The story's
`role="status"` assertion still passes (role is on Toast's wrapper).

**AC-14** The `Toast / Warning` story is updated to pass `title="High load"`.
The DOM contains `.alert-tag` with text `"!!"`. The `role="status"` assertion still
passes.

**AC-15** The `Toast / Error` story is updated to pass `title="Fault"`.
The DOM contains `.alert-tag` with text `"err"`. The `role="alert"` assertion still
passes.

**AC-16** The dismiss button (`aria-label="Dismiss notification"`) is rendered inside
Alert's bordered container (via Alert's `ondismiss` prop), not as a separate element
outside Alert. `canvas.getByRole('button', { name: /Dismiss notification/i })` finds
it in the Toast stories.

**AC-17** Border-color assertions in Toast stories are updated from
`getComputedStyle(toast).borderColor` to `getComputedStyle(alertEl).borderLeftColor`,
where `alertEl` is the `.alert` element inside the Toast wrapper. The resolved values
match the same tokens as before (`--ok`, `--amber`, `--danger`).

**AC-18** `Toast.svelte`'s `<style>` block no longer contains CSS rules for
`border-color`, `background-color`, icon `color`, or icon `font-family` — these are
now provided exclusively by `Alert.svelte`.

---

### Group C — Toast store

**AC-19** `src/lib/stores/toast.ts` exports `ToastOptions` with an optional
`title?: string` field. Existing call sites that omit `title` still compile without
error (`pnpm check`).

**AC-20** `ToastItem` includes a `title: string` field (defaulting to `''` when not
provided by the caller).

**AC-21** `ToastRegion.svelte` passes `title={item.title}` to `<Toast>`.

---

### Group D — ToastRegion stories unchanged

**AC-22** All seven existing `ToastRegion` stories (`Single Toast`, `Three Variants`,
`Stack Limit`, `Auto-Dismiss`, `Manual Dismiss via Button`, `Position Top-Left`,
`No Toasts`) pass `pnpm test` after the refactor. Their `toast.push()` calls do not
need updating (title defaults to `''`).

---

### Group E — TypeScript + full suite

**AC-23** `pnpm check` reports zero new errors after all changes.

**AC-24** `pnpm test` reports zero new failures relative to the pre-B35 baseline.

---

## Implementation notes

**File move:** Copy `Alert.svelte` and `Alert.stories.svelte` to `feedback/`, update
both `index.ts` files, then delete the originals from `patterns/`. Do not `git mv` —
just write the new files and delete the old.

**Variant rename in CSS:** Only the class names change (`.alert--ok` →
`.alert--success` etc.). The `var(--ok)`, `var(--amber)`, `var(--danger)`, `var(--cyan)`
token references inside those rules stay identical.

**Alert `title` optionality:** Change `title: string` to `title?: string` in Alert's
`Props` interface so Toast can omit it when empty. Render the title span only when
`title` is truthy.

**Toast structure after refactor:**
```svelte
<div class="toast toast--{variant}" {role} aria-live={ariaLive} aria-atomic="true">
  <Alert variant={variant}>
    {#if title}<span class="toast-title">{title}</span>{/if}
    <span class="toast-message">{message}</span>
  </Alert>
  <button aria-label="Dismiss notification" onclick={() => ondismiss(id)}>×</button>
</div>
```
The dismiss button is rendered by Alert when `ondismiss` is provided — inside Alert's flex row, pushed right via `margin-left: auto`, styled ink-faint 18px plain `<button>`.
Toast keeps `min-width`, `max-width`, `pointer-events`, and flex layout on its own wrapper.

**Alternatively**, Toast can pass `title` and `message` directly as Alert props
(since Alert already has `title` and `message` props). That avoids needing to use
Alert's `children` snippet:
```svelte
<Alert variant={variant} {title} {message} />
```
This is simpler — prefer this approach.

**Story updates:** The existing Toast stories check `.toast-icon` — this class no
longer exists after the refactor; replace with `.alert-tag`. `borderColor` checks on
the Toast root should become `borderLeftColor` checks on the `.alert` child element.

---

## Out of scope

- Changing Alert's visual design (border width, padding, background formula, layout).
- Making `ondismiss` mandatory on Alert — it is optional; when absent, Alert is static.
- Renaming `ToastVariant` in the store — it stays `'success' | 'warning' | 'error'`.
- Changing ToastRegion behavior, position logic, or stack-limit logic.
- Animation or auto-dismiss visual indicators.
- Making `title` required in `toast.push()` — it must remain optional to avoid
  breaking existing call sites.

---

## Open questions

None. Decisions confirmed before spec was written:

1. Alert moves to `feedback/`; no longer in `patterns/`.
2. Variant rename: `'ok'→'success'`, `'amber'→'warning'`, `'danger'→'error'`; `'info'` unchanged.
3. Alert `role="status"` removed; Toast wrapper keeps role/aria attributes.
4. Toast gains optional `title`; store `ToastOptions.title` is optional.
5. Toast delegates visual chrome to `<Alert variant={variant} {title} {message} />`.

No blocking open questions. Implementation may proceed.
