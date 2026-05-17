<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type ContainerSize = 'lg' | 'md' | 'sm'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** HTML element to render as. @default 'div' */
    as?: string
    /** Max-width preset: lg = 1440px, md = 960px, sm = 640px. @default 'lg' */
    size?: ContainerSize
    children?: Snippet
    [key: string]: unknown
  }

  let { as = 'div', size = 'lg', children, ...rest }: Props = $props()
</script>

<svelte:element this={as} class="container-wrap" data-size={size} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .container-wrap {
    margin: 0 auto;
    padding-left: 32px;
    padding-right: 32px;
    container-type: inline-size;
  }

  .container-wrap[data-size="lg"] {
    max-width: 1440px;
    padding-bottom: 80px;
  }

  .container-wrap[data-size="md"] {
    max-width: 960px;
    padding-bottom: 64px;
  }

  .container-wrap[data-size="sm"] {
    max-width: 640px;
    padding-bottom: 48px;
  }

  @media (max-width: 720px) {
    .container-wrap {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
</style>
