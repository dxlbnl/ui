<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import Card from "./Card.svelte";
  import Spread from "../layout/Spread.svelte";
  import Inline from "../layout/Inline.svelte";
  import Led from "../primitives/Led.svelte";
  import Text from "../primitives/Text.svelte";
  import Heading from "../primitives/Heading.svelte";

  type StockStatus = "in-stock" | "coming-soon" | "low-stock" | "out-of-stock";

  interface Props extends HTMLAnchorAttributes {
    /** HTML element to render as. @default 'a' */
    as?: string;
    /** Product SKU code, shown in the card header. */
    sku: string;
    /** Product display name. */
    name: string;
    /** Short product description. */
    description: string;
    /** Formatted price string (e.g. `'€200'`). */
    price?: string;
    /** Inventory status — drives the LED colour and CTA label. @default 'out-of-stock' */
    status?: StockStatus;
    /** Override the generated CTA label. */
    ctaLabel?: string;
    /** Resolved image URL shown at the top of the card. */
    image?: string;
    /** Responsive srcset string for the image. */
    imageSrcset?: string;
    [key: string]: unknown;
  }

  let {
    as = "a",
    sku,
    name,
    description,
    price,
    status = "out-of-stock",
    ctaLabel,
    image,
    imageSrcset,
    ...rest
  }: Props = $props();

  const ledColor = $derived(
    status === "in-stock" ? "ok" : status === "out-of-stock" ? "off" : "amber",
  );

  const stockLabel = $derived(
    status === "in-stock"
      ? "In Stock"
      : status === "coming-soon"
        ? "Coming Soon"
        : status === "low-stock"
          ? "Low Stock"
          : "Out of Stock",
  );

  const resolvedCtaLabel = $derived(
    ctaLabel ??
      (status === "in-stock" || status === "low-stock"
        ? "BUY NOW"
        : status === "coming-soon"
          ? "PRE-ORDER"
          : "VIEW DETAILS"),
  );
</script>

<Card {as} class="product-card" {...rest}>
  <div class="card-img">
    {#if image}
      <img src={image} srcset={imageSrcset ?? undefined} alt="" />
    {:else}
      <Text variant="mono" color="faint">{sku.toUpperCase()} · MODULE</Text>
    {/if}
  </div>
  <div class="card-body">
    <!-- <Text variant="eyebrow">{sku}</Text> -->
    <Heading level={3}>{name}</Heading>
    <p class="card-desc">{description}</p>
    <div class="card-footer-row">
      <Spread>
        {#if price}
          <Inline gap="xs" align="baseline">
            <Text variant="mono" color="amber" size="md">{price}</Text>
            <Text variant="mono" color="faint" size="xs" case="lower"
              >incl. VAT</Text
            >
          </Inline>
        {/if}
        <Inline gap="xs">
          <Led color={ledColor} aria-hidden="true" />
          <Text variant="mono" size="xs">{stockLabel}</Text>
        </Inline>
      </Spread>
    </div>
  </div>
  <div class="card-cta">
    <Spread>
      <Text variant="mono">{resolvedCtaLabel}</Text>
      <span aria-hidden="true">→</span>
    </Spread>
  </div>
</Card>

<style>
  .card-body {
    padding: 12px 14px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--u2);
  }

  .card-footer-row {
    margin-top: auto;
    padding-top: var(--u2);
  }

  .card-desc {
    font-family: var(--sans);
    font-size: var(--t-body);
    color: var(--ink-dim);
    line-height: 1.4;
    margin: 0;
  }

  /* :global needed — .product-card is on Card's root, invisible to Svelte's scoped CSS analysis */
  :global(.product-card) {
    text-decoration: none;
    color: inherit;
    cursor: pointer;

    & .card-img {
      aspect-ratio: 4 / 3;
      background: repeating-linear-gradient(
        135deg,
        var(--bg-sunken) 0 10px,
        var(--bg-elev) 10px 20px
      );
      border-bottom: 1px solid var(--rule);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    & .card-cta {
      border-top: 1px solid var(--rule);
      padding: 10px 14px;
      transition:
        background var(--transition),
        color var(--transition);
      font-size: 14px;
      letter-spacing: 0.1em;
    }

    &:hover .card-cta {
      background: var(--amber);
      color: var(--bg);
    }
  }
</style>
