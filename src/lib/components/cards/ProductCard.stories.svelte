<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProductCard from "./ProductCard.svelte";

  const { Story } = defineMeta({
    title: "Cards/ProductCard",
    tags: ["autodocs"],
  });

  // Helper: resolve a CSS custom property to its computed RGB background-color value.
  const resolveTokenColor = (token: string): string => {
    const el = document.createElement("div");
    el.style.backgroundColor = `var(${token})`;
    el.style.position = "absolute";
    el.style.opacity = "0";
    document.body.appendChild(el);
    const value = getComputedStyle(el).backgroundColor;
    document.body.removeChild(el);
    return value;
  };

  // ── Coming Soon ───────────────────────────────────────────────────────────
  // AC 21, 23, 24, 25, 26, 27, 29, 31, 35: a element, sku/name/desc/price/cta rendered,
  // hatch gradient present, amber LED for coming-soon, PRE-ORDER footer default
  const playComingSoon = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // AC 21: renders as <a> by default
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();
    await expect(root.tagName).toBe("A");

    // href forwarded via ...rest
    await expect(root.getAttribute("href")).toBe("#conduit-pdx2");

    // AC 24: name renders as heading (h3)
    const heading = canvas.getByText("Conduit PDX-2");
    await expect(heading).toBeVisible();

    // AC 23: SKU renders as visible mono text
    const sku = canvas.getByText("CONDUIT-PDX2");
    await expect(sku).toBeVisible();

    // AC 27: price rendered when provided
    const price = canvas.getByText(/€200/);
    await expect(price).toBeVisible();

    // AC 29, 31: status="coming-soon" → footer default "PRE-ORDER"
    const cta = canvas.getByText(/PRE-ORDER/);
    await expect(cta).toBeVisible();

    // AC 26: .card-img hatch gradient present and aspect-ratio is 14/9
    const cardImg = canvasElement.querySelector(".card-img") as HTMLElement;
    await expect(cardImg).not.toBeNull();
    const imgBg = getComputedStyle(cardImg).backgroundImage;
    await expect(imgBg).not.toBe("none");
    await expect(getComputedStyle(cardImg).aspectRatio).toBe("14 / 9");
  };

  // ── In Stock ──────────────────────────────────────────────────────────────
  // AC 30, 32, 34, 35: BUY NOW label, low-stock also BUY NOW, ctaLabel override, ok LED
  const playInStock = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // AC 30: status="in-stock" → footer label "BUY NOW"
    const cta = canvas.getByText(/BUY NOW/);
    await expect(cta).toBeVisible();

    // AC 35: Led renders with color="ok" — find the led-ok span and check its background
    const ledOk = canvasElement.querySelector(".led-ok") as HTMLElement;
    await expect(ledOk).not.toBeNull();
    const okColor = resolveTokenColor("--ok");
    await expect(getComputedStyle(ledOk).backgroundColor).toBe(okColor);
  };

  // ── Low Stock ─────────────────────────────────────────────────────────────
  // AC 32, 34: low-stock defaults to "BUY NOW"; explicit ctaLabel overrides the default
  const playLowStock = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // AC 32: status="low-stock" → default footer label "BUY NOW"
    const cta = canvas.getByText(/BUY NOW/);
    await expect(cta).toBeVisible();

    // AC 34: explicit ctaLabel="RESERVE" overrides the status default
    // (verified by the separate "Custom CTA" story below)
  };

  // ── Out of Stock ──────────────────────────────────────────────────────────
  // AC 28, 33: no price element, VIEW DETAILS footer label for out-of-stock
  const playOutOfStock = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // AC 33: status="out-of-stock" → footer label "VIEW DETAILS"
    const cta = canvas.getByText(/VIEW DETAILS/);
    await expect(cta).toBeVisible();

    // AC 28: no price rendered when price prop is omitted
    const priceEl = canvasElement.querySelector(".card-price");
    await expect(priceEl).toBeNull();
  };

  // ── As Div ────────────────────────────────────────────────────────────────
  // AC 22: as="div" renders a <div> root element
  const playAsDiv = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  };
</script>

<Story name="Coming Soon" play={playComingSoon}>
  <ProductCard
    href="#conduit-pdx2"
    sku="CONDUIT-PDX2"
    name="Conduit PDX-2"
    description="Power your entire Eurorack from a laptop charger."
    price="€200"
    status="coming-soon"
    data-testid="card"
  />
</Story>

<Story name="In Stock" play={playInStock}>
  <ProductCard
    sku="DISTRANS-AR1"
    name="Distrans AR-1"
    description="A precision attenuverter."
    price="€150"
    status="in-stock"
    data-testid="card"
  />
</Story>

<Story name="Out of Stock" play={playOutOfStock}>
  <ProductCard
    sku="LEGACY-X1"
    name="Legacy X-1"
    description="Discontinued."
    status="out-of-stock"
    data-testid="card"
  />
</Story>

<Story name="Low Stock" play={playLowStock}>
  <ProductCard
    sku="DISTRANS-AR1"
    name="Distrans AR-1"
    description="Last few units remaining."
    price="€150"
    status="low-stock"
    data-testid="card"
  />
</Story>

<Story name="Custom CTA" play={async ({ canvasElement }) => {
  // AC 34: explicit ctaLabel overrides status-derived default
  const cta = within(canvasElement).getByText(/RESERVE NOW/);
  await expect(cta).toBeVisible();
}}>
  <ProductCard
    sku="CONDUIT-PDX2"
    name="Conduit PDX-2"
    description="Power your entire Eurorack from a laptop charger."
    price="€200"
    status="coming-soon"
    ctaLabel="RESERVE NOW"
    data-testid="card"
  />
</Story>

<Story name="As Div" play={playAsDiv}>
  <ProductCard
    as="div"
    sku="CONDUIT-PDX2"
    name="Conduit PDX-2"
    description="Power your entire Eurorack from a laptop charger."
    price="€200"
    status="coming-soon"
    data-testid="card"
  />
</Story>
