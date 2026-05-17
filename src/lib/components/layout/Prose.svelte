<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface ProseProps extends HTMLAttributes<HTMLElement> {
    /** HTML element to render as. @default 'article' */
    as?: string
    /** Max-width constraint applied to the prose container. @default '72ch' */
    maxWidth?: string
    children?: Snippet
  }

  let { as = 'article', maxWidth = '72ch', children, class: klass = '', ...rest }: ProseProps = $props()
</script>

<svelte:element this={as} class={['prose', klass]} style:max-width={maxWidth} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  /* Adjacent-sibling block spacing */
  :global(.prose > * + *) {
    margin-top: var(--u3);
  }

  /* First child: no top margin */
  :global(.prose > :first-child) {
    margin-top: 0;
  }

  /* Headings */
  .prose :global(h1) {
    font-size: var(--t-h1);
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .prose :global(h2) {
    font-size: var(--t-h2);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }

  .prose :global(h3) {
    font-size: var(--t-h3);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .prose :global(h4) {
    font-family: var(--mono);
    font-size: var(--t-mono);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  /* Paragraph */
  .prose :global(p) {
    font-family: var(--sans);
    font-size: var(--t-body);
    line-height: 1.65;
  }

  /* Anchor */
  .prose :global(a) {
    color: var(--ink-faint);
    text-decoration: none;
  }

  .prose :global(a:hover) {
    color: var(--amber);
    text-decoration: underline;
  }

  /* Lists */
  .prose :global(ul) {
    list-style: disc;
    padding-left: var(--u3);
  }

  .prose :global(ol) {
    list-style: decimal;
    padding-left: var(--u3);
  }

  .prose :global(li) {
    line-height: 1.65;
  }

  .prose :global(li + li) {
    margin-top: var(--u);
  }

  /* Inline code chip */
  .prose :global(code) {
    font-family: var(--mono);
    font-size: var(--t-mono);
    background: var(--bg-rail);
    color: var(--cyan);
    padding: 1px 5px;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
  }

  /* Block code — overrides inline code chip styles */
  .prose :global(pre) {
    font-family: var(--mono);
    font-size: var(--t-mono);
    background: var(--bg-sunken);
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    padding: 16px 20px;
    overflow-x: auto;
    line-height: 1.6;
  }

  .prose :global(pre code) {
    background: transparent;
    border: none;
    padding: 0;
    color: var(--shiki-foreground, var(--ink));
  }

  /* Blockquote */
  .prose :global(blockquote) {
    margin: 0;
    padding: 4px 0 4px 16px;
    border-left: 2px solid var(--amber);
    color: var(--ink-dim);
    font-style: italic;
  }

  /* Table */
  .prose :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--mono);
    font-size: var(--t-mono);
  }

  .prose :global(th) {
    text-align: left;
    padding: 8px 0;
    border-bottom: 1px solid var(--rule-strong);
    color: var(--ink-faint);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .prose :global(td) {
    padding: 8px 0;
    border-bottom: 1px dashed var(--rule);
    color: var(--ink-dim);
  }

  /* Image */
  .prose :global(img) {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--rule);
    border-radius: var(--radius);
  }

  /* Horizontal rule */
  .prose :global(hr) {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 0;
  }
</style>
