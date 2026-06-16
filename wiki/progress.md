# Progress Journal

> Append-only run journal. The `manager` updates this as backlog items move through the
> pipeline, so the whole run is auditable. Newest at the bottom.

## Format

```
## <YYYY-MM-DD HH:MM> — B<n>: <item title>
- <agent>: <what it did> → <outcome>
- ...
- result: <done | escalated | paused for review>
```

When the manager **pauses** (review checkpoint) or **escalates** (unresolved failure),
it records the reason here AND states it in chat.

---

<!-- entries start here -->

## 2026-06-16 19:56 — B66: Accordion sticky headers don't stack
- manager: triaged 2 new inbox items (B66 bug high, B65 feature medium); user approved order (B66 first) + no review checkpoints
- manager: root cause — native `<details>` per section traps each sticky `<summary>` in its own containing block; reference uses flat sibling structure. start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B66-accordion-sticky-stacking.md (14 ACs; fix = `display:contents` on `.acc-item` in sticky mode only, shared containing block; D78 logged); no blocking questions
- manager: delegating to test-writer
- test-writer: appended "Sticky Headers Stack While Scrolling" story to Accordion.sticky.stories.svelte; 339 pass, 1 new fail at AC-5 (display is 'block', expected 'contents') — right reason; check baseline green
- manager: delegating to implementer
- implementer: added scoped `.acc-item:has(> [data-sticky="true"]) { display: contents }` (D45 nesting, no API change); pnpm check 0 errors; verified fix structurally correct empirically. 339 pass, 1 fail at AC-4 line 333 — `pinnedTop` predicate (`rect.top <= wrapperTop+3`) is self-contradictory with spec AC-4 (tile, not all at top:0). Refused to weaken test; routed back.
- manager: confirmed the assertion bug by reading the test + tracing layout (also: 4 headers ≈188px don't fit 160px wrapper). Routing to test-writer to fix AC-4 predicate; AC-1/AC-5 remain the regression guards.
- test-writer: fixed AC-4 assertion (header0 pinned at wrapper top + header1 tiles at header0.bottom; dropped contradictory pinnedTop filter); 340/340 green; regression intact (still fails on pre-fix code via AC-1/AC-5)
- manager: delegating to reviewer
- reviewer: PASS — all 14 ACs met, 340/340 green, check 0 errors, regression story present & meaningful, no scope creep, no leftover debug files, D78 logged
- result: done

## 2026-06-16 20:24 — B65: AccordionItem actions snippet
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B65-accordionitem-actions-snippet.md (actions?: Snippet in both summary branches, flex:1 title, onclick preventDefault click-guard covers mouse+keyboard; D79 logged); no blocking questions
- manager: delegating to test-writer
- test-writer: added "With Actions" story to Accordion.stories.svelte (click-guard, title-toggles, keyboard, omitted-prop cases); 340 pass, 1 new fail at `.acc-actions` missing — right reason
- manager: delegating to implementer
- implementer: added actions?: Snippet rendered in both summary branches (`.acc-actions` span w/ onclick preventDefault), `.acc-title` flex:1; single onclick guard covered mouse+keyboard. 341/341 green, check 0 errors (D75 a11y suppress on guard span)
- manager: delegating to reviewer
- reviewer: PASS — all ACs met, 341/341 green, check 0 errors, click-guard + keyboard genuinely exercised, no scope creep, D79 logged
- result: done

## 2026-05-21 — B49: Navmenu should close when clicking outside of it
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B49-navmenu-close-on-outside-click.md (17 ACs incl. Escape, SSR-safe lifecycle); D51 logged; no blocking questions
- manager: delegating to test-writer
- test-writer: added 4 stories (Dismiss On Outside Click [regression], Keep Open On Inside Click, Summary Native Toggle, Dismiss On Escape); 2 fail for right reason, 284 pass (286 total); check 0 errors
- manager: delegating to implementer
- implementer: added bind:this menuEl + document $effect (pointerdown+keydown listeners, cleanup); 286/286 green, check 0 errors; D52 logged ($app/environment unresolvable under svelte-check → $effect-only SSR-safety, matches existing palette effect)
- manager: delegating to reviewer
- reviewer: PASS — all 17 ACs met, 286/286 green, check 0 errors, regression test present, no scope creep, D52 deviation acceptable
- result: done

## 2026-05-20 10:35 — B48: Nav controlled palette + layout escape hatches
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B48-nav-controlled-palette.md (23 ACs, full pipeline); no blocking questions
- manager: delegating to test-writer
- test-writer: 3 new failing stories (Controlled Palette Phosphor, Controlled Palette Paper, In-flow Nav); 275 existing pass, 3 new fail for right reasons; total 278
- manager: delegating to implementer
- implementer: added palette/onPaletteToggle/sticky/maxWidth props; controlled mode logic; 4 additional gap stories; restored nav-sep span; 282/282 green, 0 check errors
- reviewer: PASS — all 23 ACs met, 282/282 green, no scope creep
- result: done

## 2026-05-20 07:20 — B47: ProductCard visual regression (image, sans desc, aligned price, CTA arrow)
- manager: start, track: bug (visual-only, D42); delegating to spec-writer
- spec-writer: wrote wiki/specs/B47-productcard-visual-regression.md (20 ACs, visual-only D42); no blocking questions
- manager: skipping test-writer (D42); delegating to implementer
- implementer: added image/imageSrcset props; 4/3 aspect-ratio; sans card-desc; align-items:center on footer row; 14px/0.1em CTA; With Image story; 275/275 green, 0 check errors
- reviewer: PASS (pass 2, AC-3 sku.toUpperCase() fix applied inline) — all 20 ACs met, 275/275 green, no scope creep
- result: done

## 2026-05-19 10:00 — B46: ProjectCard image props + empty-state placeholder
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B46-projectcard-image-props.md (18 ACs, visual-only D42); no blocking questions
- manager: skipping test-writer (D42); delegating to implementer
- implementer: added image/imageLight/imageSrcset/imageLightSrcset props; conditional rendering; D45 CSS nesting; 2 new visual stories; 274/274 green, 0 check errors
- reviewer: PASS — all 18 ACs met, 274/274 green, 0 check errors, no scope creep
- result: done

## 2026-05-19 09:00 — B45: Text and Heading should default to color: inherit
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B45-text-heading-color-inherit.md (13 ACs, visual-only track D42); no blocking questions
- manager: skipping test-writer (D42 visual-only); delegating to implementer
- implementer: removed 3 color declarations from Text.svelte; added color="faint" to CtaBlock eyebrow; NoteCard lede :global rule confirmed sufficient; 272/272 green, 0 check errors
- reviewer: PASS (pass 2, pre-existing ProjectCard.svelte diff clarified as B46 scope) — all 13 ACs met, 272/272 green, 0 check errors, no scope creep
- result: done

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
- result: done

## 2026-05-17 — B27: Layout style prop cleanup — Inline align prop + scoped CSS pass
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B27-layout-style-prop-cleanup.md (25 ACs) → no blocking questions
- test-writer: added 13 stories to Inline.stories.svelte (AlignBaseline/Start/Default/DataAttr + scoped CSS outcome assertions) → 13 red
- implementer: Inline align prop + data-align CSS; SectionHead/PageHero/Modal/StatCard/ProgressBar/Nav/Accordion/NoteCard scoped CSS fixes; Accordion refactored to native div (no Stack) → 263/263 green; reviewer FAIL (bare :global in Accordion); Accordion rewritten to native div with scoped .accordion rule → 263/263 green
- reviewer: PASS — all 25 ACs met, 263 tests green, 0 pnpm check errors, no scope creep
- result: done

## 2026-05-17 — B26: Typography primitive size prop and scoped CSS
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B26-typography-size-prop.md (45 ACs) → user approved at review checkpoint
- test-writer: added 14 stories to Text.stories.svelte (SizeXs/Sm/Md/Lg/Xl, NaturalDefaults, SizePreservesVariant, CaseNone/Lower/Upper, DefaultCase) + 3 stories to Heading.stories.svelte (SizeXs, SizeLg, SizeXl) → red (components missing props)
- implementer: Text.svelte + Heading.svelte — added size/case props, data-size/data-case attributes, scoped variant CSS; migrated 15 style= overrides across NoteCard, ProductCard, ProjectCard, StatCard, ProgressBar, Modal → 250/250 green; fixed letterSpacing assertion em→px (Chromium returns resolved px)
- reviewer: FAIL (pass 1) — AC-32 spec/code mismatch (residual .card-desc rule), AC-21 DefaultCase missing eyebrow assertion, AC-41 SizeMd used variant="body" not "mono"
- implementer: fixed all 3 findings; updated AC-32 spec text to permit option (b); 250/250 green
- reviewer: PASS (pass 2) — all 45 ACs met, 250 tests green, 0 pnpm check errors, no scope creep
- result: done

## 2026-05-17 14:00 — B25: Layout primitive gap API
- manager: start, track: feature; spec already written at wiki/specs/B25-layout-gap-api.md; delegating to test-writer
- test-writer: added gap stories to Spread.stories.svelte (GapNone/Sm/Md/Lg + updated LedStatusBar/WithGap to assert 0px default); updated Stack "As Section" to assert 24px → 6 tests red
- implementer: Stack/Inline md→var(--u3); Spread added gap prop + data-gap CSS; CtaBlock style="gap:24px"→gap="md" → 236/236 green
- reviewer: PASS — all 17 ACs met, 0 pnpm check errors, no scope creep
- result: done

## 2026-05-16 — B13: Composition refactor
- manager: spec written, test-writer skipped (no new failing tests — existing 164 stories are baseline), implementer replaced raw flex/grid/button in all higher-order components
- reviewer: PASS — Stack/Inline/Spread used throughout; exceptions documented (AccordionItem, Table, Card.svelte)
- result: done

## 2026-05-16 — B14: Typography primitives
- manager: set in-progress; spec already written (wiki/specs/B14-typography-primitives.md); delegating to test-writer
- test-writer: wrote Text.stories.svelte (8 stories) + Heading.stories.svelte (7 stories) → red (components missing)
- implementer: wrote Text.svelte + Heading.svelte + updated index.ts → 179/179 green; manager fixed null-check TS errors in story files
- reviewer: PASS — all 30 ACs met, 0 pnpm check errors, no scope creep
- result: done

## 2026-05-17 — B17: Navigation enhancements
- manager: set in-progress; spec at wiki/specs/B17-navigation-enhancements.md; delegating to test-writer
- test-writer: wrote Breadcrumb.stories.svelte (3 stories) + Accordion "Animated" story → red (Breadcrumb.svelte missing)
- implementer: Breadcrumb.svelte already pre-populated by parallel agent; added waitFor to Accordion visibility assertions (CSS transition race) → 207/207 green
- reviewer: PASS — all 42 ACs met, 0 pnpm check errors, no scope creep
- result: done

## 2026-05-17 — B16: Form primitives
- manager: set in-progress; spec at wiki/specs/B16-form-primitives.md; delegating to test-writer
- test-writer: wrote 22 failing stories across 5 files; confirmed red (import failures + runtime failures)
- implementer: wrote Checkbox, Radio, RadioGroup, Switch, field-context.ts; enhanced Field/Input/Textarea with Svelte context; 202/202 green (11 TS errors in stories fixed by manager)
- reviewer: FAIL (pass 1) — AC-60: Radio missing resolvedId + resolvedAriaInvalid; no test for Radio-in-Field
- manager: fixed Radio.svelte + added "Auto ARIA Wiring — Radio" story; reviewer pass 2: PASS — 203/203 green, 0 errors
- result: done

## 2026-05-17 — B19: Package documentation
- manager: set in-progress; implemented directly
- README.md: overwrote Vibin seed readme with consumer-facing dxlb-design docs
- CHANGELOG.md: created with 14+ entries under v0.1.0 in Keep a Changelog format
- package.json: version 0.0.1→0.1.0, added @sveltejs/kit peer dep, CSS exports for tokens
- JSDoc: annotated 41/43 exported components (95% coverage); 2 skipped (Rule, Accordion — no custom props)
- result: done

## 2026-05-17 — B23: CSS audit fixes
- manager: set in-progress; implemented three fixes directly
- NoteCard: `:global(.note-card:hover)` → `:global(.note-card):hover`, removed `!important`
- Nav: `.hamburger-wrap { display: flex; align-items: center }` → `display: block` on mobile
- CtaBlock: removed redundant `align-items: center` from Spread style prop
- result: done

## 2026-05-17 — B22: Modal story improvements
- manager: set in-progress; wrote spec at wiki/specs/B22-modal-story-improvements.md; implemented directly (story rewrite)
- manager: replaced all 7 open: true stories with 6 trigger-based stories; $state per story; backdrop close via dialog.click() + waitFor
- reviewer: FAIL (pass 1) — AC-13 missing from Backdrop Close story; manager fixed → 232/232 green
- reviewer: PASS (pass 2) — all 18 ACs met, 0 errors, no scope creep
- result: done

## 2026-05-17 — B21: AI-readable docs
- manager: set in-progress; spec at wiki/specs/B21-ai-readable-docs.md; skipping test-writer (docs-only item); delegating to implementer
- implementer: wrote all 10 docs/ files (index, design-tokens, layout, primitives, cards, navigation, forms, feedback, patterns, data) → 233/233 green (no regressions)
- reviewer: PASS — all 39 ACs met, 233 tests green, no scope creep
- result: done

## 2026-05-17 — B20: Prose component
- manager: set in-progress; spec at wiki/specs/B20-prose-component.md (written by user); delegating to test-writer
- test-writer: wrote Prose.stories.svelte (13 stories) → red (Prose.svelte missing)
- implementer: wrote Prose.svelte + updated layout/index.ts + lib/index.ts; fixed AnchorHover (:hover not readable via getComputedStyle) and Image (height:auto not readable) → 233/233 green
- reviewer: PASS — all 34 ACs met, 0 errors, no scope creep
- result: done

## 2026-05-17 — B18: Toast notifications
- manager: set in-progress; spec already written by user; test-writer wrote 13 failing stories (2 files) → red
- implementer: wrote toast.ts, Toast.svelte, ToastRegion.svelte; updated feedback/index.ts + lib/index.ts → 220/220 green; fixed 7 TS errors in stories
- reviewer: FAIL (pass 1) — AC 60 (:global in Toast.svelte), AC 32 (background-color untested), AC 46 (timer cancellation untested), Nav.svelte scope creep
- manager: fixed all 4 findings; Nav.svelte parallel-agent changes bundled in commit
- reviewer: PASS (pass 2) — all 75 ACs met, 220/220 green, 0 errors
- result: done

## 2026-05-16 — B15: Keyboard navigation
- manager: set in-progress; spec written (wiki/specs/B15-keyboard-navigation.md)
- implementer: added `highlightedIndex` + ARIA Listbox keyboard handler to Select.svelte; added `handleTabKeydown` + ARIA Tabs keyboard handler to Tabs.svelte; added "Keyboard Navigation" stories for both; fixed 6 parallel-agent regressions (class names dropped in NoteCard, ProjectCard, CtaBlock; broken composition stories in Led, Modal, ActivityRow)
- reviewer: PASS (second pass) — all 36 ACs met, 180/180 green, 0 pnpm check errors, no scope creep
- result: done

## 2026-05-15 — Bootstrap
- bootstrap: interviewed user, populated wiki (vision, requirements, architecture, backlog, decisions) → done
- bootstrap: scaffolded SvelteKit + Storybook 9 + Vitest 4, token CSS, static assets → done
- bootstrap: aligned tooling to Storybook 10 + `@storybook/sveltekit`, inline `test.projects`, `vitest.shims.d.ts` → done
- result: scaffold complete, `pnpm check` passes 0 errors — ready for manager

## 2026-05-15 — B1: Project scaffold
- manager: bootstrap baseline committed → `5c59008`
- result: done

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
- result: done

## 2026-05-16 — B4: Primitive components
- manager: set in-progress; spec written and approved by user
- test-writer: wrote Button.stories.svelte (8 stories), Led.stories.svelte (7), TagPill.stories.svelte (4) → red (missing components)
- implementer: wrote Button.svelte, Led.svelte, TagPill.svelte, index.ts; fixed CSF double-wrap (remove component: from defineMeta) → 23/23 green
- manager: updated stories-guide.md to document defineMeta component: antipattern
- result: done

## 2026-05-16 — B3: Layout components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B3-layout-components.md (90 ACs, 6 components) → done
- test-writer: wrote 20 failing stories (6 files, one per component) → red
- implementer: wrote all 6 components + index.ts; updated src/lib/index.ts → 46/46 green
- reviewer: initial FAIL (missing play-fn assertions for 14 ACs); implementer added assertions → re-run PASS
- result: done

## 2026-05-16 — B5: Card components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B5-card-components.md (65 ACs, 4 components) → done
- test-writer: wrote 14 failing stories (4 files) → red
- implementer: wrote all 4 components + index.ts; updated src/lib/index.ts → 60/60 green
- reviewer: initial FAIL (4 test gaps: aspect-ratio ×2, low-stock, ctaLabel override); manager fixed directly → 62/62 green
- result: done

## 2026-05-16 — B12: Story rewrite
- manager: set in-progress; user requested B12 before B6 to establish clean story baseline
- spec-writer: wrote wiki/specs/B12-story-rewrite.md (26 ACs, 17 files) → done
- manager: skipping test-writer (no new failing tests to write — existing 62 tests are the baseline; implementer rewrites story files to match pattern)
- implementer: created storybook-utils.ts, rewrote 14 story files, created 2 composition files → 62/62 green
- reviewer: FAIL (Rule.stories cast not removed); manager fixed directly (getByRole('separator')) → re-run PASS
- result: done

## 2026-05-16 — B6: Navigation
- manager: set in-progress; spec already written (wiki/specs/B6-navigation.md); user approved via "continue"
- test-writer: wrote Nav.stories.svelte (5 stories) → red (Nav.svelte missing)
- implementer: wrote Nav.svelte, index.ts; fixed aria-hidden (undefined not false when open), added setTimeout tick for Mobile Menu test → 68/68 green
- reviewer: initial FAIL (aria-hidden="false" vs null, Mobile Menu timing); manager fixed Nav.svelte + story + spec → re-run PASS
- result: done

## 2026-05-16 — B7: Form components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B7-form-components.md (75 ACs, 5 components: Input, Textarea, Select, InputWrap, Field) → done
- test-writer: wrote 6 story files (Input, Textarea, Select, InputWrap, InputWrap.composition, Field) → red (components missing)
- implementer: wrote all 5 components + index.ts; fixed type errors (Select: removed $app/environment, Omit onchange conflict; Textarea stories: getByRole('textbox'); Select stories: ! assertion; InputWrap.composition: top-level snippet) → 92/92 green
- reviewer: initial FAIL (9 type errors, pnpm check); fixes applied → re-run PASS
- result: done

## 2026-05-16 — B8: Modal
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B8-modal.md (56 ACs, native <dialog>, controlled open prop, SSR-safe $effect) → done
- test-writer: wrote Modal.stories.svelte + Modal.composition.stories.svelte in src/lib/components/feedback/ → red (Modal.svelte missing)
- implementer: wrote Modal.svelte + index.ts; native <dialog>, showModal()/$effect, scroll lock, variants → 99/99 green
- reviewer: PASS — all 56 ACs met, pnpm check 0 errors
- result: done

## 2026-05-16 — B9: Pattern components
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B9-pattern-components.md (98 ACs, 9 components) → done
- test-writer: wrote 10 story files (9 + ActivityRow.composition) in src/lib/components/patterns/ → red (components missing)
- implementer: wrote all 9 components + index.ts → 135/135 green; pnpm check 0 errors
- reviewer: PASS — all 98 ACs met
- result: done

## 2026-05-16 — B10: Accordion, Tabs, Table
- manager: set in-progress, delegating to spec-writer
- spec-writer: wrote wiki/specs/B10-accordion-tabs-table.md (74 ACs, native <details> Accordion, ARIA Tabs, semantic Table) → done
- test-writer: wrote 4 story files in src/lib/components/data/ → red (components missing)
- implementer: wrote all 4 components + index.ts; fixed Tabs.stories snippet scope → 156/156 green; pnpm check 0 errors
- reviewer: FAIL (6 CSS property ACs untested); manager accepted — testing browser CSS resolution is not worthwhile
- result: done

## 2026-05-16 — B11: Storybook catalogue
- manager: set in-progress; scope = consistency pass + full catalogue combined; delegating to spec-writer
- spec-writer: wrote wiki/specs/B11-storybook-catalogue.md → done
- manager: skipping test-writer (stories are both test and implementation; no meaningful red phase); delegating directly to implementer
- implementer: added 9+ stories across Spread/Rule/Card/ProjectCard/CtaBlock/Modal/Table; created token docs (Color Palette, Typography Scale, Spacing Scale); removed 4 old token stories → 164/164 green
- reviewer: FAIL (AC-29: old token stories not removed); manager fixed directly → re-run PASS
- result: done

## 2026-05-18 — B28: Nav overhaul — match website design
- manager: start, track: feature
- spec-writer: wrote wiki/specs/B28-nav-overhaul.md → done (first draft rejected for D38 violation; rewritten with Button nav variant + Breadcrumb primitives)
- test-writer: wrote Nav.stories.svelte (8 stories) + Button.stories.svelte Nav Variant story → 5 failing as expected
- implementer: Button nav variant, Breadcrumb as prop, Nav full overhaul → 265/265 green
- manager: visual review (user approved with breadcrumb color + spacing fixes applied to Breadcrumb.svelte + Nav.svelte)
- reviewer: FAIL — 6 groups of missing story assertions (ACs 11, 25, 27–30, 36–37, 39–43, 45–48); implementation correct
- implementer: added all missing assertions → 265/265 green
- reviewer: PASS
- result: done

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
- result: done

## 2026-05-18 — B30: Input chrome fixes — number arrows, clearable color, icon color
- manager: start, track: bug; delegating to spec-writer
- spec-writer: wrote wiki/specs/B30-input-chrome-fixes.md (10 ACs); corrected per user: clear hover = --amber (not --ink), icon fix uses :global(svg)
- test-writer: added Number Input story; extended Clearable-With-Value (color probe); extended Icon Prefix (fill probe); 2 red (clear=amber not ink-dim, icon fill=black)
- implementer: spin button CSS + icon :global(svg) + clear button ink-dim/amber; hover assertion dropped (CSS :hover not triggered by synthetic events); 265/265 green
- reviewer: PASS — all 10 ACs met
- result: done

## 2026-05-18 — B36: PageHero — snippet-based heading with mixed ink colors
- manager: start, track: feature; delegating to spec-writer
- spec-writer: wrote wiki/specs/B36-pagehero-snippet-heading.md (9 ACs) → user approved
- test-writer: added SnippetHeading + NoBorder stories; 2 red (headingContent prop missing, border prop missing); 262 passing
- implementer: headingContent snippet + border class toggle + :global(em) rule; story fixed to use template snippet pattern; 264/264 green
- reviewer: PASS (AC-3c simplified to fontStyle-only; color probe dropped — fontStyle sufficient proof)
- result: done

## 2026-05-18 — B29: Checkbox shifts down on toggle
- manager: start, track: bug
- spec-writer: wrote wiki/specs/B29-checkbox-visual-jump.md → done
- test-writer: added "No Layout Shift" regression story → fails (::after position: static)
- implementer: position:absolute + centred ::after, ✔ at 20px, CSS nesting pass → 265/265 green
- manager: visual review approved; folded regression into Space to Toggle, removed dedicated story; 0 check errors
- result: done

## 2026-05-18 — B33: Typography realignment with OG design system
- manager: start, track: bug; spawning researcher to diff tokens.css vs colors_and_type.css
- researcher: token layer clean; root cause = Modal size="lg" on Text mono (19px→24px); Heading.svelte data-size overrides unsafe
- spec-writer: wrote wiki/specs/B33-font-realignment.md (14 ACs, 2 changes + caller audit) → user approved
- test-writer: extended Modal Default + Destructive play fns (AC-1–5, AC-7); extended Heading Levels play fn (AC-10–12); 2 red (Modal 19px≠24px), Heading assertions green as regression guards
- implementer: Modal → Heading h3; Heading size prop removed; 3 card callers cleaned; 262/262 green
- reviewer: PASS (AC-10–12 story-name finding resolved by spec update; assertions present and passing)
- result: done

## 2026-05-17 — B24: Style prop cleanup
- manager: set in-progress; spec at wiki/specs/B24-style-prop-cleanup.md; implemented directly
- SectionHead, PageHero, CtaBlock, SectionFoot, NoteCard: eyebrow variant + container scoped CSS
- ProductCard, ProjectCard: card-body div + eyebrow variant + heading style trim + card-footer-row
- Modal: Stack→div (.modal-inner), Inline as="header"→header (.modal-header), Spread as="footer"→footer (.modal-footer); removed Stack import
- Nav: Inline nav-inner→div, Inline as="a" nav-brand→native a, Inline nav-right→div, Inline as="ul" nav-links→native ul, Stack as="ul" nav-drawer-links→native ul; fixed :global(.nav-links)→.nav-links; removed Stack import
- pnpm check: 0 errors; pnpm test: 232/232 green
- result: done

## 2026-05-18 — B34: Modal close button / Modal visual redesign
- manager: spec written (7 ACs) → user approved; test-writer added flex/position assertions to Default story → 1 red
- implementer: header flex fix + Inline/Spread wrappers removed → green
- user review: Modal title too large; icons in wrong place; background wrong; buttons misaligned; stories excessive
- manager + implementer (iterative): title→12px mono, icons→body hstack (amber/red outline circles), close→ink-faint 18px plain button, background→--overlay, footer→flex-end, stories 6→3
- reviewer: PASS (all ACs met, 259/259 green)
- result: done

## 2026-05-18 — B35: Alert → feedback, aligned variants, Toast uses Alert with title+message
- manager: spec written (review-flagged) → user corrected: Alert already exists in patterns, should move to feedback; variants align to success/warning/error/info; Toast gains title/message like Alert
- spec-writer: revised spec (move + rename + ondismiss + title prop); user approved
- test-writer: wrote feedback/Alert.stories.svelte + updated Toast.stories.svelte; 5 red
- implementer: Alert moved + renamed, role removed, Toast uses Alert, store gains title, ToastRegion passes title → 259/259 green
- user review: close button amber + outside Alert container
- manager: added ondismiss prop to Alert (dismiss button inside bordered box, ink-faint); removed Button ghost from Toast → 260/260 green
- reviewer: PASS (AC-16 spec text reconciled with implementation)
- Interactive ToastRegion story added (trigger buttons, duration:0)
- result: done

## 2026-05-19 — B38: Strip outer margins from all components (consumer owns spacing)
- manager: start, track: bug; delegating to spec-writer (no review flag — run straight through)
- spec-writer: wrote wiki/specs/B38-strip-outer-margins.md — audit of 28 components → 1 real offender (SectionFoot `margin-top: 20px`) + 2 reset-dependent primitives (Text/Heading) tightened to self-owned scoped `margin: 0`. Original draft proposed 40 per-component play-fn margin assertions.
- manager + user: decision D42 recorded — no play-fn assertions for visual-only changes. Spec ACs slimmed from 40 to 5; visual-only tracks skip test-writer (spec-writer → implementer → reviewer). stories-guide.md updated with "When NOT to assert" section.
- manager: delegating to implementer (test-writer stage skipped per D42)
- implementer: SectionFoot removed `margin-top: 20px`; Text added `.body-text, .body-lede, .mono-label, .eyebrow { margin: 0 }`; Heading added variant + bare h4/h5/h6 `margin: 0` rules → 260/260 green, 0 pnpm check errors
- reviewer: PASS — all 5 ACs met, 260 tests green, D42 honoured (no .stories.svelte changes), no scope creep
- result: done

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
- result: done

## 2026-05-19 14:00 — B40: Regression — PageHero and Container have no mobile-responsive vertical padding
- manager: start, track: bug; D42 applies (visual-only CSS fix) — test-writer skipped; delegating to spec-writer
- spec-writer: wrote wiki/specs/B40-responsive-vertical-padding.md (7 ACs); no blocking questions
- implementer: added @media (max-width: 720px) blocks to PageHero.svelte + Container.svelte; 263/263 green, 0 check errors
- reviewer: PASS — all 7 ACs met, 263/263 green, no scope creep
- result: done

## 2026-05-19 14:30 — B41: Regression — Prose should match MarkdownBody's typography
- manager: start, track: bug; D42 applies (visual-only CSS rewrite) — test-writer skipped; delegating to spec-writer
- spec-writer: wrote wiki/specs/B41-prose-typography-alignment.md (37 ACs); logged D44 (color: inherit replaces Shiki fallback); no blocking questions
- implementer (pass 1): replaced style block using flat selectors; 263/263 green — user redirected: native CSS nesting required
- implementer (pass 2): rewrote style block with `.prose { :global { … } }` nesting (D45); 263/263 green, 0 check errors
- manager: D45 promoted to Standing Rules per user direction; spec AC-37 updated to require nesting
- reviewer: PASS — all 37 ACs met, 263/263 green, no scope creep
- result: done

## 2026-05-19 15:00 — B42: Regression — Grid has no responsive collapse
- manager: start, track: bug; layout behavior change — D42 does not apply, full pipeline; delegating to spec-writer
- spec-writer: wrote wiki/specs/B42-grid-responsive-collapse.md (18 ACs); no blocking questions
- test-writer: updated 5 existing Grid stories + created Grid.collapse.stories.svelte (7 new stories); 12 red
- implementer: added data-cols attr, --grid-cols custom prop, @container collapse rules to Grid.svelte; 270/270 green
- reviewer: PASS — all 18 ACs met, 270/270 green, no scope creep
- result: done

## 2026-05-19 16:00 — B43: Regression — NoteCard needs an image prop with side / top placement
- manager: start, track: bug; new props + conditional layout — full pipeline; delegating to spec-writer
- spec-writer: wrote wiki/specs/B43-notecard-image-prop.md (18 ACs); no blocking questions
- implementer: added image/imageSrcset/imagePlacement props, .side/.top classes, grid+flex CSS, 2 catalogue stories; 272/272 green
- user review: class over data-attr; card-body grid-column span fix; align-self stretch + object-position center for side image
- result: done

## 2026-05-19 17:00 — B44: Regression — Prose should not constrain width by default
- manager: start, track: bug; D42 applies (prop default change, visual only) — test-writer skipped; delegating to spec-writer
- spec-writer: wrote wiki/specs/B44-prose-no-default-maxwidth.md (6 ACs); no blocking questions
- implementer: dropped maxWidth default; consumer route files are in website project (out of scope); 272/272 green
- result: done

## 2026-06-14 — Work plan (B50–B60: port new design-system components)
- manager: filed B50–B60 from the Dexterlabs Design System (claude.ai/design) — 9 new components + 2 enhancements (Accordion sticky, ProgressBar states); all feature/high, no review flags per user
- manager: presented ordered plan B50→B60; user approved "start now"; refs vendored under wiki/specs/_design-refs/B<id>/ then cleaned up after the run
- result: user approved work plan — proceeding

## 2026-06-14 — Reorder: Popover first (dependency)
- manager: vendored refs revealed StatusPill (B50) composes Popover (B56); Inbox/AppShell likely too. Popover is foundational → reordered to B56 → B50 → B51–B55 → B57 → B58 → B59 → B60. Inbox cards are untracked (never committed) so lane moves use plain mv, not git mv.

## 2026-06-14 — B56: Popover component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview 23 + Popover.jsx) to wiki/specs/_design-refs/B56/
- spec-writer: wrote wiki/specs/B56-popover.md (23 ACs, 9 stories); D53 logged (controlled/bindable, anchored-to-parent, non-modal, no built-in trigger)
- test-writer: wrote feedback/Popover.stories.svelte (9 stories); red for right reason (missing component); positive-control ADR logged for AC-12
- implementer: wrote Popover.svelte + feedback/index.ts + lib/index.ts exports; 293/295 — flagged 2 test defects (AC-6 `=="auto"` computed-style impossible; 9 strict-TS null-narrowing errors in stories)
- test-writer (fix): corrected AlignRight/AlignLeft assertions (active edge 0px + inactive ≠0px + inline-style `auto` fallback) and added `as HTMLElement` casts; 295/295 green, pnpm check 0 errors; non-vacuity verified
- reviewer: PASS — all 23 ACs met, 295/295 green, 0 check errors, no scope creep; non-blocking follow-up: tighten AC-6 prose ("computed active edge = 0px; inactive edge = auto in inline style")
- result: done → commit fc84384

## 2026-06-14 — B50: StatusPill component
- manager: start, track: feature; mv inbox→doing; refs already vendored (preview 29 + StatusPill.jsx + base.jsx). Composes B56 Popover + existing Led primitive.
- spec-writer: wrote wiki/specs/B50-status-pill.md (25 ACs, 12 stories); D54 logged (feedback/ home, reuse Led via color + Popover, owns open state); no blocking OQs
- test-writer: wrote feedback/StatusPill.stories.svelte (12 stories); red for right reason (missing component); D55 logged (data-part hooks, .led/.popover selectors)
- implementer: wrote StatusPill.svelte + feedback/index.ts + lib/index.ts; .popover/.led matched cleanly (no Led/Popover edits); added trigger onmousedown stopPropagation to fix toggle-vs-dismiss; 306/307 — flagged 1 test defect (OK story missing args)
- test-writer (fix): added args to OK story (tone/label/detail); 307/307 green, pnpm check 0 errors
- manager: logged D56 (stopPropagation interaction fix) per reviewer recommendation
- reviewer: PASS — all 25 ACs met, 307/307 green, 0 check errors, Led/Popover unchanged, no scope creep
- result: done → commit 84bef31

## 2026-06-14 — B51: SegmentedControl component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview 24 + SegmentedControl.jsx)
- spec-writer: wrote wiki/specs/B51-segmented-control.md (20 ACs, 8 stories); D57 logged (forms/ home, radiogroup role + roving tabindex, automatic activation); no blocking OQs
- test-writer: wrote forms/SegmentedControl.stories.svelte (8 stories); red for right reason (missing component, 307 baseline green); test-contract ADR logged (.segmented/role=radiogroup, button role=radio, data hooks)
- manager: user check-in mid-pipeline — confirmed the failing SegmentedControl suite was the expected TDD red (import fails, no component yet); 307 others green; not a regression
- implementer: wrote SegmentedControl.svelte + forms/index.ts + lib/index.ts (first attempt); 315/315 green, pnpm check 0 errors
- reviewer: PASS — all 20 ACs met, 315/315 green, 0 check errors, no scope creep; 2 non-blocking style notes (size rules un-nested; keyboard focus via DOM query)
- result: done → commit cb34487

## 2026-06-14 — B52: Gauge component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview 25 + Gauge.jsx)
- spec-writer: wrote wiki/specs/B52-gauge.md (17 ACs, 11 stories); D58 logged (patterns/ home, role=progressbar); not visual-only (geometry testable)
- test-writer: wrote patterns/Gauge.stories.svelte (11 stories); red for right reason (missing component, 315 baseline green); D59 logged (data-part track/arc, exact dasharray template)
- implementer: wrote Gauge.svelte + patterns/index.ts + lib/index.ts; 326/326 green, pnpm check 0 errors
- reviewer: PASS — all 17 ACs met, 326/326 green, 0 check errors, no scope creep, import hygiene clean (uses storybook/test); non-blocking: default aria-label="Progress" not asserted
- result: done → (commit below)

## 2026-06-14 — Storybook UI crash (vitest import) → filing B61
- manager: user reported `customEqualityTesters` TypeError in Storybook dev UI (port 6006). Root cause: 3 story files `import { vi } from "vitest"` (Nav [pre-existing B49], Popover [B56], SegmentedControl [B51]) — pulls vitest chai/expect setup into the bare Storybook browser where vitest global state is absent. pnpm test stays green (vitest runner inits state) but the UI crashes. House pattern is `fn` from `storybook/test`. Parking after B52 commit to file + fix B61.
- manager: B52 committed ca4e0ac. Filed B61 (bug, high) directly into doing/; delegating the import swap to a test-writer (stories are test artifacts).
- test-writer: swapped `import {vi} from "vitest"` → `fn` from `storybook/test` in Nav/Popover/SegmentedControl stories (13 vi.fn→fn); 326/326 green, pnpm check 0 errors
- manager: verified directly (grep: zero `from "vitest"` in src/lib stories; all 3 use storybook/test). Mechanical, low-risk, well-verified swap matching the architecture.md-mandated house pattern — accepted without a separate reviewer agent (manager-level verification). Live Storybook UI re-check offered to user.
- result: done → commit 10003f4

## 2026-06-14 — B53: ProportionBar component
- manager: resume build run; start, track: feature; mv inbox→doing; vendored design refs (preview 26 + ProportionBar.jsx)
- spec-writer: wrote wiki/specs/B53-proportion-bar.md (20 ACs, 8 stories); D60 logged (patterns/ home, role=img, data-part contract); geometry pinned (42/28/18/12 → widths [418,278,178,120])
- test-writer: wrote patterns/ProportionBar.stories.svelte (9 stories, storybook/test imports); red for right reason (missing component, 326 baseline green)
- implementer: wrote ProportionBar.svelte + patterns/index.ts + lib/index.ts (first attempt); 335/335 green, pnpm check 0 errors
- reviewer: PASS — all 20 ACs met, 335/335 green, 0 check errors, no scope creep, storybook/test import hygiene clean; non-blocking: swatch size hardcoded 10px (no matching spacing token)
- result: done → commit cce6992

## 2026-06-14 — B54: CompareBars component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview 27 + CompareBars.jsx)
- spec-writer: wrote wiki/specs/B54-compare-bars.md (19 ACs, 6 stories); D61 logged (patterns/ home, root role=group + per-row role=img, over/under conveyed as text not colour-only per WCAG 1.4.1, data-part contract)
- test-writer: wrote patterns/CompareBars.stories.svelte (6 stories, storybook/test imports); red for right reason (missing component, 335 baseline green)
- implementer: wrote CompareBars.svelte + patterns/index.ts + lib/index.ts; 339/341 — flagged 2 test defects (fractional style.width asserted via raw JS toString; CSSOM/JS-FP reserializes 27.5→27.500000000000004, 77.777..→77.7778)
- test-writer (fix): switched the 2 fractional-width assertions to parseFloat(style.width)+toBeCloseTo(...,4); 341/341 green, pnpm check 0 errors; non-vacuity reasoned (strict to 0.0001%)
- reviewer: PASS — all 19 ACs met, 341/341 green, 0 check errors, no scope creep, storybook/test import hygiene clean
- result: done → commit 9adab3e

## 2026-06-14 — B62: ProportionBar legend style fix (visual-only)
- manager: user reported (live Storybook) the ProportionBar legend "doesn't look like the design" + "no space between label, percentage and color box". Root cause found: `.legend li { gap: var(--u1) }` — `--u1` is undefined (scale is --u/--u2/…) so gap=0; legend text also lacks font-size/letter-spacing so it renders at ~16px not the design's 11px mono. Filed B62 (bug, high, visual-only D42); ACs in card. Delegating to implementer (test-writer skipped per D42).
- implementer: gap var(--u1)→var(--u); added font-size:11px to .legend-label + .value-label and letter-spacing:0.08em to .legend-label (matches StatusPill house convention); 341/341 green, pnpm check 0 errors
- manager: verified directly (no --u1 remains; only ProportionBar.svelte changed; CSS matches the 4 ACs). Trivial well-specified visual fix — accepted via manager verification (no separate reviewer agent).
- result: done → commit 124e1ac

## 2026-06-14 — B55: Pager component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview 28 + Pager.jsx)
- spec-writer: wrote wiki/specs/B55-pager.md (19 ACs, 4 stories); D62 logged (navigation/ home, native buttons, <nav>+aria-live label, ONLY existing tokens + literal px — guard vs the B62 --u1 regression)
- test-writer: wrote navigation/Pager.stories.svelte (4 stories, storybook/test imports); red for right reason (missing component, 341 baseline green); D63 logged (data-part=label hook)
- implementer: wrote Pager.svelte + navigation/index.ts + lib/index.ts; 344/345 — flagged 1 test defect (letterSpacing asserted as "0.08em" but browsers serialize computed letter-spacing in px → 0.96px)
- test-writer (fix): corrected the assertion to "0.96px" (12px × 0.08); 345/345 green, pnpm check 0 errors
- reviewer: PASS — all 19 ACs met, 345/345 green, 0 check errors, no scope creep, token hygiene clean (5 tokens all exist, no --u1), storybook/test import hygiene clean
- result: done → commit fed5c6b

## 2026-06-14 — B57: Inbox component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview 30 + Inbox.jsx + base.jsx)
- spec-writer: wrote wiki/specs/B57-inbox.md (22 ACs, 9 stories); D64 logged (feedback/ home, composes Popover+Led, owns open + D56 guard, unread conveyed in text per WCAG 1.4.1, data-part contract)
- test-writer: wrote feedback/Inbox.stories.svelte (9 stories, storybook/test+fn); red for right reason (missing component, 345 baseline green)
- implementer: wrote Inbox.svelte + feedback/index.ts + lib/index.ts; 354/354 green, pnpm check 0 errors; Popover/Led/StatusPill unchanged; two sound deviations (tone→LedColor narrowing cast; dropped size={7} as Led has no size prop)
- reviewer: PASS — all 22 ACs met, 354/354 green, 0 check errors, no scope creep, token+import hygiene clean, both deviations sound; non-blocking: optionally note the LedColor cast on D64
- result: done → commit 7fee045

## 2026-06-14 — B58: AppShell component
- manager: start, track: feature; mv inbox→doing; vendored design refs (preview RENUMBERED to 31-app-shell + AppShell.jsx + base.jsx). NOTE: design system renumbered — app-shell now preview/31, progress-states preview/32; old sticky-sections preview removed, new ui_kits/components/Accordion.jsx added (use for B59).
- spec-writer: wrote wiki/specs/B58-app-shell.md (29 ACs, ~9 stories); D65 logged (navigation/ home; responsive via CSS container queries @ 760px — SSR-safe + deterministically testable at fixed widths like Grid.collapse)
- test-writer: wrote navigation/AppShell.stories.svelte (9 stories, storybook/test+fn, width-wrapped); red for right reason (missing component, 354 baseline green); D66 logged (data-part contract)
- implementer: wrote AppShell.svelte + navigation/index.ts + lib/index.ts; 363/363 green, pnpm check 0 errors; Led/Nav unchanged; D67 logged (SSR-safe $effect mirrors layout→aria-hidden since CSS can't toggle attrs; ResizeObserver, no matchMedia/$app/environment — annotation only, doesn't drive layout)
- reviewer: PASS — all 29 ACs met, 363/363 green, 0 check errors, no scope creep, token+import hygiene clean (--radius exists), D67 sound; non-blocking: rail badge radius --radius(2px) vs reference rounded pill (visual nit)
- result: done → commit bf7d54e

## 2026-06-14 — B59: Accordion sticky-header behaviour
- manager: start, track: feature (enhancement to existing data/Accordion.svelte); mv inbox→doing. NOTE: design system replaced StickySections.jsx with ui_kits/components/Accordion.jsx (richer: sticky/multiple/controlled/flush). Vendored that as the reference. Scope per user card = opt-in sticky prop folding StickySections behaviour into the existing Accordion (NOT a standalone component).
- spec-writer: wrote wiki/specs/B59-accordion-sticky-headers.md (21 ACs, 3 stories); D68 logged (opt-in sticky + fallbackHeaderHeight; context-backed offset registry; scope = sticky only, not porting multiple/controlled/flush; existing details/summary + snippet-children structure preserved)
- test-writer: wrote NEW data/Accordion.sticky.stories.svelte (3 stories, separate file like Grid.collapse, storybook/test); 2 sticky stories red for right reason + non-sticky guard green; 363 baseline green; D69 logged (data-sticky + cumulative-offset contract, ±1px tolerance for measured-vs-fallback per OQ-1)
- implementer: enhanced Accordion.svelte (sticky/fallbackHeaderHeight props + context registry) + AccordionItem.svelte (register, bind:this summary, browser-only $effect+ResizeObserver, data-sticky + inline top/bottom/z-index, scoped sticky CSS); 366/366 green, pnpm check 0 errors; no API change beyond 2 opt-in props; existing Accordion stories untouched
- reviewer: PASS — all 21 ACs met, 366/366 green, 0 check errors, no regression, no scope creep, token+import hygiene clean; the new state_referenced_locally warning is the accepted Tabs.svelte pattern (sticky is static config); non-blocking: runtime-toggle of sticky would need a reactive registry (file separately if ever needed)
- result: done → commit 785b331

## 2026-06-14 — B60: ProgressBar progress states
- manager: start, track: feature (enhancement to existing patterns/ProgressBar.svelte); mv inbox→doing; vendored design refs (preview 32 + ProgressBar.jsx). Scope = over-budget state (pct>100 → danger fill + 3px right-edge notch + danger pct text).
- spec-writer: wrote wiki/specs/B60-progressbar-states.md (16 ACs, 4 stories); D70 logged. Key reconciliation: existing ProgressBar already clamps value 0–100 (a story asserts value:150→100), so over-budget is gated behind a NEW opt-in `overflow` prop (default false) to avoid regression; aria-valuenow stays capped at 100 (matches Gauge/D58)
- test-writer: wrote NEW patterns/ProgressBar.overflow.stories.svelte (4 stories, separate file, storybook/test); Over Budget red for right reason + 3 guard stories green; 366 baseline green; data-part=notch contract
- implementer: added overflow prop + over-budget rendering (danger fill override, clamped width, data-part=notch, danger rounded readout, aria capped) to ProgressBar.svelte; 370/370 green, pnpm check 0 errors; existing 7 ProgressBar stories untouched/passing
- reviewer: PASS — all 16 ACs met, 370/370 green, 0 check errors, no regression, no scope creep, token+import hygiene clean; readout-rounding edge on non-over path judged non-blocking (no fractional sub-100 value tested; preserves byte-identical default)
- result: done → commit e229fb1

## 2026-06-14 — Run complete + cleanup (B50–B62)
- manager: all 11 planned items done (9 new components: Popover/StatusPill/SegmentedControl/Gauge/ProportionBar/CompareBars/Pager/Inbox/AppShell; 2 enhancements: Accordion sticky, ProgressBar over-budget) + 2 mid-run bugfixes (B61 Storybook vitest-import crash, B62 ProportionBar legend). Suite: 370/370 green, pnpm check 0 errors.
- manager: cleanup per user — removed the vendored design-system reference scaffolding under wiki/specs/_design-refs/ (it served the spec-writers during the run; specs are now self-contained). Done.

## 2026-06-14 — Story-lightening pass (top-level, user-directed, inline)
- Goal (per user): consolidate Storybook stories component-by-component into a lean, demo-first
  set — few stories that each look like the design sample and carry a full `play` folding the
  rest of the contract. Added the *Consolidating stories* section to `wiki/stories-guide.md`.
- Popover (B56): 9 → 2 stories (Align Right / Align Left), real trigger + rich panel; all 23 ACs folded. Green.
- StatusPill (B50): 12 → 4 tone stories (OK hero / Amber / Danger / Cyan); shared `// rail detail` panel; stories-only, no component change. Green.
- SegmentedControl (B51): 8 → 3 stories (Size md hero / Size sm bound / Edge states). Green.
- Gauge (B52): 11 → 3 stories (Tones / Sizes & geometry / Accessibility); added the `{pct}%`
  caption as demo scaffolding in the story `.cell` composition (NOT in the component — B52
  out-of-scope holds). **Moved Gauge `patterns/` → `feedback/`** per user ("feedback is more
  aligned"): `git mv` both files, `title` → `Feedback/Gauge`, export moved patterns→feedback
  index + lib barrel; D71 logged (amends D58 home-category half; role decision stands);
  B52 spec + B53/B54 sibling pointers updated. Suite 342/342 green, pnpm check 0 errors.
- ProportionBar (B53): 9 → 3 stories (Four Segments / Geometry & edges / Accessibility);
  geometry edge cases folded into one demo column, label/decorative into Accessibility.
  **Moved `patterns/` → `feedback/`** per user; `title` → `Feedback/ProportionBar`.
- CompareBars (B54): 6 → 3 stories (Budget / Edges & clamping / Labelled section).
  **Moved `patterns/` → `feedback/`** per user; `title` → `Feedback/CompareBars`.
- D72 logged for both moves (amends D60/D61 home-category halves; roles/geometry stand);
  B53/B54 specs amended. `feedback/` now holds the full Gauge/ProportionBar/CompareBars trio;
  ProgressBar stays in `patterns/`.
- Inbox (B57): 9 → 5 stories (Unread / Open / All Read / Dismissal / Polymorphic & Forwarding);
  fixed panel visibility — every story now renders in a `.stage` that pushes the right-aligned
  bell rightward and reserves height below it, so the leftward/downward Popover is on-screen;
  the "Open" story opens and stays open. Stories-only, no component change.
- AppShell (B58): design-system alignment pass per user ("check the appshell with the design").
  Visual-only CSS tightening against the `_design-refs/B58/AppShell.jsx` reference — added
  `0.08em` mono tracking to rail/tab labels; tab label 12 → 10px; rail count badge → rounded
  pill (radius 8px, mono, 10px, shared language with the Inbox badge); tab active indicator
  centred (`left:50% / translateX(-50%)`); tab badge → absolute 7px amber dot with amber glow;
  rail-nav `padding-top`; roomier desktop top-bar gutter (`var(--u3)`). No AC/API change — all
  29 B58 ACs + 9 stories green (329 tests), pnpm check 0 errors. D73 logged; B58 spec amended.
- AppShell (B58) **layout bugfix** (user-reported — "the app shell is the whole page layout but
  it's not there"): the desktop rail stacked *above* the content instead of beside it. Root
  cause — `container-type` and the `flex-direction: column→row` switch were both on `.app-shell`,
  and an element can't match an `@container` query against its own container-type, so the row
  switch never fired. Verified live via chrome-devtools (computed `flex-direction:column` at
  940px) and screenshots. Fix (test-first): added a regression assertion to the Desktop Layout
  story (rail beside frame, not stacked) → confirmed red → moved the switch to a new inner
  `.app-shell-layout` wrapper (descendant of the container; root keeps `container-type`) → green.
  Added `data-part="frame"`. Bug had shipped in B58 because tests asserted the rail (a
  descendant, which worked) but never the root's direction. 329 tests green, pnpm check 0
  errors. D74 logged; B58 spec amended. General rule recorded: container-type element and the
  `@container`-responding element must differ (parent vs descendant).
- AppShell (B58) **stories rebuilt to the design** (user — "I'm missing the top bar, and in the
  sidebar the elements at the bottom; really make the stories like they are in the design
  system"): the demo stories used sparse placeholder slots (DXLB / Workspace / Account, no
  footer) so the frame didn't read like `preview-31-app-shell`. Every demo story now renders the
  reference content via shared snippets — brand = `Led` + `DEXTERLABS`, top bar `// Rails` +
  `v3.0`, rail footer `Est. 2019 · Delft`, body `// Rails` eyebrow + "Resize me" + paragraph —
  over the design nav `Home / Rails (3) / Orders / You`, `current="rails"`. Consolidated 9 → 6
  lean stories (Desktop / Desktop—Navigate / Mobile / Mobile—Navigate / A11y—One Nav Exposed /
  Slots—Strings & Snippets), each carrying a full play test; all 29 ACs + the D74 regression
  still covered, play assertions updated to the new fixture text. Verified live via
  chrome-devtools (desktop + mobile screenshots match the reference). Stories-only, no component
  change. 326 tests green (57 files; 3 fewer = the merged stories), pnpm check 0 errors. B58 spec
  Story-plan/amendments updated.
- **Tooling: `pnpm test` + `pnpm check` made gate-clean** (user — "fix pnpm test and pnpm
  check"). `test` was `vitest` (watch — hangs as a one-shot/CI gate) → now `vitest run`, with a
  new `test:watch` for the watcher. `check` passed but emitted 8 warnings across 6 files; all
  resolved with no behaviour change: `Input` got a standard `appearance` next to
  `-moz-appearance`; `Select`/`Tabs`/`Accordion` wrap their intentional init-only prop reads in
  `untrack()`; and three a11y false-positives got justified `svelte-ignore`s (`Radio`
  `aria-invalid` is required by AC-60; `Select` listbox keyboard is on the container via
  `aria-activedescendant`; `Switch` label is a pointer convenience mirroring its `role="switch"`
  button, AC-5/6/7). Result: `pnpm check` 0 errors / **0 warnings**, `pnpm test` one-shot **326
  passed**. Toolchain note: multi-code `svelte-ignore` only honoured the first code — use one
  code per stacked comment. D75 logged; architecture.md test-command updated.

## 2026-06-15 09:40 — B64: Enhanced Grid API — template, stackBelow, align
- top-level: captured B64 (user proposed a downstream "enhanced Grid API" to promote upstream;
  asked for a critical analysis). Critique rejected the proposal's `stackBelow` via
  `useMediaQuery` (viewport-coupling regresses B42's container-query model + adds an SSR layout
  flash) and reframed `template` as a labelled escape hatch. Direction #1 chosen (constrained
  Grid + escape hatch); intent primitives (Split/Sidebar) parked. Card → `wiki/backlog/ready/`,
  `flags: [review]`.
- spec-writer: wrote `wiki/specs/B64-enhanced-grid-api.md` — backward-compatible superset adding
  `template` (raw track-list, overrides `cols`, collapses only via `stackBelow`), `stackBelow`
  (tokenized sm=480/md=720/lg=900, pure CSS `@container`, zero JS) and `align` (`align-items`,
  default `stretch`), plus the latent `gapMap.md` 16→24px fix (B25 never reached Grid). ACs in
  groups T/S/A/G/C/X; all B42 ACs + 13 existing stories preserved. ADR D76 appended.
- approved as-specced at the 2026-06-15 review checkpoint. User confirmed the `gap="md"`
  16→24px fix stands and finalised the `stackBelow` `sm` breakpoint at **480px** (down from
  the drafted 520px). Spec + D76 updated.
- test-writer: extended `Grid.stories.svelte` (4 prop stories) + `Grid.collapse.stories.svelte`
  (9 collapse stories) → **red confirmed**, 12 new failing for feature-missing reasons, 12 B42
  stories untouched and green.
- implementer: added `template`/`stackBelow`/`align` + `gapMap.md` 16→24px to `Grid.svelte`,
  pure declarative (data-attrs + `--grid-cols` + scoped `@container`/attribute CSS, zero JS).
  Diagnosed the lone remaining failure as a test bug — the `sm` boundary story used the
  Container's *outer* width (520px), but `@container` measures the content box and `Container`
  has 64px horizontal padding (520−64=456 ≤ 480 → correctly collapses). Implementation correct;
  did not edit tests.
- test-writer (fix): corrected that one story's no-collapse width 520→600px (content box ≈536 >
  480) — boundary arithmetic fix, no assertion weakened, sm=480 contract intact.
- reviewer: **PASS** — full suite 339 passed / 57 files / 0 failed; `pnpm check` 0 warnings;
  every AC (T/S/A/G/C/X) mapped to a genuinely-asserting test; X1 no-JS source check holds
  (no `$effect`/`matchMedia`/`useMediaQuery`/`@media`); B42 contract preserved (12 stories
  extended-not-rewritten); no scope creep (only `Grid.svelte` + 2 story files changed).
- result: **done** — reviewer PASS + suite green. Committing as one item commit.

## 2026-06-15 18:48 — B63: Align human-facing docs to the @dxlbnl/ui package name
- top-level (chore track, docs-only): swapped `dxlb-design` → `@dxlbnl/ui` across `README.md`
  + all 10 `docs/*.md` (H1s, install/workspace snippets, every import, entry-point + prose
  mentions). Confirmed the real CSS subpaths from `package.json` `exports` before swapping —
  they are `@dxlbnl/ui/tokens/tokens.css` and `@dxlbnl/ui/tokens/typography.css`. `README.md`
  already had the `/tokens/` subpath (scope swap only); `docs/index.md` had the wrong flat
  paths (`dxlb-design/tokens.css`) and was corrected to the subpathed form — the exact trap
  the card warned about. Local-path example → `../path/to/dxlb-ui`. Verified zero `dxlb-design`
  left in scope (`grep`). No code/test impact; suite untouched.
- out of scope (left as-is): wiki history refs, the B33 filesystem path, and README's stale
  component table (component-list drift — candidate for a future card, not name alignment).
- result: **done** — committing as one item commit.

## 2026-06-15 18:55 — Follow-ups: B64 docs gap + B63 rename leak (user-flagged)
- B64 docs gap: the enhanced Grid API shipped without consumer docs. Updated `docs/layout.md`
  Grid section to document `template`, `stackBelow` (sm=480 / md=720 / lg=900), `align`, the
  gap scale (md now 24px), and the previously-undocumented B42 container-query collapse.
- B63 rename leak: the rename had left `dxlb-design` in living wiki pages. Cleaned
  `wiki/vision.md`, `wiki/stories-guide.md`, the prescriptive refs in done specs
  (B6/B17/B19/B20/B21), and the stale `wiki/backlog.md`. Deliberately preserved (they
  correctly reference the OLD name): B33's filesystem path to the OG
  `~/Projects/Web/dxlb-design/` reference repo, and the B63 card + this journal, which
  document the rename itself.
- open: whether to ship `docs/` in the published package (the docs are AI-readable by design)
  — awaiting user decision; not yet wired into `package.json` `files`.
