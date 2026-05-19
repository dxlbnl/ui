# B44: Regression — Prose should not constrain width by default

## Context

`<Prose>` currently defaults `maxWidth = '72ch'`, emitting `style="max-width: 72ch"` on its
root element. This creates a silent double-constraint when Prose sits inside a `<Container>`
that already governs page width: on `size="md"` pages (896px inner) the reading column is
capped at 72ch while PageHero, Rule, and Signature above and below span the full container
width, producing a visual misalignment.

The current workaround is `<Prose maxWidth="none">` on every slug page, which is noise.

The fix: drop the default so `maxWidth` is `undefined` by default. Svelte's `style:max-width`
directive emits nothing when the value is `undefined`, so Prose inherits its width from its
container — which is the correct behaviour. Consumers that still want a 72ch reading column
can opt in explicitly.

D42 applies: this is a visual/CSS-only change. Test-writer is skipped; the pipeline is
spec-writer → implementer → reviewer.

Related pages: [architecture.md](../architecture.md) — [decisions.md D42](../decisions.md#d42-no-play-fn-assertions-for-visual-only-changes) — [item card](../backlog/doing/B44-prose-no-default-maxwidth.md)

## Acceptance criteria

1. In `src/lib/components/layout/Prose.svelte`, the `maxWidth` prop default is removed.
   The destructuring line reads `let { as = 'article', maxWidth, children, class: klass = '', ...rest }: ProseProps = $props()` with no `= '72ch'` assignment.

2. The JSDoc comment on `maxWidth` in `ProseProps` is updated to reflect the new default:
   `/** Max-width constraint applied to the prose container. Omit to inherit from the parent. */`
   (no `@default '72ch'`).

3. When `<Prose>` is rendered with no props, the rendered root element has **no** `max-width`
   inline style attribute (i.e. `getAttribute('style')` returns `null` or omits `max-width`).

4. When `<Prose maxWidth="72ch">` is explicitly passed, the rendered root element carries
   `style="max-width: 72ch;"` — the opt-in path still works.

5. In `src/routes/(console)/legal/[slug]/+page.svelte`, the `maxWidth="none"` prop is
   removed from the `<Prose>` usage. The page must still build and render without error.

6. In `src/routes/(console)/notes/[slug]/+page.svelte`, the `maxWidth="none"` prop is
   removed from the `<Prose>` usage. The page must still build and render without error.

7. `pnpm check` (svelte-check + tsc) passes with zero errors after all three file changes.

8. All existing Storybook play-function tests continue to pass (`pnpm test` green).

## Out of scope

- Adding a `<Column>` layout primitive for wrapping a 72ch reading column alongside
  non-prose siblings (mentioned in the item card as a separate, future ask).
- Changing any other prop or styling behaviour of `Prose.svelte`.
- Updating `Prose.stories.svelte` with new play-function assertions for the visual change
  (D42: no play-fn assertions for visual-only changes).

## Open questions

None. The fix is fully specified by the item card and the existing code.
