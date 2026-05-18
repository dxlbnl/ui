# B32: Switch — dark mode invisible when off + label click doesn't toggle

## Context

`Switch.svelte` (`src/lib/components/forms/Switch.svelte`) has two bugs found during
dark-mode (Phosphor palette) visual QA:

1. In the off state the toggle track is invisible against a dark background because the
   border token `--rail` does not exist in the token set — the correct border token is
   `--rule`. With no visible border and `--bg-sunken` as the fill, the off-state track
   disappears on the Phosphor (`--bg`) background.

2. Clicking the label text next to the toggle (`<span class="switch-label">`) does
   nothing. The component uses a `<button role="switch">` (not an `<input
   type="checkbox">`), so a `<label for=…>` association does not apply. The label span
   has no click handler and therefore cannot activate the toggle.

Related wiki pages: [requirements.md](../requirements.md) (R6 Form components, WCAG
2.1 AA constraint), [architecture.md](../architecture.md) (Svelte 5 runes, semantic
HTML, clean HTML rules), [stories-guide.md](../stories-guide.md).

Item card: [wiki/backlog/doing/B32-switch-fixes.md](../backlog/doing/B32-switch-fixes.md)

---

## Acceptance criteria

### Fix 1 — Off-state track visible in dark mode

**Required CSS change in `Switch.svelte`:** replace `border: 1px solid var(--rail)`
with `border: 1px solid var(--rule)` on the `.switch` rule. `--rule` is the
canonical 1-px border token for both palettes (Phosphor: visible light rule on dark
bg; Paper: visible dark rule on light bg). No other structural change is needed for
this fix.

1. In the "Off (Default)" story, the computed `borderColor` of the `role="switch"`
   button resolves to the same RGB value as `var(--rule)` (resolved via the
   `resolveTokenColor` probe pattern).

2. In the "Off (Default)" story, the computed `borderColor` is **not** the same value
   as `var(--bg)` (i.e. the border is not invisible against the default background).

3. The "On" story is unaffected: when `checked=true` the border color resolves to
   `var(--amber)` (the `.switch.on` rule sets `border-color: var(--amber)`).

4. The "Disabled Off" story: the switch button still has a visible border (resolves to
   `var(--rule)`) even when disabled (opacity reduction on `.switch-wrap.disabled` is
   applied by the parent, not by removing the border).

### Fix 2 — Label click toggles the switch

**Required HTML/behaviour change in `Switch.svelte`:** add an `onclick` handler on the
`<span class="switch-label">` element that performs the same toggle logic as the
button (`if (!disabled) checked = !checked`). This mirrors the UX expectation that
clicking the text label activates the associated control, without changing the
component's HTML structure or ARIA semantics.

Alternative that is also acceptable: move the toggle `onclick` to the outer
`.switch-wrap` span instead of the label span, so the entire component area (including
the track and the label) is a single click target. Either approach satisfies the ACs
below.

5. Extend the existing "Off (Default)" story's play function: after the initial
   assertions pass, `userEvent.click` the element with text "Dark mode"
   (`getByText('Dark mode')`). After the click, `aria-checked` on the switch button
   must be `"true"`.

6. Extend the "On" story's play function: `userEvent.click` the label text "Dark mode".
   After the click, `aria-checked` must be `"false"`.

7. In a disabled switch, clicking the label text must **not** toggle the switch.
   Extend the "Disabled Off" story: `userEvent.click` the label text "Feature flag".
   `aria-checked` must remain `"false"` after the click.

8. The `role="switch"` button itself continues to toggle on direct click (regression
   guard): `userEvent.click` the button directly in the "Off (Default)" story (after
   the label-click assertion) and confirm `aria-checked` flips back to `"false"`.

### No regressions

9. All pre-existing play function assertions (AC-44 through AC-52 in the existing
   stories) continue to pass after both fixes are applied. The "Space to Toggle" story
   must still pass (Space key on the focused button toggles the state).

---

## Story changes

All fixes extend **existing stories only**. No new story file is needed.

- **"Off (Default)"** — extend the existing play function to add ACs 1, 2, and 5 (and 8 as a follow-up click).
- **"On"** — extend the existing play function to add AC 3 and AC 6.
- **"Disabled Off"** — extend the existing play function to add AC 4 and AC 7.
- **"Disabled On"** — no change required.
- **"Space to Toggle"** — no change required (AC 9 regression guard).
- **"Amber Track When On"** — no change required.

The `resolveTokenColor` utility (`$lib/storybook-utils.js`) is already imported in
`Switch.stories.svelte` and must be used for all token color comparisons (ACs 1–4).

---

## Out of scope

- Dark-mode visual testing at the Storybook backgrounds level (palette switching is
  done at the `[data-palette]` attribute level; the stories do not set a background
  class — token resolution uses whatever the current Storybook background provides).
- Adding a `label` prop that renders a `<label>` element with a `for` attribute — the
  component uses a `<button role="switch">`, not `<input type="checkbox">`, so a `for`
  link is not applicable and is not part of this fix.
- Converting the component from `<button role="switch">` to `<input type="checkbox">`
  — that is a larger refactor out of scope for this bug fix.
- Introducing any new prop, new story file, or new story variant beyond the extensions
  listed above.
- The `--bg-sunken` background value for the off-state track is intentional and is not
  changed by this item.

---

## Open questions

None. Both bugs have clear, minimal fixes derivable from the current implementation.
No blocking questions.
