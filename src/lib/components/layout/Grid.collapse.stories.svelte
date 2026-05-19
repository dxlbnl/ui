<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import Grid from "./Grid.svelte";
  import Container from "./Container.svelte";

  // No component: set — these are composition stories that render Container + Grid
  // directly in the story slot. See wiki/stories-guide.md "Composition stories" section.
  const { Story } = defineMeta({
    title: "Layout/Grid (Collapse)",
    tags: ["autodocs"],
  });
</script>

<!-- AC-13: Tablet Collapse — 3 cols
     Container at 820px (721–900px range): only the ≤900px rule fires → 2 equal columns. -->
<Story name="Tablet Collapse — 3 cols"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    // data-cols must be '3' (the declared prop value)
    await expect(root.dataset.cols).toBe("3");
    // After the container query fires, gridTemplateColumns must resolve to 2 equal columns.
    // "2 equal columns" means the resolved string has exactly two whitespace-separated
    // tokens of identical value (browser resolves 'repeat(2, 1fr)' to e.g. "410px 410px").
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      await expect(/^(\S+)\s+\1$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 820px; max-width: 100%;">
    <Grid cols={3}>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 1</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 2</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 3</div>
    </Grid>
  </Container>
</Story>

<!-- AC-14: Tablet Collapse — 4 cols
     Container at 820px: ≤900px rule fires → 2 equal columns. -->
<Story name="Tablet Collapse — 4 cols"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await expect(root.dataset.cols).toBe("4");
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      await expect(/^(\S+)\s+\1$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 820px; max-width: 100%;">
    <Grid cols={4}>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 1</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 2</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 3</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 4</div>
    </Grid>
  </Container>
</Story>

<!-- AC-15: Mobile Collapse — 2 cols
     Container at 680px: ≤720px rule fires → single column. -->
<Story name="Mobile Collapse — 2 cols"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await expect(root.dataset.cols).toBe("2");
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      // Single column: no space in the resolved value (e.g. "680px" or "1fr" resolved)
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid cols={2}>
      <div style="background: var(--bg-elev); padding: 16px;">Cell A</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell B</div>
    </Grid>
  </Container>
</Story>

<!-- AC-16: Mobile Collapse — 3 cols
     Container at 680px: ≤720px rule fires → single column. -->
<Story name="Mobile Collapse — 3 cols"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await expect(root.dataset.cols).toBe("3");
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid cols={3}>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 1</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 2</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 3</div>
    </Grid>
  </Container>
</Story>

<!-- AC-17: Mobile Collapse — 4 cols
     Container at 680px: ≤720px rule fires → single column. -->
<Story name="Mobile Collapse — 4 cols"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await expect(root.dataset.cols).toBe("4");
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid cols={4}>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 1</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 2</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 3</div>
      <div style="background: var(--bg-elev); padding: 16px;">Cell 4</div>
    </Grid>
  </Container>
</Story>

<!-- AC-18a: No Collapse — 1 col
     Container at 680px: no @container rule targets data-cols="1" → stays single column. -->
<Story name="No Collapse — 1 col"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await expect(root.dataset.cols).toBe("1");
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      // Single column — no space in resolved value
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid cols={1}>
      <div style="background: var(--bg-elev); padding: 16px;">Row 1</div>
      <div style="background: var(--bg-elev); padding: 16px;">Row 2</div>
    </Grid>
  </Container>
</Story>

<!-- AC-18b: No Collapse — auto
     Container at 680px: no @container rule targets data-cols="auto"; auto-fill stays active.
     Assert data-cols="auto" and --grid-cols still contains 'auto-fill'. -->
<Story name="No Collapse — auto"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    // data-cols must stay 'auto'
    await expect(root.dataset.cols).toBe("auto");
    // --grid-cols must still contain 'auto-fill' (not overridden by any @container rule)
    const gridCols = getComputedStyle(root).getPropertyValue("--grid-cols").trim();
    await expect(gridCols).toContain("auto-fill");
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid cols="auto" minColWidth="120px">
      <div style="background: var(--bg-elev); padding: 16px;">Alpha</div>
      <div style="background: var(--bg-elev); padding: 16px;">Beta</div>
      <div style="background: var(--bg-elev); padding: 16px;">Gamma</div>
    </Grid>
  </Container>
</Story>
