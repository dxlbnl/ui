<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface TableProps extends HTMLTableAttributes {
    headers: string[]
    rows?: string[][]
    children?: Snippet
    caption?: string
  }

  let { headers, rows, children, caption, ...rest }: TableProps = $props()
</script>

<table class="dxl-table" {...rest}>
  {#if caption}
    <caption class="dxl-table-caption">{caption}</caption>
  {/if}
  <thead>
    <tr>
      {#each headers as header}
        <th scope="col">{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if children}
      {@render children()}
    {:else if rows}
      {#each rows as row}
        <tr>
          {#each row as cell}
            <td>{cell}</td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style>
  .dxl-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--mono);
  }

  .dxl-table-caption {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    text-align: left;
    padding-bottom: 6px;
  }

  .dxl-table thead th {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid var(--rule-strong);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    font-weight: 700;
    white-space: nowrap;
  }

  .dxl-table tbody td {
    padding: 8px 12px;
    border-bottom: 1px dashed var(--rule);
    color: var(--ink-dim);
    vertical-align: middle;
    font-size: 12px;
  }

  .dxl-table tbody tr:hover td {
    background: var(--bg-rail);
  }
</style>
