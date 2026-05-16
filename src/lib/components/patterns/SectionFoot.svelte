<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends HTMLAttributes<HTMLElement> {
    href: string
    label: string
    count?: number
    meta?: string
    [key: string]: unknown
  }

  let {
    href,
    label,
    count,
    meta,
    ...rest
  }: Props = $props()
</script>

<footer class="section-foot" {...rest}>
  <a class="section-foot-link" {href}>{label}</a>
  {#if count !== undefined || meta}
    <span class="section-foot-meta">
      {#if count !== undefined && meta}
        {count} · {meta}
      {:else if count !== undefined}
        {count}
      {:else}
        {meta}
      {/if}
    </span>
  {/if}
</footer>

<style>
  .section-foot {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: var(--mono);
    font-size: var(--t-mono);
    letter-spacing: 0.06em;
    padding-top: 16px;
    margin-top: 20px;
    border-top: 1px solid var(--rule);
  }

  .section-foot-link {
    color: var(--amber);
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: color var(--transition);
  }

  .section-foot-link:hover {
    color: var(--ink);
  }

  .section-foot-meta {
    color: var(--ink-faint);
    text-transform: uppercase;
    font-size: var(--t-micro);
  }
</style>
