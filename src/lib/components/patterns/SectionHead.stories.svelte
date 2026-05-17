<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import SectionHead from "./SectionHead.svelte";

  const { Story } = defineMeta({
    title: "Patterns/SectionHead",
    component: SectionHead,
    tags: ["autodocs"],
  });
</script>

<Story name="With Eyebrow and Sublabel" args={{ eyebrow: "// 0x01", heading: "Catalogue", sublabel: "PRODUCTION-READY HARDWARE" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Catalogue" })).toBeVisible();
    await expect(canvas.getByText(/\/\/ 0x01/)).toBeVisible();
    await expect(canvas.getByText(/PRODUCTION-READY HARDWARE/i)).toBeVisible();
    await expect(canvasElement.querySelector("section")).not.toBeNull();
    const section = canvasElement.querySelector("section");
    await expect(getComputedStyle(section!).borderBottomStyle).not.toBe("none");
  }} />

<Story name="Heading Only" args={{ heading: "Projects" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();
    await expect(canvasElement.querySelector(".section-num")).toBeNull();
    await expect(canvasElement.querySelector(".section-sub")).toBeNull();
  }} />

<Story name="With Children Slot" args={{ eyebrow: "// 0x02", heading: "Notes" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Notes" })).toBeVisible();
    await expect(canvas.getByText("Recent bench notes and experiments.")).toBeVisible();
  }}>
  <p>Recent bench notes and experiments.</p>
</Story>

<!-- B27 AC-11: Stack gap uses gap="xs" prop — no style="gap: 6px" inline attribute -->
<!-- B27 AC-10: Inline uses align="baseline" — no style="align-items: baseline" inline attribute -->
<!-- B27 AC-12: sublabel margin-left moves to scoped CSS — no style="margin-left: auto" inline attribute -->
<Story name="No Inline Styles" args={{ eyebrow: "// 0x01", heading: "Catalogue", sublabel: "PRODUCTION-READY" }}
  play={async ({ canvasElement }) => {
    // The Stack root (direct child of .section-head) must have no style= attribute
    const sectionHead = canvasElement.querySelector(".section-head") as HTMLElement;
    const stackRoot = sectionHead.firstElementChild as HTMLElement;
    await expect(stackRoot.getAttribute("style")).toBeNull();

    // The Inline root (wrapping heading + sublabel) must have no style= attribute
    const inlineRoot = sectionHead.querySelector(".inline") as HTMLElement;
    await expect(inlineRoot.getAttribute("style")).toBeNull();

    // The sublabel Text element must have no style= attribute
    // (Text renders as a <p> or <span>; it carries class="sublabel" after implementation,
    //  but currently carries style="margin-left: auto;" directly on it)
    // Find the element containing the sublabel text
    const sublabelEl = canvasElement.querySelector('[class*="sublabel"]') as HTMLElement;
    // If not yet wrapped in .sublabel span, fall back to querying by text content
    // Either way: no element in the section should carry style="margin-left: auto;"
    const allEls = sectionHead.querySelectorAll("[style]");
    const hasMarginLeftAuto = Array.from(allEls).some(
      (el) => (el as HTMLElement).getAttribute("style")?.includes("margin-left")
    );
    await expect(hasMarginLeftAuto).toBe(false);
  }} />
