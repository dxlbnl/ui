<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Button from '../primitives/Button.svelte'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Snippet rendered as an icon before the input (aria-hidden). */
    iconPre?: Snippet
    /** Text prefix rendered before the input in a pill. */
    addonPre?: string
    /** Text suffix rendered after the input in a pill. */
    addonSuf?: string
    /** Show a clear (×) button when the input has a value. @default false */
    clearable?: boolean
    /** Current input value — used to show/hide the clear button. @default '' */
    value?: string
    /** Called when the clear button is clicked. */
    onclear?: () => void
    children: Snippet
    [key: string]: unknown
  }

  let {
    iconPre,
    addonPre,
    addonSuf,
    clearable = false,
    value = '',
    onclear,
    children,
    ...rest
  }: Props = $props()

  let showClear = $derived(clearable && (value?.length ?? 0) > 0)
</script>

<div class="input-wrap" {...rest}>
  {#if iconPre}
    <span class="icon-pre" aria-hidden="true">
      {@render iconPre()}
    </span>
  {/if}
  {#if addonPre}
    <span class="addon addon-pre">{addonPre}</span>
  {/if}
  {@render children()}
  {#if addonSuf}
    <span class="addon addon-suf">{addonSuf}</span>
  {/if}
  {#if clearable}
    <Button
      variant="ghost"
      type="button"
      class={showClear ? 'wrap-clear visible' : 'wrap-clear'}
      aria-label="Clear"
      tabindex={showClear ? 0 : -1}
      onclick={onclear}
    >×</Button>
  {/if}
</div>

<style>
  .input-wrap {
    position: relative;
    display: flex;
    align-items: stretch;
  }

  .icon-pre {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    flex-shrink: 0;
    background: var(--bg-elev);
    border: 1px solid var(--rule-strong);
    border-right: none;
    color: var(--ink-faint);
  }

  .addon {
    display: flex;
    align-items: center;
    padding: 0 10px;
    background: var(--bg-elev);
    border: 1px solid var(--rule-strong);
    font-family: var(--mono);
    font-size: 13px;
    color: var(--ink-faint);
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  .addon-pre {
    border-right: none;
  }

  .addon-suf {
    border-left: none;
  }

  :global(.wrap-clear) {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--mono);
    font-size: 14px;
    line-height: 1;
    color: var(--ink-faint);
    cursor: pointer;
    background: none;
    border: none;
    padding: 2px 4px;
    transition: color var(--transition);
    opacity: 0;
    pointer-events: none;
  }

  :global(.wrap-clear.visible) {
    opacity: 1;
    pointer-events: auto;
  }

  :global(.wrap-clear:hover) {
    color: var(--ink);
  }
</style>
