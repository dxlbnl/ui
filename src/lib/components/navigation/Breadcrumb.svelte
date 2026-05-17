<script lang="ts">
  interface Crumb {
    label: string
    href: string
  }

  interface BreadcrumbProps {
    /** Array of `{ label, href }` crumbs — last item gets `aria-current="page"`. */
    crumbs: Crumb[]
  }

  let { crumbs }: BreadcrumbProps = $props()
</script>

<nav class="breadcrumb" aria-label="breadcrumb">
  <ol class="bc-list">
    {#each crumbs as crumb, i}
      <li class="bc-item">
        <a
          href={crumb.href}
          class="bc-link"
          aria-current={i === crumbs.length - 1 ? 'page' : undefined}
        >{crumb.label}</a>
        {#if i < crumbs.length - 1}
          <span class="bc-sep" aria-hidden="true">/</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .breadcrumb {
    display: block;
  }

  .bc-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .bc-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .bc-link {
    color: var(--ink-dim);
    text-decoration: none;
  }

  .bc-link[aria-current="page"] {
    color: var(--ink);
    pointer-events: none;
  }

  .bc-link:not([aria-current]):hover {
    color: var(--ink);
  }

  .bc-sep {
    color: var(--ink-faint);
    user-select: none;
  }
</style>
