<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { getContext } from 'svelte'
  import type { FieldContext } from './field-context.js'
  import { FIELD_CONTEXT_KEY } from './field-context.js'

  interface Props extends HTMLInputAttributes {
    /** Show the error (danger-border) state. Auto-set when inside a Field with an error prop. @default false */
    error?: boolean
    [key: string]: unknown
  }

  let { error = false, ...rest }: Props = $props()

  const fieldCtx = getContext<FieldContext | undefined>(FIELD_CONTEXT_KEY)

  let resolvedId = $derived(fieldCtx ? fieldCtx.inputId : (rest.id as string | undefined))
  // 'true' is a valid Booleanish value for aria-invalid
  let resolvedAriaInvalid: boolean | 'true' | 'false' | 'grammar' | 'spelling' | null | undefined = $derived(
    fieldCtx?.hasError ? 'true' : undefined
  )
  let resolvedAriaDescribedby = $derived(
    fieldCtx?.hasHint ? fieldCtx.hintId : (rest['aria-describedby'] as string | undefined)
  )
  let resolvedError = $derived(error || (fieldCtx?.hasError ?? false))
</script>

<input
  class="input"
  class:err={resolvedError}
  id={resolvedId}
  aria-invalid={resolvedAriaInvalid}
  aria-describedby={resolvedAriaDescribedby}
  {...rest}
/>

<style>
  .input {
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 0.02em;
    background: var(--bg-sunken);
    color: var(--ink);
    border: 1px solid var(--rule-strong);
    padding: 7px 10px;
    outline: none;
    width: 100%;
    transition: border-color var(--transition);
    border-radius: 0;
  }

  .input:focus {
    border-color: var(--amber);
  }

  .input.err {
    border-color: var(--danger);
  }

  .input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Hide WebKit/Blink spin buttons */
  .input::-webkit-inner-spin-button,
  .input::-webkit-outer-spin-button {
    display: none;
  }

  /* Hide Firefox spin buttons */
  .input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
</style>
