<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type TagPillVariant = "default" | "amber" | "cyan";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** Colour variant of the pill. @default 'default' */
    variant?: TagPillVariant;
  }

  let { variant = "default", children, ...rest }: Props = $props();
</script>

<span class="pill pill-{variant}" {...rest}>
  {@render children?.()}
</span>

<style>
  .pill {
    display: inline-block;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 2px 6px;
    border: 1px solid;
    border-radius: 0;
  }

  .pill-default {
    color: var(--bg);
    background: var(--ink-dim);
  }

  .pill-amber {
    color: var(--bg);
    background: var(--amber);
  }

  .pill-cyan {
    color: var(--bg);
    background: var(--cyan);
  }
</style>
