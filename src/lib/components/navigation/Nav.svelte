<script lang="ts">
  import Led from "../primitives/Led.svelte";
  import Button from "../primitives/Button.svelte";
  import Breadcrumb from "./Breadcrumb.svelte";
  import Inline from "../layout/Inline.svelte";

  interface BreadcrumbItem {
    label: string;
    href: string;
  }

  interface NavLink {
    href: string;
    label: string;
    active?: boolean;
  }

  interface Props {
    /** Navigation links to render in the top bar. @default [] */
    links?: NavLink[];
    /** Brand name shown next to the status LED. @default 'DEXTERLABS' */
    siteName?: string;
    /** Optional breadcrumb trail. @default [] */
    breadcrumbs?: BreadcrumbItem[];
    /** Controlled palette value. When provided together with onPaletteToggle,
     *  Nav does not manage its own palette state. */
    palette?: "phosphor" | "paper";
    /** Called when the palette toggle is clicked (controlled mode). */
    onPaletteToggle?: () => void;
    /** When false, renders the nav in normal document flow instead of fixed. @default true */
    sticky?: boolean;
    /** Max-width of the inner row. @default '1200px' */
    maxWidth?: string;
    [key: string]: unknown;
  }

  let {
    links = [],
    siteName = "DEXTERLABS",
    breadcrumbs = [],
    palette: paletteProp,
    onPaletteToggle,
    sticky = true,
    maxWidth = "1200px",
    ...rest
  }: Props = $props();

  type Palette = "phosphor" | "paper";
  let internalPalette = $state<Palette>("phosphor");

  // Controlled mode: both palette and onPaletteToggle must be provided
  const isControlled = $derived(
    paletteProp !== undefined && onPaletteToggle !== undefined,
  );

  // The glyph reflects the controlled prop when controlled, else internal state
  const currentPalette = $derived(
    isControlled ? paletteProp! : internalPalette,
  );

  const PALETTE_KEY = "dxlb-palette";

  $effect(() => {
    if (isControlled) return;
    const stored = localStorage.getItem(PALETTE_KEY) as Palette | null;
    if (stored === "paper" || stored === "phosphor") internalPalette = stored;
    document.documentElement.setAttribute("data-palette", internalPalette);
  });

  function handlePaletteToggle() {
    if (isControlled) {
      onPaletteToggle!();
      return;
    }
    internalPalette = internalPalette === "paper" ? "phosphor" : "paper";
    document.documentElement.setAttribute("data-palette", internalPalette);
    localStorage.setItem(PALETTE_KEY, internalPalette);
  }
</script>

<nav class="nav" class:nav--inflow={!sticky} {...rest}>
  <div class="nav-inner" style="max-width: {maxWidth}">
    <Inline style="flex-wrap: nowrap; min-width: 0">
      <a class="nav-brand" href="/">
        <Led color="ok" aria-hidden="true" />
        <span class="nav-wordmark">{siteName}</span>
      </a>

      {#if breadcrumbs?.length}
        <div class="nav-path">
          <span class="nav-sep">//</span>
          <Breadcrumb crumbs={breadcrumbs} as="div" />
        </div>
      {/if}
    </Inline>
    <div class="nav-right">
      {#if links?.length}
        <ul class="nav-links">
          {#each links as link}
            <li>
              <a
                href={link.href}
                class="nav-link"
                class:active={link.active}
                aria-current={link.active ? "page" : undefined}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      {/if}

      <Button
        variant="nav"
        aria-label="Toggle colour palette"
        onclick={handlePaletteToggle}
      >
        {currentPalette === "paper" ? "◑" : "◐"}
      </Button>

      {#if links?.length}
        <details class="nav-menu">
          <summary class="nav-summary">
            <span class="nav-icon-open">≡</span>
            <span class="nav-icon-close">×</span>
          </summary>
          <div class="nav-dropdown">
            {#each links as link}
              <a
                href={link.href}
                class="nav-dropdown-link"
                class:active={link.active}
                aria-current={link.active ? "page" : undefined}>{link.label}</a
              >
            {/each}
          </div>
        </details>
      {/if}
    </div>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    font-family: var(--mono);
    font-size: var(--t-lede);
    letter-spacing: 0.08em;
  }

  .nav--inflow {
    position: relative;
  }

  .nav-inner {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    padding: 0 24px;
    height: 48px;
    margin: 0 auto;
    gap: var(--u2);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: var(--u);
    flex-shrink: 0;
    color: var(--ink);
    text-decoration: none;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .nav-path {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    min-width: 0;
  }

  .nav-sep {
    color: var(--ink-faint);
    flex-shrink: 0;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: var(--u2);
    margin-left: auto;
    flex-shrink: 0;
  }

  .nav-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--u2);
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    text-transform: uppercase;
    font-size: 12px;
    list-style: none;
  }

  .nav-link {
    color: var(--ink-dim);
    text-decoration: none;
    padding-bottom: 2px;
    border-bottom: 1px solid transparent;
    transition:
      color var(--transition),
      border-color var(--transition);
  }

  .nav-link:hover {
    color: var(--ink);
    border-bottom-color: var(--amber);
  }

  .nav-link.active {
    color: var(--ink);
    border-bottom-color: var(--amber);
  }

  .nav-menu {
    display: none;
  }

  .nav-icon-close {
    display: none;
  }

  details[open] .nav-icon-open {
    display: none;
  }

  details[open] .nav-icon-close {
    display: inline;
  }

  .nav-summary {
    list-style: none;
    cursor: pointer;
    color: var(--ink-dim);
    user-select: none;
  }

  .nav-summary:hover {
    color: var(--ink);
  }

  .nav-summary::-webkit-details-marker {
    display: none;
  }

  .nav-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    padding: 4px 16px 8px;
    text-transform: uppercase;
  }

  .nav-dropdown-link {
    padding: 10px 0;
    border-bottom: 1px solid var(--rule);
    color: var(--ink-dim);
    text-decoration: none;
  }

  .nav-dropdown-link.active {
    color: var(--amber);
  }

  .nav-dropdown > :last-child {
    border-bottom: none;
  }

  @media (max-width: 720px) {
    .nav-links {
      display: none;
    }

    .nav-menu {
      display: block;
      margin-left: auto;
      flex-shrink: 0;
    }
  }
</style>
