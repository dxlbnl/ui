# B30: Input chrome fixes — number arrows, clearable color, icon color

## Context

Three visual polish bugs in `Input.svelte` and `InputWrap.svelte` that break the
Dexterlabs design system's ink-token consistency. All three are CSS-only fixes with no
prop or API changes.

Relevant wiki pages: [requirements.md](../requirements.md) (R6 — Form components),
[architecture.md](../architecture.md) (Component authoring conventions),
[stories-guide.md](../stories-guide.md) (token color resolution pattern).
Item card: [backlog/doing/B30-input-chrome-fixes.md](../backlog/doing/B30-input-chrome-fixes.md).

---

## Fix 1 — Number input spin buttons

`<input type="number">` renders browser-native spin buttons (up/down arrows). On
Phosphor (dark) they appear white or otherwise off-palette. They must be hidden across
all browsers.

**Required CSS in `Input.svelte` `<style>`:**

```css
/* Hide WebKit/Blink spin buttons */
.input::-webkit-inner-spin-button,
.input::-webkit-outer-spin-button {
  display: none;
}

/* Hide Firefox spin buttons */
.input[type='number'] {
  -moz-appearance: textfield;
}
```

**Existing story to extend:** `InputWrap.stories.svelte` — "Addon Prefix" and
"Addon Suffix" stories already render `<Input type="number">`. Add a
`getByRole('spinbutton')` absence check (or `getByRole('textbox')` check after the
fix, since hiding spin buttons does not change the ARIA role) to those play functions,
OR add a dedicated story "Number Input" to `Input.stories.svelte`.

The dedicated story is preferred to keep InputWrap stories focused on the wrapper
chrome. The "Number Input" story should live in `Input.stories.svelte`.

---

## Fix 2 — Clearable × button color

The clear button in `InputWrap.svelte` is rendered via `<Button variant="ghost">`.
The `:global(.wrap-clear)` rule already sets `color: var(--ink-faint)` and hover to
`color: var(--ink)`. Verify the current implementation does NOT use `var(--amber)` at
any point. If any amber reference exists on `.wrap-clear`, remove it and replace with
`var(--ink-dim)`.

**Required outcome:** the clear `×` button color (non-hover state) resolves to
`var(--ink-dim)`. The hover state resolves to `var(--amber)`. Find whichever CSS
rule currently sets the color (check `.wrap-clear` in `InputWrap.svelte` and
inherited `btn-ghost` styles in `Button.svelte`) and patch it.

**Existing story to extend:** `InputWrap.stories.svelte` — "Clearable — With Value"
already asserts the button is visible. Extend its play function to assert the button's
computed `color` matches `resolveTokenColor('--ink-dim')` at rest.

---

## Fix 3 — Composition icon color

The leading icon in `InputWrap.composition.stories.svelte` — "Icon Prefix" — renders
a mail SVG (defined as a snippet in the stories file, no `fill` attribute on the
`<path>`). SVG defaults to `fill: black` and the `.icon-pre` wrapper's
`color: var(--ink-faint)` does not propagate into the SVG because scoped CSS in
Svelte cannot reach into snippet-rendered content without `:global`.

**Required CSS fix in `InputWrap.svelte` `<style>`:**

```css
.icon-pre :global(svg) {
  fill: currentColor;
}
```

The `:global(svg)` crosses the Svelte scoped-CSS boundary so the rule reaches the
SVG rendered by the `iconPre` snippet. `currentColor` inherits from `.icon-pre`'s
`color: var(--ink-faint)`, making the icon respect both palettes.

**Existing story to extend:** `InputWrap.composition.stories.svelte` — "Icon Prefix".
Extend its play function to assert `getComputedStyle(svgEl).fill` matches the
resolved value of `var(--ink-faint)` on the `.icon-pre` container.

---

## Acceptance criteria

1. **[Spin buttons hidden — WebKit]** When an `<Input type="number">` is rendered in
   Chromium/WebKit, no spin button pseudo-elements are visible; the computed style of
   `::-webkit-inner-spin-button` on the input has `display: none` (or equivalent
   suppression such that no arrow affordance is painted). Verified by a "Number Input"
   story in `Input.stories.svelte` whose play function asserts the input element's
   `-webkit-appearance` or checks no spinbutton role is discoverable via
   `queryByRole('spinbutton')` returning `null`.

2. **[Spin buttons hidden — Firefox]** The input element has `-moz-appearance: textfield`
   set in its computed style (or equivalent), suppressing the Firefox stepper. Verified
   by the same "Number Input" story asserting the input's computed `MozAppearance` (or
   confirming the CSS rule is present in the component `<style>` block).

3. **[Number story baseline]** The "Number Input" story in `Input.stories.svelte` passes
   all existing assertions (visible, enabled, background token, border, font) in addition
   to the spin-button assertions. `type="number"` is set as `args`.

4. **[Clear button resting color = ink-dim]** In the "Clearable — With Value" story in
   `InputWrap.stories.svelte`, after the clear button is asserted visible, the play
   function also asserts that `getComputedStyle(clearBtn).color` equals
   `resolveTokenColor('--ink-dim')`.

5. **[Clear button hover color = amber — code-level]** The `.wrap-clear:hover` CSS rule in
   `InputWrap.svelte` sets `color: var(--amber)`. Verified by the reviewer reading the
   source; not asserted at runtime because CSS `:hover` is not activated by synthetic
   events in the Playwright/Chromium test runner.

6. **[Clear button CSS source]** The `.wrap-clear` (rest) and `.wrap-clear:hover` rules in
   `InputWrap.svelte` set `color: var(--ink-dim)` and `color: var(--amber)` respectively.
   This is a code-level assertion the reviewer checks; no separate story needed.

7. **[Icon SVG fill inherits ink-faint]** In the "Icon Prefix" story in
   `InputWrap.composition.stories.svelte`, the play function resolves the computed
   `fill` color of the `<svg>` element (via `getComputedStyle(svgEl).fill`) and asserts
   it equals `resolveTokenColor('--ink-faint')`.

8. **[Icon color survives palette switch]** The `fill: currentColor` fix must not
   hard-code a color value; it must derive from the `.icon-pre color` token. This is
   verified implicitly by AC-7 (which uses the token probe pattern) and is a
   code-level criterion the reviewer checks.

9. **[No regression — existing Input stories pass]** All pre-existing play functions in
   `Input.stories.svelte` ("Default", "With Value", "Error State", "Disabled", "Email")
   continue to pass without modification.

10. **[No regression — existing InputWrap stories pass]** All pre-existing play functions
    in `InputWrap.stories.svelte` ("Addon Prefix", "Addon Suffix", "Clearable — No Value",
    "Clearable — With Value") and in `InputWrap.composition.stories.svelte` ("Icon
    Prefix") continue to pass after changes.

---

## Out of scope

- Styling the spin buttons with ink colors instead of hiding them — the requirement is
  to hide them entirely.
- Changes to keyboard accessibility of `<input type="number">` (arrow keys for
  incrementing still work even when the visual buttons are hidden).
- The `iconSuf` / trailing icon slot — `InputWrap` does not currently have one; not
  added here.
- Hover/focus color tokens for the clear button other than resting (`--ink-dim`) and
  hover (`--ink`).
- Any changes to `Input.svelte` props or TypeScript types.
- Any changes to `Field.svelte`, `Textarea.svelte`, or `Select.svelte`.

---

## Open questions

1. **Clear button color discrepancy** — The item card states the clear button uses
   `var(--amber)`, but inspecting the current `InputWrap.svelte` source shows
   `.wrap-clear` using `var(--ink-faint)` (resting) and `var(--ink)` (hover). If the
   amber color is inherited from `Button.svelte`'s `btn-ghost` rules rather than the
   `.wrap-clear` override, the fix may need to adjust the `Button` ghost style or
   strengthen the `.wrap-clear` specificity. **Not blocking** — the implementer should
   inspect both the rendered computed value and the CSS source and patch whichever rule
   is responsible. The AC (criterion 4) unambiguously requires `var(--ink-dim)` at rest.

2. **Firefox `-moz-appearance` test** — Playwright (the Vitest browser mode driver)
   runs Chromium by default. The `-moz-appearance: textfield` rule cannot be directly
   asserted via `getComputedStyle` in a Chromium test run. The AC (criterion 2)
   therefore settles for a code-level reviewer check that the rule is present in the
   component source. If the test-writer can find another reliable signal in Chromium,
   that is preferred. **Not blocking.**
