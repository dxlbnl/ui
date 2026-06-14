<script lang="ts">
  import type { Snippet } from "svelte";
  import Led from "../primitives/Led.svelte";

  interface NavItem {
    id: string;
    label: string;
    badge?: number | string;
  }

  interface Props {
    /** Brand block (top of the rail). String or Snippet (D43). */
    brand?: string | Snippet;
    /** Left side of the sticky top bar. String or Snippet (D43). */
    topLeft?: string | Snippet;
    /** Right side of the sticky top bar. String or Snippet (D43). */
    topRight?: string | Snippet;
    /** Optional rail footer (desktop only). String or Snippet (D43). */
    footer?: string | Snippet;
    /** Navigation items rendered in both rail and tab bar. @default [] */
    nav?: NavItem[];
    /** id of the currently-active nav item. */
    current: string;
    /** Called with the item id when a nav item is activated. */
    onNavigate: (id: string) => void;
    /** Required main content. */
    children: Snippet;
    /** Polymorphic root element. @default 'div' */
    as?: string;
    [key: string]: unknown;
  }

  let {
    brand,
    topLeft,
    topRight,
    footer,
    nav = [],
    current,
    onNavigate,
    children,
    as = "div",
    ...rest
  }: Props = $props();

  type LedColor = "amber" | "off";

  function isSnippet(value: string | Snippet | undefined): value is Snippet {
    return typeof value === "function";
  }

  let railNavEl = $state<HTMLElement>();
  let tabNavEl = $state<HTMLElement>();

  // CSS container queries own which layout is *visible*; this effect only mirrors
  // that CSS-decided visibility onto `aria-hidden` so exactly one nav is exposed to
  // assistive tech at a time. SSR-safe ($effect runs client-only); no layout
  // restructuring, no `$app/environment` (D52), no matchMedia (D65).
  const BREAKPOINT = 760;

  $effect(() => {
    const root = railNavEl?.closest(".app-shell") as HTMLElement | null;
    if (!root) return;

    // Derive from the root's own width so the rail (≥760px) and tab bar (<760px)
    // are exact complements — this mirrors the `@container (min-width: 760px)` rule
    // and guarantees exactly one nav is exposed, never both/neither.
    const sync = () => {
      const desktop = root.clientWidth >= BREAKPOINT;
      railNavEl?.setAttribute("aria-hidden", desktop ? "false" : "true");
      tabNavEl?.setAttribute("aria-hidden", desktop ? "true" : "false");
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);
    return () => observer.disconnect();
  });
</script>

<svelte:element this={as} class="app-shell" {...rest}>
  <!-- Desktop rail (visible ≥ 760px) -->
  <aside class="rail">
    <div class="brand" data-part="brand">
      {#if isSnippet(brand)}
        {@render brand()}
      {:else}
        {brand}
      {/if}
    </div>
    <nav
      class="rail-nav"
      aria-label="Primary"
      aria-hidden="true"
      bind:this={railNavEl}
    >
      {#each nav as item (item.id)}
        {@const active = item.id === current}
        <button
          type="button"
          class="rail-item"
          class:active
          aria-current={active ? "page" : undefined}
          onclick={() => onNavigate(item.id)}
        >
          {item.label}
          {#if item.badge !== undefined}
            <span class="rail-badge" data-part="rail-badge" aria-hidden="true"
              >{item.badge}</span
            >
          {/if}
        </button>
      {/each}
    </nav>
    {#if footer !== undefined}
      <div class="rail-footer" data-part="footer">
        {#if isSnippet(footer)}
          {@render footer()}
        {:else}
          {footer}
        {/if}
      </div>
    {/if}
  </aside>

  <!-- Content column: top bar + main + (mobile) tab bar -->
  <div class="frame">
    <div class="top-bar" data-part="top-bar">
      <div class="top-left">
        {#if isSnippet(topLeft)}
          {@render topLeft()}
        {:else if topLeft !== undefined}
          {topLeft}
        {/if}
      </div>
      <div class="top-right">
        {#if isSnippet(topRight)}
          {@render topRight()}
        {:else if topRight !== undefined}
          {topRight}
        {/if}
      </div>
    </div>

    <main class="main">
      {@render children()}
    </main>

    <!-- Mobile tab bar (visible < 760px) -->
    <nav
      class="tab-nav"
      data-part="tab-nav"
      aria-label="Sections"
      aria-hidden="true"
      bind:this={tabNavEl}
    >
      {#each nav as item (item.id)}
        {@const active = item.id === current}
        <button
          type="button"
          class="tab-item"
          aria-current={active ? "page" : undefined}
          onclick={() => onNavigate(item.id)}
        >
          <span
            class="tab-bar-indicator"
            class:active
            data-part="tab-bar"
            aria-hidden="true"
          ></span>
          <Led color={(active ? "amber" : "off") as LedColor} />
          <span class="tab-label" class:active data-part="tab-label"
            >{item.label}</span
          >
          {#if item.badge !== undefined}
            <span class="tab-badge" data-part="tab-badge" aria-hidden="true"
            ></span>
          {/if}
        </button>
      {/each}
    </nav>
  </div>
</svelte:element>

<style>
  .app-shell {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .rail {
    display: none;
  }

  .frame {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .top-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--u2);
    padding: 0 var(--u2);
    height: 48px;
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    flex-shrink: 0;
  }

  .top-right {
    margin-left: auto;
  }

  .main {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .tab-nav {
    display: flex;
    border-top: 1px solid var(--rule);
    background: var(--bg-rail);
    flex-shrink: 0;
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
    padding: 8px 4px;
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: var(--mono);
  }

  .tab-bar-indicator {
    position: absolute;
    top: 0;
    width: 22px;
    height: 2px;
    background: transparent;

    &.active {
      background: var(--amber);
    }
  }

  .tab-label {
    font-family: var(--mono);
    font-size: 12px;
    text-transform: uppercase;
    color: var(--ink-faint);

    &.active {
      color: var(--amber);
    }
  }

  .tab-badge {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber);
  }

  @container (min-width: 760px) {
    .app-shell {
      flex-direction: row;
    }

    .rail {
      display: flex;
      flex-direction: column;
      width: 212px;
      flex-shrink: 0;
      background: var(--bg-rail);
      border-right: 1px solid var(--rule);
    }

    .brand {
      padding: var(--u2);
      border-bottom: 1px solid var(--rule);
    }

    .rail-nav {
      display: flex;
      flex-direction: column;
    }

    .rail-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--u);
      width: 100%;
      padding: var(--u) var(--u2);
      background: transparent;
      border: 0;
      border-left: 2px solid transparent;
      cursor: pointer;
      font-family: var(--mono);
      font-size: 12px;
      text-transform: uppercase;
      text-align: left;
      color: var(--ink-dim);

      &.active {
        border-left-color: var(--amber);
        color: var(--amber);
      }
    }

    .rail-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 6px;
      border-radius: var(--radius);
      background: var(--amber);
      color: var(--bg);
      font-size: 12px;
    }

    .rail-footer {
      margin-top: auto;
      padding: var(--u2);
      border-top: 1px solid var(--rule);
    }

    .tab-nav {
      display: none;
    }
  }
</style>
