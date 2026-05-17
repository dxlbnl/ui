<script lang="ts">
  import Led from '../primitives/Led.svelte'
  import Button from '../primitives/Button.svelte'
  import Inline from '../layout/Inline.svelte'
  import Stack from '../layout/Stack.svelte'

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
  <Inline class="nav-inner" gap="none" style="padding: 0 24px; height: 48px; max-width: 1200px; margin: 0 auto;">
    <Inline as="a" href="/" class="nav-brand" gap="xs" style="flex-shrink: 0; color: var(--ink); text-decoration: none; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
      <Led color="ok" aria-hidden="true" />
      <span class="nav-wordmark">{siteName}</span>
    </Inline>

    <!-- Right-side group always carries margin-left:auto so it stays right-aligned
         even when nav-links is hidden on mobile -->
    <Inline class="nav-right" gap="sm" style="margin-left: auto; flex-shrink: 0;">
      <Inline as="ul" class="nav-links" gap="md" style="padding: 0; margin: 0; flex-shrink: 0; text-transform: uppercase; font-size: 12px; list-style: none;">
        {#each links as link}
          <li>
            <a href={link.href} class="nav-link" class:active={link.active}
               aria-current={link.active ? 'page' : undefined}>
              {link.label}
            </a>
          </li>
        {/each}
      </Inline>
      <Inline class="nav-actions" gap="xs" style="flex-shrink: 0;">
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
    </Inline>
  </Inline>

  <div id="nav-drawer" class="nav-drawer" aria-hidden={menuOpen ? undefined : 'true'}>
    {#if menuOpen}
      <Stack as="ul" class="nav-drawer-links" gap="sm" style="list-style: none; padding: 0; margin: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em;">
        {#each links as link}
          <li>
            <a href={link.href} class="nav-drawer-link" class:active={link.active}
               aria-current={link.active ? 'page' : undefined}>
              {link.label}
            </a>
          </li>
        {/each}
      </Stack>
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

  .hamburger-wrap {
    display: none;
  }

  .nav-drawer {
    display: none;
  }

  @media (max-width: 767px) {
    :global(.nav-links) {
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
