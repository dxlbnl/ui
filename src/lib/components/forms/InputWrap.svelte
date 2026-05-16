<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    iconPre?: Snippet
    addonPre?: string
    addonSuf?: string
    clearable?: boolean
    value?: string
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
    <button
      type="button"
      class="clear-btn"
      class:visible={showClear}
      aria-label="Clear"
      tabindex={showClear ? 0 : -1}
      onclick={onclear}
    >
      ×
    </button>
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

  .clear-btn {
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

  .clear-btn.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .clear-btn:hover {
    color: var(--ink);
  }
</style>
