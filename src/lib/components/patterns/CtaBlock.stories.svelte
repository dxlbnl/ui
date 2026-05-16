<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import CtaBlock from "./CtaBlock.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/CtaBlock",
    component: CtaBlock,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ heading: "Conduit PDX-2", eyebrow: "// CATALOGUE · HARDWARE", subtext: "Power your entire Eurorack from a laptop charger." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    await expect(canvas.getByText("Conduit PDX-2")).toBeVisible();
    await expect(canvas.getByText(/CATALOGUE · HARDWARE/i)).toBeVisible();
    await expect(canvas.getByText("Power your entire Eurorack from a laptop charger.")).toBeVisible();
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(root).borderColor).toBe(amberColor);
  }}>
  VIEW →
</Story>

<Story name="No Eyebrow" args={{ heading: "View All Projects" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("View All Projects")).toBeVisible();
    await expect(canvasElement.querySelector(".cta-eyebrow")).toBeNull();
  }} />

<Story name="As Link" args={{ as: "a", href: "/catalogue", heading: "Browse Catalogue", subtext: "All Dexterlabs products." }}
  play={async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector("a");
    await expect(anchor).toHaveAttribute("href", "/catalogue");
    await expect(anchor!.tagName).toBe("A");
  }}>
  BROWSE →
</Story>
