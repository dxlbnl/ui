<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type AlignValue = 'start' | 'center' | 'end' | 'baseline' | 'stretch'

  interface Props {
    /** HTML element to render as. @default 'div' */
    as?: string
    /** Space between children. @default 'sm' */
    gap?: GapSize
    /** Cross-axis alignment. @default 'center' */
    align?: AlignValue
    children?: Snippet
    class?: ClassValue | null
    style?: string | null
    [key: string]: unknown
  }

  let { as = 'div', gap = 'sm', align = 'center', children, class: klass = '', ...rest }: Props = $props()
</script>

<svelte:element this={as} class={['inline', klass]} data-gap={gap} data-align={align} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .inline {
    display: flex;
    flex-wrap: wrap;
  }

  .inline[data-gap="none"] { gap: 0; }
  .inline[data-gap="xs"]   { gap: var(--u); }
  .inline[data-gap="sm"]   { gap: var(--u2); }
  .inline[data-gap="md"]   { gap: var(--u3); }
  .inline[data-gap="lg"]   { gap: var(--u4); }
  .inline[data-gap="xl"]   { gap: var(--u5); }

  .inline[data-align="start"]    { align-items: flex-start; }
  .inline[data-align="center"]   { align-items: center; }
  .inline[data-align="end"]      { align-items: flex-end; }
  .inline[data-align="baseline"] { align-items: baseline; }
  .inline[data-align="stretch"]  { align-items: stretch; }
</style>
