<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements'

  interface Props extends HTMLTextareaAttributes {
    error?: boolean
    [key: string]: unknown
  }

  let { error = false, ...rest }: Props = $props()
</script>

<textarea class="input" class:err={error} {...rest}></textarea>

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
    resize: vertical;
    min-height: 60px;
    line-height: 1.5;
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
</style>
