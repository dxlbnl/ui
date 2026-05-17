<script lang="ts">
  import Led from '../primitives/Led.svelte'
  import Button from '../primitives/Button.svelte'
  import Inline from '../layout/Inline.svelte'

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
    [key: string]: unknown
  }

  let { links = [], siteName = 'DEXTERLABS', ...rest }: Props = $props()

  type Palette = 'phosphor' | 'paper'
  let palette = $state<Palette>('phosphor')
  let menuOpen = $state(false)

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

  function handleMenuToggle() {
    menuOpen = !menuOpen
  }
</script>

<nav class="nav" {...rest}>
  <div class="nav-inner">
    <a class="nav-brand" href="/">
      <Led color="ok" aria-hidden="true" />
      <span class="nav-wordmark">{siteName}</span>
    </a>

    <!-- Right-side group always carries margin-left:auto so it stays right-aligned
         even when nav-links is hidden on mobile -->
    <div class="nav-right">
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
      <Inline class="nav-actions" gap="xs">
        <Button variant="ghost" aria-label="Toggle colour palette" onclick={handlePaletteToggle}>
          {palette === 'paper' ? '◑' : '◐'}
        </Button>
        <!-- Scoped wrapper avoids specificity battle with Button's .btn rule -->
        <div class="hamburger-wrap">
          <Button variant="ghost" class="nav-hamburger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="nav-drawer" onclick={handleMenuToggle}>
            {menuOpen ? '×' : '≡'}
          </Button>
        </div>
      </Inline>
    </div>
  </div>

  <div id="nav-drawer" class="nav-drawer" aria-hidden={menuOpen ? undefined : 'true'}>
    {#if menuOpen}
      <ul class="nav-drawer-links">
        {#each links as link}
          <li>
            <a href={link.href} class="nav-drawer-link" class:active={link.active}
               aria-current={link.active ? 'page' : undefined}>
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
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

  .nav-drawer-links {
    display: flex;
    flex-direction: column;
    gap: var(--u2);
    list-style: none;
    padding: 0;
    margin: 0;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .nav-link {
    color: var(--ink-dim);
    text-decoration: none;
    padding-bottom: 2px;
    border-bottom: 1px solid transparent;
    transition: color var(--transition), border-color var(--transition);
  }

  .nav-link.active {
    color: var(--ink);
    border-bottom-color: var(--amber);
  }

  .nav-right :global(.nav-actions) {
    flex-shrink: 0;
  }

  .hamburger-wrap {
    display: none;
  }

  .nav-drawer {
    display: none;
  }

  @media (max-width: 767px) {
    .nav-links {
      display: none !important;
    }

    .hamburger-wrap {
      display: block;
    }

    .nav-drawer {
      display: block;
      background: var(--bg);
      border-bottom: 1px solid var(--rule);
      padding: 12px 24px 16px;
    }

    .nav-drawer[aria-hidden='true'] {
      display: none;
    }

    .nav-drawer-link {
      color: var(--ink-dim);
      text-decoration: none;
      padding-bottom: 2px;
      border-bottom: 1px solid transparent;
    }

    .nav-drawer-link.active {
      color: var(--ink);
      border-bottom-color: var(--amber);
    }
  }
</style>
