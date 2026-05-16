<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type GridCols = 1 | 2 | 3 | 4 | 'auto'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    as?: string
    cols?: GridCols
    gap?: GapSize
    minColWidth?: string
    children?: Snippet
    [key: string]: unknown
  }

  let { as = 'div', cols = 3, gap = 'sm', minColWidth = '240px', children, ...rest }: Props = $props()

  const gapMap: Record<GapSize, string> = {
    none: '0',
    xs:   'var(--u)',
    sm:   'var(--u2)',
    md:   'var(--u2)',
    lg:   'var(--u4)',
    xl:   'var(--u5)',
  }

  const colsTemplate = $derived(
    cols === 'auto'
      ? `repeat(auto-fill, minmax(${minColWidth}, 1fr))`
      : cols === 1
        ? '1fr'
        : `repeat(${cols}, 1fr)`
  )
</script>

<svelte:element
  this={as}
  class="grid-layout"
  style="grid-template-columns: {colsTemplate}; gap: {gapMap[gap]};"
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .grid-layout {
    display: grid;
  }
</style>
