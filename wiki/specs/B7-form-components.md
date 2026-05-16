# B7: Form components

## Context

B7 delivers five Svelte 5 components that implement the Dexterlabs form design: `Input`
(the styled native input), `Textarea` (the styled native textarea), `Select` (a custom
dropdown replacing the native `<select>`), `InputWrap` (a decorator layer that adds icon
prefix, text addon, or a clear button), and `Field` (the label + control + hint/error
wrapper that wires them all together for accessibility).

These components are **molecules** (Field, InputWrap) and **atoms** (Input, Textarea,
Select) in the B-layer build pyramid. They may import from:
- `src/lib/components/primitives/` — atoms already built (Button, Led, TagPill)
- `src/lib/components/layout/` — layout primitives already built (Stack, Inline, etc.)

They must not import from cards, navigation, feedback, or pattern layers.

The visual reference is `dexterlabs-design-system/project/preview/15-components-forms.html`.
Key design details extracted from that file:
- Sunken background (`var(--bg-sunken)`), `1px solid var(--rule-strong)` border
- Mono font, 13px, `letter-spacing: 0.02em`
- Focus: `border-color: var(--amber)`; Error: `border-color: var(--danger)`
- Disabled: `opacity: 0.4`, `cursor: not-allowed`
- Label: mono, 10px, uppercase, `var(--ink-faint)`
- Hint/error text: mono, 10px, `var(--ink-faint)` default / `var(--danger)` on error
- Icon prefix: `var(--bg-elev)` bg, `34px` wide, right border removed
- Text addon: `var(--bg-elev)` bg, same height as input, removable left/right border
- Clear button: `×` glyph, positioned absolutely at right, visible only when value is non-empty
- Select: custom trigger + floating panel; trigger amber-border on open; panel drops below
- Checkbox / radio: custom `appearance: none` styles; checked state uses `var(--amber)`
- Toggle: pill switch; not required in B7 (see Out of scope)

Related wiki pages:
- [requirements.md](../requirements.md) — R6 (form components), R1 (design tokens),
  constraints (Svelte 5 runes, strict TypeScript, `...rest` forwarding, SSR-safe, WCAG 2.1 AA)
- [architecture.md](../architecture.md) — component authoring conventions
- [decisions.md](../decisions.md) — D4 (Chakra-style), D5 (scoped CSS only), D1 (play functions only)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function rules

---

## Layer position

Form components are the fourth layer of the build pyramid (after atoms, layout, cards/nav).
They must not import from layers above themselves (feedback, patterns, data).

---

## Files produced

| File | Role |
|---|---|
| `src/lib/components/forms/Input.svelte` | Base styled input atom |
| `src/lib/components/forms/Input.stories.svelte` | Input stories + tests |
| `src/lib/components/forms/Textarea.svelte` | Styled textarea atom |
| `src/lib/components/forms/Textarea.stories.svelte` | Textarea stories + tests |
| `src/lib/components/forms/Select.svelte` | Custom select molecule |
| `src/lib/components/forms/Select.stories.svelte` | Select stories + tests |
| `src/lib/components/forms/InputWrap.svelte` | Decorator wrap molecule |
| `src/lib/components/forms/InputWrap.stories.svelte` | InputWrap stories + tests |
| `src/lib/components/forms/Field.svelte` | Label + control + hint/error wrapper |
| `src/lib/components/forms/Field.stories.svelte` | Field stories + tests |
| `src/lib/components/forms/index.ts` | Barrel export for all five components |
| `src/lib/index.ts` | Updated to re-export all five from `$lib` |

---

## Component specifications

### Input

`Input` is the base styled input atom. It renders a native `<input>` element with the
Dexterlabs mono style, four states (default, focus, error, disabled), and full attribute
forwarding.

#### Props interface

```ts
import type { HTMLInputAttributes } from 'svelte/elements'

interface Props extends HTMLInputAttributes {
  error?: boolean    // when true: amber border → danger border (error state)
}

let { error = false, ...rest }: Props = $props()
```

No `as` prop — `Input` always renders as `<input>`. The `type` attribute is forwarded
via `...rest` (defaults to `"text"` per the HTML specification if not provided).

#### HTML structure

```html
<input class="input" class:err={error} {...rest} />
```

The native `class` attribute from `...rest` must not clobber the scoped `"input"` class.
Svelte's `class` directive merges consumer-provided classes with the component's own
class string.

#### CSS

| Selector | Property | Value |
|---|---|---|
| `.input` | `font-family` | `var(--mono)` |
| `.input` | `font-size` | `13px` |
| `.input` | `letter-spacing` | `0.02em` |
| `.input` | `background` | `var(--bg-sunken)` |
| `.input` | `color` | `var(--ink)` |
| `.input` | `border` | `1px solid var(--rule-strong)` |
| `.input` | `padding` | `7px 10px` |
| `.input` | `outline` | `none` |
| `.input` | `width` | `100%` |
| `.input` | `transition` | `border-color var(--transition)` |
| `.input:focus` | `border-color` | `var(--amber)` |
| `.input.err` | `border-color` | `var(--danger)` |
| `.input:disabled` | `opacity` | `0.4` |
| `.input:disabled` | `cursor` | `not-allowed` |

No `border-radius` — Dexterlabs uses square corners on form inputs.

#### Accessibility

- `id` and `name` are forwarded via `...rest`; `Field` is responsible for linking
  `label[for]` to `input[id]`.
- When `error` is true, the component does NOT add `aria-invalid` itself — `Field` is
  responsible for this (it has the full picture of label+control+hint).
- However, when `Input` is used standalone (outside `Field`), the consumer should pass
  `aria-invalid="true"` via `...rest` when `error` is true.
- `:focus-visible` outline must not be suppressed — `outline: none` on `.input` removes
  the browser default, so the focus state is delivered entirely by `border-color: var(--amber)`.
  This is sufficient provided the amber border change meets WCAG 3:1 non-text contrast
  against adjacent backgrounds in both palettes. (See OQ-1.)

#### Story specifications

File: `src/lib/components/forms/Input.stories.svelte`
Title: `'Forms/Input'`
`component: Input` in `defineMeta`.

**Story: "Default"**
- `args`: `{ type: 'text', placeholder: 'Placeholder…' }`
- Play: query `getByRole('textbox')` — assert visible, enabled. Assert `getComputedStyle`
  `backgroundColor` matches `var(--bg-sunken)`. Assert `borderTopStyle` is `"solid"` and
  `borderTopWidth` is `"1px"`. Assert `fontFamily` contains the `--mono` font name.

**Story: "With Value"**
- `args`: `{ type: 'text', value: 'CONDUIT-PDX2' }`
- Play: assert `getByRole('textbox')` has value `"CONDUIT-PDX2"`.

**Story: "Error State"**
- `args`: `{ type: 'text', value: 'bad@input', error: true }`
- Play: query `getByRole('textbox')` — assert computed `borderColor` matches
  `var(--danger)`. Assert element is visible and enabled.

**Story: "Disabled"**
- `args`: `{ type: 'text', value: 'read-only', disabled: true }`
- Play: query `getByRole('textbox')` — assert `toBeDisabled()`. Assert computed
  `opacity` is `"0.4"`. Assert computed `cursor` is `"not-allowed"`.

**Story: "Email"**
- `args`: `{ type: 'email', placeholder: 'you@domain.com' }`
- Play: query `getByRole('textbox')` — assert `getAttribute('type')` is `'email'`.

---

### Textarea

`Textarea` renders a native `<textarea>` element sharing the same `.input` visual style
as `Input`. It adds `resize: vertical` and a `min-height`.

#### Props interface

```ts
import type { HTMLTextareaAttributes } from 'svelte/elements'

interface Props extends HTMLTextareaAttributes {
  error?: boolean
}

let { error = false, ...rest }: Props = $props()
```

#### HTML structure

```html
<textarea class="input" class:err={error} {...rest}></textarea>
```

#### CSS

All rules from Input's `.input` apply. Additional:

| Selector | Property | Value |
|---|---|---|
| `.input` | `resize` | `vertical` |
| `.input` | `min-height` | `60px` |
| `.input` | `line-height` | `1.5` |

The `.input:focus`, `.input.err`, `.input:disabled` rules are identical to `Input`.

#### Accessibility

Same as `Input`. `id` and `name` forwarded via `...rest`. `Field` wires `aria-invalid`
and `aria-describedby`.

#### Story specifications

File: `src/lib/components/forms/Textarea.stories.svelte`
Title: `'Forms/Textarea'`
`component: Textarea` in `defineMeta`.

**Story: "Default"**
- `args`: `{ placeholder: 'What changed, what broke, what shipped…' }`
- Play: query `canvasElement.querySelector('textarea')` — assert visible. Assert computed
  `resize` is `"vertical"`. Assert computed `minHeight` is `"60px"`.

**Story: "With Content"**
- In slot (children are forwarded as the textarea's default value in Svelte): use `args`
  `value` attribute instead — `args: { value: 'Conduit arrived. Rail draws 62mA @ +12V.' }`
- Play: query textarea — assert its value is `"Conduit arrived. Rail draws 62mA @ +12V."`.

**Story: "Error State"**
- `args`: `{ error: true, value: 'Bad data' }`
- Play: assert computed `borderColor` matches `var(--danger)`.

**Story: "Disabled"**
- `args`: `{ disabled: true, value: 'Locked content' }`
- Play: query textarea — assert `toBeDisabled()`. Assert computed `opacity` is `"0.4"`.

---

### Select

`Select` is a **custom dropdown** — it does not use the native `<select>` element.
The design system specifies a bespoke trigger + floating option panel (see the reference
HTML `15-components-forms.html`, `.dxl-select`/`.dxl-trigger`/`.dxl-panel`/`.dxl-option`).

The component is **controlled**: the consumer passes `value` (the currently selected
option value) and an `onchange` callback (which receives the new string value). This is
the Svelte 5 pattern — the component does not hold internal selection state; that belongs
in the consumer.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

interface SelectOption {
  value: string
  label: string
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  options: SelectOption[]  // the list of options to display
  value?: string           // the currently selected value; undefined = no selection
  placeholder?: string     // text shown when no value is selected; defaults to 'SELECT…'
  error?: boolean          // error border state on the trigger
  disabled?: boolean       // prevents interaction when true
  onchange?: (value: string) => void  // called when the user picks an option
}

let {
  options,
  value = undefined,
  placeholder = 'SELECT…',
  error = false,
  disabled = false,
  onchange,
  ...rest
}: Props = $props()
```

Internal state (Svelte 5 `$state`):

```ts
let open = $state(false)
```

`$derived` for the displayed label:

```ts
let displayLabel = $derived(
  options.find(o => o.value === value)?.label ?? placeholder
)
```

#### HTML structure

```html
<div class="select" class:disabled={disabled} {...rest}>
  <button
    type="button"
    class="select-trigger"
    class:open={open}
    class:err={error}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-disabled={disabled}
    disabled={disabled}
    onclick={handleTriggerClick}
  >
    <span class="select-value">{displayLabel}</span>
    <span class="select-chevron" aria-hidden="true">›</span>
  </button>
  {#if open}
    <ul
      class="select-panel"
      role="listbox"
      aria-label="Options"
    >
      {#each options as option}
        <li
          class="select-option"
          class:selected={option.value === value}
          role="option"
          aria-selected={option.value === value}
          onclick={() => handleSelect(option.value)}
        >
          {option.label}
          {#if option.value === value}
            <span class="select-check" aria-hidden="true">✓</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

`handleTriggerClick`:
- If `disabled`, return immediately.
- Toggle `open`.

`handleSelect(newValue)`:
- Set `open = false`.
- Call `onchange?.(newValue)`.

**Close on outside click**: a `$effect` registers a `document` click listener that sets
`open = false` when the click target is not inside the `.select` element. The effect must
guard with the `browser` import from `$app/environment` to remain SSR-safe. The listener
is removed in the effect's cleanup return function.

```ts
import { browser } from '$app/environment'

$effect(() => {
  if (!browser || !open) return
  const handler = (e: MouseEvent) => {
    if (!(e.target as Node).isEqualNode(null) && !rootEl?.contains(e.target as Node)) {
      open = false
    }
  }
  document.addEventListener('click', handler)
  return () => document.removeEventListener('click', handler)
})
```

Where `rootEl` is a reference obtained via `bind:this` on the root `<div>`.

#### CSS

| Selector | Property | Value |
|---|---|---|
| `.select` | `position` | `relative` |
| `.select` | `width` | `100%` |
| `.select` | `user-select` | `none` |
| `.select-trigger` | `display` | `flex` |
| `.select-trigger` | `align-items` | `center` |
| `.select-trigger` | `justify-content` | `space-between` |
| `.select-trigger` | `font-family` | `var(--mono)` |
| `.select-trigger` | `font-size` | `13px` |
| `.select-trigger` | `letter-spacing` | `0.04em` |
| `.select-trigger` | `text-transform` | `uppercase` |
| `.select-trigger` | `background` | `var(--bg-sunken)` |
| `.select-trigger` | `color` | `var(--ink)` |
| `.select-trigger` | `border` | `1px solid var(--rule-strong)` |
| `.select-trigger` | `padding` | `7px 10px` |
| `.select-trigger` | `width` | `100%` |
| `.select-trigger` | `cursor` | `pointer` |
| `.select-trigger` | `transition` | `border-color var(--transition)` |
| `.select-trigger:hover` | `border-color` | `var(--amber)` |
| `.select-trigger.open` | `border-color` | `var(--amber)` |
| `.select-trigger.open` | `border-left-width` | `3px` |
| `.select-trigger.open` | `padding-left` | `8px` |
| `.select-trigger.err` | `border-color` | `var(--danger)` |
| `.select-trigger:disabled` | `opacity` | `0.4` |
| `.select-trigger:disabled` | `cursor` | `not-allowed` |
| `.select-chevron` | `font-family` | `var(--mono)` |
| `.select-chevron` | `font-size` | `14px` |
| `.select-chevron` | `color` | `var(--amber)` |
| `.select-chevron` | `transition` | `transform var(--transition)` |
| `.select-trigger.open .select-chevron` | `transform` | `rotate(90deg)` |
| `.select-panel` | `position` | `absolute` |
| `.select-panel` | `top` | `100%` |
| `.select-panel` | `left` | `0` |
| `.select-panel` | `right` | `0` |
| `.select-panel` | `z-index` | `50` |
| `.select-panel` | `background` | `var(--bg-elev)` |
| `.select-panel` | `border` | `1px solid var(--amber)` |
| `.select-panel` | `border-top` | `none` |
| `.select-panel` | `list-style` | `none` |
| `.select-panel` | `margin` | `0` |
| `.select-panel` | `padding` | `0` |
| `.select-option` | `font-family` | `var(--mono)` |
| `.select-option` | `font-size` | `12px` |
| `.select-option` | `letter-spacing` | `0.04em` |
| `.select-option` | `text-transform` | `uppercase` |
| `.select-option` | `padding` | `8px 10px` |
| `.select-option` | `cursor` | `pointer` |
| `.select-option` | `color` | `var(--ink-dim)` |
| `.select-option` | `border-bottom` | `1px solid var(--rule)` |
| `.select-option:last-child` | `border-bottom` | `none` |
| `.select-option:hover` | `background` | `var(--bg-rail)` |
| `.select-option:hover` | `color` | `var(--ink)` |
| `.select-option.selected` | `color` | `var(--amber)` |
| `.select-check` | `font-size` | `11px` |
| `.select-check` | `color` | `var(--amber)` |

#### Keyboard behaviour

- Trigger button receives normal keyboard focus (it is a `<button>`).
- `Enter` or `Space` on the trigger opens/closes the panel (native button behaviour).
- Arrow keys on option list items: not required for B7 (see Out of scope).
- `Escape` closes the panel: a `keydown` listener on the root div closes the panel
  on `key === 'Escape'`.

#### Accessibility

- Root `<div>` has no ARIA role — it is a presentation wrapper.
- Trigger `<button>` has `aria-haspopup="listbox"` and `aria-expanded` reflecting `open`.
- Panel `<ul>` has `role="listbox"`.
- Each `<li>` has `role="option"` and `aria-selected` reflecting whether it is the
  current value.
- `aria-disabled` on the trigger when `disabled` is true.
- When `error` is true and Select is used standalone, consumer must pass `aria-invalid`
  via `...rest` on the root div (or `Field` sets it; see Field spec).

#### Story specifications

File: `src/lib/components/forms/Select.stories.svelte`
Title: `'Forms/Select'`
`component: Select` in `defineMeta`.

For stories that need to track selected value across interactions, use a Svelte
`$state` variable declared in the story's inline script. Because the stories file is
a `.stories.svelte` module, you can use a `<script>` block per-story inside the template
slot, or manage state via the args mechanism. For Select stories, use a stateful wrapper
pattern within the play function using `userEvent.click`.

**Story: "Default"**
- `args`: `{ options: [{ value: 'osc', label: 'Oscillator' }, { value: 'env', label: 'Envelope' }, { value: 'util', label: 'Utility' }], placeholder: 'SELECT…' }`
- Play: assert `getByRole('button')` is visible and enabled. Assert button text contains
  `"SELECT…"`. Assert `getAttribute('aria-expanded')` is `"false"`. Assert no element
  with `role="listbox"` is in the DOM (panel is closed).

**Story: "Open Panel"**
- `args`: same options. `play` function clicks the trigger button.
- Play: click `getByRole('button')` via `userEvent.click`. Assert `getByRole('listbox')`
  is now visible. Assert there are 3 elements with `role="option"`. Assert
  `getAttribute('aria-expanded')` on the trigger button is `"true"`.

**Story: "With Selection"**
- `args`: `{ options: [...], value: 'env' }`
- Play: assert trigger button text contains `"Envelope"`. Open panel — assert the
  "Envelope" option has `aria-selected="true"`. Assert other options have
  `aria-selected="false"`.

**Story: "Disabled"**
- `args`: `{ options: [...], disabled: true }`
- Play: assert `getByRole('button')` is disabled. Assert computed `opacity` is `"0.4"`.

**Story: "Error State"**
- `args`: `{ options: [...], error: true }`
- Play: assert trigger button computed `borderColor` matches `var(--danger)`.

---

### InputWrap

`InputWrap` is a layout molecule that wraps an `Input` (or `Textarea`) to add an icon
prefix, text addon prefix, text addon suffix, or a clear button. Multiple decorators
can be combined (e.g. icon prefix + clear button).

The wrapped `Input` is provided as a Svelte snippet child — the consumer places the
`<Input>` inside `<InputWrap>`. `InputWrap` does not create the input; it only decorates it.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface Props extends HTMLAttributes<HTMLDivElement> {
  iconPre?: Snippet        // snippet rendering an SVG icon (or any node) for the left prefix slot
  addonPre?: string        // text string for a text addon prefix (e.g. '+12V', '€')
  addonSuf?: string        // text string for a text addon suffix (e.g. 'mA', 'kg')
  clearable?: boolean      // when true, renders a × clear button on the right
  value?: string           // the current input value — used to show/hide the clear button
  onclear?: () => void     // called when the clear button is clicked
  children: Snippet        // the Input/Textarea/Select placed inside the wrap
}

let {
  iconPre,
  addonPre,
  addonSuf,
  clearable = false,
  value = '',
  onclear,
  children,
  ...rest
}: Props = $props()
```

Derived state:

```ts
let showClear = $derived(clearable && (value?.length ?? 0) > 0)
```

#### HTML structure

```html
<div class="input-wrap" {...rest}>
  {#if iconPre}
    <span class="icon-pre" aria-hidden="true">
      {@render iconPre()}
    </span>
  {/if}
  {#if addonPre}
    <span class="addon addon-pre">{addonPre}</span>
  {/if}
  {@render children()}
  {#if addonSuf}
    <span class="addon addon-suf">{addonSuf}</span>
  {/if}
  {#if clearable}
    <button
      type="button"
      class="clear-btn"
      class:visible={showClear}
      aria-label="Clear"
      tabindex={showClear ? 0 : -1}
      onclick={onclear}
    >
      ×
    </button>
  {/if}
</div>
```

The `<Input>` child must add `padding-right: 28px` when a clear button is present
(`showClear` is true). Because `InputWrap` cannot reach into the child's styles, the
consumer is responsible for passing `class="has-clear"` or appropriate padding to the
`<Input>` — or `InputWrap` exposes a `data-has-clear` attribute on the root div so the
child can use a descendant CSS selector. **Chosen approach**: `InputWrap` adds a
`data-has-clear` attribute on the root when `clearable && showClear`, and `Input`'s
scoped CSS includes:

```css
/* This rule applies within InputWrap context */
:global([data-has-clear]) .input {
  padding-right: 28px;
}
```

Because Svelte scopes styles per component, the `Input` component cannot know about its
parent's structure. The simplest correct approach is: `InputWrap` renders a thin wrapper
`div` with `data-has-clear` when the clear button is visible, and the Input component
adds an optional `hasClear` prop (`hasClear?: boolean`) that adjusts `padding-right`.
This keeps style ownership inside the component. **Final decision**: `Input` accepts an
optional `hasClear?: boolean` prop; when true, `padding-right` is `28px`. The consumer
(or `InputWrap` documentation) instructs the user to pass `hasClear={showClear}` to the
`Input` child. Alternatively, `InputWrap` passes `hasClear` via Svelte context. For
simplicity in B7, the consumer is responsible for passing `style="padding-right:28px"`
or the `hasClear` prop when using a clearable `InputWrap`.

> **Simpler implementation guidance**: For B7, `InputWrap` renders a visible `×` button
> absolutely positioned. The inner `<Input>` child automatically has `padding-right:28px`
> only when the consumer explicitly passes `style` or a class. The clear button overlap
> with no padding is a known cosmetic issue for B7; padding-right coordination is
> deferred to B11 (catalogue stories that wire it up end-to-end).

#### CSS

| Selector | Property | Value |
|---|---|---|
| `.input-wrap` | `position` | `relative` |
| `.input-wrap` | `display` | `flex` |
| `.input-wrap` | `align-items` | `stretch` |
| `.icon-pre` | `display` | `flex` |
| `.icon-pre` | `align-items` | `center` |
| `.icon-pre` | `justify-content` | `center` |
| `.icon-pre` | `width` | `34px` |
| `.icon-pre` | `flex-shrink` | `0` |
| `.icon-pre` | `background` | `var(--bg-elev)` |
| `.icon-pre` | `border` | `1px solid var(--rule-strong)` |
| `.icon-pre` | `border-right` | `none` |
| `.icon-pre` | `color` | `var(--ink-faint)` |
| `.addon` | `display` | `flex` |
| `.addon` | `align-items` | `center` |
| `.addon` | `padding` | `0 10px` |
| `.addon` | `background` | `var(--bg-elev)` |
| `.addon` | `border` | `1px solid var(--rule-strong)` |
| `.addon` | `font-family` | `var(--mono)` |
| `.addon` | `font-size` | `13px` |
| `.addon` | `color` | `var(--ink-faint)` |
| `.addon` | `white-space` | `nowrap` |
| `.addon` | `letter-spacing` | `0.04em` |
| `.addon-pre` | `border-right` | `none` |
| `.addon-suf` | `border-left` | `none` |
| `.clear-btn` | `position` | `absolute` |
| `.clear-btn` | `right` | `8px` |
| `.clear-btn` | `top` | `50%` |
| `.clear-btn` | `transform` | `translateY(-50%)` |
| `.clear-btn` | `font-family` | `var(--mono)` |
| `.clear-btn` | `font-size` | `14px` |
| `.clear-btn` | `line-height` | `1` |
| `.clear-btn` | `color` | `var(--ink-faint)` |
| `.clear-btn` | `cursor` | `pointer` |
| `.clear-btn` | `background` | `none` |
| `.clear-btn` | `border` | `none` |
| `.clear-btn` | `padding` | `2px 4px` |
| `.clear-btn` | `transition` | `color var(--transition)` |
| `.clear-btn` | `visibility` | `hidden` |
| `.clear-btn.visible` | `visibility` | `visible` |
| `.clear-btn:hover` | `color` | `var(--ink)` |

Note: using `visibility: hidden` / `visibility: visible` (not `display: none` /
`display: block`) preserves the button's space in the layout and avoids jank when
toggling — but since the clear button is absolutely positioned, `display: none` is also
acceptable. The reference HTML used `display: none` / `display: block`. Either is valid.

#### Accessibility

- `icon-pre` is `aria-hidden="true"` — it is purely decorative.
- The clear button has `aria-label="Clear"` to provide an accessible name.
- When `showClear` is false, the clear button has `tabindex="-1"` so it is not
  keyboard-reachable in its hidden state.
- `addonPre` and `addonSuf` text spans are informational visual labels — screen readers
  will read them as they are encountered in DOM order. If the addon is not informative
  for AT, the consumer may add `aria-hidden="true"` via `...rest` on the `InputWrap`.

#### Story specifications

File: `src/lib/components/forms/InputWrap.stories.svelte`
Title: `'Forms/InputWrap'`
`component: InputWrap` in `defineMeta`.

Stories that render multiple elements (InputWrap + inner Input) should use a
composition pattern in the story slot. Because `component: InputWrap` is set, the
slot content is rendered inside the `InputWrap`; the inner `<Input>` goes in the slot.

**Story: "With Icon Prefix"**

Use a `iconPre` snippet via `args` — because snippet args are not directly supported
in `defineMeta`, this story places the `<Input>` child in the slot and uses a manual
snippet on the `iconPre` prop. In practice, `InputWrap.stories.svelte` renders the
icon prefix via the story slot pattern.

Since `component: InputWrap` is set, the story's slot content becomes InputWrap's
`children`. The `iconPre` prop is a snippet — it cannot be passed via `args` (snippets
are not serializable). Therefore this story file should set `component: InputWrap` but
the `iconPre` prop must be rendered by creating an alternative composition story or by
using `defineMeta` without `component:` for stories that need snippets.

**Revised approach for InputWrap stories**: Create a primary story file
`InputWrap.stories.svelte` with `component: InputWrap` that covers stories NOT requiring
snippet props (e.g. `addonPre`, `addonSuf`, `clearable`, `value`). Create a second file
`InputWrap.composition.stories.svelte` (no `component:` in `defineMeta`) for stories
that need `iconPre`.

**Story: "Addon Prefix"** (primary file, `component: InputWrap`)
- `args`: `{ addonPre: '+12V' }`
- Slot: `<Input type="number" value="75" />`
- Play: assert `getByText('+12V')` is visible. Assert computed `backgroundColor` of the
  addon span matches `var(--bg-elev)`. Assert `getByRole('spinbutton')` is visible.

**Story: "Addon Suffix"** (primary file)
- `args`: `{ addonSuf: 'mA' }`
- Slot: `<Input type="number" value="62" />`
- Play: assert `getByText('mA')` is visible.

**Story: "Clearable — No Value"** (primary file)
- `args`: `{ clearable: true, value: '' }`
- Slot: `<Input type="text" />`
- Play: query `getByRole('button', { name: 'Clear' })` — assert it is not visible
  (hidden state; `visibility: hidden` means `toBeVisible()` fails for hidden element).

**Story: "Clearable — With Value"** (primary file)
- `args`: `{ clearable: true, value: 'DISTRANS-AR1' }`
- Slot: `<Input type="text" value="DISTRANS-AR1" />`
- Play: assert `getByRole('button', { name: 'Clear' })` is visible.

**Story: "Icon Prefix"** (`InputWrap.composition.stories.svelte`, no `component:`)
- Renders `<InputWrap>` manually in the slot with an `iconPre` snippet containing an
  SVG envelope icon, wrapping an `<Input type="email" />`.
- Play: assert the `<input>` is visible. Assert `getByRole('textbox')` is visible.
  Assert no accessible name violation (a11y).

---

### Field

`Field` is the molecule that wires a form control to its label and optional hint/error
message. It is the primary a11y integration point: it associates `label[for]` → `input[id]`,
adds `aria-invalid` to the control when in error state, and adds `aria-describedby`
pointing to the hint/error element.

`Field` is a layout-only molecule: it does not know what control is inside it. The
consumer places any control (`<Input>`, `<Textarea>`, `<Select>`, `<InputWrap>`) in the
`children` snippet.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface Props extends HTMLAttributes<HTMLDivElement> {
  label: string            // the visible label text (required)
  inputId: string          // the id that connects label[for] to the control's id attribute
  hint?: string            // helper text below the control (shown in default state)
  error?: string           // error message below the control (overrides hint when set)
  children: Snippet        // the form control(s)
}

let {
  label,
  inputId,
  hint,
  error,
  children,
  ...rest
}: Props = $props()
```

Derived:

```ts
let hintId = $derived(`${inputId}-hint`)
let hasError = $derived(!!error)
let hintText = $derived(error ?? hint)
```

#### HTML structure

```html
<div class="field" {...rest}>
  <label for={inputId} class="field-label">{label}</label>
  {@render children()}
  {#if hintText}
    <span id={hintId} class="field-hint" class:err={hasError} aria-live="polite">
      {hintText}
    </span>
  {/if}
</div>
```

The child control MUST be given:
- `id={inputId}` — so the `label[for]` association works
- `aria-describedby={hintId}` — when `hint` or `error` is present
- `aria-invalid="true"` — when `error` is set

Because `Field` cannot directly mutate the child element's attributes (Svelte does not
support slot prop injection), these attributes are the **consumer's responsibility**. The
spec documents the required convention:

> When using `Field`, always pass `id={inputId}`, `aria-describedby="{inputId}-hint"` (when
> hint/error is present), and `aria-invalid={!!error}` directly on the wrapped control.

Field stories will use a `data-testid` attribute pattern on the wrapped `<Input>` to
verify the association, not a programmatic injection.

#### CSS

| Selector | Property | Value |
|---|---|---|
| `.field` | `display` | `flex` |
| `.field` | `flex-direction` | `column` |
| `.field` | `gap` | `4px` |
| `.field` | `min-width` | `0` |
| `.field-label` | `font-family` | `var(--mono)` |
| `.field-label` | `font-size` | `10px` |
| `.field-label` | `letter-spacing` | `0.1em` |
| `.field-label` | `text-transform` | `uppercase` |
| `.field-label` | `color` | `var(--ink-faint)` |
| `.field-label` | `display` | `block` |
| `.field-hint` | `font-family` | `var(--mono)` |
| `.field-hint` | `font-size` | `10px` |
| `.field-hint` | `letter-spacing` | `0.04em` |
| `.field-hint` | `color` | `var(--ink-faint)` |
| `.field-hint.err` | `color` | `var(--danger)` |

#### Accessibility

- `<label for={inputId}>` — associates the label with the native control. For `Select`
  (which uses a `<button>` not an `<input>`), the `for` attribute does not natively wire
  up; consumers should additionally set `aria-labelledby` on the Select trigger button
  pointing to the label element. This is documented as a consumer responsibility in B7
  and addressed in a future accessibility refinement. See OQ-2.
- `<span id="{inputId}-hint" aria-live="polite">` — the hint/error span has a stable id
  so the wrapped control can reference it via `aria-describedby`.
- `aria-live="polite"` on the hint span — ensures screen readers announce the error
  message when it appears after initial render (e.g. after form submission).
- The wrapped control must have `aria-invalid="true"` when `error` is set; this is the
  consumer's responsibility as described above.

#### Story specifications

File: `src/lib/components/forms/Field.stories.svelte`
Title: `'Forms/Field'`
`component: Field` in `defineMeta` — however, because Field always wraps a child
control (which goes in the slot), this works correctly with `component: Field`.

**Story: "Default — Hint"**

Template slot: `<Input id="bench-note" aria-describedby="bench-note-hint" type="text" placeholder="Placeholder…" />`
`args`: `{ label: 'Bench Note', inputId: 'bench-note', hint: 'Describe the work session.' }`

Play:
- Query `getByLabelText('Bench Note')` — assert it is visible and returns the `<input>`
  element (confirms `label[for]` → `input[id]` association).
- Assert `getByText('Describe the work session.')` is visible.
- Assert the hint span's computed `color` matches `var(--ink-faint)` (not danger).

**Story: "Error State"**

Template slot: `<Input id="email-field" aria-describedby="email-field-hint" aria-invalid="true" error={true} type="email" value="bad@" />`
`args`: `{ label: 'Email', inputId: 'email-field', error: 'Invalid email address.' }`

Play:
- Query `getByLabelText('Email')` — assert visible. Assert `getAttribute('aria-invalid')`
  is `"true"`.
- Query `getByText('Invalid email address.')` — assert visible.
- Assert hint span's computed `color` matches `var(--danger)`.
- Assert `getByRole('textbox', { name: 'Email' })` `aria-describedby` is
  `"email-field-hint"`.

**Story: "Disabled"**

Template slot: `<Input id="locked-field" type="text" value="read-only" disabled />`
`args`: `{ label: 'Locked', inputId: 'locked-field', hint: 'Field is locked.' }`

Play:
- Query `getByLabelText('Locked')` — assert `toBeDisabled()`.
- Assert `getByText('Field is locked.')` is visible.

**Story: "With Textarea"**

Template slot: `<Textarea id="notes-field" aria-describedby="notes-field-hint" />`
`args`: `{ label: 'Notes', inputId: 'notes-field', hint: 'Up to 500 characters.' }`

Play:
- Query `getByLabelText('Notes')` — assert it is a `<textarea>` (tagName `"TEXTAREA"`).

**Story: "Required Field"**

Template slot: `<Input id="project-name" type="text" required />`
`args`: `{ label: 'Project Name', inputId: 'project-name' }`

Play:
- Query `getByRole('textbox', { name: 'Project Name' })` — assert `toBeRequired()`.
- Assert no hint/error span is rendered (no `hint` or `error` prop).

---

## CSS token reference

All form component styles use only the following CSS custom properties. No hardcoded
hex, rgb, or named colours are permitted in any `<style>` block.

| Token | Usage |
|---|---|
| `var(--mono)` | All font-family values |
| `var(--bg-sunken)` | Input/Textarea/Select trigger background |
| `var(--bg-elev)` | Icon prefix, addon, select panel background |
| `var(--bg-rail)` | Select option hover background |
| `var(--ink)` | Default text colour |
| `var(--ink-dim)` | Select option default text colour |
| `var(--ink-faint)` | Label, hint text, icon/addon colour, disabled text |
| `var(--rule-strong)` | Default border colour |
| `var(--amber)` | Focus border, select trigger open border, chevron, selected option |
| `var(--danger)` | Error border, error hint text |
| `var(--transition)` | All CSS transitions |

---

## Acceptance criteria

### General (all five components)

1. All five component files exist at their specified paths within `src/lib/components/forms/`.
2. `src/lib/components/forms/index.ts` barrel-exports `Input`, `Textarea`, `Select`,
   `InputWrap`, and `Field` as named exports.
3. `src/lib/index.ts` re-exports all five so that
   `import { Input, Textarea, Select, InputWrap, Field } from '$lib'` resolves without
   error in a SvelteKit consumer.
4. `pnpm check` (Svelte type-check) passes with zero errors on all five component files
   and both barrel files.
5. No component file contains a `@import` or any external CSS file reference; all styles
   live in the component's own `<style>` block.
6. No hardcoded hex, rgb, or named colour values appear in any component's `<style>`
   block; every colour reference uses a `var(--token)` CSS custom property.
7. No component uses Svelte 4 `export let`; all props are declared via `$props()`.
8. Every component spreads `...rest` onto its root element so arbitrary HTML attributes
   passed by consumers are forwarded to the DOM.
9. All five story files exist at `src/lib/components/forms/<Name>.stories.svelte`,
   co-located with the components.
10. Every story file uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, and imports `expect` and `within` from
    `"storybook/test"` (no `@` prefix). Play functions are written inline on the
    `<Story>` tag — no named `const` play functions in the module script block. No
    TypeScript type annotations inside play function template expressions.
11. Every story `play` function passes when executed via `pnpm test`
    (`@storybook/addon-vitest` Vitest browser mode).

### Input

12. `<Input>` renders as a native `<input>` element.
13. The default `type` is `"text"` (HTML specification default; no type attribute is
    explicitly set by the component — it relies on the HTML default).
14. Computed `backgroundColor` of the input matches `var(--bg-sunken)`.
15. Computed `fontFamily` of the input includes the JetBrains Mono font name (the
    `--mono` font stack's first family).
16. Computed `borderTopWidth` is `"1px"`, `borderTopStyle` is `"solid"`, and
    `borderTopColor` matches `var(--rule-strong)`.
17. When `error={true}` is passed, the computed `borderColor` matches `var(--danger)`.
18. When `disabled={true}` is passed: `getByRole('textbox')` returns `toBeDisabled()`;
    computed `opacity` is `"0.4"`; computed `cursor` is `"not-allowed"`.
19. A `placeholder` attribute passed via `...rest` appears on the rendered `<input>`.
20. An `id` attribute passed via `...rest` appears on the rendered `<input>`.
21. `@storybook/addon-a11y` reports no accessibility violations on any Input story.

### Textarea

22. `<Textarea>` renders as a native `<textarea>` element.
23. Computed `backgroundColor` of the textarea matches `var(--bg-sunken)`.
24. Computed `resize` is `"vertical"`.
25. Computed `minHeight` is `"60px"`.
26. Computed `lineHeight` is `"1.5"`.
27. When `error={true}` is passed, computed `borderColor` matches `var(--danger)`.
28. When `disabled={true}` is passed: textarea is `toBeDisabled()`; computed `opacity`
    is `"0.4"`.
29. `@storybook/addon-a11y` reports no accessibility violations on any Textarea story.

### Select

30. `<Select>` renders a root `<div>` element with a `<button>` trigger child.
31. The trigger button has `aria-haspopup="listbox"`.
32. When `open` is false (initial state), `aria-expanded` on the trigger is `"false"`,
    and no element with `role="listbox"` is present in the DOM.
33. Clicking the trigger button sets `aria-expanded` to `"true"` and renders a `<ul>`
    with `role="listbox"` in the DOM.
34. The `<ul>` panel contains one `<li role="option">` per entry in the `options` array.
35. When `value` matches an option's `value`, that option's `<li>` has
    `aria-selected="true"` and the trigger displays the matching option's `label`.
36. When `value` is undefined/unset, the trigger displays the `placeholder` text and no
    option has `aria-selected="true"`.
37. Clicking an option closes the panel (`aria-expanded` returns to `"false"`) and calls
    the `onchange` callback with the selected option's `value` string.
38. When `disabled={true}`, the trigger button is `toBeDisabled()` and computed `opacity`
    is `"0.4"`. Clicking the trigger does not open the panel.
39. When `error={true}`, the trigger button's computed `borderColor` matches
    `var(--danger)`.
40. Pressing `Escape` when the panel is open closes the panel.
41. Clicking outside the `<Select>` root element while the panel is open closes the panel
    (SSR-safe: the outside-click listener is registered in a `$effect` guarded by `browser`).
42. The `$effect` outside-click listener is cleaned up when the component is destroyed
    (the effect's return function removes the event listener).
43. The chevron `›` glyph rotates 90 degrees (computed `transform` contains `rotate(90deg)`)
    when the panel is open, and is `0deg` (no rotation) when closed.
44. `@storybook/addon-a11y` reports no accessibility violations on any Select story.

### InputWrap

45. `<InputWrap>` renders a root `<div>` element with `position: relative` and
    `display: flex`.
46. When `addonPre` is provided, a `<span class="addon addon-pre">` is rendered with the
    addon text, positioned before the child control in DOM order.
47. When `addonSuf` is provided, a `<span class="addon addon-suf">` is rendered with the
    addon text, positioned after the child control in DOM order.
48. When `iconPre` snippet is provided, a `<span class="icon-pre" aria-hidden="true">`
    is rendered before the child control.
49. When `clearable={true}` and `value` is an empty string (or not provided), the clear
    button exists in the DOM but is not visible (hidden via `visibility: hidden` or
    `display: none`, causing `toBeVisible()` to fail).
50. When `clearable={true}` and `value` is a non-empty string, the clear button is
    visible (`toBeVisible()` passes).
51. The clear button has `aria-label="Clear"`.
52. When the clear button is clicked, the `onclear` callback is invoked.
53. When `clearable={true}` and `showClear` is false, the clear button has
    `tabindex="-1"` (not keyboard-reachable).
54. The `icon-pre` span has `aria-hidden="true"`.
55. `@storybook/addon-a11y` reports no accessibility violations on any InputWrap story.

### Field

56. `<Field>` renders a root `<div>` element with `display: flex` and
    `flex-direction: column`.
57. A `<label>` element is rendered with its `for` attribute set to the value of the
    `inputId` prop.
58. The `<label>` text matches the `label` prop value.
59. The label computed `fontFamily` includes the `--mono` font name, and computed
    `textTransform` is `"uppercase"`.
60. The label computed `color` matches `var(--ink-faint)`.
61. When a child `<Input id={inputId}>` is placed in the slot, querying
    `getByLabelText(label)` returns the input element — confirming the `label[for]` →
    `input[id]` association is functional.
62. When `hint` is provided (and `error` is not), a `<span>` with the hint text is
    rendered. Its computed `color` matches `var(--ink-faint)` (not danger).
63. When `error` is provided, a `<span>` with the error text is rendered. Its computed
    `color` matches `var(--danger)`.
64. When both `hint` and `error` are provided, only the error text is displayed (error
    takes precedence).
65. When neither `hint` nor `error` is provided, no hint/error `<span>` is rendered.
66. The hint/error `<span>` has an `id` attribute equal to `"{inputId}-hint"`.
67. The hint/error `<span>` has `aria-live="polite"`.
68. When a child control has `aria-invalid="true"` passed by the consumer, the
    `getByRole('textbox')` element reports `aria-invalid="true"` in the DOM.
69. When a child control has `aria-describedby="{inputId}-hint"` passed by the consumer
    and `hint` or `error` is set, the described-by element (the hint span) is accessible
    via the association.
70. `@storybook/addon-a11y` reports no accessibility violations on any Field story.

### Stories

71. `Input.stories.svelte` exists and defines stories with `title: 'Forms/Input'`.
    Named stories: "Default", "With Value", "Error State", "Disabled", "Email".
    Each story has a play function that passes.
72. `Textarea.stories.svelte` exists and defines stories with `title: 'Forms/Textarea'`.
    Named stories: "Default", "With Content", "Error State", "Disabled".
    Each story has a play function that passes.
73. `Select.stories.svelte` exists and defines stories with `title: 'Forms/Select'`.
    Named stories: "Default", "Open Panel", "With Selection", "Disabled", "Error State".
    Each story has a play function that passes.
74. `InputWrap.stories.svelte` and `InputWrap.composition.stories.svelte` exist.
    Primary file defines stories: "Addon Prefix", "Addon Suffix", "Clearable — No Value",
    "Clearable — With Value". Composition file defines story: "Icon Prefix".
    Each story has a play function that passes.
75. `Field.stories.svelte` exists and defines stories with `title: 'Forms/Field'`.
    Named stories: "Default — Hint", "Error State", "Disabled", "With Textarea",
    "Required Field". Each story has a play function that passes.

---

## Out of scope

- **Checkbox and Radio inputs** — the reference HTML shows custom `appearance: none`
  checkbox and radio styles. These are excluded from B7 because they require a different
  component structure (label + checkbox in a single element) and are not part of R6.
  They are deferred to a future item (B9 or B11).
- **Toggle / switch** — the reference HTML shows a custom pill toggle. Excluded from B7
  for the same reason. Deferred.
- **Native `<select>` element** — the design system uses a fully custom select (no
  browser-native dropdown). The native `<select>` element is not wrapped or styled; the
  custom `Select` component replaces it entirely.
- **Full keyboard navigation of Select options** — Arrow-key navigation inside the open
  listbox (ARIA Combobox/Listbox pattern) is a non-trivial a11y enhancement deferred to
  B11 or a dedicated accessibility refinement item. B7 delivers trigger open/close via
  click and Escape, plus `aria-haspopup`, `aria-expanded`, `role="listbox"`, and
  `role="option"`. The a11y addon may flag the missing arrow-key pattern; this is a
  known open question (OQ-3).
- **`padding-right` coordination between `InputWrap` and `Input`** — when a clear button
  is visible, the inner Input should add `padding-right: 28px` to avoid overlap with the
  `×` button. The coordination mechanism (context, prop injection, or consumer
  responsibility) is deferred to B11 catalogue wiring. B7 documents the consumer
  responsibility pattern.
- **Multi-select** — `Select` is single-value only. Multi-select is out of scope.
- **Search/filter inside Select** — no option filtering in B7. All options are always visible.
- **Form validation integration** — `Field` handles display of error state but does not
  integrate with any form library (SvelteKit `enhance`, `sveltekit-superforms`, etc.).
- **Fieldset / legend for grouped fields** — group wrappers (e.g. for radio groups) are
  out of scope.
- **Palette toggle testing** — verifying correct colours in Paper palette via play
  functions is out of scope. The a11y addon will flag contrast issues.
- **Visual regression / snapshot testing** — no screenshot assertions.

---

## Open questions

**OQ-1 (non-blocking): Focus state contrast — amber border on sunken bg.**
The Input focus state replaces the browser's default `outline` with `border-color: var(--amber)`.
WCAG 2.1 SC 1.4.11 (Non-text Contrast) requires 3:1 contrast between the focus indicator
and adjacent background colours. The amber border sits between the sunken background
(`--bg-sunken`) and the surrounding page background (`--bg`). Both palettes need
verification. In the Phosphor palette, `--amber: #ffb347` against `--bg-sunken: #070908`
gives approximately 10:1 contrast — comfortably passes. The Paper palette must be checked
when tokens are confirmed. This does not block B7 implementation.

**OQ-2 (non-blocking): `<label for>` does not associate with custom Select trigger.**
HTML's `label[for]` wires to a form control element (`input`, `textarea`, `select`).
The custom `Select` trigger is a `<button>` — `label[for]` will not programmatically
associate with it. Assistive technologies will not automatically announce the label when
the `<button>` receives focus. The workaround (documented in the Field spec) is to add
`aria-labelledby` on the trigger button referencing the `<label>` element's id. B7 does
not implement this automatically — it is the consumer's responsibility. A future item
(B11 or an accessibility refinement) should address this by either making `Field` inject
an `aria-labelledby` into the Select trigger via Svelte context, or by making `Select`
accept a `labelledById` prop. This does not block B7 implementation.

**OQ-3 (non-blocking): Select listbox keyboard pattern — a11y addon warning expected.**
Full ARIA Listbox keyboard navigation (Arrow keys, Home, End, type-ahead) is not
implemented in B7. The `@storybook/addon-a11y` may flag the incomplete ARIA pattern
(specifically: no `aria-activedescendant` on the listbox, no keyboard focus management
inside the panel). These warnings are known and acceptable for B7. Implementation of
full keyboard navigation is deferred. If the a11y addon flags this as a violation (not
just a warning), the Select component should add `aria-activedescendant=""` on the
panel `<ul>` as a placeholder to suppress the violation without implementing full
focus management. Document this workaround in the story file comment if needed.

**OQ-4 (non-blocking): Hover state assertability in play functions.**
As established in B5 (OQ-1 there), CSS `:hover` state may not reflect in
`getComputedStyle()` after `userEvent.hover()` in headless Playwright. Acceptance
criteria that reference hover styles (Input focus border, Select trigger hover border)
fall back to code-review checks if `userEvent` hover does not trigger CSS pseudo-class
matching. The focus-state border (`:focus`) is more reliable than `:hover` since
`userEvent.click` and `userEvent.type` genuinely focus the element.

No open questions block implementation. B7 is ready for `test-writer`.
