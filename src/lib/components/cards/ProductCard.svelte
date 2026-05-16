<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import Led from '../primitives/Led.svelte'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'

  type StockStatus = 'in-stock' | 'coming-soon' | 'low-stock' | 'out-of-stock'

  interface Props extends HTMLAnchorAttributes {
    as?: string
    sku: string
    name: string
    description: string
    price?: string
    status?: StockStatus
    ctaLabel?: string
    [key: string]: unknown
  }

  let {
    as = 'a',
    sku,
    name,
    description,
    price,
    status = 'out-of-stock',
    ctaLabel,
    ...rest
  }: Props = $props()

  const ledColor = $derived(
    status === 'in-stock' ? 'ok' : status === 'out-of-stock' ? 'off' : 'amber'
  )

  const stockLabel = $derived(
    status === 'in-stock'
      ? 'In Stock'
      : status === 'coming-soon'
        ? 'Coming Soon'
        : status === 'low-stock'
          ? 'Low Stock'
          : 'Out of Stock'
  )

  const resolvedCtaLabel = $derived(
    ctaLabel ??
      (status === 'in-stock' || status === 'low-stock'
        ? 'BUY NOW'
        : status === 'coming-soon'
          ? 'PRE-ORDER'
          : 'VIEW DETAILS')
  )
</script>

<svelte:element this={as} class="product-card" {...rest}>
  <div class="card-img">
    <span class="card-img-label">{sku} · PRODUCT</span>
  </div>
  <Stack gap="xs" style="padding: 12px 14px 10px; flex: 1;">
    <span class="card-sku">{sku}</span>
    <h3 class="card-title">{name}</h3>
    <p class="card-desc">{description}</p>
    <div class="card-meta">
      <Spread style="align-items: baseline; margin-top: auto; padding-top: 8px; font-family: var(--mono); font-size: var(--t-micro); letter-spacing: 0.04em; text-transform: uppercase;">
        {#if price}
          <span class="card-price">
            {price}
            <span class="card-price-sub">incl. VAT</span>
          </span>
        {/if}
        <span class="card-stock">
          <Led color={ledColor} aria-hidden="true" />
          <span class="card-stock-label">{stockLabel}</span>
        </span>
      </Spread>
    </div>
  </Stack>
  <div class="card-cta">
    <Spread>
      <span>{resolvedCtaLabel}</span>
      <span aria-hidden="true">→</span>
    </Spread>
  </div>
</svelte:element>

<style>
  .product-card {
    border: 1px solid var(--rule);
    background: var(--bg-rail);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .card-img {
    aspect-ratio: 14 / 9;
    background: repeating-linear-gradient(
      135deg,
      var(--bg-sunken) 0 10px,
      var(--bg-elev) 10px 20px
    );
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-img-label {
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--ink-faint);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .card-sku {
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--ink-faint);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .card-title {
    font-weight: 500;
    font-size: var(--t-lede);
    letter-spacing: -0.01em;
    line-height: 1.2;
    margin: 0;
  }

  .card-desc {
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.4;
    margin: 0;
  }

  .card-price {
    font-size: var(--t-body);
    color: var(--amber);
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .card-price-sub {
    font-size: var(--t-micro);
    color: var(--ink-faint);
    letter-spacing: 0.06em;
    text-transform: lowercase;
  }

  .card-stock {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
  }

  .card-cta {
    border-top: 1px solid var(--rule);
    padding: 10px 14px;
    font-family: var(--mono);
    font-size: var(--t-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-dim);
    transition: background var(--transition), color var(--transition);
  }

  .product-card:hover .card-cta {
    background: var(--amber);
    color: var(--bg);
  }
</style>
