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
