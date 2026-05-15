# Vision

## What is this project?

**dxlb-design** is the design system and Svelte component library for Dexterlabs —
Alexander "Dexter" Esselink's one-person engineering lab in Delft, Netherlands. It
implements the Dexterlabs visual identity (Phosphor dark + Paper light palettes,
JetBrains Mono + Inter Tight, terminal-aesthetic, amber accent) as reusable Svelte 5
components. The immediate target is dexterlabs.nl (SvelteKit 2 + Svelte 5 site);
future projects will consume the same library.

## Why does it exist?

The current dexterlabs.nl was built as a prototype. Extracting the design into a
standalone, tested component library means future site revisions and new projects
(catalogue, app tools, hardware docs) share a consistent visual foundation without
copy-pasting styles. It also acts as living documentation of the Dexterlabs brand.

## Who is it for?

Dexter — primary consumer is the dexterlabs.nl site and its sub-sections:
- `/catalogue/` — hardware products (Conduit PDX-2, Distrans AR-1) with Stripe checkout
- `/projects/` — software & open-source work (Lists, Private Share, zod4-mock)
- `/notes/` — engineering log (hex-indexed: 0x01–0x07+)
- `/feed/`, `/about/`, `/contact/`

Not published to npm initially. Not for other clients or teams.

## What does success look like?

- Every component on dexterlabs.nl can be replaced with a library import with zero
  visual regression
- All components are accessible (WCAG 2.1 AA), SSR-compatible, and documented in
  Storybook
- New pages/features for the lab can be assembled from the library in minutes
- The Storybook catalogue is the authoritative visual reference for the Dexterlabs brand

## Non-goals

- Not a published npm package (initially)
- Not a multi-brand or white-label system
- Not for client work or external teams
- No Tailwind, no external UI primitives
- No emoji, no gradients on surfaces, no hype
