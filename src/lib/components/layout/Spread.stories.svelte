<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Spread from "./Spread.svelte";
  import Button from "../primitives/Button.svelte";
  import Led from "../primitives/Led.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Spread",
    component: Spread,
    tags: ["autodocs"],
  });
</script>

<Story name="Section Header" args={{ "aria-label": "test-label" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("flex");
    await expect(style.justifyContent).toBe("space-between");
    // aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  }}>
  <span class="mono-label">System Status</span>
  <Button variant="ghost">View All →</Button>
</Story>

<Story name="Led Status Bar"
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.justifyContent).toBe("space-between");
    // After B25: bare <Spread> with no gap prop defaults to none → 0px
    const gap = style.gap || style.columnGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  }}>
  <span style="display: flex; align-items: center; gap: 8px;">
    <Led color="ok" aria-label="Status: ok" />
    <span>All systems nominal</span>
  </span>
  <TagPill variant="amber">Live</TagPill>
</Story>

<Story name="With Gap"
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(getComputedStyle(root).display).toBe("flex");
    await expect(getComputedStyle(root).justifyContent).toBe("space-between");
    // After B25: bare <Spread> with no gap prop defaults to none → 0px
    const gap = getComputedStyle(root).gap || getComputedStyle(root).columnGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  }}>
  <span class="mono-label">Left Item</span>
  <span class="mono-label">Center Item</span>
  <span class="mono-label">Right Item</span>
</Story>

<Story name="Vertical Stack" args={{ as: "section", "aria-label": "stack-region" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("SECTION");
    await expect(getComputedStyle(root).display).toBe("flex");
    await expect(root.getAttribute("aria-label")).toBe("stack-region");
  }}>
  <span>Item A</span>
  <span>Item B</span>
</Story>

<!-- AC-2 / AC-3: default gap (no prop) and explicit gap="none" both resolve to 0px -->
<Story name="Gap None" args={{ gap: "none" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const gap = getComputedStyle(root).gap || getComputedStyle(root).columnGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  }}>
  <span>Left</span>
  <span>Right</span>
</Story>

<!-- AC-5: gap="sm" → var(--u2) → 16px -->
<Story name="Gap Sm" args={{ gap: "sm" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const gap = getComputedStyle(root).gap || getComputedStyle(root).columnGap;
    await expect(gap.includes("16px")).toBe(true);
  }}>
  <span>Left</span>
  <span>Right</span>
</Story>

<!-- AC-6: gap="md" → var(--u3) → 24px -->
<Story name="Gap Md" args={{ gap: "md" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const gap = getComputedStyle(root).gap || getComputedStyle(root).columnGap;
    await expect(gap.includes("24px")).toBe(true);
  }}>
  <span>Left</span>
  <span>Right</span>
</Story>

<!-- AC-7: gap="lg" → var(--u4) → 32px -->
<Story name="Gap Lg" args={{ gap: "lg" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const gap = getComputedStyle(root).gap || getComputedStyle(root).columnGap;
    await expect(gap.includes("32px")).toBe(true);
  }}>
  <span>Left</span>
  <span>Right</span>
</Story>
