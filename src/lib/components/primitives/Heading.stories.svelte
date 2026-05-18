<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Heading from "./Heading.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Heading",
    component: Heading,
    tags: ["autodocs"],
  });
</script>

<!-- AC-17, AC-18, AC-19, AC-21, AC-22, AC-23: levels 1/2/3 render h1/h2/h3 with default variant classes -->
<!-- AC-20: default level is 2 -->
<!-- AC-12: H1 font-size === 72px (var(--t-h1)) -->
<!-- AC-10: H2 font-size === 36px (var(--t-h2)) -->
<!-- AC-11: H3 font-size === 24px (var(--t-h3)) -->
<Story name="Levels"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const h1 = canvas.getByTestId("level-1");
    await expect(h1.tagName).toBe("H1");
    await expect(h1.classList.contains("h1")).toBe(true);
    await expect(getComputedStyle(h1).fontSize).toBe("72px");

    const h2 = canvas.getByTestId("level-2");
    await expect(h2.tagName).toBe("H2");
    await expect(h2.classList.contains("h2")).toBe(true);
    await expect(getComputedStyle(h2).fontSize).toBe("36px");

    const h3 = canvas.getByTestId("level-3");
    await expect(h3.tagName).toBe("H3");
    await expect(h3.classList.contains("h3")).toBe(true);
    await expect(getComputedStyle(h3).fontSize).toBe("24px");

    const defaultLevel = canvas.getByTestId("level-default");
    await expect(defaultLevel.tagName).toBe("H2");
    await expect(defaultLevel.classList.contains("h2")).toBe(true);
  }}>
  <Heading level={1} data-testid="level-1">Heading 1</Heading>
  <Heading level={2} data-testid="level-2">Heading 2</Heading>
  <Heading level={3} data-testid="level-3">Heading 3</Heading>
  <Heading data-testid="level-default">Default Level</Heading>
</Story>

<!-- AC-25: level=1 variant="hero" renders <h1 class="hero-heading"> -->
<Story name="HeroVariant" args={{ level: 1, variant: "hero" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("H1");
    await expect(root.classList.contains("hero-heading")).toBe(true);
  }}>
  Dexterlabs
</Story>

<!-- AC-26: level=1 variant="display" renders <h1 class="display-heading"> -->
<Story name="DisplayVariant" args={{ level: 1, variant: "display" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("H1");
    await expect(root.classList.contains("display-heading")).toBe(true);
  }}>
  Dx
</Story>

<!-- AC-27: level=2 variant="h3" renders <h2 class="h3"> — semantic h2, visual h3 -->
<Story name="DecoupledLevelVariant" args={{ level: 2, variant: "h3" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("H2");
    await expect(root.classList.contains("h3")).toBe(true);
    await expect(root.classList.contains("h2")).toBe(false);
  }}>
  Projects
</Story>

<!-- AC-24: level=4 has no heading visual class (h1/h2/h3/hero-heading/display-heading) -->
<Story name="Level4NoClass" args={{ level: 4 }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("H4");
    await expect(root.classList.contains("h1")).toBe(false);
    await expect(root.classList.contains("h2")).toBe(false);
    await expect(root.classList.contains("h3")).toBe(false);
    await expect(root.classList.contains("hero-heading")).toBe(false);
    await expect(root.classList.contains("display-heading")).toBe(false);
  }}>
  Sub-section heading
</Story>

<!-- AC-28: color="amber" applies inline style with var(--amber) -->
<Story name="Color" args={{ level: 2, color: "amber" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.getAttribute("style")).toContain("var(--amber)");
  }}>
  Amber Heading
</Story>

<!-- AC-29: extra class is merged alongside variant class -->
<!-- AC-30: data attributes are forwarded -->
<Story name="ClassMerge" args={{ level: 2, class: "section-title", "data-testid": "probe" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("H2");
    await expect(root.classList.contains("h2")).toBe(true);
    await expect(root.classList.contains("section-title")).toBe(true);
    await expect(root.getAttribute("data-testid")).toBe("probe");
  }}>
  Section Title
</Story>

