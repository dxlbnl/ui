<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  type RuleVariant = 'solid' | 'dashed' | 'strong'

  interface Props extends HTMLAttributes<HTMLHRElement> {
    variant?: RuleVariant
    [key: string]: unknown
  }

  let { variant = 'solid', ...rest }: Props = $props()
</script>

<hr class="rule" data-variant={variant} {...rest} />

<style>
  .rule {
    border: none;
    margin: 0;
  }

  .rule[data-variant="solid"] {
    border-top: 1px solid var(--rule);
  }

  .rule[data-variant="dashed"] {
    border-top: 1px dashed var(--rule);
  }

  .rule[data-variant="strong"] {
    border-top: 1px solid var(--rule-strong);
  }
</style>
