<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { getContext } from 'svelte'
  import type { FieldContext } from './field-context.js'
  import { FIELD_CONTEXT_KEY } from './field-context.js'

  interface Props extends HTMLInputAttributes {
    label: string
    [key: string]: unknown
  }

  let {
    label,
    checked = false,
    disabled,
    tabindex,
    ...rest
  }: Props = $props()

  const fieldCtx = getContext<FieldContext | undefined>(FIELD_CONTEXT_KEY)

  let resolvedId = $derived(fieldCtx ? fieldCtx.inputId : (rest.id as string | undefined))
  let resolvedAriaInvalid: boolean | 'true' | 'false' | 'grammar' | 'spelling' | null | undefined = $derived(
    fieldCtx?.hasError ? 'true' : undefined
  )
  let resolvedAriaDescribedby = $derived(fieldCtx?.hasHint ? fieldCtx.hintId : undefined)
</script>

<label class="radio-wrap" class:disabled={disabled}>
  <input
    type="radio"
    class="radio-input"
    {checked}
    {disabled}
    {tabindex}
    id={resolvedId}
    aria-invalid={resolvedAriaInvalid}
    aria-describedby={resolvedAriaDescribedby}
    {...rest}
  />
  <span class="radio-indicator" aria-hidden="true"></span>
  <span class="radio-label">{label}</span>
</label>

<style>
  .radio-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    font-family: var(--mono);
    font-size: 13px;
    color: var(--ink);
    position: relative;
  }

  .radio-wrap.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .radio-input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .radio-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 1px solid var(--rule-strong);
    border-radius: 50%;
    background: transparent;
    transition: border-color var(--transition);
    position: relative;
  }

  /* Checked state — amber inner dot via ::before */
  .radio-input:checked + .radio-indicator::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--amber);
  }

  /* Focus-visible delegated to indicator */
  .radio-input:focus-visible + .radio-indicator {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }

  .radio-label {
    color: var(--ink);
  }
</style>
