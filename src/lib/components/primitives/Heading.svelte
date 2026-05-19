<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
  type HeadingVariant = 'display' | 'hero' | 'h1' | 'h2' | 'h3'
  type TextColor = 'ink' | 'dim' | 'faint' | 'amber' | 'cyan' | 'ok' | 'danger'
  interface Props {
    /** HTML heading level (h1–h6). @default 2 */
    level?: HeadingLevel
    /** Typography class to apply — defaults to the level's matching variant. */
    variant?: HeadingVariant
    /** Text colour mapped to a design token. */
    color?: TextColor
    children?: Snippet
    class?: ClassValue | null
    style?: string | null
    [key: string]: unknown
  }

  const DEFAULT_VARIANT: Partial<Record<HeadingLevel, HeadingVariant>> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
  }

  const VARIANT_CLASS: Record<HeadingVariant, string> = {
    display: 'display-heading',
    hero: 'hero-heading',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
  }

  const COLOR_MAP: Record<NonNullable<TextColor>, string> = {
    ink: 'ink',
    dim: 'ink-dim',
    faint: 'ink-faint',
    amber: 'amber',
    cyan: 'cyan',
    ok: 'ok',
    danger: 'danger',
  }

  let { level = 2, variant, color, children, class: klass = '', style, ...rest }: Props = $props()

  const resolvedVariant = $derived(variant ?? DEFAULT_VARIANT[level])
  const variantClass = $derived(resolvedVariant ? VARIANT_CLASS[resolvedVariant] : undefined)
  const colorStyle = $derived(color ? `color: var(--${COLOR_MAP[color]});` : '')
  const mergedStyle = $derived([colorStyle, style].filter(Boolean).join(' ') || undefined)
</script>

<svelte:element this={"h" + level} class={[variantClass, klass]} style={mergedStyle} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .h1, .h2, .h3, .hero-heading, .display-heading { margin: 0 }
  h4, h5, h6 { margin: 0 }

  .h1 {
    font-family: var(--sans);
    font-weight: 500;
    font-size: var(--t-h1);
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .h2 {
    font-family: var(--sans);
    font-weight: 500;
    font-size: var(--t-h2);
    letter-spacing: -0.01em;
    line-height: 1.1;
  }

  .h3 {
    font-family: var(--sans);
    font-weight: 500;
    font-size: var(--t-h3);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .hero-heading {
    font-family: var(--sans);
    font-weight: 500;
    font-size: var(--t-hero);
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .display-heading {
    font-family: var(--sans);
    font-weight: 500;
    font-size: var(--t-display);
    letter-spacing: -0.04em;
    line-height: 0.9;
  }

</style>
