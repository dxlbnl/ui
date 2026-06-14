<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  interface Segment {
    /** Legend label. Rendered uppercase mono in --ink-faint. */
    label: string
    /** Share value. Negative values are clamped to 0 before any geometry. */
    value: number
    /** Any CSS colour / var token. Applied inline as the rect fill and swatch background. */
    color: string
    /** Optional per-segment value caption shown in the legend (e.g. "42%"). */
    valueLabel?: string
  }

  interface Props extends SVGAttributes<SVGSVGElement> {
    /** Ordered segments, laid left-to-right. */
    segments: Segment[]
    /** SVG height in px (the bar thickness). @default 14 */
    height?: number
    /** Accessible name for the whole bar. @default 'Proportion' */
    label?: string
  }

  // No polymorphic `as` prop — the bar is intrinsically an SVG, so polymorphism is N/A.
  let { segments, height = 14, label, ...rest }: Props = $props()

  const W = 1000
  const GAP = 2

  const clampV = (v: number) => Math.max(0, v)
  const total = $derived(segments.reduce((s, seg) => s + clampV(seg.value), 0) || 1)
  const widths = $derived(segments.map((seg) => (clampV(seg.value) / total) * W))
  const rects = $derived(
    segments.map((seg, i) => ({
      x: widths.slice(0, i).reduce((s, w) => s + w, 0),
      width: Math.max(0, widths[i] - (i < segments.length - 1 ? GAP : 0)),
      color: seg.color,
    })),
  )
</script>

<div data-part="root" class="proportion-bar">
  <svg
    class="bar"
    viewBox="0 0 {W} {height}"
    preserveAspectRatio="none"
    role="img"
    aria-label={label ?? 'Proportion'}
    {...rest}
  >
    {#each rects as rect}
      <rect
        data-part="segment"
        x={rect.x}
        y="0"
        width={rect.width}
        height={height}
        fill={rect.color}
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each segments as seg}
      <li>
        <span data-part="swatch" class="swatch" style="background: {seg.color}"></span>
        <span data-part="legend-label" class="legend-label">{seg.label}</span>
        {#if seg.valueLabel}
          <span data-part="value-label" class="value-label">{seg.valueLabel}</span>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .proportion-bar {
    display: flex;
    flex-direction: column;
    gap: var(--u2);
  }

  .bar {
    display: block;
    width: 100%;
    border: 1px solid var(--rule);
    background: var(--bg-sunken);
  }

  .legend {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--u2);

    & li {
      display: flex;
      align-items: center;
      gap: var(--u);
    }
  }

  .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    flex-shrink: 0;
  }

  .legend-label {
    text-transform: uppercase;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--ink-faint);
  }

  .value-label {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-dim);
  }
</style>
