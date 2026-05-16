<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'

  interface Props extends HTMLAnchorAttributes {
    as?: string
    idx: number
    kind?: string
    title: string
    lede?: string
    date?: string
    [key: string]: unknown
  }

  let {
    as = 'a',
    idx,
    kind = 'LOG',
    title,
    lede,
    date,
    ...rest
  }: Props = $props()

  const hexId = $derived('0x' + idx.toString(16).padStart(2, '0').toUpperCase())
</script>

<svelte:element this={as} class="note-card" {...rest}>
  <div class="note-head">
    <span class="note-hex">{hexId}</span>
    <span class="note-kind">{kind.toUpperCase()}</span>
  </div>
  <h3 class="note-title">{title}</h3>
  {#if lede}
    <p class="note-lede">{lede}</p>
  {/if}
  {#if date}
    <div class="note-foot">
      <span class="note-date">{date}</span>
      <span class="note-read" aria-hidden="true">READ →</span>
    </div>
  {/if}
</svelte:element>

<style>
  .note-card {
    border: 1px solid var(--rule);
    background: var(--bg-rail);
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: border-color var(--transition);
  }

  .note-card:hover {
    border-color: var(--amber);
  }

  .note-head {
    display: flex;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .note-hex {
    color: var(--ink-faint);
  }

  .note-kind {
    color: var(--cyan);
  }

  .note-title {
    font-weight: 500;
    font-size: var(--t-lede);
    letter-spacing: -0.01em;
    margin: 0;
  }

  .note-lede {
    font-size: var(--t-body);
    color: var(--ink-dim);
    line-height: 1.5;
    flex: 1;
    margin: 0;
  }

  .note-foot {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    color: var(--ink-faint);
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed var(--rule);
  }

  .note-date {
    color: var(--ink-faint);
  }

  .note-read {
    color: var(--amber);
  }
</style>
