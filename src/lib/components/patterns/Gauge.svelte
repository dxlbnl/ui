<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  interface Props extends SVGAttributes<SVGSVGElement> {
    /** Value 0–100. Clamped to that range; values <0 → 0, >100 → 100. */
    pct: number
    /** SVG width/height in px. @default 42 */
    size?: number
    /** Token name for the progress arc colour (rendered as `var(--{tone})`). @default 'amber' */
    tone?: string
    /** Track (background ring) stroke — a full CSS colour/var string. @default 'var(--rule-strong)' */
    track?: string
    /** Stroke width of both circles. @default 4 */
    width?: number
    /** Accessible name. @default 'Progress' */
    label?: string
  }

  // No polymorphic `as` prop — a gauge is intrinsically an SVG, so polymorphism is N/A.
  let {
    pct,
    size = 42,
    tone = 'amber',
    track = 'var(--rule-strong)',
    width = 4,
    label,
    ...rest
  }: Props = $props()

  const r = $derived((size - width - 3) / 2)
  const c = $derived(2 * Math.PI * r)
  const p = $derived(Math.max(0, Math.min(100, pct)))
  const dash = $derived(`${(p / 100) * c} ${c}`)
</script>

<svg
  class="gauge"
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  role="progressbar"
  aria-valuenow={p}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={label ?? 'Progress'}
  {...rest}
>
  <circle
    data-part="track"
    cx={size / 2}
    cy={size / 2}
    {r}
    fill="none"
    stroke={track}
    stroke-width={width}
  />
  <circle
    data-part="arc"
    class="gauge-arc"
    cx={size / 2}
    cy={size / 2}
    {r}
    fill="none"
    stroke="var(--{tone})"
    stroke-width={width}
    stroke-dasharray={dash}
  />
</svg>

<style>
  .gauge {
    display: block;
    flex-shrink: 0;
    transform: rotate(-90deg);
  }

  .gauge-arc {
    transition: stroke-dasharray 0.4s ease;
  }
</style>
