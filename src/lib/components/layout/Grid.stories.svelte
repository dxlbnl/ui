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

  // ── Three Column ──────────────────────────────────────────────────────────
  const playThreeColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // The implementer sets inline style — check element.style for the template string
    await expect(
      root.style.gridTemplateColumns.includes("3") ||
      root.style.gridTemplateColumns === "repeat(3, 1fr)"
    ).toBe(true);
    // gap="sm" → var(--u2) → 16px
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("16px")).toBe(true);
  };

  // ── Two Column ────────────────────────────────────────────────────────────
  const playTwoColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    await expect(
      root.style.gridTemplateColumns.includes("2") ||
      root.style.gridTemplateColumns === "repeat(2, 1fr)"
    ).toBe(true);
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("32px")).toBe(true);
  };

  // ── Four Column ───────────────────────────────────────────────────────────
  const playFourColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    await expect(
      root.style.gridTemplateColumns.includes("4") ||
      root.style.gridTemplateColumns === "repeat(4, 1fr)"
    ).toBe(true);
  };

  // ── Auto Fill ─────────────────────────────────────────────────────────────
  const playAutoFill = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    const templateCols = root.style.gridTemplateColumns;
    await expect(
      templateCols.includes("auto-fill") || templateCols.includes("minmax")
    ).toBe(true);
    // minColWidth="160px" should be reflected in the template string
    await expect(templateCols.includes("160px")).toBe(true);
  };

  // ── Single Column ─────────────────────────────────────────────────────────
  const playSingleColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    const templateCols = root.style.gridTemplateColumns;
    await expect(templateCols).toBe("1fr");
  };
</script>

<Story name="Three Column" args={{ cols: 3, gap: "sm" }} play={playThreeColumn}>
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

<Story name="Two Column" args={{ cols: 2, gap: "lg" }} play={playTwoColumn}>
  <div style="background: var(--bg-elev); padding: 16px;">Cell A</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell B</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell C</div>
  <div style="background: var(--bg-elev); padding: 16px;">Cell D</div>
</Story>

<Story name="Four Column" args={{ cols: 4, gap: "sm" }} play={playFourColumn}>
  <div style="background: var(--bg-elev); padding: 16px;">1</div>
  <div style="background: var(--bg-elev); padding: 16px;">2</div>
  <div style="background: var(--bg-elev); padding: 16px;">3</div>
  <div style="background: var(--bg-elev); padding: 16px;">4</div>
  <div style="background: var(--bg-elev); padding: 16px;">5</div>
  <div style="background: var(--bg-elev); padding: 16px;">6</div>
  <div style="background: var(--bg-elev); padding: 16px;">7</div>
  <div style="background: var(--bg-elev); padding: 16px;">8</div>
</Story>

<Story name="Auto Fill" args={{ cols: "auto", minColWidth: "160px", gap: "sm" }} play={playAutoFill}>
  <TagPill>Alpha</TagPill>
  <TagPill variant="amber">Beta</TagPill>
  <TagPill variant="cyan">Gamma</TagPill>
  <TagPill>Delta</TagPill>
  <TagPill variant="amber">Epsilon</TagPill>
  <TagPill>Zeta</TagPill>
</Story>

<Story name="Single Column" args={{ cols: 1, gap: "md" }} play={playSingleColumn}>
  <div style="background: var(--bg-elev); padding: 16px;">Row 1</div>
  <div style="background: var(--bg-elev); padding: 16px;">Row 2</div>
  <div style="background: var(--bg-elev); padding: 16px;">Row 3</div>
</Story>
