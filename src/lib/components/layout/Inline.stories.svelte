<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Inline from "./Inline.svelte";
  import Button from "../primitives/Button.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Inline",
    component: Inline,
    tags: ["autodocs"],
  });
</script>

<Story name="Tag Row" args={{ gap: "sm", "aria-label": "test-label" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("flex");
    await expect(style.flexWrap).toBe("wrap");
    await expect(style.alignItems).toBe("center");
    // gap="sm" is non-zero
    const gap = style.gap || style.columnGap;
    await expect(gap).not.toBe("0px");
    // aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  }}>
  <TagPill>Utility</TagPill>
  <TagPill variant="amber">Featured</TagPill>
  <TagPill variant="cyan">New</TagPill>
  <TagPill>Power Supply</TagPill>
  <TagPill variant="amber">Latest</TagPill>
</Story>

<Story name="None Gap" args={{ gap: "none" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    const gap = style.gap || style.columnGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  }}>
  <TagPill>Alpha</TagPill>
  <TagPill variant="amber">Beta</TagPill>
</Story>

<Story name="Button Row" args={{ gap: "md" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const buttons = root.querySelectorAll("button");
    await expect(buttons.length).toBe(2);
  }}>
  <Button variant="ghost">View All →</Button>
  <Button variant="primary">Order Now</Button>
</Story>

<Story name="Large Gap" args={{ gap: "lg" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("32px")).toBe(true);
  }}>
  <TagPill>Alpha</TagPill>
  <TagPill variant="amber">Beta</TagPill>
  <TagPill variant="cyan">Gamma</TagPill>
</Story>
