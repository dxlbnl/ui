<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type TextVariant = 'body' | 'lede' | 'mono' | 'eyebrow'
  type TextColor = 'ink' | 'dim' | 'faint' | 'amber' | 'cyan' | 'ok' | 'danger'

  interface Props {
    variant?: TextVariant
    color?: TextColor
    as?: string
    children?: Snippet
    class?: ClassValue | null
    style?: string | null
    [key: string]: unknown
  }

  const DEFAULT_TAG: Record<TextVariant, string> = {
    body: 'p',
    lede: 'p',
    mono: 'span',
    eyebrow: 'span',
  }

  const VARIANT_CLASS: Record<TextVariant, string> = {
    body: 'body-text',
    lede: 'body-lede',
    mono: 'mono-label',
    eyebrow: 'eyebrow',
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

  let { variant = 'body', color, as, children, class: klass = '', style, ...rest }: Props = $props()

  const resolvedAs = $derived(as ?? DEFAULT_TAG[variant])
  const colorStyle = $derived(color ? `color: var(--${COLOR_MAP[color]});` : '')
  const mergedStyle = $derived([colorStyle, style].filter(Boolean).join(' ') || undefined)
</script>

<svelte:element this={resolvedAs} class={[VARIANT_CLASS[variant], klass]} style={mergedStyle} {...rest}>
  {@render children?.()}
</svelte:element>
