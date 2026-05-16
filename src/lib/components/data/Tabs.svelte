<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type TabsVariant = 'underline' | 'pill'

  interface TabItem {
    id: string
    label: string
    panel: Snippet
  }

  interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    tabs: TabItem[]
    active?: string
    variant?: TabsVariant
  }

  let { tabs, active = tabs[0]?.id, variant = 'underline', ...rest }: TabsProps = $props()

  let activeId = $state(active)
</script>

<div class="tabs tabs--{variant}" {...rest}>
  <div class="tab-bar" role="tablist">
    {#each tabs as tab}
      <button
        class="tab"
        class:tab--active={activeId === tab.id}
        role="tab"
        id="tab-{tab.id}"
        aria-selected={activeId === tab.id}
        aria-controls="panel-{tab.id}"
        onclick={() => (activeId = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  {#each tabs as tab}
    <div
      class="tab-panel"
      role="tabpanel"
      id="panel-{tab.id}"
      aria-labelledby="tab-{tab.id}"
      hidden={activeId !== tab.id}
    >
      {@render tab.panel()}
    </div>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    flex-direction: column;
  }

  .tab-bar {
    display: flex;
    border-bottom: 1px solid var(--rule);
    gap: 0;
  }

  .tab {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 18px;
    cursor: pointer;
    color: var(--ink-faint);
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition:
      color var(--transition),
      border-color var(--transition);
    white-space: nowrap;
  }

  .tab:hover {
    color: var(--ink);
  }

  .tab--active {
    color: var(--ink);
    border-bottom-color: var(--amber);
  }

  .tab-panel {
    padding: 16px;
    background: var(--bg-rail);
    border: 1px solid var(--rule);
    border-top: none;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ink-dim);
  }

  /* Pill variant */
  .tabs--pill .tab-bar {
    gap: 4px;
    padding: 4px;
    background: var(--bg-rail);
    border: 1px solid var(--rule);
    width: fit-content;
    border-bottom: 1px solid var(--rule);
  }

  .tabs--pill .tab {
    font-size: 11px;
    padding: 5px 14px;
    border-bottom: none;
    margin-bottom: 0;
  }

  .tabs--pill .tab--active {
    background: var(--amber);
    color: var(--bg);
    border-bottom-color: transparent;
  }
</style>
