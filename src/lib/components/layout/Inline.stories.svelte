<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Inline from "./Inline.svelte";
  import Button from "../primitives/Button.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Inline",
    tags: ["autodocs"],
  });

  // ── Tag Row ───────────────────────────────────────────────────────────────
  // AC 27, 29, 31, 75: display flex, flex-wrap wrap, align-items center, non-zero gap, aria-label forwarded
  const playTagRow = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='inline-tag-row']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("flex");
    await expect(style.flexWrap).toBe("wrap");
    await expect(style.alignItems).toBe("center");
    // AC 29: default gap="sm" is non-zero
    const gap = style.gap || style.columnGap;
    await expect(gap).not.toBe("0px");
    // AC 31: aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  };

  // ── None Gap ─────────────────────────────────────────────────────────────
  // AC 28: gap="none" → 0px
  const playNoneGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='inline-none-gap']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    const gap = style.gap || style.columnGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  };

  // ── Button Row ────────────────────────────────────────────────────────────
  // AC 76: contains exactly two button elements
  const playButtonRow = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='inline-button-row']") as HTMLElement;
    await expect(root).not.toBeNull();
    const buttons = root.querySelectorAll("button");
    await expect(buttons.length).toBe(2);
  };

  // ── Large Gap ─────────────────────────────────────────────────────────────
  // AC 30, 77: gap="lg" → 32px
  const playLargeGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='inline-large-gap']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("32px")).toBe(true);
  };
</script>

<Story name="Tag Row" play={playTagRow}>
  <Inline gap="sm" data-testid="inline-tag-row" aria-label="test-label">
    <TagPill>Utility</TagPill>
    <TagPill variant="amber">Featured</TagPill>
    <TagPill variant="cyan">New</TagPill>
    <TagPill>Power Supply</TagPill>
    <TagPill variant="amber">Latest</TagPill>
  </Inline>
</Story>

<Story name="None Gap" play={playNoneGap}>
  <Inline gap="none" data-testid="inline-none-gap">
    <TagPill>Alpha</TagPill>
    <TagPill variant="amber">Beta</TagPill>
  </Inline>
</Story>

<Story name="Button Row" play={playButtonRow}>
  <Inline gap="md" data-testid="inline-button-row">
    <Button variant="ghost">View All →</Button>
    <Button variant="primary">Order Now</Button>
  </Inline>
</Story>

<Story name="Large Gap" play={playLargeGap}>
  <Inline gap="lg" data-testid="inline-large-gap">
    <TagPill>Alpha</TagPill>
    <TagPill variant="amber">Beta</TagPill>
    <TagPill variant="cyan">Gamma</TagPill>
  </Inline>
</Story>
