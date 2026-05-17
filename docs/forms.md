# Forms

Form components share a terminal aesthetic: monospace font, `--bg-sunken` fill, amber focus border, and danger error border. All controls integrate with `Field` via Svelte context to auto-wire `id`, `aria-describedby`, and `aria-invalid`.

## Input

Single-line text input. Monospace font, full width, amber focus border, danger error border.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `error` | `boolean` | `false` | When true, applies the danger border colour. Also set automatically when inside a `Field` with an `error` prop. |
| `...rest` | `HTMLInputAttributes` | — | All native HTML input attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Input } from 'dxlb-design'

  let username = $state('')
</script>

<Input bind:value={username} placeholder="Enter username" />
<Input type="password" error={true} />
```

### Notable behaviour

- When nested inside a `Field`, `id`, `aria-describedby`, and `aria-invalid` are injected automatically via Svelte context — no manual wiring needed.
- `error` from the `Field` context overrides the local `error` prop (`resolvedError = error || fieldCtx?.hasError`).
- Disabled state applies 0.4 opacity and `cursor: not-allowed`.
- `border-radius: 0` — square corners throughout.

---

## Textarea

Multi-line text input. Same visual treatment as `Input` with `resize: vertical` and `min-height: 60px`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `error` | `boolean` | `false` | When true, applies the danger border colour. |
| `...rest` | `HTMLTextareaAttributes` | — | All native HTML textarea attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Textarea } from 'dxlb-design'

  let notes = $state('')
</script>

<Textarea bind:value={notes} placeholder="Add notes…" rows={4} />
```

### Notable behaviour

- `resize: vertical` — users can drag to increase height but not width.
- `min-height: 60px` — minimum usable height.
- Same `Field` context integration as `Input`.

---

## Select

Fully custom select control. No native `<select>` element — renders a trigger button and a `role="listbox"` panel.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ value: string; label: string }[]` | — | Array of selectable options. |
| `value` | `string` | `undefined` | Currently selected value. |
| `placeholder` | `string` | `'SELECT…'` | Label shown when no value is selected. |
| `error` | `boolean` | `false` | Applies danger border to the trigger. |
| `disabled` | `boolean` | `false` | Disables the control entirely. |
| `onchange` | `(value: string) => void` | `undefined` | Callback fired when the user selects an option. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Select } from 'dxlb-design'

  let selected = $state('')

  const options = [
    { value: 'vco', label: 'VCO' },
    { value: 'vcf', label: 'VCF' },
    { value: 'vca', label: 'VCA' },
  ]
</script>

<Select {options} bind:value={selected} onchange={(v) => console.log(v)} />
```

### Notable behaviour

- Opens a `role="listbox"` dropdown panel on click. The trigger button carries `aria-haspopup="listbox"`, `aria-expanded`, and `aria-activedescendant` (set to the highlighted option's id when open).
- Keyboard navigation: `ArrowDown`/`ArrowUp` cycle options; `Home` jumps to first; `End` jumps to last; `Enter` confirms the highlighted option; `Escape` closes without selecting.
- The panel closes on outside click (a `document` click listener is added when open and removed on close).
- Selected option is shown with a `✓` checkmark and amber colour.
- Highlighted option (keyboard focus) receives an amber outline.
- When open, the trigger button gains a 3px amber left border (`border-left-width: 3px`) and the chevron (`›`) rotates 90°.
- `internalValue` tracks the last confirmed selection independently of the `value` prop, so the display label updates immediately on selection even if the parent does not bind `value`.

---

## InputWrap

Wraps a form control with optional icon prefix, text addons (prefix/suffix), and a clear button.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `iconPre` | `Snippet` | `undefined` | Icon snippet rendered before the control in a fixed-width slot. |
| `addonPre` | `string` | `undefined` | Text addon rendered before the control (e.g. `'https://'`). |
| `addonSuf` | `string` | `undefined` | Text addon rendered after the control (e.g. `'.com'`). |
| `clearable` | `boolean` | `false` | Shows a clear (×) button when `value` is non-empty. |
| `value` | `string` | `''` | Current input value — used to show/hide the clear button. |
| `onclear` | `() => void` | `undefined` | Callback fired when the clear button is clicked. |
| `children` | `Snippet` | — | The wrapped form control (required). Pass an `Input` or other control. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root wrapper. |

### Usage

```svelte
<script>
  import { InputWrap, Input } from 'dxlb-design'

  let search = $state('')
</script>

<InputWrap
  addonPre="https://"
  clearable={true}
  value={search}
  onclear={() => { search = '' }}
>
  <Input bind:value={search} placeholder="example.com" />
</InputWrap>
```

### Usage with icon

```svelte
<script>
  import { InputWrap, Input } from 'dxlb-design'
</script>

<InputWrap>
  {#snippet iconPre()}
    <span>⌕</span>
  {/snippet}
  <Input placeholder="Search…" />
</InputWrap>
```

### Notable behaviour

- The clear button is absolutely positioned inside the wrapper; it is invisible (`opacity: 0; pointer-events: none`) when `value` is empty and becomes visible when `value.length > 0` and `clearable` is true.
- The clear button has `tabindex="-1"` when hidden to prevent keyboard focus on an invisible element.
- Addons share the same border as the input but use `--bg-elev` background to visually separate them.
- `iconPre` renders in a 34px wide slot with `--bg-elev` background; the right border is omitted so it appears joined to the input.

---

## Field

Labelled form field group. Provides a label, optional hint/error text, and Svelte context that child controls use to auto-wire accessibility attributes.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible label text. Rendered as a `<label for={inputId}>`. |
| `inputId` | `string` | — | The `id` of the associated control. Used for `<label for>` and passed via context. |
| `hint` | `string` | `undefined` | Optional helper text shown below the control. |
| `error` | `string` | `undefined` | Error message. When set, overrides `hint` and is shown in `--danger` colour. |
| `children` | `Snippet` | — | The form control(s) to wrap (required). |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Field, Input } from 'dxlb-design'
</script>

<Field label="Username" inputId="username" hint="Letters and numbers only.">
  <Input id="username" />
</Field>

<Field label="Email" inputId="email" error="Invalid email address.">
  <Input id="email" type="email" />
</Field>
```

### Notable behaviour

- Sets Svelte context under key `'field'`. Child `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, and `Switch` components read this context to auto-inject `id`, `aria-describedby`, and `aria-invalid` — the explicit `id` prop on the child is redundant when used inside `Field`.
- `hint` and `error` both set `hintId` (`${inputId}-hint`) which is passed as `aria-describedby` to the child control.
- When `error` is provided, `hasError` is true and child controls receive `aria-invalid="true"`.
- The hint/error text has `aria-live="polite"` so screen readers announce changes.
- Only one of `hint` or `error` is displayed at a time; `error` takes precedence.

---

## Checkbox

Accessible checkbox with an amber fill when checked and support for the indeterminate state.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible label text. Wraps the control in an implicit `<label>`. |
| `checked` | `boolean` | `false` | Bindable checked state. |
| `indeterminate` | `boolean` | `false` | When true, sets the native `input.indeterminate` property via `$effect`. |
| `disabled` | `boolean` | `undefined` | Disables the checkbox. |
| `...rest` | `HTMLInputAttributes` | — | All native HTML input attributes forwarded to the hidden input. |

### Usage

```svelte
<script>
  import { Checkbox } from 'dxlb-design'

  let accepted = $state(false)
</script>

<Checkbox label="Accept terms" bind:checked={accepted} />
<Checkbox label="Partial selection" indeterminate={true} />
<Checkbox label="Disabled" disabled />
```

### Notable behaviour

- The native `<input type="checkbox">` is visually hidden (1×1px, clipped). The visible indicator is a custom `<span>` element styled entirely in CSS.
- Checked: amber fill (`--amber`) with a `✓` glyph in `--bg` colour.
- Indeterminate: amber fill at 0.6 opacity with a `–` glyph. The `indeterminate` DOM property is set via `$effect` since it is not a standard HTML attribute.
- Focus ring is delegated to the indicator span via `:focus-visible`.
- `Field` context integration: `id`, `aria-describedby`, and `aria-invalid` are injected when nested inside a `Field`.

---

## Radio

Single radio button atom. Use inside `RadioGroup` for exclusive selection with keyboard navigation.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible label text. |
| `checked` | `boolean` | `false` | Whether this radio is selected. |
| `disabled` | `boolean` | `undefined` | Disables this radio. |
| `tabindex` | `number` | `undefined` | Tab index — managed by `RadioGroup` for roving tabindex. |
| `...rest` | `HTMLInputAttributes` | — | All native HTML input attributes forwarded (notably `name` and `value`). |

### Usage

```svelte
<script>
  import { Radio } from 'dxlb-design'
</script>

<!-- Standalone use (uncommon) -->
<Radio name="palette" value="phosphor" label="Phosphor" checked={true} />
<Radio name="palette" value="paper" label="Paper" />
```

### Notable behaviour

- The native `<input type="radio">` is visually hidden. The indicator is a 16×16px circle; when checked, an 8×8px amber inner dot appears via `::before`.
- Wrapped in `<label>` for an implicit accessible name — no `for`/`id` wiring required.
- `tabindex` is controlled externally by `RadioGroup` to implement roving tabindex. When used standalone, the browser manages focus naturally.
- `Field` context integration: `id`, `aria-describedby`, and `aria-invalid` are injected when nested inside a `Field`.

---

## RadioGroup

Renders a `<fieldset>` + `<legend>` containing a set of mutually exclusive `Radio` buttons with arrow-key navigation.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `legend` | `string` | — | Fieldset legend text. Styled as a small uppercase mono label. |
| `name` | `string` | — | `name` attribute shared by all radio inputs in the group. |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | — | Array of radio options. |
| `value` | `string` | `undefined` | Currently selected value. |
| `disabled` | `boolean` | `false` | Disables the entire group. |
| `onchange` | `(value: string) => void` | `undefined` | Callback fired when the selection changes. |
| `...rest` | `HTMLAttributes<HTMLFieldSetElement>` | — | All native HTML fieldset attributes forwarded. |

### Usage

```svelte
<script>
  import { RadioGroup } from 'dxlb-design'

  let palette = $state('phosphor')

  const options = [
    { value: 'phosphor', label: 'Phosphor (dark)' },
    { value: 'paper', label: 'Paper (light)' },
  ]
</script>

<RadioGroup
  legend="Colour palette"
  name="palette"
  {options}
  value={palette}
  onchange={(v) => { palette = v }}
/>
```

### Notable behaviour

- Implements roving tabindex: the selected radio (or the first enabled radio when nothing is selected) has `tabindex="0"`; all others have `tabindex="-1"`.
- Arrow keys (`ArrowDown`/`ArrowRight` move forward; `ArrowUp`/`ArrowLeft` move backward) cycle through enabled radios and fire `onchange`.
- Navigation skips disabled options by querying `input[type="radio"]:not([disabled])` inside the fieldset.
- The `disabled` prop on the group disables all radios and applies 0.4 opacity.

---

## Switch

Toggle switch rendered as a `role="switch"` button. Amber track when on. SSR-safe — all state is CSS-driven with no `$effect`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible label. Used as `aria-label` on the button and as visible label text beside the switch. |
| `checked` | `boolean` | `false` | Bindable on/off state. |
| `disabled` | `boolean` | `undefined` | Disables the switch. |
| `...rest` | `HTMLButtonAttributes` | — | All native HTML button attributes forwarded to the switch button. |

### Usage

```svelte
<script>
  import { Switch } from 'dxlb-design'

  let enabled = $state(false)
</script>

<Switch label="Enable notifications" bind:checked={enabled} />
<Switch label="Dark mode" checked={true} disabled />
```

### Notable behaviour

- Renders `role="switch"` with `aria-checked` on the `<button>` element. Space key toggles via the native button click handler.
- When `checked` is true, the track background becomes `--amber` and the knob translates from `translateX(2px)` to `translateX(20px)`.
- `aria-label` is set to the `label` prop value; a separate visible `<span>` also renders the label text beside the switch.
- `Field` context integration: `aria-describedby` and `aria-invalid` are injected when nested inside a `Field`. Unlike `Input`/`Checkbox`, the Switch does not receive an `id` from context since it is a `<button>` not an `<input>`.
- The disabled state sets `aria-disabled` on the button and applies 0.4 opacity via the wrapper span.
