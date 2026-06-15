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

<!-- B64-T1: `template` renders the given asymmetric track list.
     The second track (1.1fr) must resolve wider than the first (0.9fr) → two
     whitespace-separated, NON-equal tokens. --grid-cols carries the template string. -->
<Story name="Template — Asymmetric" args={{ template: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(getComputedStyle(root).display).toBe("grid");
    // --grid-cols must carry the supplied template (contains 'minmax')
    await expect(
      getComputedStyle(root).getPropertyValue("--grid-cols")
    ).toContain("minmax");
    // Two tracks resolved, second wider than first (asymmetric, NOT equal)
    const cols = getComputedStyle(root).gridTemplateColumns;
    const m = /^(\S+)\s+(\S+)$/.exec(cols);
    await expect(m).not.toBe(null);
    await expect(m![1]).not.toBe(m![2]);
    // second token (1.1fr) wider than first (0.9fr)
    await expect(parseFloat(m![2])).toBeGreaterThan(parseFloat(m![1]));
  }}>
  <div style="background: var(--bg-elev); padding: 16px;">Narrow</div>
  <div style="background: var(--bg-elev); padding: 16px;">Wide</div>
</Story>

<!-- B64-T2: `template` overrides `cols`. cols={3} would give three equal tracks;
     template="60px 1fr" must win → two tracks, --grid-cols carries '60px'. -->
<Story name="Template Overrides Cols" args={{ cols: 3, template: "60px 1fr" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    // --grid-cols comes from template, not cols
    await expect(
      getComputedStyle(root).getPropertyValue("--grid-cols")
    ).toContain("60px");
    // Resolved columns: exactly two tracks, not three
    const cols = getComputedStyle(root).gridTemplateColumns;
    await expect(/^\S+\s+\S+$/.test(cols)).toBe(true);
    await expect(/^\S+\s+\S+\s+\S+$/.test(cols)).toBe(false);
  }}>
  <div style="background: var(--bg-elev); padding: 16px;">Rail</div>
  <div style="background: var(--bg-elev); padding: 16px;">Body</div>
</Story>

<!-- B64-A1: `align` sets align-items (start / center / stretch at least);
     B64-A2: an un-aligned grid defaults to stretch.
     Uses the composition-in-slot pattern (D33): four <Grid data-testid> children
     rendered inside an innocuous outer grid, queried by data-testid. -->
<Story name="Align"
  play={async ({ canvasElement }) => {
    const q = (id: string) =>
      within(canvasElement).getByTestId(id) as HTMLElement;

    // B64-A1: start (CSS grid resolves 'start'; accept the flex-normalised form too)
    const start = q("align-start");
    await expect(start.dataset.align).toBe("start");
    await expect(["start", "flex-start"]).toContain(
      getComputedStyle(start).alignItems
    );

    // B64-A1: center
    const center = q("align-center");
    await expect(center.dataset.align).toBe("center");
    await expect(getComputedStyle(center).alignItems).toBe("center");

    // B64-A1: stretch
    const stretch = q("align-stretch");
    await expect(stretch.dataset.align).toBe("stretch");
    await expect(getComputedStyle(stretch).alignItems).toBe("stretch");

    // B64-A2: default (no align prop) is NOT center/start/end — renders as stretch
    const def = q("align-default");
    const ai = getComputedStyle(def).alignItems;
    await expect(["center", "start", "flex-start", "end", "flex-end"]).not.toContain(ai);
  }}>
  <Grid align="start" data-testid="align-start">
    <div style="background: var(--bg-elev); padding: 16px;">A</div>
  </Grid>
  <Grid align="center" data-testid="align-center">
    <div style="background: var(--bg-elev); padding: 16px;">B</div>
  </Grid>
  <Grid align="stretch" data-testid="align-stretch">
    <div style="background: var(--bg-elev); padding: 16px;">C</div>
  </Grid>
  <Grid data-testid="align-default">
    <div style="background: var(--bg-elev); padding: 16px;">D</div>
  </Grid>
</Story>

<!-- B64-G1: `gap="md"` resolves to 24px (was the duplicated 16px bug).
     B64-G2: gap="md" (24px) differs from gap="sm" (16px).
     Two <Grid data-testid> children in an innocuous outer grid (D33). -->
<Story name="Gap Scale"
  play={async ({ canvasElement }) => {
    const md = within(canvasElement).getByTestId("gap-md") as HTMLElement;
    const sm = within(canvasElement).getByTestId("gap-sm") as HTMLElement;

    // B64-G1: gap="md" → 24px
    const mdGap = getComputedStyle(md).gap || getComputedStyle(md).rowGap;
    await expect(mdGap).toContain("24px");

    // B64-G2: gap="sm" → 16px, and md !== sm
    const smGap = getComputedStyle(sm).gap || getComputedStyle(sm).rowGap;
    await expect(smGap).toContain("16px");
    await expect(mdGap).not.toBe(smGap);
  }}>
  <Grid gap="md" data-testid="gap-md">
    <div style="background: var(--bg-elev); padding: 16px;">M1</div>
    <div style="background: var(--bg-elev); padding: 16px;">M2</div>
  </Grid>
  <Grid gap="sm" data-testid="gap-sm">
    <div style="background: var(--bg-elev); padding: 16px;">S1</div>
    <div style="background: var(--bg-elev); padding: 16px;">S2</div>
  </Grid>
</Story>
