<script lang="ts">
  import Led from '../primitives/Led.svelte'
  import Button from '../primitives/Button.svelte'
  import Breadcrumb from './Breadcrumb.svelte'

  interface BreadcrumbItem {
    label: string
    href: string
  }

  interface NavLink {
    href: string
    label: string
    active?: boolean
  }

  interface Props {
    /** Navigation links to render in the top bar. @default [] */
    links?: NavLink[]
    /** Brand name shown next to the status LED. @default 'DEXTERLABS' */
    siteName?: string
    /** Optional breadcrumb trail. @default [] */
    breadcrumbs?: BreadcrumbItem[]
    [key: string]: unknown
  }

  let { links = [], siteName = 'DEXTERLABS', breadcrumbs = [], ...rest }: Props = $props()

  type Palette = 'phosphor' | 'paper'
  let palette = $state<Palette>('phosphor')

  const PALETTE_KEY = 'dxlb-palette'

  $effect(() => {
    const stored = localStorage.getItem(PALETTE_KEY) as Palette | null
    if (stored === 'paper' || stored === 'phosphor') palette = stored
    document.documentElement.setAttribute('data-palette', palette)
  })

  function handlePaletteToggle() {
    palette = palette === 'paper' ? 'phosphor' : 'paper'
    document.documentElement.setAttribute('data-palette', palette)
    localStorage.setItem(PALETTE_KEY, palette)
  }
</script>

<nav class="nav" {...rest}>
  <div class="nav-inner">
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

    <div class="nav-right">
      {#if links?.length}
        <ul class="nav-links">
          {#each links as link}
            <li>
              <a href={link.href} class="nav-link" class:active={link.active}
                 aria-current={link.active ? 'page' : undefined}>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      {/if}

      <Button variant="nav" aria-label="Toggle colour palette" onclick={handlePaletteToggle}>
        {palette === 'paper' ? '◑' : '◐'}
      </Button>

      {#if links?.length}
        <details class="nav-menu">
          <summary class="nav-summary">
            <span class="nav-icon-open">≡</span>
            <span class="nav-icon-close">×</span>
          </summary>
          <div class="nav-dropdown">
            {#each links as link}
              <a href={link.href} class="nav-dropdown-link" class:active={link.active}
                 aria-current={link.active ? 'page' : undefined}>{link.label}</a>
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
    font-size: var(--t-mono);
    letter-spacing: 0.08em;
  }

  .nav-inner {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    padding: 0 24px;
    height: 48px;
    max-width: 1200px;
    margin: 0 auto;
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
    margin-left: 8px;
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
    transition: color var(--transition), border-color var(--transition);
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
