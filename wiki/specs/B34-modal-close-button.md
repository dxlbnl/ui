# B34: Modal close button not in top-right corner

## Context

The Modal component (`src/lib/components/feedback/Modal.svelte`) wraps its header
content — title heading plus close (×) button — inside an `<Inline>` layout
component. Because `<Inline>` is a scoped-CSS child component, the `.modal-header`
flex rules cannot reach across the Svelte boundary to push the close button to the
right edge. The result is that the close button sits immediately after the title text
instead of being flush to the right of the header.

The fix is to apply `display: flex; align-items: center; justify-content: space-between`
directly on `.modal-header` and make the title and close button direct children of it
(removing the `<Inline>` wrapper), so both participate in the same flex formatting
context. The title gets `flex: 1` and the close button gets `flex-shrink: 0`.

Related wiki pages: [requirements.md](../requirements.md) R7, [architecture.md](../architecture.md),
[stories-guide.md](../stories-guide.md).
Item card: [wiki/backlog/doing/B34-modal-close-button.md](../backlog/doing/B34-modal-close-button.md).

## Acceptance criteria

1. `.modal-header` has `display: flex`, `align-items: center`, and
   `justify-content: space-between` as computed styles when the modal is open.

2. The `<h2#modal-title>` heading element has computed `flex: 1` (i.e. `flex-grow: 1`,
   `flex-shrink: 1`, `flex-basis: 0%`) — it fills all remaining space between any
   leading icon and the close button.

3. The close button (`aria-label="Close dialog"`) has computed `flex-shrink: 0` so it
   never compresses.

4. The close button is the **last** child element of `.modal-header` — confirmed by
   asserting `header.lastElementChild` matches the close button element. This verifies
   it is flush to the right in the flex row.

5. The gap between the title text and the close button is at least 8 px (`--u` spacing
   unit) — the close button must not overlap or immediately touch the title. This is
   confirmed by checking that the close button's `getBoundingClientRect().left` is
   greater than the title's `getBoundingClientRect().right`.

6. All of the above hold for the `default`, `confirm`, and `destructive` variants
   (the icon badge does not displace the close button).

7. Existing play-function assertions in all three stories (`Default`, `Confirm`,
   `Destructive`) continue to pass without modification — this fix must not regress
   any prior AC. (Note: the six-story structure from the original spec was consolidated
   to three stories as part of the Modal redesign that followed B34.)

## Implementation notes (for the implementer, not testable)

- Remove the `<Inline>` wrapper from the header and place the optional icon badge,
  `<Heading>`, and `<Button>` as direct children of `<header class="modal-header">`.
- Ensure `.modal-header` carries `justify-content: space-between` in its CSS rule.
- The `:global(.modal-title) { flex: 1 }` rule already exists; verify it still applies
  after restructuring (it targets the `id="modal-title"` h2 regardless of nesting).
- `flex-shrink: 0` should be added to the close button via a `.modal-close` helper
  class or inline, because the `<Button>` component is a child component and the
  scoped-CSS rule on `.modal-header > button` would not apply across the boundary
  without `:global`.

## Out of scope

- Redesigning the modal header layout beyond the flex alignment fix.
- Changing the close button's visual style, size, or variant.
- Adding any new story; ACs are verified by extending the `Default` story's existing
  play function only.
- Responsive or mobile-specific header behaviour.

## Open questions

None. This is a self-contained CSS/markup fix with a clear expected outcome.
