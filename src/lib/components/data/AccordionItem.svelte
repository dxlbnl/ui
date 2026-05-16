<script lang="ts">
  import type { Snippet } from 'svelte'

  interface AccordionItemProps {
    label: string
    open?: boolean
    children: Snippet
  }

  let { label, open = false, children }: AccordionItemProps = $props()
</script>

<details class="acc-item" {open}>
  <summary class="acc-trigger">
    <span class="acc-title">{label}</span>
    <span class="acc-icon" aria-hidden="true">›</span>
  </summary>
  <div class="acc-body">
    {@render children()}
  </div>
</details>

<style>
  .acc-item {
    border-bottom: 1px solid var(--rule);
  }

  .acc-item:last-child {
    border-bottom: none;
  }

  .acc-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--bg-rail);
    transition: background var(--transition);
    user-select: none;
    list-style: none;
  }

  .acc-trigger::-webkit-details-marker {
    display: none;
  }

  .acc-trigger:hover {
    background: var(--bg-elev);
  }

  details[open] .acc-trigger {
    background: var(--bg-elev);
  }

  .acc-title {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .acc-icon {
    font-family: var(--mono);
    font-size: 14px;
    color: var(--ink-faint);
    transition: transform var(--transition);
    flex-shrink: 0;
  }

  details[open] .acc-icon {
    transform: rotate(90deg);
    color: var(--amber);
  }

  .acc-body {
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ink-dim);
    border-top: 1px solid var(--rule);
    background: var(--bg-sunken, var(--bg));
  }
</style>
