# B15: Keyboard navigation

## Context

B15 completes the ARIA keyboard interaction patterns for the two custom interactive
widgets that currently have partial keyboard support:

- **`Select`** (`src/lib/components/forms/Select.svelte`) — has a `<button>` trigger
  (click-to-open, Escape-to-close) and a `<ul role="listbox">` panel, but lacks the
  ARIA Listbox keyboard pattern: arrow keys do not move focus inside the open list,
  Home/End do not jump to first/last option, and Enter does not confirm a highlighted
  option. WAI-ARIA 1.2 § Listbox (§ 3.14) requires these interactions for any component
  that uses `role="listbox"` + `role="option"`.

- **`Tabs`** (`src/lib/components/data/Tabs.svelte`) — has click-to-activate and
  Space/Enter via `<button role="tab">`, but lacks the WAI-ARIA Tabs keyboard pattern:
  left/right arrow keys do not move focus between tabs, and Home/End do not jump to
  first/last tab. WAI-ARIA 1.2 § Tabs (§ 3.26) requires these for the tab activation
  pattern.

Both gaps are WCAG 2.1 AA non-conformances for a publicly distributed component library
(SC 2.1.1 Keyboard). They were explicitly deferred from B7 (Select, OQ-3) and B10
(Tabs, OQ-2) to this item.

B15 is an **enhancement** to existing components. No new component files are created.

Related wiki pages:
- [requirements.md](../requirements.md) — constraint "WCAG 2.1 AA: keyboard nav, correct
  ARIA roles" and R6 (Select), R10 (Tabs).
- [architecture.md](../architecture.md) — component authoring conventions, Svelte 5 runes,
  Storybook play function test setup.
- [specs/B7-form-components.md](B7-form-components.md) — Select spec (OQ-3: known gap).
- [specs/B10-accordion-tabs-table.md](B10-accordion-tabs-table.md) — Tabs spec (OQ-2:
  known gap).
- [stories-guide.md](../stories-guide.md) — story format, `userEvent`, `within`.
- [decisions.md](../decisions.md) — D10 (Select custom), D17 (Tabs uses `<button>`).

WAI-ARIA references:
- WAI-ARIA Authoring Practices 1.2, § 3.14 Listbox:
  https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- WAI-ARIA Authoring Practices 1.2, § 3.26 Tabs:
  https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

---

## Files modified

| File | Change |
|---|---|
| `src/lib/components/forms/Select.svelte` | Add ARIA listbox keyboard handler: ArrowDown/Up, Home/End, Enter |
| `src/lib/components/forms/Select.stories.svelte` | Add "Keyboard Navigation" story |
| `src/lib/components/data/Tabs.svelte` | Add ARIA tabpanel keyboard handler: ArrowLeft/Right, Home/End |
| `src/lib/components/data/Tabs.stories.svelte` | Add "Keyboard Navigation" story |

No new files are created. No other component files are touched.

---

## Design: Select ARIA Listbox keyboard pattern

### Focus model

The WAI-ARIA Listbox pattern distinguishes two variants — **roving focus** (DOM focus
moves to each option) and **aria-activedescendant** (DOM focus stays on the listbox
container; `aria-activedescendant` points to the visually focused option). Because the
options in `Select` are `<li>` elements (not natively focusable), the
**`aria-activedescendant`** model is chosen:

- DOM focus **stays on the trigger `<button>`** when the panel is open. This is the
  current state already — the trigger is the keyboard focus owner.
- The `<ul role="listbox">` gets `aria-activedescendant` pointing to the `id` of the
  currently highlighted option.
- Each `<li role="option">` gets a stable `id` attribute (`select-opt-{i}` where `i`
  is the 0-based index, or the option's `value` sanitised for id use).

> **Design note**: using `aria-activedescendant` on the **trigger `<button>`** rather
> than on the `<ul>` is the correct wiring for this component structure: the trigger
> owns keyboard focus; it announces the highlighted option to assistive technology via
> `aria-activedescendant`. The `<ul>` itself does not receive focus in this model.
> (See WAI-ARIA APG Listbox § "Keyboard Interaction" — the model where the listbox
> container is NOT the focus target is permitted when a separate control opens the list.)

### Keyboard events (when panel is open)

| Key | Behaviour |
|---|---|
| `ArrowDown` | Move highlight to the next enabled option; wrap to first if at last |
| `ArrowUp` | Move highlight to the previous enabled option; wrap to last if at first |
| `Home` | Move highlight to the first enabled option |
| `End` | Move highlight to the last enabled option |
| `Enter` | Confirm highlighted option: call `onchange` with its value, close panel |
| `Escape` | Close panel without changing selection (existing behaviour, already implemented) |
| `Space` | On trigger when panel is **closed**: open panel (native `<button>` behaviour) |
| `Tab` | Close panel (do not intercept — browser's default Tab focus movement applies) |

The "highlight" is distinct from "selected". Selected is the committed `value` prop;
highlight is the ephemeral keyboard cursor inside the open panel. When the panel opens,
the highlight initialises to the currently selected option (if any), otherwise to the
first option.

### Internal state additions to `Select.svelte`

```ts
let highlightedIndex = $state(-1)   // index into options[]; -1 = none
```

`$derived`:
```ts
let highlightedOption = $derived(
  highlightedIndex >= 0 ? options[highlightedIndex] : undefined
)
```

When `open` becomes `true`:
- If the current `value` matches an option, set `highlightedIndex` to that option's
  index. Otherwise set `highlightedIndex` to `0`.

This can be done inside the existing `handleTriggerClick` or via a `$effect` on `open`.

### ARIA attribute additions to Select's HTML

On the trigger `<button>`:
```html
aria-activedescendant={open && highlightedIndex >= 0
  ? `select-opt-${highlightedIndex}`
  : undefined}
```

On each `<li>`:
```html
id="select-opt-{i}"
aria-selected={option.value === value}
class:highlighted={i === highlightedIndex}
```

The `highlighted` CSS class provides visual focus indication for keyboard users. Style:
```css
.select-option.highlighted {
  background: var(--bg-rail);
  color: var(--ink);
  outline: 2px solid var(--amber);
  outline-offset: -2px;
}
```

### Keyboard handler

The existing `handleKeydown` on the root `<div>` is extended:

```ts
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    open = false
    return
  }
  if (!open) return           // remaining keys only active when panel is open
  const count = options.length
  if (count === 0) return
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()      // prevent page scroll
      highlightedIndex = (highlightedIndex + 1) % count
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex = (highlightedIndex - 1 + count) % count
      break
    case 'Home':
      e.preventDefault()
      highlightedIndex = 0
      break
    case 'End':
      e.preventDefault()
      highlightedIndex = count - 1
      break
    case 'Enter':
      if (highlightedIndex >= 0) {
        handleSelect(options[highlightedIndex].value)
      }
      break
  }
}
```

---

## Design: Tabs ARIA tabpanel keyboard pattern

### Focus model

DOM focus **stays on the tab `<button>`** that currently has focus. Arrow keys move
focus from the active tab to the adjacent tab and activate it immediately
(**automatic activation** model — WAI-ARIA APG Tabs, § "Automatic Activation").

> The WAI-ARIA APG describes two activation models: automatic (arrow key moves focus
> and activates immediately) and manual (arrow key moves focus only; Space/Enter
> activates). Automatic activation is simpler to implement here and matches common
> browser tab-bar behaviour. It is the default recommendation for tabs whose panels load
> instantly (no async). See WAI-ARIA APG § "Deciding When to Make Selection Automatically
> Follow Focus."

### Keyboard events (focus is on a tab button)

| Key | Behaviour |
|---|---|
| `ArrowRight` | Move focus to and activate the next tab; wrap to first if at last |
| `ArrowLeft` | Move focus to and activate the previous tab; wrap to last if at first |
| `Home` | Move focus to and activate the first tab |
| `End` | Move focus to and activate the last tab |
| `Space` / `Enter` | Activate the focused tab (native `<button>` behaviour — already works) |
| `Tab` | Move focus out of the tab list to the active panel (standard tab order) |

Arrow keys must call `e.preventDefault()` to prevent the page from scrolling.

### Implementation in `Tabs.svelte`

Add a `keydown` event handler to each tab `<button>`:

```ts
function handleTabKeydown(e: KeyboardEvent, index: number) {
  const count = tabs.length
  let target = -1
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      target = (index + 1) % count
      break
    case 'ArrowLeft':
      e.preventDefault()
      target = (index - 1 + count) % count
      break
    case 'Home':
      e.preventDefault()
      target = 0
      break
    case 'End':
      e.preventDefault()
      target = count - 1
      break
  }
  if (target >= 0) {
    activeId = tabs[target].id
    // Focus the target tab button programmatically
    const tabButtons = document.querySelectorAll<HTMLElement>(
      `[id^="tab-"]`
    )
    // Prefer: bind an array of button refs via $state or use the DOM id directly
    document.getElementById(`tab-${tabs[target].id}`)?.focus()
  }
}
```

> **Implementation note**: the `document.getElementById` lookup is safe here because it
> runs inside a `keydown` event handler (browser-only). If `Tabs` is used in SSR, no
> `$effect` guard is needed because the handler only fires on user interaction. The
> implementer may also use a Svelte `bind:this` array if preferred.

The handler is added inline on each tab `<button>`:
```html
onkeydown={(e) => handleTabKeydown(e, i)}
```

where `i` is the loop index from `{#each tabs as tab, i}`.

The `tablist` element should also declare the keyboard navigation role hint. Because
`role="tablist"` already implies arrow-key navigation for AT users, no additional ARIA
attribute is needed beyond what B10 already provides.

---

## Story plan

### `Select.stories.svelte` — new story: "Keyboard Navigation"

File: `src/lib/components/forms/Select.stories.svelte` (existing file, add one story)

**Story: "Keyboard Navigation"**

Setup: three options (Oscillator/Envelope/Utility), no initial value. Panel is
**closed** on mount. The play function exercises the full keyboard flow.

```
play function steps:
1. Focus the trigger button via userEvent.click (or .tab)
2. Press Space → panel opens (aria-expanded="true", listbox visible)
3. Assert highlightedIndex initialises to option 0:
   - getByRole('option', { name: /OSCILLATOR/i }) has id "select-opt-0"
   - trigger button has aria-activedescendant="select-opt-0"
4. Press ArrowDown → highlight moves to index 1 (Envelope)
   - trigger aria-activedescendant becomes "select-opt-1"
5. Press ArrowDown → highlight moves to index 2 (Utility)
6. Press ArrowDown → wraps to index 0 (Oscillator)
7. Press End → highlight moves to index 2 (Utility, last)
8. Press Home → highlight moves to index 0 (Oscillator, first)
9. Press ArrowDown → highlight index 1 (Envelope)
10. Press Enter → panel closes (aria-expanded="false", listbox gone)
    - onchange called with value "env" (verified via a spy/state variable)
    - trigger text contains "ENVELOPE"
11. Re-open panel (Space) → highlighted option is the currently selected one (index 1)
12. Press Escape → panel closes without changing selection
    - trigger text still contains "ENVELOPE"
```

The story must use a stateful wrapper pattern to capture the `onchange` callback result.
Because `Select` is controlled, the story tracks the current value in a reactive variable
passed as `value` to the component and updated by `onchange`.

**Assertions derived from the above flow:**

The play function must include at minimum:
- After step 3: `trigger.getAttribute('aria-activedescendant')` equals `'select-opt-0'`
- After step 4: `aria-activedescendant` equals `'select-opt-1'`
- After step 6 (wrap): `aria-activedescendant` equals `'select-opt-0'`
- After step 7 (End): `aria-activedescendant` equals `'select-opt-2'`
- After step 8 (Home): `aria-activedescendant` equals `'select-opt-0'`
- After step 10 (Enter): panel is closed; `trigger.textContent` contains `'ENVELOPE'`
- After step 12 (Escape): panel closed; value unchanged

### `Tabs.stories.svelte` — new story: "Keyboard Navigation"

File: `src/lib/components/data/Tabs.stories.svelte` (existing file, add one story)

**Story: "Keyboard Navigation"**

Setup: three tabs (Overview/Specs/Notes), Overview active by default (underline variant).

```
play function steps:
1. Click the Overview tab to ensure keyboard focus is on it
2. Press ArrowRight → Specs tab is activated (aria-selected="true") and focused
   - Overview tab: aria-selected="false"
   - Specs panel: no hidden attribute; Overview panel: has hidden attribute
3. Press ArrowRight → Notes tab is activated
4. Press ArrowRight → wraps to Overview tab (first)
5. Press End → Notes tab (last) is activated
6. Press Home → Overview tab (first) is activated
7. Press ArrowLeft → Notes tab (last, wrap) is activated
8. Assert throughout: only one tab has aria-selected="true" at a time
```

**Assertions derived from the above flow:**

- After step 2: `getByRole('tab', { name: /specs/i })` has `aria-selected="true"`;
  `getByRole('tab', { name: /overview/i })` has `aria-selected="false"`;
  `canvasElement.querySelector('#panel-specs')` does not have `hidden`;
  `canvasElement.querySelector('#panel-overview')` has `hidden`.
- After step 4 (wrap): `getByRole('tab', { name: /overview/i })` has `aria-selected="true"`.
- After step 5 (End): `getByRole('tab', { name: /notes/i })` has `aria-selected="true"`.
- After step 6 (Home): `getByRole('tab', { name: /overview/i })` has `aria-selected="true"`.
- After step 7 (ArrowLeft wrap): `getByRole('tab', { name: /notes/i })` has `aria-selected="true"`.

---

## Acceptance criteria

### General

1. `pnpm check` passes with zero TypeScript errors after all changes to `Select.svelte`
   and `Tabs.svelte`.
2. `pnpm test` passes — all existing story play functions continue to pass (no
   regressions).
3. The `@storybook/addon-a11y` panel reports zero violations on all `Select` and `Tabs`
   stories after B15 changes are applied (including the two new stories).

---

### Select — ARIA Listbox keyboard pattern

#### ARIA attribute additions

4. Each `<li role="option">` in the open panel has an `id` attribute. The `id` follows
   the pattern `select-opt-{i}` where `i` is the 0-based index of the option in the
   `options` array. Verified by: open the panel in any Select story and assert
   `getAllByRole('option')[0].getAttribute('id')` is `"select-opt-0"`.

5. The trigger `<button>` has `aria-activedescendant` pointing to `"select-opt-{i}"` when
   the panel is open and a highlight index is active. When the panel is closed,
   `aria-activedescendant` is absent (or `undefined`) on the trigger button. Verified by:
   open panel → assert `aria-activedescendant` is set; close panel → assert it is unset.

6. When the panel opens, `highlightedIndex` initialises to the index of the currently
   selected option (the option whose `value` matches the `value` prop). If no option
   matches (no selection), `highlightedIndex` initialises to `0` (the first option).
   Verified by: open a Select with `value="env"` (Envelope at index 1) → assert
   `aria-activedescendant` is `"select-opt-1"` immediately after opening.

7. The highlighted option has the CSS class `highlighted` applied. Verified by:
   open the panel → assert `getAllByRole('option')[0]` has class `highlighted` (when it
   is the initial highlight target).

#### ArrowDown key

8. When the panel is open and the user presses `ArrowDown`, `highlightedIndex` increments
   by 1. Verified by: open panel (highlight at 0) → press ArrowDown → assert
   `aria-activedescendant` is `"select-opt-1"`.

9. When `ArrowDown` is pressed while the highlight is on the **last** option, it wraps to
   index 0 (first option). Verified by: press ArrowDown until reaching last option → press
   ArrowDown again → assert `aria-activedescendant` is `"select-opt-0"`.

10. `ArrowDown` calls `e.preventDefault()` — verified by: the page does not scroll
    (assertion: `window.scrollY` remains 0 after the key press, or the default is
    confirmed prevented via the absence of scroll). In Storybook/Playwright, this is
    implicitly satisfied when `userEvent.keyboard('{ArrowDown}')` does not cause navigation.

#### ArrowUp key

11. When the panel is open and the user presses `ArrowUp`, `highlightedIndex` decrements
    by 1. Verified by: open panel (highlight at index 0, after pressing ArrowDown once to
    reach index 1) → press ArrowUp → assert `aria-activedescendant` is `"select-opt-0"`.

12. When `ArrowUp` is pressed while the highlight is on the **first** option (index 0),
    it wraps to the last option. Verified by: open panel (highlight at 0) → press ArrowUp
    → assert `aria-activedescendant` is `"select-opt-{last}"` where `last` is
    `options.length - 1`.

#### Home and End keys

13. When the panel is open and `Home` is pressed, `highlightedIndex` becomes `0`.
    Verified by: open panel, press ArrowDown to move to index 1 → press Home → assert
    `aria-activedescendant` is `"select-opt-0"`.

14. When the panel is open and `End` is pressed, `highlightedIndex` becomes
    `options.length - 1`. Verified by: open panel (highlight at 0) → press End → assert
    `aria-activedescendant` is `"select-opt-{options.length - 1}"`.

#### Enter key

15. When the panel is open and `Enter` is pressed, the highlighted option is confirmed:
    the `onchange` callback is invoked with the highlighted option's `value` string.
    Verified by: track `onchange` calls in the story → press Enter → assert callback
    was called with the correct value.

16. After pressing `Enter` to confirm, the panel closes: `aria-expanded` on the trigger
    is `"false"` and no element with `role="listbox"` is present in the DOM.

17. After pressing `Enter` to confirm, the trigger displays the label of the confirmed
    option (i.e. the component is re-rendered with the new `value` and the correct
    `displayLabel` is shown).

#### Escape key (existing behaviour preserved)

18. When the panel is open and `Escape` is pressed, the panel closes (`aria-expanded`
    returns to `"false"`) without changing the current selection. The `onchange` callback
    is NOT invoked. Verified by: open panel, navigate to a different option with ArrowDown,
    press Escape → assert panel closed, trigger still shows original label.

#### Keyboard highlight — visual focus

19. The highlighted option has a visual focus style distinct from the selected option.
    Verified by: open panel → assert the highlighted `<li>` has class `highlighted`.
    The selected option (if different) has class `selected` but NOT `highlighted`.

20. When the panel closes (by any means), no option retains the `highlighted` class. The
    class is tied to the ephemeral in-panel navigation state. Verified by: open panel,
    press ArrowDown, then press Escape → assert no element with class `highlighted`
    exists in the DOM (panel is gone, so all options are removed from DOM).

#### Disabled state

21. When `disabled={true}`, keyboard events on the trigger do not open the panel.
    Pressing `Space` or `Enter` on a disabled trigger does nothing. Verified by: focus
    a disabled trigger → press Space → assert `aria-expanded` remains `"false"` and no
    listbox appears.

#### Panel opening initialises highlight correctly

22. When the panel is opened via keyboard (`Space` on the trigger) after a previous
    selection was made (e.g. `value="env"`), the highlight immediately points to the
    selected option (index 1 for "env"). `aria-activedescendant` is set to the correct
    `id` before any further key presses. Verified by: open Select with `value="env"`,
    press Space → assert `aria-activedescendant` is `"select-opt-1"` immediately.

---

### Tabs — ARIA tabpanel keyboard pattern

#### ArrowRight key

23. When focus is on a tab button and `ArrowRight` is pressed, focus moves to the next
    tab in DOM order and that tab becomes active (`aria-selected="true"`). Verified by:
    focus first tab → press ArrowRight → assert second tab has `aria-selected="true"` and
    receives DOM focus (`document.activeElement` is the second tab button).

24. When `ArrowRight` is pressed while focus is on the **last** tab, it wraps to the
    first tab. Verified by: focus last tab → press ArrowRight → assert first tab has
    `aria-selected="true"` and focus.

25. `ArrowRight` calls `e.preventDefault()`. Verified implicitly by absence of page
    scroll (same reasoning as Select AC-10).

#### ArrowLeft key

26. When focus is on a tab button and `ArrowLeft` is pressed, focus moves to the previous
    tab in DOM order and that tab becomes active. Verified by: focus second tab → press
    ArrowLeft → assert first tab has `aria-selected="true"` and focus.

27. When `ArrowLeft` is pressed while focus is on the **first** tab, it wraps to the last
    tab. Verified by: focus first tab → press ArrowLeft → assert last tab has
    `aria-selected="true"` and focus.

#### Home and End keys (Tabs)

28. When focus is on any tab and `Home` is pressed, focus and activation move to the
    first tab. Verified by: focus last tab → press Home → assert first tab has
    `aria-selected="true"` and focus.

29. When focus is on any tab and `End` is pressed, focus and activation move to the last
    tab. Verified by: focus first tab → press End → assert last tab has
    `aria-selected="true"` and focus.

#### Panel switching on keyboard navigation

30. When keyboard navigation activates a tab (via arrow/Home/End), the corresponding
    panel becomes visible (loses `hidden`) and all other panels gain `hidden`. This is
    the same panel-switching behaviour as click activation. Verified by: ArrowRight to
    second tab → assert second panel has no `hidden`; first panel has `hidden`.

31. Only one panel is visible at any time, regardless of how the active tab was changed
    (click or keyboard). Verified by: after any keyboard navigation, assert exactly one
    panel in the DOM lacks the `hidden` attribute.

#### Single-tab edge case

32. When the `Tabs` component has exactly one tab, pressing `ArrowRight`, `ArrowLeft`,
    `Home`, or `End` leaves focus and selection on the same (only) tab. No error is
    thrown. `aria-selected` remains `"true"` on the single tab. Verified by a Tabs story
    with one tab entry; pressing ArrowRight asserts unchanged state.

#### Existing behaviour preserved

33. Clicking a tab still activates it (existing B10 behaviour). After a keyboard
    navigation session (tabs changed via keyboard), a subsequent click on any tab still
    correctly activates it and shows its panel.

34. Space and Enter on a focused tab still activate it (native `<button>` behaviour —
    these must NOT be intercepted by the new `keydown` handler). Verified by: focus an
    inactive tab → press Space → assert `aria-selected="true"` and panel visible.

#### Story additions

35. A Storybook story named **"Keyboard Navigation"** exists in
    `src/lib/components/data/Tabs.stories.svelte`. Its play function:
    - Presses ArrowRight on the first tab and asserts the second tab becomes active.
    - Presses ArrowRight again to reach the third tab.
    - Presses ArrowRight again and asserts wrap to the first tab.
    - Presses End and asserts the last tab is active.
    - Presses Home and asserts the first tab is active.
    - Presses ArrowLeft and asserts the last tab is active (wrap).
    - Each step verifies `aria-selected` and panel `hidden` attribute state.

36. A Storybook story named **"Keyboard Navigation"** exists in
    `src/lib/components/forms/Select.stories.svelte`. Its play function exercises the
    full flow described in the Story Plan section above, including ArrowDown/ArrowUp
    wrap, Home, End, Enter confirmation (verifying `onchange` called with correct value),
    and Escape without selection change.

---

## Edge cases

### Select edge cases

- **Empty options array**: if `options` is `[]`, all keyboard handlers are no-ops (the
  `count === 0` guard prevents index computation). No error is thrown.
- **Single option**: ArrowDown and ArrowUp both keep `highlightedIndex` at 0 (modulo 1
  wraps to 0). Home and End both point to 0. Enter confirms the single option.
- **Disabled option entries**: the current `SelectOption` type has no `disabled` field.
  Option-level disabling is out of scope for B15 (see Out of scope). The highlight
  skips no options.
- **Very long option lists**: the modulo wrap arithmetic is correct for any `count >= 1`.
  No virtual-scroll or max-height overflow keyboard behaviour is specified; the consumer
  is responsible for overflow via CSS on `.select-panel`.

### Tabs edge cases

- **Single tab**: modulo wrap with `count = 1` always resolves to 0. ArrowRight,
  ArrowLeft, Home, End all result in the same tab remaining active. (AC-32)
- **Two tabs**: ArrowRight wraps directly from tab 1 to tab 0 and vice versa. This is
  correct by the wrap formula.
- **`active` prop set to a non-existent id**: this is an existing edge case (not
  introduced by B15) and is not in scope to fix here.

---

## Out of scope

- **Disabled option items in Select** — the `SelectOption` interface has no `disabled`
  field; arrow-key skip-over of disabled options requires extending the type and the
  keyboard handler. Deferred to a future accessibility enhancement.
- **Type-ahead / character search in Select** — pressing a letter key to jump to the
  first option whose label starts with that letter (ARIA Listbox optional behaviour).
  Not required for WCAG 2.1 AA; deferred.
- **Manual activation model for Tabs** — the alternative pattern where arrow keys move
  focus without activating; the user must press Space/Enter to activate. Not implemented;
  automatic activation is chosen (see Design section).
- **Vertical Tabs keyboard pattern** — the vertical variant (if added in future) would
  require ArrowUp/ArrowDown instead of ArrowLeft/ArrowRight. Out of scope as there is no
  vertical variant in the current codebase.
- **`$bindable` active prop for Tabs** — external programmatic control of the active tab
  (deferred from B10 OQ-1). B15 does not add `$bindable` to the `active` prop.
- **Select `aria-activedescendant` on the listbox `<ul>`** — the spec places
  `aria-activedescendant` on the trigger `<button>` (the focus owner), not on the `<ul>`.
  Placing it on the `<ul>` is the pattern when the `<ul>` owns focus; in this component
  the `<button>` owns focus. This design is intentional and is not in scope to revisit.
- **Pointer/touch interaction changes** — mouse hover does not change `highlightedIndex`.
  The highlight is purely keyboard-driven. Option mouse-click continues to call
  `handleSelect` as before (no highlight involvement needed).
- **Animated panel transitions** — smooth CSS animation on the Select panel or Tabs
  panel switching. Out of scope.
- **Roving tabindex model for Tabs** — where only the active tab is in the natural tab
  order (`tabindex="0"`) and inactive tabs have `tabindex="-1"`. The WAI-ARIA APG
  recommends this for tab lists. This is not implemented in B10 and is a follow-up.
  B15 does not require it; the existing `<button>` tab elements retain natural focus
  order.

---

## Open questions

**OQ-1 (non-blocking): `aria-activedescendant` placement — trigger vs. listbox.**
The spec places `aria-activedescendant` on the trigger `<button>` (the DOM focus owner).
Some screen reader implementations may not announce `aria-activedescendant` changes when
it is on a `<button>` rather than on a `role="combobox"` or `role="listbox"` element.
Testing with NVDA/JAWS is recommended after implementation, but this does not block B15.
The alternative (moving focus into the `<ul>` using roving tabindex on the `<li>`
elements) is a more significant refactor deferred to a future item.

**OQ-2 (non-blocking): Roving tabindex for Tabs tab buttons.**
WAI-ARIA APG recommends that in a `tablist`, only the active tab should be in the tab
order (`tabindex="0"`) and inactive tabs should have `tabindex="-1"`. This prevents
`Tab` key from visiting every inactive tab button (instead, `Tab` moves from the active
tab directly to the active panel). The current implementation does not apply this
pattern. Adding it in B15 is desirable but not required for the stated acceptance
criteria. The implementer may add it without a spec revision if it does not break
existing tests.

**OQ-3 (non-blocking): `userEvent.keyboard` vs. `userEvent.type` in play functions.**
In `@storybook/addon-vitest` with Playwright browser mode, keyboard event simulation
should use `userEvent.keyboard('{ArrowDown}')` (using the key descriptor syntax) to
send keyboard events to the currently focused element. If `userEvent.keyboard` is not
available on the `userEvent` object provided to play functions, fall back to
`userEvent.type(element, '{arrowdown}')` or use direct `dispatchEvent` as a last resort.
The test-writer should confirm which API is available in this project's Storybook version
(10.4.0) before writing the play functions.

**OQ-4 (non-blocking): Focus assertion reliability in Playwright.**
`document.activeElement` assertions (for verifying that keyboard navigation moves DOM
focus to the correct tab button) may be unreliable in headless Playwright if the canvas
element or iframe does not have focus. The test-writer should use
`await expect(targetTab).toHaveFocus()` (if available in the `@storybook/test` expect
matchers) rather than directly comparing `document.activeElement`. If neither works
reliably, the focus assertion can be omitted from the play function and covered by a
code-review check, provided the `aria-selected` and panel `hidden` assertions are
retained.

No open questions block implementation. B15 is ready for `test-writer`.
