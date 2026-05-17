<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import PageHero from "./PageHero.svelte";
  import Button from "$lib/components/primitives/Button.svelte";

  const { Story } = defineMeta({
    title: "Patterns/PageHero",
    component: PageHero,
    tags: ["autodocs"],
  });
</script>

<Story name="Full" args={{ eyebrow: "// DEXTERLABS · WORKBENCH · 2026", heading: "Things built in the lab.", lede: "Software engineer by day; hardware builder by night." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Things built in the lab." })).toBeVisible();
    await expect(canvas.getByText(/DEXTERLABS · WORKBENCH/i)).toBeVisible();
    await expect(canvas.getByText(/Software engineer by day/i)).toBeVisible();
    await expect(canvas.getByRole("button", { name: "View Catalogue" })).toBeVisible();
    await expect(canvasElement.querySelector("header")).not.toBeNull();
    const header = canvasElement.querySelector("header");
    await expect(getComputedStyle(header!).borderBottomStyle).not.toBe("none");
  }}>
  <Button variant="primary">View Catalogue</Button>
  <Button variant="ghost">View Projects →</Button>
</Story>

<Story name="Heading Only" args={{ heading: "Catalogue" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Catalogue" })).toBeVisible();
    await expect(canvasElement.querySelector(".page-hero-eyebrow")).toBeNull();
    await expect(canvasElement.querySelector(".page-hero-lede")).toBeNull();
    await expect(canvasElement.querySelector(".page-hero-actions")).toBeNull();
  }} />

<Story name="No Slot" args={{ eyebrow: "// SECTION", heading: "Projects", lede: "Open source and web work." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
    await expect(canvas.getByText("Open source and web work.")).toBeVisible();
    await expect(canvasElement.querySelector(".page-hero-actions")).toBeNull();
  }} />

<!-- B27 AC-13, AC-14, AC-15: no inline style= attributes on Text or Inline children -->
<Story name="No Inline Styles" args={{ eyebrow: "// DEXTERLABS", heading: "Things built in the lab.", lede: "Software engineer by day; hardware builder by night." }}
  play={async ({ canvasElement }) => {
    const pageHero = canvasElement.querySelector(".page-hero") as HTMLElement;

    // AC-13: eyebrow Text must have no style= attribute (margin-bottom moves to scoped CSS)
    // AC-14: lede Text must have no style= attribute (margin-top + max-width move to scoped CSS)
    // AC-15: actions Inline must have no style= attribute (margin-top moves to scoped CSS)
    // Assert: no descendant element inside .page-hero carries a style= attribute
    // (the only legitimate style= after B27 is the reactive fill width in ProgressBar,
    //  which is not in PageHero — so zero style= attributes is the correct post-B27 state)
    const styledEls = pageHero.querySelectorAll("[style]");
    await expect(styledEls.length).toBe(0);
  }}>
  <Button variant="primary">View Catalogue</Button>
  <Button variant="ghost">View Projects →</Button>
</Story>
