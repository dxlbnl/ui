<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  type KvColor = 'default' | 'ok' | 'amber' | 'danger' | 'cyan'

  interface KvItem {
    key: string
    value: string
    color?: KvColor
  }

  interface Props extends HTMLAttributes<HTMLDivElement> {
    items: KvItem[]
    [key: string]: unknown
  }

  let {
    items,
    ...rest
  }: Props = $props()
</script>

<div class="kv-list" {...rest}>
  {#each items as item}
    <div class="kv-row">
      <span class="kv-key">{item.key}</span>
      <span class="kv-val kv-val--{item.color ?? 'default'}">{item.value}</span>
    </div>
  {/each}
</div>

<style>
  .kv-list {
    display: flex;
    flex-direction: column;
  }

  .kv-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    padding: 6px 0;
    border-bottom: 1px dashed var(--rule);
    font-family: var(--mono);
    font-size: var(--t-mono);
  }

  .kv-row:last-child {
    border-bottom: none;
  }

  .kv-key {
    color: var(--ink-faint);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .kv-val {
    color: var(--ink);
    text-align: right;
  }

  .kv-val--amber  { color: var(--amber); }
  .kv-val--ok     { color: var(--ok); }
  .kv-val--danger { color: var(--danger); }
  .kv-val--cyan   { color: var(--cyan); }
</style>
