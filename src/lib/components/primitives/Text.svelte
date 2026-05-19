<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type TextVariant = 'body' | 'lede' | 'mono' | 'eyebrow'
  type TextColor = 'ink' | 'dim' | 'faint' | 'amber' | 'cyan' | 'ok' | 'danger'
  type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type CaseVariant = 'upper' | 'lower' | 'none'

  interface Props {
    /** Typography style to apply. @default 'body' */
    variant?: TextVariant
    /** Text colour mapped to a design token. */
    color?: TextColor
    /** Font size override mapped to a type-scale token. */
    size?: SizeVariant
    /** Text transform override. */
    case?: CaseVariant
    /** HTML element to render as — overrides the variant default. */
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

  let { variant = 'body', color, size, case: textCase, as, children, class: klass = '', style, ...rest }: Props = $props()

  const resolvedAs = $derived(as ?? DEFAULT_TAG[variant])
  const colorStyle = $derived(color ? `color: var(--${COLOR_MAP[color]});` : '')
  const mergedStyle = $derived([colorStyle, style].filter(Boolean).join(' ') || undefined)
</script>

<svelte:element this={resolvedAs} class={[VARIANT_CLASS[variant], klass]} style={mergedStyle} data-size={size || undefined} data-case={textCase || undefined} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .body-text, .body-lede, .mono-label, .eyebrow { margin: 0 }

  .body-text {
    font-family: var(--sans);
    font-size: var(--t-body);
    line-height: 1.65;
  }

  .body-lede {
    font-family: var(--sans);
    font-size: var(--t-lede);
    line-height: 1.5;
    letter-spacing: -0.01em;
  }

  .mono-label {
    font-family: var(--mono);
    font-size: var(--t-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .eyebrow {
    font-family: var(--mono);
    font-size: var(--t-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  [data-size="xs"] { font-size: var(--t-micro) }
  [data-size="sm"] { font-size: var(--t-mono) }
  [data-size="md"] { font-size: var(--t-body) }
  [data-size="lg"] { font-size: var(--t-lede) }
  [data-size="xl"] { font-size: var(--t-h3) }

  [data-case="upper"] { text-transform: uppercase }
  [data-case="lower"] { text-transform: lowercase }
  [data-case="none"]  { text-transform: none }
</style>
