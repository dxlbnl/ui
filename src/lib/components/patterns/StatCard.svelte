<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  type StatColor = 'default' | 'ok' | 'amber' | 'danger'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string
    value: string
    sublabel?: string
    color?: StatColor
    [key: string]: unknown
  }

  let {
    label,
    value,
    sublabel,
    color = 'default',
    ...rest
  }: Props = $props()
</script>

<div class="stat-card" {...rest}>
  <span class="stat-label">{label}</span>
  <span class="stat-value stat-value--{color}">{value}</span>
  {#if sublabel}
    <span class="stat-sub">{sublabel}</span>
  {/if}
</div>

<style>
  .stat-card {
    border: 1px solid var(--rule);
    background: var(--bg-rail);
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stat-label {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .stat-value {
    font-family: var(--mono);
    font-size: 32px;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
  }

  .stat-value--ok     { color: var(--ok); }
  .stat-value--amber  { color: var(--amber); }
  .stat-value--danger { color: var(--danger); }

  .stat-sub {
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--ink-faint);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
