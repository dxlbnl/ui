<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type GridCols = 1 | 2 | 3 | 4 | 'auto'
  type StackBelow = 'sm' | 'md' | 'lg'
  type GridAlign = 'start' | 'center' | 'end' | 'stretch'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** HTML element to render as. @default 'div' */
    as?: string
    /** Number of equal columns, or `'auto'` for responsive auto-fill. @default 3 */
    cols?: GridCols
    /** Space between grid cells. @default 'sm' */
    gap?: GapSize
    /** Minimum column width used when `cols` is `'auto'`. @default '240px' */
    minColWidth?: string
    /** Raw `grid-template-columns` track list — overrides `cols`. */
    template?: string
    /** Tokenized container width below which the grid collapses to one column. */
    stackBelow?: StackBelow
    /** Cross-axis alignment (`align-items`). @default 'stretch' */
    align?: GridAlign
    children?: Snippet
    [key: string]: unknown
  }

  let {
    as = 'div',
    cols = 3,
    gap = 'sm',
    minColWidth = '240px',
    template,
    stackBelow,
    align = 'stretch',
    children,
    ...rest
  }: Props = $props()

  const gapMap: Record<GapSize, string> = {
    none: '0',
    xs:   'var(--u)',
    sm:   'var(--u2)',
    md:   'var(--u3)',
    lg:   'var(--u4)',
    xl:   'var(--u5)',
  }

  const colsTemplate = $derived(
    template
      ? template
      : cols === 'auto'
        ? `repeat(auto-fill, minmax(${minColWidth}, 1fr))`
        : cols === 1
          ? '1fr'
          : `repeat(${cols}, 1fr)`
  )
</script>

<svelte:element
  this={as}
  class="grid-layout"
  data-cols={template ? undefined : cols}
  data-stack={stackBelow}
  data-align={align}
  style="--grid-cols: {colsTemplate}; --grid-gap: {gapMap[gap]};"
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .grid-layout {
    display: grid;
    grid-template-columns: var(--grid-cols);
    gap: var(--grid-gap);

    /* B42 cols-collapse schedule — only when stackBelow is NOT set; with
       stackBelow the collapse is governed solely by the stack rules (B64-C1). */
    @container (max-width: 900px) {
      &[data-cols="3"]:not([data-stack]),
      &[data-cols="4"]:not([data-stack]) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @container (max-width: 720px) {
      &[data-cols="2"]:not([data-stack]),
      &[data-cols="3"]:not([data-stack]),
      &[data-cols="4"]:not([data-stack]) {
        grid-template-columns: 1fr;
      }
    }

    /* B64: stackBelow collapse-to-one — keyed on data-stack. Works for both
       cols grids and template grids (template grids carry no data-cols). */
    @container (max-width: 900px) {
      &[data-stack="lg"] {
        grid-template-columns: 1fr;
      }
    }

    @container (max-width: 720px) {
      &[data-stack="md"] {
        grid-template-columns: 1fr;
      }
    }

    @container (max-width: 480px) {
      &[data-stack="sm"] {
        grid-template-columns: 1fr;
      }
    }
  }

  /* B64: align mirrors Inline's data-align pattern. */
  .grid-layout[data-align="start"]   { align-items: start; }
  .grid-layout[data-align="center"]  { align-items: center; }
  .grid-layout[data-align="end"]     { align-items: end; }
  .grid-layout[data-align="stretch"] { align-items: stretch; }
</style>
