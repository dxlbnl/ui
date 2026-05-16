<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type AlertVariant = 'ok' | 'amber' | 'danger' | 'info'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant
    title: string
    message?: string
    children?: Snippet
    [key: string]: unknown
  }

  let {
    variant = 'info',
    title,
    message,
    children,
    ...rest
  }: Props = $props()

  const TAG_GLYPHS: Record<AlertVariant, string> = {
    ok: 'ok',
    amber: '!!',
    danger: 'err',
    info: 'inf',
  }
</script>

<div class="alert alert--{variant}" role="status" {...rest}>
  <span class="alert-tag" aria-hidden="true">{TAG_GLYPHS[variant]}</span>
  <div class="alert-body">
    <span class="alert-title">{title}</span>
    {#if message}
      <span class="alert-msg">{message}</span>
    {/if}
    {@render children?.()}
  </div>
</div>

<style>
  .alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-left: 2px solid;
    font-size: var(--t-body);
    line-height: 1.5;
  }

  .alert--ok     { border-color: var(--ok);     background: color-mix(in srgb, var(--ok)     8%, transparent); }
  .alert--amber  { border-color: var(--amber);  background: color-mix(in srgb, var(--amber)  8%, transparent); }
  .alert--danger { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 8%, transparent); }
  .alert--info   { border-color: var(--cyan);   background: color-mix(in srgb, var(--cyan)   8%, transparent); }

  .alert-tag {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .alert--ok     .alert-tag { color: var(--ok); }
  .alert--amber  .alert-tag { color: var(--amber); }
  .alert--danger .alert-tag { color: var(--danger); }
  .alert--info   .alert-tag { color: var(--cyan); }

  .alert-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .alert-title {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .alert--ok     .alert-title { color: var(--ok); }
  .alert--amber  .alert-title { color: var(--amber); }
  .alert--danger .alert-title { color: var(--danger); }
  .alert--info   .alert-title { color: var(--cyan); }

  .alert-msg {
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.5;
  }
</style>
