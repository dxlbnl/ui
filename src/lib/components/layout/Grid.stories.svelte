<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Grid from "./Grid.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Grid",
    tags: ["autodocs"],
  });

  // ── Three Column ──────────────────────────────────────────────────────────
  // AC 41, 44, 48, 80: display grid, grid-template-columns with 3 tracks, gap="sm" → 16px
  const playThreeColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='grid-three']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    // The implementer sets inline style — check element.style for the template string
    await expect(
      (root as HTMLElement).style.gridTemplateColumns.includes("3") ||
      (root as HTMLElement).style.gridTemplateColumns === "repeat(3, 1fr)"
    ).toBe(true);
    // AC 48: gap="sm" → var(--u2) → 16px
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("16px")).toBe(true);
  };

  // ── Two Column ────────────────────────────────────────────────────────────
  // AC 43, 49, 81: 2 tracks and gap = 32px
  const playTwoColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='grid-two']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    await expect(
      (root as HTMLElement).style.gridTemplateColumns.includes("2") ||
      (root as HTMLElement).style.gridTemplateColumns === "repeat(2, 1fr)"
    ).toBe(true);
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("32px")).toBe(true);
  };

  // ── Four Column ───────────────────────────────────────────────────────────
  // AC 45, 82: 4 tracks
  const playFourColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='grid-four']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    await expect(
      (root as HTMLElement).style.gridTemplateColumns.includes("4") ||
      (root as HTMLElement).style.gridTemplateColumns === "repeat(4, 1fr)"
    ).toBe(true);
  };

  // ── Auto Fill ─────────────────────────────────────────────────────────────
  // AC 46, 47, 83: display grid and gridTemplateColumns contains auto-fill or minmax
  const playAutoFill = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='grid-auto']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    const templateCols = (root as HTMLElement).style.gridTemplateColumns;
    await expect(
      templateCols.includes("auto-fill") || templateCols.includes("minmax")
    ).toBe(true);
    // minColWidth="160px" should be reflected in the template string
    await expect(templateCols.includes("160px")).toBe(true);
  };

  // ── Single Column ─────────────────────────────────────────────────────────
  // AC 42, 84: single track — gridTemplateColumns is "1fr"
  const playSingleColumn = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='grid-single']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("grid");
    const templateCols = (root as HTMLElement).style.gridTemplateColumns;
    await expect(templateCols).toBe("1fr");
  };
</script>

<Story name="Three Column" play={playThreeColumn}>
  <Grid cols={3} gap="sm" data-testid="grid-three">
    <div style="background: var(--bg-elev); padding: 16px;">Cell 1</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 2</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 3</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 4</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 5</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 6</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 7</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 8</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell 9</div>
  </Grid>
</Story>

<Story name="Two Column" play={playTwoColumn}>
  <Grid cols={2} gap="lg" data-testid="grid-two">
    <div style="background: var(--bg-elev); padding: 16px;">Cell A</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell B</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell C</div>
    <div style="background: var(--bg-elev); padding: 16px;">Cell D</div>
  </Grid>
</Story>

<Story name="Four Column" play={playFourColumn}>
  <Grid cols={4} gap="sm" data-testid="grid-four">
    <div style="background: var(--bg-elev); padding: 16px;">1</div>
    <div style="background: var(--bg-elev); padding: 16px;">2</div>
    <div style="background: var(--bg-elev); padding: 16px;">3</div>
    <div style="background: var(--bg-elev); padding: 16px;">4</div>
    <div style="background: var(--bg-elev); padding: 16px;">5</div>
    <div style="background: var(--bg-elev); padding: 16px;">6</div>
    <div style="background: var(--bg-elev); padding: 16px;">7</div>
    <div style="background: var(--bg-elev); padding: 16px;">8</div>
  </Grid>
</Story>

<Story name="Auto Fill" play={playAutoFill}>
  <Grid cols="auto" minColWidth="160px" gap="sm" data-testid="grid-auto">
    <TagPill>Alpha</TagPill>
    <TagPill variant="amber">Beta</TagPill>
    <TagPill variant="cyan">Gamma</TagPill>
    <TagPill>Delta</TagPill>
    <TagPill variant="amber">Epsilon</TagPill>
    <TagPill>Zeta</TagPill>
  </Grid>
</Story>

<Story name="Single Column" play={playSingleColumn}>
  <Grid cols={1} gap="md" data-testid="grid-single">
    <div style="background: var(--bg-elev); padding: 16px;">Row 1</div>
    <div style="background: var(--bg-elev); padding: 16px;">Row 2</div>
    <div style="background: var(--bg-elev); padding: 16px;">Row 3</div>
  </Grid>
</Story>
