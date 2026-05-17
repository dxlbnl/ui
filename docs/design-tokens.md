# Design Tokens

## Overview

Design tokens are CSS custom properties defined on `:root` (Phosphor palette, dark default) and selectively overridden on `[data-palette="paper"]` (Paper palette, light). There are no JavaScript token objects — every token is consumed via `var(--token-name)` inside component `<style>` blocks. Switching palettes requires setting the `data-palette` attribute on the `<html>` element; see `docs/index.md` for the full setup.

## Surfaces

Tokens controlling background fill levels, from deepest to most elevated.

| Token | Phosphor value | Paper value | Semantic meaning |
|---|---|---|---|
| `--bg` | `#0b0d0c` | `#efece4` | Page background |
| `--bg-rail` | `#0f1211` | `#e6e2d6` | Cards, nav bar, sidebars |
| `--bg-elev` | `#141817` | `#f5f2ea` | Elevated surfaces, inline-code background |
| `--bg-sunken` | `#070908` | `#dfdbce` | Code blocks, status bar, sunken wells |

## Ink

Tokens controlling text colour at three levels of emphasis.

| Token | Phosphor value | Paper value | Semantic meaning |
|---|---|---|---|
| `--ink` | `#d6e2dc` | `#14110b` | Primary text |
| `--ink-dim` | `#a4b0a9` | `#3f3b30` | Secondary / muted text |
| `--ink-faint` | `#7a8580` | `#5f5a4a` | Metadata, tertiary, placeholders |

## Rules

Tokens controlling border and divider colours.

| Token | Phosphor value | Paper value | Semantic meaning |
|---|---|---|---|
| `--rule` | `#1d2321` | `#cfcabc` | Default borders — barely visible |
| `--rule-strong` | `#2a3330` | `#a8a192` | Emphasised borders |

## Accents

Semantic colour tokens used across components for status and emphasis.

| Token | Phosphor value | Paper value | Semantic meaning |
|---|---|---|---|
| `--amber` | `#ffb347` | `#a04e00` | Primary accent — CTAs, prices, active state, LED |
| `--cyan` | `#7cc7d1` | `#030304` | Secondary — code functions, kind labels, LED |
| `--danger` | `#ff7a6b` | `#a83224` | Error / destructive actions |
| `--ok` | `#8fd48a` | `#356b31` | Success / online status |

## Typography

### Font stacks

| Token | Value | Meaning |
|---|---|---|
| `--mono` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | Monospace stack — labels, code, buttons |
| `--sans` | `"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif` | Sans-serif stack — body prose |

### Type scale

| Token | Value | Meaning |
|---|---|---|
| `--t-micro` | `12px` | Smallest label size — timestamps, meta, pill text |
| `--t-mono` | `14px` | Default mono size — labels, table cells |
| `--t-body` | `16px` | Body prose |
| `--t-lede` | `19px` | Lead paragraph / card title |
| `--t-h3` | `24px` | H3 heading |
| `--t-h2` | `36px` | H2 heading |
| `--t-h1` | `72px` | H1 heading |
| `--t-display` | `140px` | Display / massive decorative heading |
| `--t-hero` | `clamp(48px, 8vw, 112px)` | Fluid hero heading |
| `--t-title` | `clamp(36px, 5vw, 56px)` | Fluid title |
| `--t-subtitle` | `clamp(22px, 3.5vw, 40px)` | Fluid subtitle |

## Spacing

Base unit is 8px. All spacing tokens are multiples of the base unit.

| Token | Value | Description |
|---|---|---|
| `--u` | `8px` | 1× base unit |
| `--u2` | `16px` | 2× base unit |
| `--u3` | `24px` | 3× base unit |
| `--u4` | `32px` | 4× base unit |
| `--u5` | `40px` | 5× base unit |
| `--u6` | `48px` | 6× base unit |
| `--u7` | `56px` | 7× base unit |
| `--u10` | `80px` | 10× base unit |

## Radius

| Token | Value | Usage |
|---|---|---|
| `--radius` | `2px` | Buttons, pills, inline code |
| `--radius-card` | `4px` | Cards |

## Transitions

| Token | Value |
|---|---|
| `--transition` | `0.15s` |

Used for `color`, `background`, and `border-color` transitions only. Transform animations use explicit durations.

## Shiki syntax tokens

Used by Shiki (mdsvex / rehype code highlighting). The Phosphor palette maps these to design tokens; the Paper palette overrides only the string-related variables.

| Token | Phosphor value | Maps to |
|---|---|---|
| `--shiki-foreground` | `var(--ink)` | Primary text colour |
| `--shiki-background` | `var(--bg-sunken)` | Code block background |
| `--shiki-token-keyword` | `var(--amber)` | Keywords |
| `--shiki-token-function` | `var(--cyan)` | Function names |
| `--shiki-token-constant` | `var(--amber)` | Constants |
| `--shiki-token-string` | `#7ec8a0` (Phosphor) / `#2d7a50` (Paper) | String literals |
| `--shiki-token-string-expression` | `#7ec8a0` (Phosphor) / `#2d7a50` (Paper) | Template literals / string expressions |
| `--shiki-token-comment` | `var(--ink-faint)` | Comments |
| `--shiki-token-parameter` | `var(--ink-dim)` | Function parameters |
| `--shiki-token-punctuation` | `var(--ink-dim)` | Punctuation |
| `--shiki-token-link` | `var(--cyan)` | Links in code |

The Paper palette overrides only `--shiki-token-string` and `--shiki-token-string-expression` (to `#2d7a50`). All other Shiki tokens inherit from the design token overrides (e.g. `--amber` and `--cyan` change in Paper, so keyword and function colours change automatically).
