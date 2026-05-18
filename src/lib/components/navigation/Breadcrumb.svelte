<script lang="ts">
  interface Crumb {
    label: string
    href: string
  }

  interface BreadcrumbProps {
    /** Array of `{ label, href }` crumbs — last item gets `aria-current="page"`. */
    crumbs: Crumb[]
    /** Root element tag. Use `"div"` when embedding inside a `<nav>` to avoid nested landmark. @default 'nav' */
    as?: string
  }

  let { crumbs, as = 'nav' }: BreadcrumbProps = $props()
</script>

<svelte:element this={as} class="breadcrumb" aria-label="breadcrumb">
  <ol class="bc-list">
    {#each crumbs as crumb, i}
      <li class="bc-item">
        {#if i > 0}<span class="bc-sep" aria-hidden="true">/</span>{/if}
        <a
          href={crumb.href}
          class="bc-link"
          aria-current={i === crumbs.length - 1 ? 'page' : undefined}
        >{crumb.label}</a>
      </li>
    {/each}
  </ol>
</svelte:element>

<style>
  .breadcrumb {
    display: block;
  }

  .bc-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
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
    color: var(--amber);
    text-decoration: none;
  }

  .bc-link:hover {
    color: var(--amber);
    opacity: 0.75;
  }

  .bc-sep {
    color: var(--ink-faint);
    user-select: none;
  }
</style>
