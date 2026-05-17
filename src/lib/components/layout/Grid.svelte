<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type GridCols = 1 | 2 | 3 | 4 | 'auto'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** HTML element to render as. @default 'div' */
    as?: string
    /** Number of equal columns, or `'auto'` for responsive auto-fill. @default 3 */
    cols?: GridCols
    /** Space between grid cells. @default 'sm' */
    gap?: GapSize
    /** Minimum column width used when `cols` is `'auto'`. @default '240px' */
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
