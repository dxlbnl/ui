<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'back' | 'del'

  interface Props extends HTMLButtonAttributes {
    /** HTML element or component to render as. @default 'button' */
    as?: string
    /** Visual style variant. @default 'primary' */
    variant?: ButtonVariant
    children?: Snippet
    /** URL — pass to render as an `<a>` (set `as="a"` too). */
    href?: string
    [key: string]: unknown
  }

  let { as = 'button', variant = 'primary', children, class: klass = '', ...rest }: Props = $props()
</script>

<svelte:element this={as} class={['btn', `btn-${variant}`, klass]} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .btn {
    font-family: var(--mono);
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background var(--transition),
      color var(--transition),
      border-color var(--transition);
    border: none;
    background: transparent;
    display: inline-block;
    text-decoration: none;
  }

  /* primary */
  .btn-primary {
    background: var(--amber);
    color: var(--bg);
    padding: 10px 16px;
    font-size: 14px;
    letter-spacing: 0.1em;
  }

  .btn-primary:hover {
    background: var(--ink);
  }

  .btn-primary:disabled,
  .btn-primary[disabled],
  .btn-primary[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* cta */
  .btn-cta {
    color: var(--amber);
    border: 1px solid var(--amber);
    border-radius: var(--radius);
    background: transparent;
    padding: 9px 20px;
    font-size: 14px;
    letter-spacing: 0.1em;
  }

  .btn-cta:hover {
    background: var(--amber);
    color: var(--bg);
  }

  .btn-cta:disabled,
  .btn-cta[disabled],
  .btn-cta[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ghost */
  .btn-ghost {
    color: var(--amber);
    background: transparent;
    border: none;
    font-size: 14px;
    letter-spacing: 0.08em;
  }

  .btn-ghost:hover {
    color: var(--ink);
  }

  /* back */
  .btn-back {
    color: var(--ink-faint);
    background: transparent;
    border: none;
    font-size: 14px;
    letter-spacing: 0.08em;
  }

  .btn-back:hover {
    color: var(--amber);
  }

  /* del */
  .btn-del {
    color: var(--ink-faint);
    border: 1px solid var(--rule-strong);
    border-radius: var(--radius);
    background: transparent;
    padding: 3px 7px;
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .btn-del:hover {
    color: var(--danger);
    border-color: var(--danger);
  }
</style>
