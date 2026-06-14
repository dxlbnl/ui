<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProportionBar from "./ProportionBar.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/ProportionBar",
    component: ProportionBar,
    tags: ["autodocs"],
  });

  // Geometry helpers — mirror the spec's formula exactly (never hard-coded literals).
  // clamped(v) = max(0,v) ; total = sum(clamped) || 1 ; w(i) = (clamped/total)*1000
  // rectWidth(i) = max(0, w(i) - (i<last ? 2 : 0)) ; x(i) = sum(w(j<i))
  const W = 1000;
  const GAP = 2;
  const clampV = (v: number) => Math.max(0, v);
  const total = (vals: number[]) =>
    vals.reduce((s, v) => s + clampV(v), 0) || 1;
  const widths = (vals: number[]) => {
    const t = total(vals);
    return vals.map((v) => (clampV(v) / t) * W);
  };
  const rectWidth = (vals: number[], i: number) => {
    const w = widths(vals);
    return Math.max(0, w[i] - (i < vals.length - 1 ? GAP : 0));
  };
  const offsetX = (vals: number[], i: number) =>
    widths(vals)
      .slice(0, i)
      .reduce((s, w) => s + w, 0);

  // Reads the SVG <rect data-part="segment"> nodes of one bar, in source order.
  const rectsOf = (scope: Element) =>
    Array.from(scope.querySelectorAll('rect[data-part="segment"]'));

  // Canonical example — a 4-segment power budget, 42/28/18/12, with value captions.
  const fourSegments = [
    { label: "Power", value: 42, color: "var(--amber)", valueLabel: "42%" },
    { label: "Logic", value: 28, color: "var(--cyan)", valueLabel: "28%" },
    { label: "I/O", value: 18, color: "var(--ok)", valueLabel: "18%" },
    { label: "Spare", value: 12, color: "var(--rule-strong)", valueLabel: "12%" },
  ];
</script>

<!--
  The hero: a full part-to-whole share bar with its legend. The play function walks the
  whole rendering contract on this one realistic instance — the role="img" summary with
  its default "Proportion" name, the wrapper holding the bar above its legend, one rect
  per segment sized and positioned from the value/total formula in the segment colour,
  and the legend rows (swatch + uppercase-mono label + value caption) below.
-->
<Story
  name="Four Segments"
  args={{ segments: fourSegments }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const vals = fourSegments.map((s) => s.value);

    // the whole chart is announced as one named image, not a pile of anonymous rects;
    // with no `label` prop it falls back to "Proportion"
    const svg = canvas.getByRole("img", { name: "Proportion" });
    await expect(svg.tagName.toLowerCase()).toBe("svg");
    await expect(svg).toHaveAttribute("viewBox", "0 0 1000 14");
    await expect(svg).toHaveAttribute("preserveAspectRatio", "none");

    // the wrapper holds the bar first, then the legend
    const root = canvasElement.querySelector('[data-part="root"]') as Element;
    const legend = root.querySelector("ul") as HTMLUListElement;
    await expect(root.contains(svg)).toBe(true);
    await expect(
      svg.compareDocumentPosition(legend) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // the bar carries the neutral surface tokens via scoped CSS
    const svgStyle = getComputedStyle(svg);
    await expect(svgStyle.display).toBe("block");
    await expect(svgStyle.borderTopColor).toBe(resolveTokenColor("--rule"));
    await expect(svgStyle.backgroundColor).toBe(
      resolveTokenColor("--bg-sunken"),
    );

    // for 42/28/18/12 the formula gives total 100, widths [420,280,180,120];
    // each rect is shortened by the 2px gap except the last, and stacks left-to-right
    await expect(total(vals)).toBe(100);
    await expect(widths(vals)).toEqual([420, 280, 180, 120]);
    const rects = rectsOf(svg);
    await expect(rects.length).toBe(4);
    rects.forEach((rect, i) => {
      expect(rect).toHaveAttribute("x", String(offsetX(vals, i)));
      expect(rect).toHaveAttribute("y", "0");
      expect(rect).toHaveAttribute("width", String(rectWidth(vals, i)));
      expect(rect).toHaveAttribute("height", "14");
      expect(rect).toHaveAttribute("fill", fourSegments[i].color);
    });

    // the legend is one row per segment: a colour swatch, then an uppercase mono label,
    // then the optional value caption — in that order
    const items = Array.from(legend.querySelectorAll("li"));
    await expect(items.length).toBe(4);
    items.forEach((li, i) => {
      const swatch = li.querySelector('[data-part="swatch"]') as HTMLElement;
      const label = li.querySelector('[data-part="legend-label"]') as HTMLElement;
      const valueLabel = li.querySelector(
        '[data-part="value-label"]',
      ) as HTMLElement;

      expect(getComputedStyle(swatch).backgroundColor).toBe(
        resolveTokenColor(fourSegments[i].color.replace(/^var\(|\)$/g, "")),
      );

      expect(label.textContent?.trim()).toBe(fourSegments[i].label);
      const labelStyle = getComputedStyle(label);
      expect(labelStyle.textTransform).toBe("uppercase");
      expect(labelStyle.fontFamily).toContain("JetBrains Mono");
      expect(labelStyle.color).toBe(resolveTokenFgColor("--ink-faint"));

      expect(valueLabel.textContent?.trim()).toBe(fourSegments[i].valueLabel);
      expect(
        label.compareDocumentPosition(valueLabel) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  }}
/>

<!--
  The geometry corners, stacked so the reader can compare them: a plain two-segment split
  (no value captions), a thicker custom-height bar, an all-zero bar, and one with a
  negative value. The play function checks how each shapes the rects — proportional split,
  a height that drives the viewBox and rect height, the `|| 1` fallback that keeps an empty
  bar free of NaN, and negatives clamped to a zero-width rect.
-->
<Story
  name="Geometry & edges"
  play={async ({ canvasElement }) => {
    // two segments 75/25 → widths [750,250], first shortened by the gap; no captions
    const twoVals = [75, 25];
    const twoBar = canvasElement.querySelector(
      '[data-testid="b-two"]',
    ) as Element;
    await expect(widths(twoVals)).toEqual([750, 250]);
    const twoRects = rectsOf(twoBar);
    await expect(twoRects.length).toBe(2);
    twoRects.forEach((rect, i) => {
      expect(rect).toHaveAttribute("width", String(rectWidth(twoVals, i)));
      expect(rect).toHaveAttribute("x", String(offsetX(twoVals, i)));
    });
    // no valueLabel supplied → no value-label element in any legend row, labels remain
    const twoItems = Array.from(
      (twoBar.closest('[data-part="root"]') as Element).querySelectorAll("li"),
    );
    await expect(twoItems.length).toBe(2);
    twoItems.forEach((li) => {
      expect(li.querySelector('[data-part="value-label"]')).toBeNull();
      expect(li.querySelector('[data-part="legend-label"]')).not.toBeNull();
    });

    // height drives both the viewBox and every rect's height
    const tallBar = canvasElement.querySelector(
      '[data-testid="b-tall"]',
    ) as Element;
    await expect(tallBar).toHaveAttribute("viewBox", "0 0 1000 24");
    for (const rect of rectsOf(tallBar)) {
      await expect(rect).toHaveAttribute("height", "24");
    }

    // all-zero values → || 1 fallback total, every rect zero-width, no NaN leaks
    const zeroVals = [0, 0];
    await expect(total(zeroVals)).toBe(1);
    const zeroBar = canvasElement.querySelector(
      '[data-testid="b-zero"]',
    ) as Element;
    for (const rect of rectsOf(zeroBar)) {
      const w = rect.getAttribute("width") ?? "";
      await expect(w).not.toContain("NaN");
      await expect(Number(w)).toBe(0);
    }

    // a negative value contributes 0 to the total: [-5,5] → widths [0,1000], x [0,0]
    const negVals = [-5, 5];
    await expect(total(negVals)).toBe(5);
    await expect(widths(negVals)).toEqual([0, 1000]);
    const negBar = canvasElement.querySelector(
      '[data-testid="b-neg"]',
    ) as Element;
    const negRects = rectsOf(negBar);
    negRects.forEach((rect, i) => {
      expect(rect).toHaveAttribute("width", String(rectWidth(negVals, i)));
      expect(rect).toHaveAttribute("x", String(offsetX(negVals, i)));
    });
  }}
>
  {#snippet template()}
    <div class="col">
      <div class="cell">
        <ProportionBar
          data-testid="b-two"
          segments={[
            { label: "Used", value: 75, color: "var(--amber)" },
            { label: "Free", value: 25, color: "var(--cyan)" },
          ]}
        />
        <span class="cap">two segments</span>
      </div>
      <div class="cell">
        <ProportionBar
          data-testid="b-tall"
          height={24}
          segments={[
            { label: "One", value: 60, color: "var(--amber)" },
            { label: "Two", value: 40, color: "var(--cyan)" },
          ]}
        />
        <span class="cap">height 24</span>
      </div>
      <div class="cell">
        <ProportionBar
          data-testid="b-zero"
          segments={[
            { label: "A", value: 0, color: "var(--amber)" },
            { label: "B", value: 0, color: "var(--cyan)" },
          ]}
        />
        <span class="cap">zero total</span>
      </div>
      <div class="cell">
        <ProportionBar
          data-testid="b-neg"
          segments={[
            { label: "Loss", value: -5, color: "var(--danger)" },
            { label: "Gain", value: 5, color: "var(--ok)" },
          ]}
        />
        <span class="cap">negative clamp</span>
      </div>
    </div>
  {/snippet}
</Story>

<!--
  The two ways a bar sits in a page. One carries a descriptive label so a screen reader
  announces it by name; the other is decorative (e.g. paired with visible text) and passes
  aria-hidden straight through to take the bar out of the a11y tree — while its legend
  stays as ordinary, readable text.
-->
<Story
  name="Accessibility"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // the label becomes the bar's accessible name; the decorative bar is gone from the
    // tree, so the labelled one is the only image a screen reader can reach
    const labelled = canvas.getByRole("img", { name: "Power budget" });
    await expect(labelled).toHaveAttribute("aria-label", "Power budget");
    await expect(canvas.getAllByRole("img").length).toBe(1);

    // aria-hidden (and any other attribute) forwards through ...rest onto the root <svg>
    const deco = canvasElement.querySelector(
      '[data-testid="deco-bar"]',
    ) as Element;
    await expect(deco.tagName.toLowerCase()).toBe("svg");
    await expect(deco).toHaveAttribute("aria-hidden", "true");

    // the decorative bar's legend still renders as plain text below it
    const decoRoot = deco.closest('[data-part="root"]') as Element;
    await expect(decoRoot.querySelectorAll("li").length).toBe(2);
  }}
>
  {#snippet template()}
    <div class="col">
      <div class="cell">
        <ProportionBar
          label="Power budget"
          segments={[
            { label: "P", value: 50, color: "var(--amber)" },
            { label: "Q", value: 50, color: "var(--cyan)" },
          ]}
        />
        <span class="cap">labelled</span>
      </div>
      <div class="cell">
        <ProportionBar
          aria-hidden={true}
          data-testid="deco-bar"
          segments={[
            { label: "A", value: 50, color: "var(--amber)" },
            { label: "B", value: 50, color: "var(--cyan)" },
          ]}
        />
        <span class="cap">decorative</span>
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .col {
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 520px;
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cap {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-dim);
  }
</style>
