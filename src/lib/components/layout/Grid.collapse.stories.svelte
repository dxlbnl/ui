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

<!-- ====================================================================
     B64 — template + stackBelow collapse behaviour (container-query driven)
     ==================================================================== -->

<!-- B64-T3: `template` neutralises data-cols so cols-collapse rules cannot match.
     A template grid in a 680px Container (below B42's 720px rule) keeps its two
     template tracks and does NOT collapse to one column from the cols rules. -->
<Story name="Template — No Cols Collapse at 680px"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    // No data-cols value that a [data-cols="1|2|3|4"] @container rule targets.
    await expect(["1", "2", "3", "4"]).not.toContain(root.dataset.cols);
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      // ≥2 whitespace-separated tracks — did NOT collapse from the cols rules
      await expect(/^\S+\s+\S+/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid template="minmax(0, 1fr) minmax(0, 2fr)">
      <div style="background: var(--bg-elev); padding: 16px;">L</div>
      <div style="background: var(--bg-elev); padding: 16px;">R</div>
    </Grid>
  </Container>
</Story>

<!-- B64-T4: `template` collapse is governed solely by stackBelow.
     With template set and NO stackBelow, the grid never collapses — even at 400px,
     it still renders its full multi-track template (≥2 tracks). -->
<Story name="Template — Never Collapses at 400px"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await expect(["1", "2", "3", "4"]).not.toContain(root.dataset.cols);
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      // Still ≥2 tracks at 400px — no stackBelow ⇒ no collapse
      await expect(/^\S+\s+\S+/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 400px; max-width: 100%;">
    <Grid template="minmax(0, 1fr) minmax(0, 2fr)">
      <div style="background: var(--bg-elev); padding: 16px;">L</div>
      <div style="background: var(--bg-elev); padding: 16px;">R</div>
    </Grid>
  </Container>
</Story>

<!-- B64-S1: stackBelow="md" collapses a cols grid below 720px.
     680 ≤ 720 → stack rule fires → single column.
     NOTE: at 680px B42's own 720px rule would also collapse cols={2}, so the
     single-column assertion alone cannot prove stackBelow drove it. The
     data-stack="md" assertion ties this story to the stackBelow implementation
     (absent today ⇒ red), isolating it from the B42 cols-collapse path. -->
<Story name="stackBelow md — Collapses at 680px"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    // dedicated stackBelow attribute must be emitted
    await expect(root.dataset.stack).toBe("md");
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      // Single column: one whitespace-free token
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid cols={2} stackBelow="md">
      <div style="background: var(--bg-elev); padding: 16px;">A</div>
      <div style="background: var(--bg-elev); padding: 16px;">B</div>
    </Grid>
  </Container>
</Story>

<!-- B64-S2: stackBelow="md" does NOT collapse above 720px.
     800 > 720 → stack rule does not fire; cols={2} stays at two columns. -->
<Story name="stackBelow md — No Collapse at 800px"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      // Two columns: ≥2 whitespace-separated tokens
      await expect(/^\S+\s+\S+/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 800px; max-width: 100%;">
    <Grid cols={2} stackBelow="md">
      <div style="background: var(--bg-elev); padding: 16px;">A</div>
      <div style="background: var(--bg-elev); padding: 16px;">B</div>
    </Grid>
  </Container>
</Story>

<!-- B64-S3: stackBelow="lg" collapses below 900px.
     800 ≤ 900 → stack rule fires → single column. Same width + cols as S2,
     different token ⇒ different outcome (proves the token controls the threshold). -->
<Story name="stackBelow lg — Collapses at 800px"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 800px; max-width: 100%;">
    <Grid cols={2} stackBelow="lg">
      <div style="background: var(--bg-elev); padding: 16px;">A</div>
      <div style="background: var(--bg-elev); padding: 16px;">B</div>
    </Grid>
  </Container>
</Story>

<!-- B64-S4: stackBelow collapses a template grid below its breakpoint,
     and renders the two template tracks above it. Two Containers, two grids.
     The data-stack + --grid-cols(template) assertions tie this to the template +
     stackBelow implementation so it cannot pass via today's cols={3} default
     (which would also give 1 track @680 and 2 tracks @800 by sheer coincidence). -->
<Story name="stackBelow md — Template Collapses 680 / 2 Tracks 800"
  play={async ({ canvasElement }) => {
    const narrow = (canvasElement.children[0] as HTMLElement)
      .firstElementChild as HTMLElement;
    const wide = (canvasElement.children[1] as HTMLElement)
      .firstElementChild as HTMLElement;
    // both must carry the dedicated stackBelow attribute and the template
    await expect(narrow.dataset.stack).toBe("md");
    await expect(wide.dataset.stack).toBe("md");
    await expect(
      getComputedStyle(wide).getPropertyValue("--grid-cols")
    ).toContain("minmax");
    // 680px ≤ 720 → collapses to a single track
    await waitFor(async () => {
      await expect(/^\S+$/.test(getComputedStyle(narrow).gridTemplateColumns)).toBe(true);
    });
    // 800px > 720 → two template tracks (asymmetric, not equal)
    await waitFor(async () => {
      const cols = getComputedStyle(wide).gridTemplateColumns;
      const m = /^(\S+)\s+(\S+)$/.exec(cols);
      await expect(m).not.toBe(null);
      await expect(m![1]).not.toBe(m![2]);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid template="minmax(0,1fr) minmax(0,2fr)" stackBelow="md">
      <div style="background: var(--bg-elev); padding: 16px;">L</div>
      <div style="background: var(--bg-elev); padding: 16px;">R</div>
    </Grid>
  </Container>
  <Container style="width: 800px; max-width: 100%;">
    <Grid template="minmax(0,1fr) minmax(0,2fr)" stackBelow="md">
      <div style="background: var(--bg-elev); padding: 16px;">L</div>
      <div style="background: var(--bg-elev); padding: 16px;">R</div>
    </Grid>
  </Container>
</Story>

<!-- B64-S5: stackBelow is keyed on its own data-* attribute (data-stack),
     not data-cols. data-stack="md" is present, the grid has no matching
     data-cols (it is a template grid), and the collapse still fires at 680px. -->
<Story name="stackBelow — data-stack Present, Collapse Without data-cols"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    // dedicated attribute present
    await expect(root.dataset.stack).toBe("md");
    // template grid has no cols-collapse-targetable data-cols
    await expect(["1", "2", "3", "4"]).not.toContain(root.dataset.cols);
    // collapse fires anyway (driven by data-stack, not data-cols)
    await waitFor(async () => {
      await expect(/^\S+$/.test(getComputedStyle(root).gridTemplateColumns)).toBe(true);
    });
  }}>
  <Container style="width: 680px; max-width: 100%;">
    <Grid template="minmax(0,1fr) minmax(0,2fr)" stackBelow="md">
      <div style="background: var(--bg-elev); padding: 16px;">L</div>
      <div style="background: var(--bg-elev); padding: 16px;">R</div>
    </Grid>
  </Container>
</Story>

<!-- B64-S6: stackBelow wins over cols collapse (single-column wins below threshold).
     cols={3} stackBelow="lg" at 800px: 800 ≤ 900 → stack fires → ONE column,
     even though B42's 900 rule alone would give cols=3 → two columns. -->
<Story name="stackBelow lg — Single Column Wins Over cols=3 at 800px"
  play={async ({ canvasElement }) => {
    const container = canvasElement.firstElementChild as HTMLElement;
    const root = container.firstElementChild as HTMLElement;
    await waitFor(async () => {
      const cols = getComputedStyle(root).gridTemplateColumns;
      await expect(/^\S+$/.test(cols)).toBe(true);
    });
  }}>
  <Container style="width: 800px; max-width: 100%;">
    <Grid cols={3} stackBelow="lg">
      <div style="background: var(--bg-elev); padding: 16px;">1</div>
      <div style="background: var(--bg-elev); padding: 16px;">2</div>
      <div style="background: var(--bg-elev); padding: 16px;">3</div>
    </Grid>
  </Container>
</Story>

<!-- B64 sm boundary: stackBelow="sm" → 480px. Nails down the user-finalised
     sm=480px value: collapses at 440px content-box ≤480, does NOT collapse at 600px
     (content box ≈ 536px > 480 after Container's 32px-per-side padding). Two
     Containers, two grids. -->
<Story name="stackBelow sm — Collapses 440 / No Collapse 600 (480px boundary)"
  play={async ({ canvasElement }) => {
    const narrow = (canvasElement.children[0] as HTMLElement)
      .firstElementChild as HTMLElement;
    const wide = (canvasElement.children[1] as HTMLElement)
      .firstElementChild as HTMLElement;
    await expect(narrow.dataset.stack).toBe("sm");
    await expect(wide.dataset.stack).toBe("sm");
    // 440 ≤ 480 → collapses to one column
    await waitFor(async () => {
      await expect(/^\S+$/.test(getComputedStyle(narrow).gridTemplateColumns)).toBe(true);
    });
    // 600px outer → content box ≈ 536px > 480 → stays at two columns
    await waitFor(async () => {
      await expect(/^\S+\s+\S+/.test(getComputedStyle(wide).gridTemplateColumns)).toBe(true);
    });
  }}>
  <Container style="width: 440px; max-width: 100%;">
    <Grid cols={2} stackBelow="sm">
      <div style="background: var(--bg-elev); padding: 16px;">A</div>
      <div style="background: var(--bg-elev); padding: 16px;">B</div>
    </Grid>
  </Container>
  <Container style="width: 600px; max-width: 100%;">
    <Grid cols={2} stackBelow="sm">
      <div style="background: var(--bg-elev); padding: 16px;">A</div>
      <div style="background: var(--bg-elev); padding: 16px;">B</div>
    </Grid>
  </Container>
</Story>
