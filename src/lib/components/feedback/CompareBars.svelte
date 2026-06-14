<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface CompareRow {
    /** Row label. Rendered uppercase mono, --ink-dim, ellipsis-truncated. */
    label: string
    /** Actual value. Drives the actual-fill width and the over-target comparison. */
    value: number
    /** Target value. Drives the ghost target-fill width. */
    target: number
    /** Optional caption shown at the row's right edge (e.g. "€240 / 320"). */
    valueLabel?: string
  }

  interface Props extends HTMLAttributes<HTMLElement> {
    /** Ordered rows, stacked top-to-bottom. */
    rows: CompareRow[]
    /** Accessible name for the whole chart. @default 'Comparison' */
    label?: string
    /** Polymorphic root element. @default 'div' */
    as?: string
  }

  let { rows, label, as = 'div', ...rest }: Props = $props()

  const max = $derived(
    Math.max(1, ...rows.map((r) => r.target), ...rows.map((r) => r.value)),
  )
</script>

<svelte:element
  this={as}
  data-part="root"
  class="compare-bars"
  role="group"
  aria-label={label ?? 'Comparison'}
  {...rest}
>
  {#each rows as row}
    {@const over = row.value > row.target}
    <div
      data-part="row"
      class="row"
      role="img"
      aria-label={`${row.label}: ${row.value} of ${row.target}, ${over ? 'over target' : 'within target'}`}
    >
      <span data-part="label" class="label">{row.label}</span>
      <div data-part="track" class="track">
        <div
          data-part="target-fill"
          class="target-fill"
          style="width:{(row.target / max) * 100}%"
        ></div>
        <div
          data-part="actual-fill"
          class={['actual-fill', over && 'over']}
          style="width:{Math.min(100, (row.value / max) * 100)}%"
        ></div>
      </div>
      {#if row.valueLabel}
        <span data-part="value-label" class={['value-label', over && 'over']}>
          {row.valueLabel}
        </span>
      {/if}
    </div>
  {/each}
</svelte:element>

<style>
  .compare-bars {
    display: flex;
    flex-direction: column;
    gap: var(--u2);
  }

  .row {
    display: grid;
    grid-template-columns: 110px 1fr auto;
    align-items: center;
    gap: var(--u2);
  }

  .label {
    text-transform: uppercase;
    font-family: var(--mono);
    color: var(--ink-dim);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track {
    position: relative;
    height: 16px;
    background: var(--bg-sunken);
    border: 1px solid var(--rule);
  }

  .target-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--bg-elev);
    border-right: 1px solid var(--rule-strong);
  }

  .actual-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--ok);
    transition: width 0.35s ease;

    &.over {
      background-color: var(--danger);
    }
  }

  .value-label {
    font-family: var(--mono);
    white-space: nowrap;
    color: var(--ink-faint);

    &.over {
      color: var(--danger);
    }
  }
</style>
