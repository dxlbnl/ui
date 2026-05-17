<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Spread from '../layout/Spread.svelte'

  interface Props extends HTMLAttributes<HTMLElement> {
    /** Link URL for the "view all" anchor. */
    href: string
    /** Link label text. */
    label: string
    /** Optional item count shown on the right. */
    count?: number
    /** Optional meta string shown alongside the count. */
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

<Spread as="footer" style="border-top: 1px solid var(--rule); padding: 12px 0; font-family: var(--mono); font-size: var(--t-mono); letter-spacing: 0.06em; margin-top: 20px;" {...rest}>
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
</Spread>

<style>
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
