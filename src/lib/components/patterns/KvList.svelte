<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'

  type KvColor = 'default' | 'ok' | 'amber' | 'danger' | 'cyan'

  interface KvItem {
    key: string
    value: string
    color?: KvColor
  }

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Array of `{ key, value, color? }` rows to render. */
    items: KvItem[]
    [key: string]: unknown
  }

  let {
    items,
    ...rest
  }: Props = $props()
</script>

<Stack gap="none" {...rest}>
  {#each items as item}
    <div class="kv-row">
      <Spread>
        <span class="kv-key">{item.key}</span>
        <span class="kv-val kv-val--{item.color ?? 'default'}">{item.value}</span>
      </Spread>
    </div>
  {/each}
</Stack>

<style>
  .kv-row {
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
