<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import Stack from '../layout/Stack.svelte'
  import Button from '../primitives/Button.svelte'

  type TabsVariant = 'underline' | 'pill'

  interface TabItem {
    id: string
    label: string
    panel: Snippet
  }

  interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    /** Array of `{ id, label, panel }` tab descriptors. */
    tabs: TabItem[]
    /** `id` of the initially active tab — defaults to the first tab. */
    active?: string
    /** Tab indicator style. @default 'underline' */
    variant?: TabsVariant
  }

  let { tabs, active = tabs[0]?.id, variant = 'underline', ...rest }: TabsProps = $props()

  // `active` seeds the initial tab only (Tabs is uncontrolled after mount), so
  // untrack() the one-time read to silence the state_referenced_locally hint.
  let activeId = $state(untrack(() => active))

  function handleTabKeydown(e: KeyboardEvent, index: number) {
    const count = tabs.length
    let target = -1
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); target = (index + 1) % count; break
      case 'ArrowLeft':  e.preventDefault(); target = (index - 1 + count) % count; break
      case 'Home':       e.preventDefault(); target = 0; break
      case 'End':        e.preventDefault(); target = count - 1; break
    }
    if (target >= 0) {
      activeId = tabs[target].id
      document.getElementById(`tab-${tabs[target].id}`)?.focus()
    }
  }
</script>

<Stack class="tabs tabs--{variant}" {...rest}>
  <div class="tab-bar" role="tablist">
    {#each tabs as tab, i}
      <Button
        variant="ghost"
        class={activeId === tab.id ? 'tab tab--active' : 'tab'}
        role="tab"
        id="tab-{tab.id}"
        aria-selected={activeId === tab.id}
        aria-controls="panel-{tab.id}"
        onclick={() => (activeId = tab.id)}
        onkeydown={(e) => handleTabKeydown(e, i)}
      >
        {tab.label}
      </Button>
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
</Stack>

<style>
  .tab-bar {
    display: flex;
    border-bottom: 1px solid var(--rule);
    gap: 0;
  }

  /* Use .btn.tab (two classes) to beat .btn-ghost (one class) in specificity */
  :global(.btn.tab) {
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

  :global(.btn.tab:hover) {
    color: var(--ink);
  }

  :global(.btn.tab--active) {
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
  :global(.tabs--pill) .tab-bar {
    gap: 4px;
    padding: 4px;
    background: var(--bg-rail);
    border: 1px solid var(--rule);
    width: fit-content;
    border-bottom: 1px solid var(--rule);
  }

  :global(.tabs--pill .btn.tab) {
    font-size: 11px;
    padding: 5px 14px;
    border-bottom: none;
    margin-bottom: 0;
  }

  :global(.tabs--pill .btn.tab--active) {
    background: var(--amber);
    color: var(--bg);
    border-bottom-color: transparent;
  }
</style>
