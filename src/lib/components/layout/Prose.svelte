<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  interface ProseProps extends HTMLAttributes<HTMLElement> {
    /** HTML element to render as. @default 'article' */
    as?: string;
    /** Max-width constraint applied to the prose container. Omit to inherit from the parent. */
    maxWidth?: string;
    children?: Snippet;
  }

  let {
    as = "article",
    maxWidth,
    children,
    class: klass = "",
    ...rest
  }: ProseProps = $props();
</script>

<svelte:element
  this={as}
  class={["prose", klass]}
  style:max-width={maxWidth}
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .prose {
    font-size: var(--t-body);
    line-height: 1.65;

    :global {
      /* Headings — AC-3/4/5/6/7/8/9 */
      h1 {
        font-size: var(--t-h1);
        font-weight: 500;
        letter-spacing: -0.03em;
        line-height: 1;
      }

      h2 {
        font-size: var(--t-h3);
        font-weight: 500;
        letter-spacing: -0.01em;
        margin: 48px 0 8px;
        color: var(--ink);
      }

      h3 {
        font-size: var(--t-lede);
        font-weight: 500;
        letter-spacing: -0.01em;
        margin: 32px 0 6px;
        color: var(--ink);
      }

      h4 {
        font-family: var(--mono);
        font-size: var(--t-mono);
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-faint);
      }

      /* Paragraph — AC-10/11 */
      p {
        margin-bottom: 20px;
        color: var(--ink-dim);
      }

      /* Anchor — AC-12/13/14 */
      a:not([class]) {
        border-bottom: 1px solid var(--rule-strong);
        transition: border-color 0.15s;

        &:hover {
          border-color: var(--amber);
        }
      }

      /* Strong and em — AC-15/16 */
      strong {
        font-weight: 500;
        color: var(--ink);
      }

      em {
        color: var(--ink-dim);
      }

      /* Blockquote — AC-17/18/19 */
      blockquote {
        margin: 28px 0;
        padding: 4px 0 4px 16px;
        border-left: 2px solid var(--amber);
        color: var(--ink-dim);

        p {
          margin-bottom: 0;
        }
      }

      /* Inline code chip — AC-20/21 */
      code {
        font-family: var(--mono);
        font-size: var(--t-mono);
        background: var(--bg-elev);
        color: var(--cyan);
        padding: 1px 5px;
        border: 1px solid var(--rule);
        border-radius: var(--radius);
      }

      /* Block code — AC-22/23/24 */
      pre {
        font-size: var(--t-mono);
        border: 1px solid var(--rule);
        border-radius: var(--radius);
        padding: 16px 20px;
        overflow-x: auto;
        line-height: 1.6;
        white-space: pre;
        margin: 24px 0;

        > code {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
        }
      }

      /* Lists — AC-25/26/27/28/29 */
      ul,
      ol {
        padding-left: 20px;
        margin-bottom: 20px;
        color: var(--ink-dim);
      }

      li {
        line-height: 1.65;
        margin-bottom: 6px;
      }

      ul li::marker {
        color: var(--amber);
      }

      ol li::marker {
        font-family: var(--mono);
        font-size: var(--t-mono);
        color: var(--ink-faint);
      }

      /* Horizontal rule — AC-30 */
      hr {
        border: none;
        border-top: 1px solid var(--rule);
        margin: 48px 0;
      }

      /* Image — AC-31/32/33 */
      img {
        width: 100%;
        height: auto;
        display: block;
        margin: 28px 0;
        border: 1px solid var(--rule);
      }

      /* Table — AC-34/35/36 */
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--mono);
        font-size: var(--t-mono);
        margin: 24px 0;
      }

      th {
        text-align: left;
        padding: 8px 0;
        border-bottom: 1px solid var(--rule-strong);
        color: var(--ink-faint);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-weight: 500;
      }

      td {
        padding: 8px 0;
        border-bottom: 1px dashed var(--rule);
        color: var(--ink-dim);

        &:first-child {
          width: 40%;
        }

        &:last-child {
          color: var(--ink);
        }
      }
    }
  }
</style>
