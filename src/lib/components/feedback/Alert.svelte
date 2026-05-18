<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Stack from '../layout/Stack.svelte'

  type AlertVariant = 'success' | 'warning' | 'error' | 'info'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Colour variant — drives the tag glyph and border accent. @default 'info' */
    variant?: AlertVariant
    /** Bold title text shown in the alert header. */
    title?: string
    /** Body message text. */
    message?: string
    /** When provided, renders a dismiss × button inside the alert. */
    ondismiss?: () => void
    children?: Snippet
    [key: string]: unknown
  }

  let {
    variant = 'info',
    title,
    message,
    ondismiss,
    children,
    ...rest
  }: Props = $props()

  const TAG_GLYPHS: Record<AlertVariant, string> = {
    success: 'ok',
    warning: '!!',
    error: 'err',
    info: 'inf',
  }
</script>

<div class="alert alert--{variant}" {...rest}>
  <span class="alert-tag" aria-hidden="true">{TAG_GLYPHS[variant]}</span>
  <Stack gap="sm">
    {#if title}
      <span class="alert-title">{title}</span>
    {/if}
    {#if message}
      <span class="alert-msg">{message}</span>
    {/if}
    {@render children?.()}
  </Stack>
  {#if ondismiss}
    <button class="alert-dismiss" type="button" aria-label="Dismiss notification" onclick={ondismiss}>×</button>
  {/if}
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

  .alert--success { border-color: var(--ok);     background: color-mix(in srgb, var(--ok)     8%, transparent); }
  .alert--warning { border-color: var(--amber);  background: color-mix(in srgb, var(--amber)  8%, transparent); }
  .alert--error   { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 8%, transparent); }
  .alert--info    { border-color: var(--cyan);   background: color-mix(in srgb, var(--cyan)   8%, transparent); }

  .alert-tag {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .alert--success .alert-tag { color: var(--ok); }
  .alert--warning .alert-tag { color: var(--amber); }
  .alert--error   .alert-tag { color: var(--danger); }
  .alert--info    .alert-tag { color: var(--cyan); }

  .alert-title {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .alert--success .alert-title { color: var(--ok); }
  .alert--warning .alert-title { color: var(--amber); }
  .alert--error   .alert-title { color: var(--danger); }
  .alert--info    .alert-title { color: var(--cyan); }

  .alert-msg {
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.5;
  }

  .alert-dismiss {
    margin-left: auto;
    flex-shrink: 0;
    align-self: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-faint);
    font-size: 18px;
    line-height: 1;
    padding: 0;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
