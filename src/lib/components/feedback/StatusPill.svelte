<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Led from '../primitives/Led.svelte'
  import Popover from './Popover.svelte'

  type StatusTone = 'ok' | 'amber' | 'cyan' | 'danger' | 'off'
  type PopoverAlign = 'left' | 'right'

  interface Props extends HTMLButtonAttributes {
    /** Status tone — drives the LED colour and (for non-ok tones) the label + border. @default 'ok' */
    tone?: StatusTone
    /** Pill label text — rendered uppercase mono. */
    label: string
    /** Optional ` · <detail>` suffix after the label, in faint ink. */
    detail?: string
    /** Whether the LED blinks. Forwarded to Led. @default false */
    blink?: boolean
    /** Detail panel contents — a Snippet (D43). When absent, clicking does not open a Popover. */
    children?: Snippet
    /** Popover edge alignment, forwarded to Popover. @default 'right' */
    align?: PopoverAlign
    /** Popover panel width, forwarded to Popover. @default 300 */
    width?: number | string
    /** Polymorphic trigger element. @default 'button' */
    as?: string
    [key: string]: unknown
  }

  let {
    tone = 'ok',
    label,
    detail,
    blink = false,
    children,
    align = 'right',
    width = 300,
    as = 'button',
    ...rest
  }: Props = $props()

  let open = $state(false)
</script>

<div class="pill-wrap">
  <svelte:element
    this={as}
    class="pill"
    data-tone={tone}
    aria-haspopup={children ? 'dialog' : undefined}
    aria-expanded={children ? open : undefined}
    onmousedown={(e: MouseEvent) => e.stopPropagation()}
    onclick={() => (open = !open)}
    {...rest}
  >
    <Led color={tone} {blink} />
    <span class="pill-label" data-part="label">
      {label}{#if detail}<span class="pill-detail" data-part="detail"> · {detail}</span>{/if}
    </span>
  </svelte:element>

  {#if open && children}
    <Popover bind:open onclose={() => (open = false)} {align} {width}>
      {@render children()}
    </Popover>
  {/if}
</div>

<style>
  .pill-wrap {
    position: relative;
    display: inline-block;
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 11px;
    border: 1px solid var(--rule-strong);
    background: var(--bg-rail);
    cursor: pointer;

    &[data-tone='amber'] {
      border-color: var(--amber);
    }
    &[data-tone='cyan'] {
      border-color: var(--cyan);
    }
    &[data-tone='danger'] {
      border-color: var(--danger);
    }
  }

  .pill-label {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--ink-dim);

    .pill[data-tone='amber'] & {
      color: var(--amber);
    }
    .pill[data-tone='cyan'] & {
      color: var(--cyan);
    }
    .pill[data-tone='danger'] & {
      color: var(--danger);
    }
  }

  .pill-detail {
    color: var(--ink-faint);
  }
</style>
