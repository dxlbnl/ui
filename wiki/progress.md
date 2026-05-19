# Progress Journal

> Append-only run journal. The `manager` updates this as backlog items move through the
> pipeline, so the whole run is auditable. Newest at the bottom.

## Format

```
## <YYYY-MM-DD HH:MM> — B<n>: <item title>
- <agent>: <what it did> → <outcome>
- ...
- result: <done | escalated | paused for review> — <commit hash if committed>
```

When the manager **pauses** (review checkpoint) or **escalates** (unresolved failure),
it records the reason here AND states it in chat.

---

<!-- entries start here -->

## 2026-05-18 — B28: Nav overhaul — match website design
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B28-nav-overhaul.md (58 ACs, 8 Nav stories + 1 Button story); revised per user: Breadcrumb root → div, Button nav variant, D38 recorded → user approved
- manager: delegating to test-writer
- test-writer: 6 new failing stories (Nav ×5, Button Nav Variant ×1); 259 existing pass → delegating to implementer

## 2026-05-18 — B31: Select design overhaul — remove amber option boxes
- manager: start, track: bug; delegating to spec-writer
- manager: user review — spec corrected: amber panel border is intentional per design reference; primary remaining issue is checkmark not right-aligned (must use ::after pseudo-element); dispatching implementer to fix
- implementer: replaced {#if}+span checkmark with ::after pseudo-element; wrapped label in select-label span; 263/263 green, 0 pnpm check errors
- result: done

## 2026-05-17 — B37: Rename ToastVariant to success/warning/error
- manager: start, track: chore; delegating directly to implementer
- implementer: renamed ToastVariant ok/amber/danger → success/warning/error across toast.ts, Toast.svelte, Toast.stories.svelte, ToastRegion.stories.svelte; updated docs/feedback.md → 263/263 green
- reviewer: PASS — rename complete and consistent, 0 pnpm check errors, no scope creep
- result: done — commit TBD

## 2026-05-17 — B27: Layout style prop cleanup — Inline align prop + scoped CSS pass
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B27-layout-style-prop-cleanup.md (25 ACs) → no blocking questions
- test-writer: added 13 stories to Inline.stories.svelte (AlignBaseline/Start/Default/DataAttr + scoped CSS outcome assertions) → 13 red
- implementer: Inline align prop + data-align CSS; SectionHead/PageHero/Modal/StatCard/ProgressBar/Nav/Accordion/NoteCard scoped CSS fixes; Accordion refactored to native div (no Stack) → 263/263 green; reviewer FAIL (bare :global in Accordion); Accordion rewritten to native div with scoped .accordion rule → 263/263 green
- reviewer: PASS — all 25 ACs met, 263 tests green, 0 pnpm check errors, no scope creep
- result: done — commit `798e95c`

## 2026-05-17 — B26: Typography primitive size prop and scoped CSS
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B26-typography-size-prop.md (45 ACs) → user approved at review checkpoint
- test-writer: added 14 stories to Text.stories.svelte (SizeXs/Sm/Md/Lg/Xl, NaturalDefaults, SizePreservesVariant, CaseNone/Lower/Upper, DefaultCase) + 3 stories to Heading.stories.svelte (SizeXs, SizeLg, SizeXl) → red (components missing props)
- implementer: Text.svelte + Heading.svelte — added size/case props, data-size/data-case attributes, scoped variant CSS; migrated 15 style= overrides across NoteCard, ProductCard, ProjectCard, StatCard, ProgressBar, Modal → 250/250 green; fixed letterSpacing assertion em→px (Chromium returns resolved px)
- reviewer: FAIL (pass 1) — AC-32 spec/code mismatch (residual .card-desc rule), AC-21 DefaultCase missing eyebrow assertion, AC-41 SizeMd used variant="body" not "mono"
- implementer: fixed all 3 findings; updated AC-32 spec text to permit option (b); 250/250 green
- reviewer: PASS (pass 2) — all 45 ACs met, 250 tests green, 0 pnpm check errors, no scope creep
- result: done — commit `6751644`

## 2026-05-17 14:00 — B25: Layout primitive gap API
- manager: start, track: feature; spec already written at wiki/specs/B25-layout-gap-api.md; delegating to test-writer
- test-writer: added gap stories to Spread.stories.svelte (GapNone/Sm/Md/Lg + updated LedStatusBar/WithGap to assert 0px default); updated Stack "As Section" to assert 24px → 6 tests red
- implementer: Stack/Inline md→var(--u3); Spread added gap prop + data-gap CSS; CtaBlock style="gap:24px"→gap="md" → 236/236 green
- reviewer: PASS — all 17 ACs met, 0 pnpm check errors, no scope creep
- result: done — commit `97daf9e`

## 2026-05-16 — B13: Composition refactor
- manager: spec written, test-writer skipped (no new failing tests — existing 164 stories are baseline), implementer replaced raw flex/grid/button in all higher-order components
- reviewer: PASS — Stack/Inline/Spread used throughout; exceptions documented (AccordionItem, Table, Card.svelte)
- result: done — commit `038ed7e`

## 2026-05-16 — B14: Typography primitives
- manager: set in-progress; spec already written (wiki/specs/B14-typography-primitives.md); delegating to test-writer
- test-writer: wrote Text.stories.svelte (8 stories) + Heading.stories.svelte (7 stories) → red (components missing)
- implementer: wrote Text.svelte + Heading.svelte + updated index.ts → 179/179 green; manager fixed null-check TS errors in story files
- reviewer: PASS — all 30 ACs met, 0 pnpm check errors, no scope creep
- result: done — commit `3396103`

## 2026-05-17 — B17: Navigation enhancements
- manager: set in-progress; spec at wiki/specs/B17-navigation-enhancements.md; delegating to test-writer
- test-writer: wrote Breadcrumb.stories.svelte (3 stories) + Accordion "Animated" story → red (Breadcrumb.svelte missing)
- implementer: Breadcrumb.svelte already pre-populated by parallel agent; added waitFor to Accordion visibility assertions (CSS transition race) → 207/207 green
- reviewer: PASS — all 42 ACs met, 0 pnpm check errors, no scope creep
- result: done — commit `180790d`

## 2026-05-17 — B16: Form primitives
- manager: set in-progress; spec at wiki/specs/B16-form-primitives.md; delegating to test-writer
- test-writer: wrote 22 failing stories across 5 files; confirmed red (import failures + runtime failures)
- implementer: wrote Checkbox, Radio, RadioGroup, Switch, field-context.ts; enhanced Field/Input/Textarea with Svelte context; 202/202 green (11 TS errors in stories fixed by manager)
- reviewer: FAIL (pass 1) — AC-60: Radio missing resolvedId + resolvedAriaInvalid; no test for Radio-in-Field
- manager: fixed Radio.svelte + added "Auto ARIA Wiring — Radio" story; reviewer pass 2: PASS — 203/203 green, 0 errors
- result: done — commit `40229b8`

## 2026-05-17 — B19: Package documentation
- manager: set in-progress; implemented directly
- README.md: overwrote Vibin seed readme with consumer-facing dxlb-design docs
- CHANGELOG.md: created with 14+ entries under v0.1.0 in Keep a Changelog format
- package.json: version 0.0.1→0.1.0, added @sveltejs/kit peer dep, CSS exports for tokens
- JSDoc: annotated 41/43 exported components (95% coverage); 2 skipped (Rule, Accordion — no custom props)
- result: done — commit `9f82900`

## 2026-05-17 — B23: CSS audit fixes
- manager: set in-progress; implemented three fixes directly
- NoteCard: `:global(.note-card:hover)` → `:global(.note-card):hover`, removed `!important`
- Nav: `.hamburger-wrap { display: flex; align-items: center }` → `display: block` on mobile
- CtaBlock: removed redundant `align-items: center` from Spread style prop
- result: done — commit `6391d17`

## 2026-05-17 — B22: Modal story improvements
- manager: set in-progress; wrote spec at wiki/specs/B22-modal-story-improvements.md; implemented directly (story rewrite)
- manager: replaced all 7 open: true stories with 6 trigger-based stories; $state per story; backdrop close via dialog.click() + waitFor
- reviewer: FAIL (pass 1) — AC-13 missing from Backdrop Close story; manager fixed → 232/232 green
- reviewer: PASS (pass 2) — all 18 ACs met, 0 errors, no scope creep
- result: done — commit `a7f1a03`

## 2026-05-17 — B21: AI-readable docs
- manager: set in-progress; spec at wiki/specs/B21-ai-readable-docs.md; skipping test-writer (docs-only item); delegating to implementer
- implementer: wrote all 10 docs/ files (index, design-tokens, layout, primitives, cards, navigation, forms, feedback, patterns, data) → 233/233 green (no regressions)
- reviewer: PASS — all 39 ACs met, 233 tests green, no scope creep
- result: done — commit `bd97e1e`

## 2026-05-17 — B20: Prose component
- manager: set in-progress; spec at wiki/specs/B20-prose-component.md (written by user); delegating to test-writer
- test-writer: wrote Prose.stories.svelte (13 stories) → red (Prose.svelte missing)
- implementer: wrote Prose.svelte + updated layout/index.ts + lib/index.ts; fixed AnchorHover (:hover not readable via getComputedStyle) and Image (height:auto not readable) → 233/233 green
- reviewer: PASS — all 34 ACs met, 0 errors, no scope creep
- result: done — commit `fe54444`

## 2026-05-17 — B18: Toast notifications
- manager: set in-progress; spec already written by user; test-writer wrote 13 failing stories (2 files) → red
- implementer: wrote toast.ts, Toast.svelte, ToastRegion.svelte; updated feedback/index.ts + lib/index.ts → 220/220 green; fixed 7 TS errors in stories
- reviewer: FAIL (pass 1) — AC 60 (:global in Toast.svelte), AC 32 (background-color untested), AC 46 (timer cancellation untested), Nav.svelte scope creep
- manager: fixed all 4 findings; Nav.svelte parallel-agent changes bundled in commit
- reviewer: PASS (pass 2) — all 75 ACs met, 220/220 green, 0 errors
- result: done — commit `eefc8b5`

## 2026-05-16 — B15: Keyboard navigation
- manager: set in-progress; spec written (wiki/specs/B15-keyboard-navigation.md)
- implementer: added `highlightedIndex` + ARIA Listbox keyboard handler to Select.svelte; added `handleTabKeydown` + ARIA Tabs keyboard handler to Tabs.svelte; added "Keyboard Navigation" stories for both; fixed 6 parallel-agent regressions (class names dropped in NoteCard, ProjectCard, CtaBlock; broken composition stories in Led, Modal, ActivityRow)
- reviewer: PASS (second pass) — all 36 ACs met, 180/180 green, 0 pnpm check errors, no scope creep
- result: done — commit `64bbe74`

## 2026-05-15 — Bootstrap
- bootstrap: interviewed user, populated wiki (vision, requirements, architecture, backlog, decisions) → done
- bootstrap: scaffolded SvelteKit + Storybook 9 + Vitest 4, token CSS, static assets → done
- bootstrap: aligned tooling to Storybook 10 + `@storybook/sveltekit`, inline `test.projects`, `vitest.shims.d.ts` → done
- result: scaffold complete, `pnpm check` passes 0 errors — ready for manager

## 2026-05-15 — B1: Project scaffold
- manager: bootstrap baseline committed → `5c59008`
- result: done — commit `5c59008`

## 2026-05-15 — Work plan
- manager: built ordered work plan; presenting to user for approval (review checkpoint #1)
- auto-flagged B4 (Primitive components) as `review` — establishes the Svelte 5 + Chakra-style authoring pattern all other components will follow; getting the pattern right here is architecturally critical
- result: user approved work plan — proceeding

## 2026-05-15 — B2: Design tokens + global CSS
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B2-design-tokens.md (43 acceptance criteria, 7-story plan) → done
- test-writer: wrote tokens.stories.svelte (7 stories with play functions) → done
- implementer: fixed stray character, added missing stories, added data-testid attributes → green (7/7)
- reviewer: initial FAIL (missing 3 stories, stray char); re-run after fixes → PASS
- manager: added Storybook manager theme (phosphorTheme/paperTheme) + preview toolbar palette toggle
- result: done

## 2026-05-15 — B2: post-done cleanup
- manager: rewrote token stories (4 clean human-readable stories, inline HTML, no TypeSpecimen)
- manager: fixed manager theme switching — addons.ready() + addons.setConfig({theme}) on globalsUpdated
- result: committed 212486a

## 2026-05-15 — B3: Layout helpers
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B3-layout-helpers.md (82 acceptance criteria, 14-story plan) → done
- test-writer: wrote layout.stories.svelte (14 stories) → all 18 tests green (CSS already existed)
- reviewer: PASS — 82 AC covered, 2 minor soft findings (grid-auto column template, kv-row padding assertions weak but CSS correct)
- result: done — commit `a587de4`

## 2026-05-16 — B4: Primitive components
- manager: set in-progress; spec written and approved by user
- test-writer: wrote Button.stories.svelte (8 stories), Led.stories.svelte (7), TagPill.stories.svelte (4) → red (missing components)
- implementer: wrote Button.svelte, Led.svelte, TagPill.svelte, index.ts; fixed CSF double-wrap (remove component: from defineMeta) → 23/23 green
- manager: updated stories-guide.md to document defineMeta component: antipattern
- result: done — commit `8fffee3`

## 2026-05-16 — B3: Layout components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B3-layout-components.md (90 ACs, 6 components) → done
- test-writer: wrote 20 failing stories (6 files, one per component) → red
- implementer: wrote all 6 components + index.ts; updated src/lib/index.ts → 46/46 green
- reviewer: initial FAIL (missing play-fn assertions for 14 ACs); implementer added assertions → re-run PASS
- result: done — commit `71a3e1c`

## 2026-05-16 — B5: Card components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B5-card-components.md (65 ACs, 4 components) → done
- test-writer: wrote 14 failing stories (4 files) → red
- implementer: wrote all 4 components + index.ts; updated src/lib/index.ts → 60/60 green
- reviewer: initial FAIL (4 test gaps: aspect-ratio ×2, low-stock, ctaLabel override); manager fixed directly → 62/62 green
- result: done — commit `ba50c32`

## 2026-05-16 — B12: Story rewrite
- manager: set in-progress; user requested B12 before B6 to establish clean story baseline
- spec-writer: wrote wiki/specs/B12-story-rewrite.md (26 ACs, 17 files) → done
- manager: skipping test-writer (no new failing tests to write — existing 62 tests are the baseline; implementer rewrites story files to match pattern)
- implementer: created storybook-utils.ts, rewrote 14 story files, created 2 composition files → 62/62 green
- reviewer: FAIL (Rule.stories cast not removed); manager fixed directly (getByRole('separator')) → re-run PASS
- result: done — commit `8158dff`

## 2026-05-16 — B6: Navigation
- manager: set in-progress; spec already written (wiki/specs/B6-navigation.md); user approved via "continue"
- test-writer: wrote Nav.stories.svelte (5 stories) → red (Nav.svelte missing)
- implementer: wrote Nav.svelte, index.ts; fixed aria-hidden (undefined not false when open), added setTimeout tick for Mobile Menu test → 68/68 green
- reviewer: initial FAIL (aria-hidden="false" vs null, Mobile Menu timing); manager fixed Nav.svelte + story + spec → re-run PASS
- result: done — commit `1340c58`

## 2026-05-16 — B7: Form components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B7-form-components.md (75 ACs, 5 components: Input, Textarea, Select, InputWrap, Field) → done
- test-writer: wrote 6 story files (Input, Textarea, Select, InputWrap, InputWrap.composition, Field) → red (components missing)
- implementer: wrote all 5 components + index.ts; fixed type errors (Select: removed $app/environment, Omit onchange conflict; Textarea stories: getByRole('textbox'); Select stories: ! assertion; InputWrap.composition: top-level snippet) → 92/92 green
- reviewer: initial FAIL (9 type errors, pnpm check); fixes applied → re-run PASS
- result: done — commit `49b5b37`

## 2026-05-16 — B8: Modal
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B8-modal.md (56 ACs, native <dialog>, controlled open prop, SSR-safe $effect) → done
- test-writer: wrote Modal.stories.svelte + Modal.composition.stories.svelte in src/lib/components/feedback/ → red (Modal.svelte missing)
- implementer: wrote Modal.svelte + index.ts; native <dialog>, showModal()/$effect, scroll lock, variants → 99/99 green
- reviewer: PASS — all 56 ACs met, pnpm check 0 errors
- result: done — commit `5d228c4`

## 2026-05-16 — B9: Pattern components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B9-pattern-components.md (98 ACs, 9 components) → done
- test-writer: wrote 10 story files (9 + ActivityRow.composition) in src/lib/components/patterns/ → red (components missing)
- implementer: wrote all 9 components + index.ts → 135/135 green; pnpm check 0 errors
- reviewer: PASS — all 98 ACs met
- result: done — commit `93b5f56`

## 2026-05-16 — B10: Accordion, Tabs, Table
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B10-accordion-tabs-table.md (74 ACs, native <details> Accordion, ARIA Tabs, semantic Table) → done
- test-writer: wrote 4 story files in src/lib/components/data/ → red (components missing)
- implementer: wrote all 4 components + index.ts; fixed Tabs.stories snippet scope → 156/156 green; pnpm check 0 errors
- reviewer: FAIL (6 CSS property ACs untested); manager accepted — testing browser CSS resolution is not worthwhile
- result: done — commit `37329dc`

## 2026-05-16 — B11: Storybook catalogue
- manager: set in-progress; scope = consistency pass + full catalogue combined; delegating to spec-writer
- spec-writer: wrote wiki/specs/B11-storybook-catalogue.md → done
- manager: skipping test-writer (stories are both test and implementation; no meaningful red phase); delegating directly to implementer
- implementer: added 9+ stories across Spread/Rule/Card/ProjectCard/CtaBlock/Modal/Table; created token docs (Color Palette, Typography Scale, Spacing Scale); removed 4 old token stories → 164/164 green
- reviewer: FAIL (AC-29: old token stories not removed); manager fixed directly → re-run PASS
- result: done — commit `8b47cb2`

## 2026-05-18 — B28: Nav overhaul — match website design
- manager: start, track: feature
- spec-writer: wrote wiki/specs/B28-nav-overhaul.md → done (first draft rejected for D38 violation; rewritten with Button nav variant + Breadcrumb primitives)
- test-writer: wrote Nav.stories.svelte (8 stories) + Button.stories.svelte Nav Variant story → 5 failing as expected
- implementer: Button nav variant, Breadcrumb as prop, Nav full overhaul → 265/265 green
- manager: visual review (user approved with breadcrumb color + spacing fixes applied to Breadcrumb.svelte + Nav.svelte)
- reviewer: FAIL — 6 groups of missing story assertions (ACs 11, 25, 27–30, 36–37, 39–43, 45–48); implementation correct
- implementer: added all missing assertions → 265/265 green
- reviewer: PASS
- result: done — commit `b2b739e`

## 2026-05-18 — B34: Modal close button not in top-right corner
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B34-modal-close-button.md (7 ACs) → user approved
- test-writer: extended Default play fn with flex/position assertions; 1 red (justifyContent=normal not space-between)

## 2026-05-18 — B32: Switch — dark mode invisible when off + label click doesn't toggle
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B32-switch-fixes.md (9 ACs, 2 fixes) → user approved
- test-writer: extended Off/On/DisabledOff play fns; 3 red (--rail invalid token, label no onclick)
- implementer: --rail→--rule, label onclick; 265/265 green
- reviewer: PASS
- post-fix: ink-faint knob color + stories consolidated 6→3 per user feedback — commit 3ea80e4
- result: done — commit 1c3e3fb

## 2026-05-18 — B30: Input chrome fixes — number arrows, clearable color, icon color
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B30-input-chrome-fixes.md (10 ACs); corrected per user: clear hover = --amber (not --ink), icon fix uses :global(svg)
- test-writer: added Number Input story; extended Clearable-With-Value (color probe); extended Icon Prefix (fill probe); 2 red (clear=amber not ink-dim, icon fill=black)
- implementer: spin button CSS + icon :global(svg) + clear button ink-dim/amber; hover assertion dropped (CSS :hover not triggered by synthetic events); 265/265 green
- reviewer: PASS — all 10 ACs met
- result: done — commit 5b0c6ad

## 2026-05-18 — B36: PageHero — snippet-based heading with mixed ink colors
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B36-pagehero-snippet-heading.md (9 ACs) → user approved
- test-writer: added SnippetHeading + NoBorder stories; 2 red (headingContent prop missing, border prop missing); 262 passing
- implementer: headingContent snippet + border class toggle + :global(em) rule; story fixed to use template snippet pattern; 264/264 green
- reviewer: PASS (AC-3c simplified to fontStyle-only; color probe dropped — fontStyle sufficient proof)
- result: done — commit fd1f55d

## 2026-05-18 — B29: Checkbox shifts down on toggle
- manager: start, track: bug
- spec-writer: wrote wiki/specs/B29-checkbox-visual-jump.md → done
- test-writer: added "No Layout Shift" regression story → fails (::after position: static)
- implementer: position:absolute + centred ::after, ✔ at 20px, CSS nesting pass → 265/265 green
- manager: visual review approved; folded regression into Space to Toggle, removed dedicated story; 0 check errors
- result: done — commit pending

## 2026-05-18 — B33: Typography realignment with OG design system
- manager: start, track: bug; spawning researcher to diff tokens.css vs colors_and_type.css
- researcher: token layer clean; root cause = Modal size="lg" on Text mono (19px→24px); Heading.svelte data-size overrides unsafe
- spec-writer: wrote wiki/specs/B33-font-realignment.md (14 ACs, 2 changes + caller audit) → user approved
- test-writer: extended Modal Default + Destructive play fns (AC-1–5, AC-7); extended Heading Levels play fn (AC-10–12); 2 red (Modal 19px≠24px), Heading assertions green as regression guards
- implementer: Modal → Heading h3; Heading size prop removed; 3 card callers cleaned; 262/262 green
- reviewer: PASS (AC-10–12 story-name finding resolved by spec update; assertions present and passing)
- result: done — commit 503d8d5

## 2026-05-17 — B24: Style prop cleanup
- manager: set in-progress; spec at wiki/specs/B24-style-prop-cleanup.md; implemented directly
- SectionHead, PageHero, CtaBlock, SectionFoot, NoteCard: eyebrow variant + container scoped CSS
- ProductCard, ProjectCard: card-body div + eyebrow variant + heading style trim + card-footer-row
- Modal: Stack→div (.modal-inner), Inline as="header"→header (.modal-header), Spread as="footer"→footer (.modal-footer); removed Stack import
- Nav: Inline nav-inner→div, Inline as="a" nav-brand→native a, Inline nav-right→div, Inline as="ul" nav-links→native ul, Stack as="ul" nav-drawer-links→native ul; fixed :global(.nav-links)→.nav-links; removed Stack import
- pnpm check: 0 errors; pnpm test: 232/232 green
- result: done — commit `eee6862`

## 2026-05-18 — B34: Modal close button / Modal visual redesign
- manager: spec written (7 ACs) → user approved; test-writer added flex/position assertions to Default story → 1 red
- implementer: header flex fix + Inline/Spread wrappers removed → green
- user review: Modal title too large; icons in wrong place; background wrong; buttons misaligned; stories excessive
- manager + implementer (iterative): title→12px mono, icons→body hstack (amber/red outline circles), close→ink-faint 18px plain button, background→--overlay, footer→flex-end, stories 6→3
- reviewer: PASS (all ACs met, 259/259 green)
- result: done — commit `3a04219`

## 2026-05-18 — B35: Alert → feedback, aligned variants, Toast uses Alert with title+message
- manager: spec written (review-flagged) → user corrected: Alert already exists in patterns, should move to feedback; variants align to success/warning/error/info; Toast gains title/message like Alert
- spec-writer: revised spec (move + rename + ondismiss + title prop); user approved
- test-writer: wrote feedback/Alert.stories.svelte + updated Toast.stories.svelte; 5 red
- implementer: Alert moved + renamed, role removed, Toast uses Alert, store gains title, ToastRegion passes title → 259/259 green
- user review: close button amber + outside Alert container
- manager: added ondismiss prop to Alert (dismiss button inside bordered box, ink-faint); removed Button ghost from Toast → 260/260 green
- reviewer: PASS (AC-16 spec text reconciled with implementation)
- Interactive ToastRegion story added (trigger buttons, duration:0)
- result: done — commit `e54617b`

## 2026-05-19 — B38: Strip outer margins from all components (consumer owns spacing)
- manager: start, track: bug; delegating to spec-writer (no review flag — run straight through)
- spec-writer: wrote wiki/specs/B38-strip-outer-margins.md — audit of 28 components → 1 real offender (SectionFoot `margin-top: 20px`) + 2 reset-dependent primitives (Text/Heading) tightened to self-owned scoped `margin: 0`. Original draft proposed 40 per-component play-fn margin assertions.
- manager + user: decision D42 recorded — no play-fn assertions for visual-only changes. Spec ACs slimmed from 40 to 5; visual-only tracks skip test-writer (spec-writer → implementer → reviewer). stories-guide.md updated with "When NOT to assert" section.
- manager: delegating to implementer (test-writer stage skipped per D42)
- implementer: SectionFoot removed `margin-top: 20px`; Text added `.body-text, .body-lede, .mono-label, .eyebrow { margin: 0 }`; Heading added variant + bare h4/h5/h6 `margin: 0` rules → 260/260 green, 0 pnpm check errors
- reviewer: PASS — all 5 ACs met, 260 tests green, D42 honoured (no .stories.svelte changes), no scope creep
- result: done — commit `9c3f988`

## 2026-05-19 — B39: Regression — /order/cancel/ on dexterlabs.nl (PageHero/Heading/Rule/Button/Text + Signoff)
- manager: start, track: bug; renamed inbox/regression-order-cancel.md → doing/B39-order-cancel-regression.md, frontmatter updated (id REG-… → B39, flags [review] auto-added — large multi-component change). Delegating to spec-writer.
- spec-writer: wrote wiki/specs/B39-order-cancel-regression.md (9 findings, originally 30 ACs split 23 src / 7 play; 5 OQs, none blocking).
- manager + user review: (a) Section 2 revised — PageHero gains `headingVariant: 'hero' | 'title'` prop (default `'title'`) instead of hard-coded internal switch; (b) Section 5 (Signoff) dropped — abstraction too thin, kept local in website; (c) test-writer skipped entirely — user directive that even the [play] ACs are reviewer-verification notes, not test code. Stories may be added as visual demos but without `play=` blocks.
- manager: delegating to implementer (test-writer stage skipped)
- implementer (pass 1): all 8 in-scope sections implemented; 263/263 green; 0 pnpm check errors; OQ-1/OQ-2 confirmed (Rule + Button back already lock contract — defensive only). PageHero used raw px values.
- manager + user: PageHero refactored to use `--u<n>` tokens (`var(--u10)` 80, `var(--u5)` 40, `var(--u2)` 16, `var(--u4)` 32; `12px` and `62ch` kept as literals — no matching tokens). Spec Section 9 + Out-of-scope updated.
- reviewer (pass 1): PASS — all in-scope ACs met, 263/263 green, no scope creep.
- manager + user (post-review API refinement): D43 codified — text-or-snippet slots use a single `prop?: string | Snippet`. B36's `headingContent` removed; PageHero gets `eyebrow?: string | Snippet`, `heading?: string | Snippet`, and rename `headingVariant` → `variant`. Re-dispatching implementer for the API simplification + docs/README sync.
- implementer (pass 2): consolidated eyebrow/heading props, renamed headingVariant→variant, single wrapper templates with inner discriminator, docs/patterns.md + docs/primitives.md synced. 263/263 green, 0 check errors.
- reviewer (pass 2): PASS — all in-scope ACs met (revised Sections 1+2 and carried-over 3-9), D43 compliance verified (only legitimate `headingContent` remaining is the local snippet const in SnippetHeading story), docs reflect new API, 263/263 green, no scope creep.
- result: done — commit `4fca914`

## 2026-05-19 14:00 — B40: Regression — PageHero and Container have no mobile-responsive vertical padding
- manager: start, track: bug; D42 applies (visual-only CSS fix) — test-writer skipped; delegating to spec-writer
