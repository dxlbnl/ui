<script lang="ts">
  import Led from '../primitives/Led.svelte'

  interface NavLink {
    href: string
    label: string
    active?: boolean
  }

  interface Props {
    links?: NavLink[]
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
    <div class="nav-actions">
      <button class="nav-palette-toggle" aria-label="Toggle colour palette"
              onclick={handlePaletteToggle}>
        {palette === 'paper' ? '◑' : '◐'}
      </button>
      <button class="nav-hamburger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              onclick={handleMenuToggle}>
        {menuOpen ? '×' : '≡'}
      </button>
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
    gap: 28px;
    padding: 0 24px;
    height: 48px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink);
    text-decoration: none;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .nav-links {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0 0 0 auto;
    padding: 0;
    flex-shrink: 0;
    text-transform: uppercase;
    font-size: 12px;
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

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .nav-palette-toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-faint);
    font-family: var(--mono);
    font-size: 16px;
    line-height: 1;
    padding: 0;
  }

  .nav-hamburger {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-faint);
    font-family: var(--mono);
    font-size: 20px;
    line-height: 1;
    padding: 0;
    display: none;
  }

  .nav-drawer {
    display: none;
  }

  @media (max-width: 767px) {
    .nav-links {
      display: none;
    }

    .nav-hamburger {
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

    .nav-drawer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.08em;
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
