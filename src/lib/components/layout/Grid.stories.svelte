<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Grid from "./Grid.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Grid",
    component: Grid,
    tags: ["autodocs"],
  });
</script>

<Story name="Three Column" args={{ cols: 3, gap: "sm" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // AC-8: data-cols attribute must be set
    await expect(root.dataset.cols).toBe("3");
    // AC-8: grid-template-columns must NOT be in the inline style (moved to --grid-cols)
    await expect(root.style.gridTemplateColumns).toBe("");
    // AC-8: --grid-cols custom property must contain the column template
    await expect(
      getComputedStyle(root).getPropertyValue("--grid-cols").trim()
    ).toContain("repeat(3, 1fr)");
    // gap="sm" → var(--u2) → 16px
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("16px")).toBe(true);
  }}>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 1</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 2</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 3</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 4</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 5</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 6</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 7</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 8</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell 9</div>
</Story>

<Story name="Two Column" args={{ cols: 2, gap: "lg" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // AC-9: data-cols attribute must be set
    await expect(root.dataset.cols).toBe("2");
    // AC-9: grid-template-columns must NOT be in the inline style
    await expect(root.style.gridTemplateColumns).toBe("");
    // AC-9: --grid-cols custom property must contain the column template
    await expect(
      getComputedStyle(root).getPropertyValue("--grid-cols").trim()
    ).toContain("repeat(2, 1fr)");
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("32px")).toBe(true);
  }}>
  <div style="background: var(--bg-elev); padding: 16px;">Cell A</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell B</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell C</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell D</div>
</Story>

<Story name="Four Column" args={{ cols: 4, gap: "sm" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // AC-10: data-cols attribute must be set
    await expect(root.dataset.cols).toBe("4");
    // AC-10: grid-template-columns must NOT be in the inline style
    await expect(root.style.gridTemplateColumns).toBe("");
    // AC-10: --grid-cols custom property must contain the column template
    await expect(
      getComputedStyle(root).getPropertyValue("--grid-cols").trim()
    ).toContain("repeat(4, 1fr)");
  }}>
  <div style="background: var(--bg-elev); padding: 16px;">1</div>
  <div style="background: var(--bg-elev); padding: 16px;">2</div>
  <div style="background: var(--bg-elev); padding: 16px;">3</div>
  <div style="background: var(--bg-elev); padding: 16px;">4</div>
  <div style="background: var(--bg-elev); padding: 16px;">5</div>
  <div style="background: var(--bg-elev); padding: 16px;">6</div>
  <div style="background: var(--bg-elev); padding: 16px;">7</div>
  <div style="background: var(--bg-elev); padding: 16px;">8</div>
</Story>

<Story name="Auto Fill" args={{ cols: "auto", minColWidth: "160px", gap: "sm" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // AC-12: data-cols attribute must be set
    await expect(root.dataset.cols).toBe("auto");
    // AC-12: grid-template-columns must NOT be in the inline style
    await expect(root.style.gridTemplateColumns).toBe("");
    // AC-12: --grid-cols custom property must contain auto-fill and minColWidth
    const gridCols = getComputedStyle(root).getPropertyValue("--grid-cols").trim();
    await expect(gridCols).toContain("auto-fill");
    await expect(gridCols).toContain("160px");
  }}>
  <TagPill>Alpha</TagPill>
  <TagPill variant="amber">Beta</TagPill>
  <TagPill variant="cyan">Gamma</TagPill>
  <TagPill>Delta</TagPill>
  <TagPill variant="amber">Epsilon</TagPill>
  <TagPill>Zeta</TagPill>
</Story>

<Story name="Single Column" args={{ cols: 1, gap: "md" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // AC-11: data-cols attribute must be set
    await expect(root.dataset.cols).toBe("1");
    // AC-11: grid-template-columns must NOT be in the inline style
    await expect(root.style.gridTemplateColumns).toBe("");
    // AC-11: --grid-cols custom property must be '1fr'
    await expect(
      getComputedStyle(root).getPropertyValue("--grid-cols").trim()
    ).toBe("1fr");
  }}>
  <div style="background: var(--bg-elev); padding: 16px;">Row 1</div>
  <div style="background: var(--bg-elev); padding: 16px;">Row 2</div>
  <div style="background: var(--bg-elev); padding: 16px;">Row 3</div>
</Story>
