# B16: Form primitives

## Context

B16 adds the boolean and selection controls that are absent from the B7 form layer:
`Checkbox`, `Radio` + `RadioGroup`, and `Switch`. It also enhances the existing `Field`
component to automatically inject `aria-invalid` and `aria-describedby` onto the wrapped
control via Svelte context, eliminating the manual plumbing that B7 left to the consumer
(documented in D11 and OQ-2 of B7).

These controls complete the Dexterlabs form component set. They share the same design
token palette, mono font style, and Svelte 5 runes conventions as the components
delivered in B7.

Related wiki pages:
- [requirements.md](../requirements.md) — R6 (form components), constraints (Svelte 5
  runes, strict TypeScript, `...rest` forwarding, SSR-safe, WCAG 2.1 AA).
- [architecture.md](../architecture.md) — component authoring conventions, scoped CSS.
- [specs/B7-form-components.md](B7-form-components.md) — existing form layer; `Field`
  current implementation (consumer-responsibility ARIA wiring, D11).
- [specs/B15-keyboard-navigation.md](B15-keyboard-navigation.md) — ARIA keyboard
  pattern precedent (Select, Tabs).
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format, inline play
  functions, token color resolution pattern.
- [decisions.md](../decisions.md) — D1 (tests = play functions), D4 (Chakra-style), D5
  (scoped CSS), D7 (SSR-safe `$effect` + `browser` guard), D11 (Field ARIA wiring gap).

---

## Files produced / modified

| File | Role |
|---|---|
| `src/lib/components/forms/Checkbox.svelte` | New component |
| `src/lib/components/forms/Checkbox.stories.svelte` | Checkbox stories + tests |
| `src/lib/components/forms/Radio.svelte` | New component |
| `src/lib/components/forms/Radio.stories.svelte` | Radio stories + tests (standalone radio only) |
| `src/lib/components/forms/RadioGroup.svelte` | New component |
| `src/lib/components/forms/RadioGroup.stories.svelte` | RadioGroup stories + tests |
| `src/lib/components/forms/Switch.svelte` | New component |
| `src/lib/components/forms/Switch.stories.svelte` | Switch stories + tests |
| `src/lib/components/forms/Field.svelte` | Enhanced: auto-injects `aria-invalid` + `aria-describedby` via Svelte context |
| `src/lib/components/forms/Field.stories.svelte` | Add "Auto ARIA Wiring" story |
| `src/lib/components/forms/index.ts` | Export `Checkbox`, `Radio`, `RadioGroup`, `Switch` |
| `src/lib/index.ts` | Re-export all four new components |

---

## Layer position

Form primitive components are in the same layer as B7 form components. They may import from:
- `src/lib/components/primitives/` — atoms (Button, Led, TagPill)
- `src/lib/components/layout/` — layout primitives (Stack, Inline, etc.)

They must not import from cards, navigation, feedback, pattern, or data layers.

---

## CSS token reference

All styles use only CSS custom properties. No hardcoded hex, rgb, or named colours.

| Token | Usage in B16 |
|---|---|
| `var(--amber)` | Checkbox/Radio checked fill, Switch on-track, focus outline colour |
| `var(--bg-sunken)` | Switch off-track background |
| `var(--ink)` | Label text default colour |
| `var(--ink-faint)` | Label text disabled colour |
| `var(--ink-dim)` | Checkbox/Radio unchecked icon colour |
| `var(--rail)` | Checkbox/Radio/Switch border colour (unchecked/off) |
| `var(--rule-strong)` | Checkbox border (same as input borders in B7) |
| `var(--bg)` | Switch knob colour |
| `var(--transition)` | All CSS transitions |
| `var(--danger)` | `aria-invalid` state border (same as Input error state) |

---

## Component specifications

### Checkbox

`Checkbox` renders a native `<input type="checkbox">` with `appearance: none`, a custom
visual indicator, and an associated `<label>`. The label and control are sibling elements
wrapped in a single `<span>` so that clicking the label toggles the checkbox.

The indeterminate state is set via a `$effect` on the DOM property `indeterminate`
(not an HTML attribute — this must be done in JavaScript after render).

#### Props interface

```ts
import type { HTMLInputAttributes } from 'svelte/elements'

interface Props extends HTMLInputAttributes {
  label: string        // visible label text; required for accessible name
  indeterminate?: boolean  // when true, sets input.indeterminate via $effect
}

let { label, indeterminate = false, checked = $bindable(false), disabled, ...rest }: Props = $props()
```

`checked` uses `$bindable` so consumers can use `bind:checked`. The `id` attribute is
forwarded via `...rest`; if not provided, a fallback `id` should be generated internally
(e.g. via a `crypto.randomUUID()` or a module-level counter — SSR-safe string generation
only, not `crypto` in server paths). For simplicity, the `id` is the consumer's
responsibility in B16 (pass via `...rest` or `aria-labelledby` will fill the gap from
`Field`'s context when used inside `Field`).

#### HTML structure

```html
<span class="checkbox-wrap" class:disabled={disabled}>
  <input
    type="checkbox"
    class="checkbox-input"
    bind:checked
    {disabled}
    bind:this={inputEl}
    {...rest}
  />
  <span class="checkbox-indicator" aria-hidden="true"></span>
  <span class="checkbox-label">{label}</span>
</span>
```

The `bind:this={inputEl}` reference is used by a `$effect` to set `inputEl.indeterminate`.

`$effect`:
```ts
$effect(() => {
  if (inputEl) inputEl.indeterminate = indeterminate
})
```

#### Visual behaviour

| State | Indicator appearance |
|---|---|
| Unchecked | `var(--rule-strong)` border, transparent fill |
| Checked | `var(--amber)` fill, white `✓` glyph (CSS `content`) |
| Indeterminate | `var(--amber)` fill at 60% opacity, `–` glyph |
| Disabled (any) | `opacity: 0.4`, `cursor: not-allowed` on wrap |
| Focus-visible | `outline: 2px solid var(--amber)` on the indicator (delegated focus) |

The indicator `<span>` is a `16px × 16px` square with `border: 1px solid var(--rule-strong)`,
`background: transparent` (unchecked), `border-radius: 0` (square corners per design).

When `checked` is true: `background: var(--amber)`, `border-color: var(--amber)`, `content`
pseudo-element renders `✓` in `var(--bg)`.

When `indeterminate` is true (takes priority over `checked` visually): `background: var(--amber)`,
`opacity: 0.6` on the indicator, `content` pseudo-element renders `–` in `var(--bg)`.

The native `<input>` is positioned `opacity: 0; position: absolute; width: 0; height: 0`
so it is invisible but participates in accessibility tree and receives `:focus-visible`.
The `.checkbox-indicator` shows a custom `outline` when `.checkbox-input:focus-visible + .checkbox-indicator`.

#### ARIA

- The native `<input type="checkbox">` carries `aria-checked` automatically via its
  `checked` property. When `indeterminate` is true, the browser sets `aria-checked="mixed"`.
- When `disabled` is true, the input is `disabled` (which implies `aria-disabled`
  in the accessibility tree).
- No additional ARIA is required on the wrapper `<span>` (it has no role).
- The `<label>` is implicit here (the label text is part of the component, not a separate
  `<label>` element). The `<input>` must have an accessible name. Options:
  - Consumer passes `aria-label` or `id`+`<label for>` via `...rest`.
  - Or: wrap the input and label text in a `<label>` element to provide an implicit
    accessible name.

**Chosen approach**: wrap the entire component in `<label>` so clicking either the
indicator or the text toggles the checkbox. The `<label>` provides the implicit
accessible name from the visible `{label}` text.

Revised HTML structure:

```html
<label class="checkbox-wrap" class:disabled={disabled}>
  <input
    type="checkbox"
    class="checkbox-input"
    bind:checked
    {disabled}
    bind:this={inputEl}
    {...rest}
  />
  <span class="checkbox-indicator" aria-hidden="true"></span>
  <span class="checkbox-label">{label}</span>
</label>
```

This eliminates the need for a separate `id`/`for` association; the `<label>` wraps the
`<input>` directly (implicit label association per HTML spec).

#### Story plan

File: `src/lib/components/forms/Checkbox.stories.svelte`
Title: `'Forms/Checkbox'`
`component: Checkbox` in `defineMeta`.

| Story name | `args` / setup | Key assertions |
|---|---|---|
| "Default (Unchecked)" | `{ label: 'Enable notifications', checked: false }` | `getByRole('checkbox')` is unchecked (`not.toBeChecked()`); indicator background is transparent. |
| "Checked" | `{ label: 'Enable notifications', checked: true }` | `getByRole('checkbox')` is checked (`toBeChecked()`); computed indicator background matches `var(--amber)`. |
| "Indeterminate" | `{ label: 'Select all', indeterminate: true, checked: false }` | `getByRole('checkbox')` has `indeterminate` property `true`; `aria-checked` is `"mixed"`. |
| "Disabled Unchecked" | `{ label: 'Locked option', disabled: true, checked: false }` | `getByRole('checkbox')` is `toBeDisabled()`; wrap computed `opacity` is `"0.4"`. |
| "Disabled Checked" | `{ label: 'Locked option', disabled: true, checked: true }` | `getByRole('checkbox')` is `toBeDisabled()` and `toBeChecked()`. |
| "Space to Toggle" | `{ label: 'Toggle me', checked: false }` | `userEvent.type` Space on the input; assert `toBeChecked()` after. |

---

### Radio

`Radio` is a single radio button atom. It is always used via `RadioGroup` in real
applications, but is also exported for standalone use (e.g. custom group implementations).
It renders a native `<input type="radio">` with `appearance: none` styling, inside a
`<label>` for implicit accessible name association.

#### Props interface

```ts
import type { HTMLInputAttributes } from 'svelte/elements'

interface Props extends HTMLInputAttributes {
  label: string    // visible label text; required for accessible name
}

let { label, checked = false, disabled, ...rest }: Props = $props()
```

`name` and `value` are passed via `...rest` (required for radio group behaviour).

#### HTML structure

```html
<label class="radio-wrap" class:disabled={disabled}>
  <input
    type="radio"
    class="radio-input"
    {checked}
    {disabled}
    {...rest}
  />
  <span class="radio-indicator" aria-hidden="true"></span>
  <span class="radio-label">{label}</span>
</label>
```

The indicator is a `16px × 16px` circle (`border-radius: 50%`) with
`border: 1px solid var(--rule-strong)`. When the native input is checked, the indicator
shows an inner filled circle using a CSS `::before` pseudo-element:
`background: var(--amber); border-radius: 50%; width: 8px; height: 8px; centered`.

The native `<input>` is hidden visually (`opacity: 0; position: absolute; width: 0; height: 0`)
but remains in the accessibility tree. Focus outline is delegated to the indicator via
`.radio-input:focus-visible + .radio-indicator`.

#### Visual behaviour

| State | Indicator |
|---|---|
| Unchecked | `var(--rule-strong)` border, transparent fill |
| Checked | `var(--rule-strong)` border (or `var(--amber)`), amber inner dot |
| Disabled | `opacity: 0.4` on wrap, `cursor: not-allowed` |
| Focus-visible | `outline: 2px solid var(--amber)` on indicator |

#### ARIA

- The native `<input type="radio">` carries `aria-checked` automatically.
- `name` and `value` attributes are forwarded via `...rest` (required for browser radio
  group exclusivity when multiple radios share the same `name`).
- When standalone (outside `RadioGroup`), the `<label>` wrapping provides the accessible name.
- `disabled` on the input implies `aria-disabled`.

#### Story plan

File: `src/lib/components/forms/Radio.stories.svelte`
Title: `'Forms/Radio'`
`component: Radio` in `defineMeta`.

Standalone radio stories (no group behaviour expected):

| Story name | `args` | Key assertions |
|---|---|---|
| "Default (Unchecked)" | `{ label: 'Option A', name: 'demo', value: 'a', checked: false }` | `getByRole('radio')` is `not.toBeChecked()`; indicator border colour matches `var(--rule-strong)`. |
| "Checked" | `{ label: 'Option A', name: 'demo', value: 'a', checked: true }` | `getByRole('radio')` is `toBeChecked()`; indicator `::before` amber dot is present (assert `getComputedStyle(indicator, '::before').background` resolves). |
| "Disabled" | `{ label: 'Locked', name: 'demo', value: 'x', disabled: true }` | `getByRole('radio')` is `toBeDisabled()`; wrap `opacity` is `"0.4"`. |
| "Focus Styles" | `{ label: 'Focus me', name: 'demo', value: 'f' }` | `userEvent.tab()` to focus; assert `getByRole('radio')` matches `:focus-visible` (a11y addon confirms focus indicator visible). |

---

### RadioGroup

`RadioGroup` is a compound molecule that renders a group of `Radio` atoms with proper
ARIA grouping (`role="radiogroup"` and a group label). It manages exclusive selection
internally, accepting a `value` prop (the currently selected option's value) and an
`onchange` callback. It also handles keyboard arrow-key navigation among its radio
buttons per the WAI-ARIA Radio Group pattern.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props extends HTMLAttributes<HTMLFieldSetElement> {
  legend: string              // accessible group label (rendered as <legend>)
  name: string                // shared name attribute for all radio inputs
  options: RadioOption[]      // the list of options
  value?: string              // currently selected value; undefined = nothing selected
  disabled?: boolean          // disables the entire group when true
  onchange?: (value: string) => void  // called when selection changes
}

let { legend, name, options, value, disabled = false, onchange, ...rest }: Props = $props()
```

#### HTML structure

```html
<fieldset class="radio-group" class:disabled={disabled} {disabled} {...rest}>
  <legend class="radio-group-legend">{legend}</legend>
  {#each options as option, i}
    <Radio
      {name}
      value={option.value}
      label={option.label}
      checked={option.value === value}
      disabled={disabled || option.disabled}
      data-index={i}
      onchange={() => onchange?.(option.value)}
    />
  {/each}
</fieldset>
```

Using `<fieldset>` + `<legend>` is the correct semantic element for grouping radio
buttons; it provides `role="radiogroup"` implicitly and associates the group label
without additional ARIA.

#### Keyboard navigation (WAI-ARIA Radio Group pattern)

The component handles `keydown` on the `<fieldset>`:

| Key | Behaviour |
|---|---|
| `ArrowDown` / `ArrowRight` | Move to the next enabled radio in the group; wrap from last to first. Fires `onchange` with the new option's value. |
| `ArrowUp` / `ArrowLeft` | Move to the previous enabled radio in the group; wrap from first to last. Fires `onchange` with the new option's value. |

DOM focus moves to the target radio input. The standard radio-group keyboard contract
(WAI-ARIA APG § Radio Group) is that only one radio in the group is in the tab sequence
at any time — the selected one (or the first, if none is selected). Arrow keys move both
focus and selection simultaneously (automatic activation, consistent with D23 for Tabs).

Implementation note: the `keydown` handler on the `<fieldset>` inspects `event.target`
to identify which radio currently has focus, computes the next/previous enabled index,
programmatically calls `.focus()` on the target `<input>`, and fires `onchange`.

The `tabindex` of each radio input:
- The selected radio (matching `value`) has `tabindex="0"` (in the tab order).
- All other radios have `tabindex="-1"` (keyboard-reachable via arrow keys only).
- If `value` is undefined/unset, the first enabled radio has `tabindex="0"`.

#### Story plan

File: `src/lib/components/forms/RadioGroup.stories.svelte`
Title: `'Forms/RadioGroup'`
`component: RadioGroup` in `defineMeta`.

Because `RadioGroup` manages state internally (selection changes from arrow keys call
`onchange` but the parent must re-bind `value`), stories that test keyboard navigation
need a stateful wrapper. Use a Svelte `$state` variable declared in the module script
or the `play` function interaction model (click/keydown without a state loop — assertion
focuses on DOM attributes, not reactive re-render).

| Story name | `args` / setup | Key assertions |
|---|---|---|
| "Default — No Selection" | `{ legend: 'Module type', name: 'mod', options: [{value:'osc',label:'Oscillator'},{value:'env',label:'Envelope'},{value:'util',label:'Utility'}] }` | 3 `getByRole('radio')` elements visible; none is `toBeChecked()`; `getByRole('group')` exists. |
| "With Selection" | same options, `value: 'env'` | The "Envelope" radio `toBeChecked()`; other two `not.toBeChecked()`. |
| "Disabled Group" | same options, `disabled: true` | All 3 radios `toBeDisabled()`. |
| "Partially Disabled" | options with `{value:'util',label:'Utility',disabled:true}`, no group `disabled` | "Utility" radio `toBeDisabled()`; others enabled. |
| "Keyboard Navigation" | options as above, `value: 'osc'` | `userEvent.tab()` to focus "Oscillator" radio; press `ArrowDown`; assert "Envelope" radio is now focused (`document.activeElement`) and — after simulated `onchange` fires — the "Envelope" radio's `checked` attribute would be expected to be true (verify via the input's `checked` property or `aria-checked`). |

> Note for test-writer: the "Keyboard Navigation" story's `play` function must fire
> `userEvent.keyboard('{ArrowDown}')` after focusing the first radio, then assert
> `document.activeElement === getByRole('radio', {name:'Envelope'})` to confirm focus
> moved. Because `onchange` is not wired to a stateful parent in a plain Storybook story,
> the selection visual change will not reflect unless the story uses a wrapper with reactive
> `$state`. The play function should assert focus movement (DOM-observable) at minimum.

---

### Switch

`Switch` renders a boolean toggle that looks like a pill-shaped slider. It uses
`role="switch"` with `aria-checked` reflecting its on/off state. When on, the track
is `var(--amber)`; when off, the track is `var(--bg-sunken)`. The knob is white
(`var(--bg)`). The component is SSR-safe: the track colour transitions are CSS-only
(no JS required after hydration).

#### Props interface

```ts
import type { HTMLButtonAttributes } from 'svelte/elements'

interface Props extends HTMLButtonAttributes {
  label: string       // visible label text beside the switch; also used as aria-label fallback
  checked?: boolean   // on/off state; use bind:checked for two-way binding
}

let { label, checked = $bindable(false), disabled, ...rest }: Props = $props()
```

`Switch` renders as a `<button type="button">` (not an `<input>`), which allows full
control over `role`, `aria-checked`, and keyboard behaviour without the constraints of
`<input type="checkbox">`. The `checked` prop uses `$bindable` for two-way binding.

#### HTML structure

```html
<span class="switch-wrap" class:disabled={disabled}>
  <button
    type="button"
    class="switch"
    class:on={checked}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    aria-disabled={disabled}
    onclick={() => { if (!disabled) checked = !checked }}
    {...rest}
  >
    <span class="switch-knob" aria-hidden="true"></span>
  </button>
  <span class="switch-label">{label}</span>
</span>
```

The `<button>` has `role="switch"` and `aria-checked` reflecting the boolean `checked`
state. The `aria-label` is the `label` prop — this provides the accessible name even
though the visual label `<span>` is adjacent (not wrapped in a `<label>`). If the consumer
needs the label to be associated differently, they may pass `aria-labelledby` via `...rest`
to override.

`Space` key toggling is native to `<button>`: pressing Space fires `onclick` on a focused
`<button>`. No additional `keydown` handler is needed.

#### Visual behaviour

| State | Track | Knob |
|---|---|---|
| Off | `background: var(--bg-sunken)`, `border: 1px solid var(--rail)` | `background: var(--bg)`, left position |
| On | `background: var(--amber)`, `border-color: var(--amber)` | `background: var(--bg)`, right position |
| Disabled | `opacity: 0.4`, `cursor: not-allowed` on wrap |
| Focus-visible | `outline: 2px solid var(--amber)` offset on the button |

Track dimensions: `width: 40px`, `height: 22px`, `border-radius: 11px` (pill shape).
Knob dimensions: `width: 16px`, `height: 16px`, `border-radius: 50%`. Knob positions:
off = `translateX(2px)`, on = `translateX(20px)`. Transition on both track background
and knob transform: `var(--transition)`.

#### SSR safety

The component contains no `$effect` or browser API calls. All state (on/off) is
expressed as Svelte reactive props and CSS classes. The track colour and knob position
are pure CSS (`class:on={checked}`). This is inherently SSR-safe — there is no
browser-only mount path (contrast with Modal and Nav which require `$effect` + `browser`
guard for `showModal()` / `localStorage`).

#### ARIA

- `role="switch"` on the `<button>`.
- `aria-checked={checked}` — `"true"` when on, `"false"` when off (Svelte serialises
  booleans to strings in ARIA attributes automatically).
- `aria-label={label}` provides the accessible name.
- `aria-disabled={disabled}` + native `disabled` attribute when `disabled` is true.
- `Space` key activates the `onclick` handler (native `<button>` behaviour).

#### Story plan

File: `src/lib/components/forms/Switch.stories.svelte`
Title: `'Forms/Switch'`
`component: Switch` in `defineMeta`.

| Story name | `args` | Key assertions |
|---|---|---|
| "Off (Default)" | `{ label: 'Dark mode', checked: false }` | `getByRole('switch', {name:'Dark mode'})` visible; `aria-checked` is `"false"`; track background matches `var(--bg-sunken)`. |
| "On" | `{ label: 'Dark mode', checked: true }` | `aria-checked` is `"true"`; track background matches `var(--amber)`. |
| "Disabled Off" | `{ label: 'Feature flag', disabled: true, checked: false }` | Switch `toBeDisabled()`; wrap `opacity` is `"0.4"`. |
| "Disabled On" | `{ label: 'Feature flag', disabled: true, checked: true }` | Switch `toBeDisabled()` and `aria-checked` is `"true"`. |
| "Space to Toggle" | `{ label: 'Toggle', checked: false }` | `userEvent.tab()` to focus; `userEvent.keyboard(' ')` (Space); assert `aria-checked` is `"true"` after. |
| "Amber Track When On" | `{ label: 'Power', checked: true }` | Probe `var(--amber)` resolved value; assert switch track `backgroundColor` equals that value. |

---

### Field enhancement — auto-inject `aria-invalid` + `aria-describedby`

#### Current behaviour (B7 / D11)

`Field` renders a `<label>` + children slot + optional hint/error span. The consumer must
manually pass `aria-invalid="true"` and `aria-describedby="{inputId}-hint"` directly on
the wrapped control. This is documented in D11 as a known trade-off.

#### B16 enhancement

`Field` sets a Svelte **context** entry that the wrapped control can read to obtain the
ARIA values it should apply. The context key is `'field'` and its value is:

```ts
import { setContext } from 'svelte'

setContext('field', {
  inputId,           // string — the id the control should have
  hintId,            // string — "{inputId}-hint" — use as aria-describedby when hint/error present
  hasHint,           // boolean derived — true when hint or error prop is set
  hasError,          // boolean derived — true when error prop is set
})
```

`Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch` each call `getContext('field')`
in their script block and — **if the context is present** — automatically apply:
- `id={fieldCtx.inputId}` (overrides any `id` in `...rest` when context is present)
- `aria-describedby={fieldCtx.hintId}` when `fieldCtx.hasHint` is true
- `aria-invalid={fieldCtx.hasError ? 'true' : undefined}`

This is opt-in by context: when a control is used outside `Field`, no context is present,
and no automatic ARIA is applied (backward-compatible with standalone usage).

**Type for the context value** (shared across all form components):

```ts
// Defined in a shared file, e.g. src/lib/components/forms/field-context.ts
export interface FieldContext {
  inputId: string
  hintId: string
  hasHint: boolean
  hasError: boolean
}

export const FIELD_CONTEXT_KEY = 'field'
```

#### Context scope and reactivity

Svelte context is read once at component initialisation. Because `hasError` and `hasHint`
may change after initial render (e.g. validation), they must be **reactive stores** or
**`$state` proxies** for the child to observe changes. The recommended approach:

Use `setContext` with a reactive object — in Svelte 5 runes mode, passing a plain object
with `$derived` properties does not automatically propagate to `getContext` consumers
(context is read once). Instead, pass a plain object whose properties are updated in a
`$effect`, or use a Svelte 5 `$derived` at the call site by reading context values as
reactive props.

**Simpler chosen approach**: the child components read context once and apply the initial
ARIA values. For dynamic error changes (where `hasError` flips from false to true after
initial render), the child re-reads via a `$derived` that calls `getContext` — but since
context is not reactive, the simpler contract is:

> Consumers using `Field` must ensure the `error` prop is set before the child mounts,
> OR the child re-renders when `Field`'s props change (which happens naturally in Svelte
> when `Field` updates its slot content). Because the child is re-evaluated as part of
> `Field`'s reactive render, `getContext` returns the latest values on each render cycle.

In practice, `Field` calls `setContext` at the top level of its `<script>` using
`$derived` values, and the child `getContext` runs during the child's reactive update
cycle — so dynamic error changes propagate correctly when the child re-evaluates its
reactive expressions.

#### Field props — unchanged

The `Field` component props do not change. The enhancement is purely internal (adds
`setContext` call). The `label`, `inputId`, `hint`, `error`, `children`, and `...rest`
props remain identical to B7.

#### Backward compatibility

Consumers who still pass `id`, `aria-describedby`, and `aria-invalid` manually on the
wrapped control continue to work. The context-derived values are applied only when
context is present. If the consumer also passes `id` via `...rest`, the context `inputId`
takes precedence (it is applied directly as a prop binding, not via `...rest`).

Existing Field stories from B7 remain valid. The new "Auto ARIA Wiring" story
demonstrates the enhancement.

#### New Field story

**Story: "Auto ARIA Wiring"**

Template slot: `<Input />` (no manual `id`, `aria-invalid`, or `aria-describedby`).
`args`: `{ label: 'Email', inputId: 'auto-email', error: 'Invalid email address.' }`

Play:
- Query `getByRole('textbox')` — assert `getAttribute('id')` is `"auto-email"` (set by context).
- Assert `getAttribute('aria-invalid')` is `"true"` (set by context from `error` prop).
- Assert `getAttribute('aria-describedby')` is `"auto-email-hint"` (set by context).
- Assert `getByText('Invalid email address.')` is visible (hint span with id `"auto-email-hint"`).
- Assert the a11y addon reports no violations.

---

## Acceptance criteria

### General (all four new components + Field enhancement)

1. All four new component files exist at their specified paths within
   `src/lib/components/forms/`.
2. `src/lib/components/forms/index.ts` barrel-exports `Checkbox`, `Radio`, `RadioGroup`,
   and `Switch` as named exports in addition to the existing B7 exports.
3. `src/lib/index.ts` re-exports all four new components so that
   `import { Checkbox, Radio, RadioGroup, Switch } from '$lib'` resolves without error.
4. `pnpm check` (Svelte type-check) passes with zero errors on all new and modified files.
5. No component file contains a CSS `@import` or external file reference; all styles live
   in the component's own `<style>` block.
6. No hardcoded hex, rgb, or named colour values appear in any component `<style>` block;
   every colour reference uses a `var(--token)` CSS custom property.
7. No new component uses Svelte 4 `export let`; all props are declared via `$props()`.
8. Every new component spreads `...rest` onto its root interactive element so arbitrary
   HTML attributes are forwarded to the DOM.
9. All four story files exist at `src/lib/components/forms/<Name>.stories.svelte`,
   co-located with the components.
10. Every story file uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, and imports `expect` and `within` from
    `"storybook/test"` (no `@` prefix). Play functions are written inline on the `<Story>`
    tag. No TypeScript type annotations inside play function template expressions.
11. Every story `play` function passes when executed via `pnpm test`.

### Checkbox

12. `Checkbox` renders a native `<input type="checkbox">` element (accessible via
    `getByRole('checkbox')`).
13. The `<input>` is wrapped in a `<label>` element providing implicit accessible name
    association — clicking the label text toggles the checkbox.
14. When `checked={false}` (default), `getByRole('checkbox')` returns `not.toBeChecked()`.
15. When `checked={true}`, `getByRole('checkbox')` returns `toBeChecked()`.
16. When `indeterminate={true}` is passed, the DOM property `inputEl.indeterminate` is
    `true` after mount. The `aria-checked` attribute on the input is `"mixed"`.
17. When `disabled={true}`, `getByRole('checkbox')` returns `toBeDisabled()`. The wrap
    element's computed `opacity` is `"0.4"` and `cursor` is `"not-allowed"`.
18. Pressing `Space` when the checkbox has focus toggles the `checked` state (fires the
    native checkbox `change` event). After Space, `toBeChecked()` passes when started
    unchecked.
19. The checked visual indicator uses `var(--amber)` as the background colour (computed
    `backgroundColor` of the indicator span matches the resolved `--amber` value).
20. When `checked={false}`, the indicator's computed `backgroundColor` is transparent
    (`rgba(0, 0, 0, 0)` or equivalent).
21. A `:focus-visible` outline is visible on the indicator when the checkbox has keyboard
    focus. The a11y addon reports no focus-indicator violation on any Checkbox story.
22. `@storybook/addon-a11y` reports no accessibility violations on any Checkbox story.

### Radio

23. `Radio` renders a native `<input type="radio">` element (accessible via
    `getByRole('radio')`).
24. The `<input>` is wrapped in a `<label>` element providing implicit accessible name.
25. When `checked={false}`, `getByRole('radio')` returns `not.toBeChecked()`.
26. When `checked={true}`, `getByRole('radio')` returns `toBeChecked()`.
27. When `disabled={true}`, `getByRole('radio')` returns `toBeDisabled()`. The wrap
    element's computed `opacity` is `"0.4"`.
28. The `name` and `value` attributes passed via `...rest` are present on the rendered
    `<input>` element (forwarded correctly).
29. A `:focus-visible` outline is visible on the indicator when the radio has keyboard
    focus. The a11y addon reports no focus-indicator violation on any Radio story.
30. `@storybook/addon-a11y` reports no accessibility violations on any Radio story.

### RadioGroup

31. `RadioGroup` renders a `<fieldset>` element with a `<legend>` child containing the
    `legend` prop text.
32. `getByRole('group', { name: legendText })` returns the `<fieldset>` element.
33. `RadioGroup` renders one `<input type="radio">` per entry in the `options` array.
34. All radio inputs in the group share the same `name` attribute (the `name` prop value).
35. The radio whose `value` matches the `value` prop is checked (`toBeChecked()`); all
    others are unchecked.
36. When `value` is undefined/unset, no radio is checked.
37. When `disabled={true}` is passed to the group, all radio inputs are `toBeDisabled()`.
38. When an individual option has `disabled: true`, only that radio is `toBeDisabled()`;
    others remain enabled.
39. Pressing `ArrowDown` or `ArrowRight` when a radio in the group has focus moves DOM
    focus to the next enabled radio in the group (wrapping from last to first). After the
    key press, `document.activeElement` is the next radio's `<input>` element.
40. Pressing `ArrowUp` or `ArrowLeft` when a radio in the group has focus moves DOM focus
    to the previous enabled radio (wrapping from first to last).
41. Arrow key navigation skips disabled options (they are excluded from the cycle).
42. The selected radio (matching `value`) has `tabindex="0"`; all other radios have
    `tabindex="-1"` (roving tabindex).
43. `@storybook/addon-a11y` reports no accessibility violations on any RadioGroup story.

### Switch

44. `Switch` renders a `<button>` element (accessible via `getByRole('switch')`).
45. The button has `role="switch"` and `aria-checked` reflecting the `checked` prop:
    `"true"` when on, `"false"` when off.
46. The button has an accessible name provided by `aria-label={label}` (confirmed by
    `getByRole('switch', { name: labelText })` succeeding).
47. When `checked={false}`, the track's computed `backgroundColor` matches
    `var(--bg-sunken)`.
48. When `checked={true}`, the track's computed `backgroundColor` matches `var(--amber)`.
49. When `disabled={true}`, `getByRole('switch')` returns `toBeDisabled()`. The wrap
    element's computed `opacity` is `"0.4"`.
50. Pressing `Space` when the switch has focus toggles `checked` (native `<button>`
    click event via Space). After Space on an off switch: `aria-checked` is `"true"`.
51. No `$effect` or `browser` guard is needed because all state is CSS-driven. The
    component renders correctly in SSR (no browser-only APIs in the render path).
52. The track is pill-shaped: computed `borderRadius` is `"11px"` (or equivalent half
    of track height). Width is `40px`, height is `22px`.
53. `@storybook/addon-a11y` reports no accessibility violations on any Switch story.

### Field enhancement

54. `Field` calls `setContext('field', { inputId, hintId, hasHint, hasError })` in its
    `<script>` block using reactive (`$derived`) values.
55. When an `Input` component is placed inside `Field` without a manually-provided `id`,
    the rendered `<input>` has `id` equal to the `Field`'s `inputId` prop.
56. When `Field`'s `error` prop is set, the wrapped `Input` (placed in the slot without
    manual `aria-invalid`) has `aria-invalid="true"` on the rendered `<input>` element.
57. When `Field`'s `hint` or `error` prop is set, the wrapped `Input` has
    `aria-describedby="{inputId}-hint"` on the rendered `<input>` element.
58. When neither `hint` nor `error` is set on `Field`, the wrapped control does not have
    an `aria-describedby` attribute applied by context.
59. When a control is rendered outside `Field` (no context), no automatic `id`,
    `aria-invalid`, or `aria-describedby` is injected — existing standalone usage is
    unaffected (backward-compatible).
60. `Checkbox`, `Radio`, and `Switch`, when used inside `Field`, also receive the
    context-driven ARIA wiring (same as `Input`/`Textarea`).
61. The "Auto ARIA Wiring" story in `Field.stories.svelte` passes its play assertions:
    the inner `<Input />` (with no manual ARIA props) has `id="auto-email"`,
    `aria-invalid="true"`, and `aria-describedby="auto-email-hint"` automatically.
62. `@storybook/addon-a11y` reports no accessibility violations on any updated Field story.

### Stories

63. `Checkbox.stories.svelte` exists and defines stories with `title: 'Forms/Checkbox'`.
    Named stories: "Default (Unchecked)", "Checked", "Indeterminate", "Disabled Unchecked",
    "Disabled Checked", "Space to Toggle". Each has a play function that passes.
64. `Radio.stories.svelte` exists and defines stories with `title: 'Forms/Radio'`.
    Named stories: "Default (Unchecked)", "Checked", "Disabled", "Focus Styles".
    Each has a play function that passes.
65. `RadioGroup.stories.svelte` exists and defines stories with
    `title: 'Forms/RadioGroup'`. Named stories: "Default — No Selection", "With Selection",
    "Disabled Group", "Partially Disabled", "Keyboard Navigation". Each has a play
    function that passes.
66. `Switch.stories.svelte` exists and defines stories with `title: 'Forms/Switch'`.
    Named stories: "Off (Default)", "On", "Disabled Off", "Disabled On", "Space to Toggle",
    "Amber Track When On". Each has a play function that passes.
67. `Field.stories.svelte` gains an "Auto ARIA Wiring" story with a play function that
    passes. All previously existing Field stories continue to pass.

---

## Out of scope

- **Full form library integration** — `Field`, `Checkbox`, `Radio`, `RadioGroup`, and
  `Switch` do not integrate with SvelteKit `enhance`, `sveltekit-superforms`, or any
  validation library. Error state is driven by the `error` prop on `Field` only.
- **Multi-select or combobox** — `RadioGroup` is single-selection only.
- **Checkboxes in a group** — a `CheckboxGroup` compound component (analogous to
  `RadioGroup`) is out of scope. Multiple independent `Checkbox` components can be used
  side by side.
- **Custom click-target area for Checkbox/Radio beyond the label wrapper** — the implicit
  label association is the only supported click target.
- **Switch animated knob transition beyond CSS `transition`** — no spring/physics
  animations.
- **Palette toggle testing** — correct colours in Paper palette are audited by the a11y
  addon, not by explicit play-function assertions.
- **Visual regression / snapshot testing** — no screenshot comparisons.
- **`<input type="range">` or other input types** — out of scope for this item.
- **Fieldset grouping of `Checkbox` controls** — a semantically grouped checkbox list
  (with `<fieldset>` + `<legend>`) is out of scope; use `Field` + individual `Checkbox`
  components until a future item addresses this.

---

## Open questions

**OQ-1 (non-blocking): Svelte context reactivity for Field enhancement.**
In Svelte 5 runes mode, `setContext` / `getContext` is not reactive by default — the
child reads the context value at initialisation, not on subsequent parent prop changes.
The spec proposes that child components use `$derived` to re-read context values; however,
`getContext` called inside `$derived` does not re-run reactively (context values are
resolved once per component instance). If `Field.error` changes from `undefined` to a
string after initial mount (e.g. on form submit), the child may not update `aria-invalid`
without re-mounting. The test-writer should verify this with the "Auto ARIA Wiring" story
by testing the static case (error set before mount) first. Dynamic error wiring may
require an alternative pattern (e.g. passing error state through a Svelte 5 `$state`
object reference held in context). If dynamic wiring cannot be made reactive without
re-mounting, document this as a known limitation and add an OQ to `decisions.md`.
This does not block implementation.

**OQ-2 (non-blocking): RadioGroup `onchange` + story state wiring.**
The "Keyboard Navigation" story for `RadioGroup` needs to assert that `onchange` fires
and that the selected radio reflects the new value. Because a plain Storybook story does
not have a stateful parent, the play function can only assert DOM focus movement (AC-39),
not that the selected radio visually updates. The test-writer should use an `actions`
spy (Storybook `fn()`) to assert that `onchange` was called with the correct value string,
as an alternative to asserting the visual checked state. If `fn()` / action spies are not
available in the current Storybook version, document this and assert focus only.
This does not block implementation.

**OQ-3 (non-blocking): `indeterminate` ARIA serialisation.**
The `indeterminate` DOM property on `<input type="checkbox">` controls the
`aria-checked="mixed"` state via browser logic. This is correct behaviour per the HTML
spec. However, the test assertion `getAttribute('aria-checked')` on a native checkbox
input may not return `"mixed"` in all browsers — browsers expose `aria-checked` through
the accessibility tree but may not set the literal `aria-checked` HTML attribute.
The test-writer should use Testing Library's `expect(input).toHaveAttribute('aria-checked', 'mixed')`
or the accessibility tree query; if that fails, use `expect(input.indeterminate).toBe(true)`
as the primary assertion for AC-16.
This does not block implementation.

No open questions block implementation. B16 is ready for `test-writer`.
