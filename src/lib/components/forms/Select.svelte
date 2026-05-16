<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface SelectOption {
    value: string
    label: string
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
    options: SelectOption[]
    value?: string
    placeholder?: string
    error?: boolean
    disabled?: boolean
    onchange?: (value: string) => void
    [key: string]: unknown
  }

  let {
    options,
    value = undefined,
    placeholder = 'SELECT…',
    error = false,
    disabled = false,
    onchange,
    ...rest
  }: Props = $props()

  let open = $state(false)
  let rootEl: HTMLDivElement | undefined = $state(undefined)

  let displayLabel = $derived(
    options.find((o) => o.value === value)?.label ?? placeholder
  )

  function handleTriggerClick() {
    if (disabled) return
    open = !open
  }

  function handleSelect(newValue: string) {
    open = false
    onchange?.(newValue)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      open = false
    }
  }

  $effect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (rootEl && !rootEl.contains(e.target as Node)) {
        open = false
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  })
</script>

<div
  class="select"
  class:disabled
  bind:this={rootEl}
  onkeydown={handleKeydown}
  role="presentation"
  {...rest}
>
  <button
    type="button"
    class="select-trigger"
    class:open
    class:err={error}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-disabled={disabled}
    disabled={disabled}
    onclick={handleTriggerClick}
  >
    <span class="select-value">{displayLabel}</span>
    <span class="select-chevron" aria-hidden="true">›</span>
  </button>
  {#if open}
    <ul
      class="select-panel"
      role="listbox"
      aria-label="Options"
    >
      {#each options as option}
        <li
          class="select-option"
          class:selected={option.value === value}
          role="option"
          aria-selected={option.value === value}
          onclick={() => handleSelect(option.value)}
        >
          {option.label}
          {#if option.value === value}
            <span class="select-check" aria-hidden="true">✓</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .select {
    position: relative;
    width: 100%;
    user-select: none;
  }

  .select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-sunken);
    color: var(--ink);
    border: 1px solid var(--rule-strong);
    padding: 7px 10px;
    width: 100%;
    cursor: pointer;
    transition: border-color var(--transition);
    border-radius: 0;
  }

  .select-trigger:hover {
    border-color: var(--amber);
  }

  .select-trigger.open {
    border-color: var(--amber);
    border-left-width: 3px;
    padding-left: 8px;
  }

  .select-trigger.err {
    border-color: var(--danger);
  }

  .select-trigger:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .select-chevron {
    font-family: var(--mono);
    font-size: 14px;
    color: var(--amber);
    transition: transform var(--transition);
  }

  .select-trigger.open .select-chevron {
    transform: rotate(90deg);
  }

  .select-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--bg-elev);
    border: 1px solid var(--amber);
    border-top: none;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .select-option {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 8px 10px;
    cursor: pointer;
    color: var(--ink-dim);
    border-bottom: 1px solid var(--rule);
  }

  .select-option:last-child {
    border-bottom: none;
  }

  .select-option:hover {
    background: var(--bg-rail);
    color: var(--ink);
  }

  .select-option.selected {
    color: var(--amber);
  }

  .select-check {
    font-size: 11px;
    color: var(--amber);
  }
</style>
