<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProductCard from "./ProductCard.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Cards/ProductCard",
    component: ProductCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Coming Soon" args={{ href: "#conduit-pdx2", sku: "CONDUIT-PDX2", name: "Conduit PDX-2", description: "Power your entire Eurorack from a laptop charger.", price: "€200", status: "coming-soon" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // renders as <a> by default
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    await expect(root.tagName).toBe("A");

    // href forwarded via ...rest
    await expect(root.getAttribute("href")).toBe("#conduit-pdx2");

    // name renders as heading (h3)
    const heading = canvas.getByText("Conduit PDX-2");
    await expect(heading).toBeVisible();

    // price rendered when provided
    const price = canvas.getByText(/€200/);
    await expect(price).toBeVisible();

    // status="coming-soon" → footer default "PRE-ORDER"
    const cta = canvas.getByText(/PRE-ORDER/);
    await expect(cta).toBeVisible();

    // .card-img hatch gradient present and aspect-ratio is 4/3
    const cardImg = canvasElement.querySelector(".card-img") as HTMLElement;
    const imgBg = getComputedStyle(cardImg).backgroundImage;
    await expect(imgBg).not.toBe("none");
    await expect(getComputedStyle(cardImg).aspectRatio).toBe("4 / 3");
  }} />

<Story name="With Image" args={{ href: "#conduit-pdx2", sku: "CONDUIT-PDX2", name: "Conduit PDX-2", description: "Power your entire Eurorack from a laptop charger.", price: "€200", status: "coming-soon", image: "/placeholder.jpg" }} />

<Story name="In Stock" args={{ sku: "DISTRANS-AR1", name: "Distrans AR-1", description: "A precision attenuverter.", price: "€150", status: "in-stock" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // status="in-stock" → footer label "BUY NOW"
    const cta = canvas.getByText(/BUY NOW/);
    await expect(cta).toBeVisible();

    // Led renders with color="ok" — find the led-ok span and check its background
    const ledOk = canvasElement.querySelector(".led-ok") as HTMLElement;
    await expect(ledOk).toBeVisible();
    const okColor = resolveTokenColor("--ok");
    await expect(getComputedStyle(ledOk).backgroundColor).toBe(okColor);
  }} />

<Story name="Out of Stock" args={{ sku: "LEGACY-X1", name: "Legacy X-1", description: "Discontinued.", status: "out-of-stock" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // status="out-of-stock" → footer label "VIEW DETAILS"
    const cta = canvas.getByText(/VIEW DETAILS/);
    await expect(cta).toBeVisible();

    // no price rendered when price prop is omitted
    const priceEl = canvasElement.querySelector(".card-price");
    await expect(priceEl).toBeNull();
  }} />

<Story name="Low Stock" args={{ sku: "DISTRANS-AR1", name: "Distrans AR-1", description: "Last few units remaining.", price: "€150", status: "low-stock" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // status="low-stock" → default footer label "BUY NOW"
    const cta = canvas.getByText(/BUY NOW/);
    await expect(cta).toBeVisible();
  }} />

<Story name="Custom CTA" args={{ sku: "CONDUIT-PDX2", name: "Conduit PDX-2", description: "Power your entire Eurorack from a laptop charger.", price: "€200", status: "coming-soon", ctaLabel: "RESERVE NOW" }}
  play={async ({ canvasElement }) => {
    // explicit ctaLabel overrides status-derived default
    const cta = within(canvasElement).getByText(/RESERVE NOW/);
    await expect(cta).toBeVisible();
  }} />

<Story name="As Div" args={{ as: "div", sku: "CONDUIT-PDX2", name: "Conduit PDX-2", description: "Power your entire Eurorack from a laptop charger.", price: "€200", status: "coming-soon" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  }} />
