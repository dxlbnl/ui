<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProportionBar from "./ProportionBar.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/ProportionBar",
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

  // Reads the SVG <rect data-part="segment"> nodes in source order.
  const segmentRects = (root: HTMLElement): SVGRectElement[] =>
    Array.from(
      root.querySelectorAll<SVGRectElement>('rect[data-part="segment"]'),
    );

  // Canonical example — 4-segment 42/28/18/12.
  const fourSegments = [
    { label: "Power", value: 42, color: "var(--amber)", valueLabel: "42%" },
    { label: "Logic", value: 28, color: "var(--cyan)", valueLabel: "28%" },
    { label: "I/O", value: 18, color: "var(--ok)", valueLabel: "18%" },
    {
      label: "Spare",
      value: 12,
      color: "var(--rule-strong)",
      valueLabel: "12%",
    },
  ];
</script>

<!-- Story 1 — Four Segments (42/28/18/12): canonical example. AC 1,2,3,4,5,10,11,12,13,14,17 -->
<Story
  name="Four Segments"
  args={{ segments: fourSegments }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 17 / AC 1 — root <svg> is role="img", default viewBox + preserveAspectRatio
    const svg = canvas.getByRole("img") as unknown as SVGSVGElement;
    await expect(svg.tagName.toLowerCase()).toBe("svg");
    await expect(svg).toHaveAttribute("viewBox", "0 0 1000 14");
    await expect(svg).toHaveAttribute("preserveAspectRatio", "none");

    // AC 2 — outermost wrapper holds the <svg> then the <ul> legend.
    const root = canvasElement.querySelector(
      '[data-part="root"]',
    ) as HTMLElement;
    await expect(root).not.toBeNull();
    const legend = root.querySelector("ul") as HTMLUListElement;
    await expect(legend).not.toBeNull();
    await expect(root.contains(svg)).toBe(true);
    await expect(root.contains(legend)).toBe(true);
    // svg precedes the legend in source order
    await expect(
      svg.compareDocumentPosition(legend) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // AC 3 — exactly one <rect data-part="segment"> per segment, in order
    const vals = fourSegments.map((s) => s.value);
    const rects = segmentRects(canvasElement);
    await expect(rects.length).toBe(4);

    // AC 5 — total === 100, w = [420,280,180,120]
    await expect(total(vals)).toBe(100);
    await expect(widths(vals)).toEqual([420, 280, 180, 120]);

    // AC 4 / AC 5 — each rect x, width, height, fill computed from the formula.
    // expected width = [418,278,178,120], x = [0,420,700,880]
    const expectWidths = [418, 278, 178, 120];
    const expectX = [0, 420, 700, 880];
    rects.forEach((rect, i) => {
      expect(rectWidth(vals, i)).toBe(expectWidths[i]);
      expect(offsetX(vals, i)).toBe(expectX[i]);
      expect(rect).toHaveAttribute("x", String(offsetX(vals, i)));
      expect(rect).toHaveAttribute("y", "0");
      expect(rect).toHaveAttribute("width", String(rectWidth(vals, i)));
      expect(rect).toHaveAttribute("height", "14");
      expect(rect).toHaveAttribute("fill", fourSegments[i].color);
    });

    // AC 10 / AC 13 — legend <ul> has 4 <li>, each swatch + label (+ value-label)
    const items = Array.from(legend.querySelectorAll("li"));
    await expect(items.length).toBe(4);

    for (let i = 0; i < items.length; i++) {
      const li = items[i];
      const swatch = li.querySelector(
        '[data-part="swatch"]',
      ) as HTMLElement;
      const label = li.querySelector(
        '[data-part="legend-label"]',
      ) as HTMLElement;
      const valueLabel = li.querySelector(
        '[data-part="value-label"]',
      ) as HTMLElement;

      await expect(swatch).not.toBeNull();
      await expect(label).not.toBeNull();

      // swatch precedes label in source order
      await expect(
        swatch.compareDocumentPosition(label) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      // AC 11 — swatch inline background resolves to the segment colour
      await expect(getComputedStyle(swatch).backgroundColor).toBe(
        resolveTokenColor(
          fourSegments[i].color.replace(/^var\(|\)$/g, ""),
        ),
      );

      // AC 12 — label text + uppercase + mono + --ink-faint
      await expect(label.textContent?.trim()).toBe(fourSegments[i].label);
      const labelStyle = getComputedStyle(label);
      await expect(labelStyle.textTransform).toBe("uppercase");
      await expect(labelStyle.fontFamily).toContain("JetBrains Mono");
      await expect(labelStyle.color).toBe(resolveTokenFgColor("--ink-faint"));

      // AC 13 — value-label present + correct text, after the label
      await expect(valueLabel).not.toBeNull();
      await expect(valueLabel.textContent?.trim()).toBe(
        fourSegments[i].valueLabel,
      );
      await expect(
        label.compareDocumentPosition(valueLabel) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    // AC 14 — the <svg> bar border colour = --rule, background = --bg-sunken
    const svgStyle = getComputedStyle(svg as unknown as Element);
    await expect(svgStyle.borderTopColor).toBe(resolveTokenColor("--rule"));
    await expect(svgStyle.backgroundColor).toBe(
      resolveTokenColor("--bg-sunken"),
    );
    await expect(svgStyle.display).toBe("block");
  }}
/>

<!-- Story 2 — Two Segments (75/25): total 100, widths [748,250], x [0,750]. AC 5,9 -->
<Story
  name="Two Segments"
  args={{
    segments: [
      { label: "Used", value: 75, color: "var(--amber)" },
      { label: "Free", value: 25, color: "var(--cyan)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const vals = [75, 25];
    const rects = segmentRects(canvasElement);
    await expect(rects.length).toBe(2);

    await expect(total(vals)).toBe(100);
    await expect(widths(vals)).toEqual([750, 250]);

    const expectWidths = [748, 250];
    const expectX = [0, 750];
    rects.forEach((rect, i) => {
      expect(rectWidth(vals, i)).toBe(expectWidths[i]);
      expect(offsetX(vals, i)).toBe(expectX[i]);
      expect(rect).toHaveAttribute("width", String(rectWidth(vals, i)));
      expect(rect).toHaveAttribute("x", String(offsetX(vals, i)));
    });

    const legend = canvasElement.querySelector("ul") as HTMLUListElement;
    await expect(legend.querySelectorAll("li").length).toBe(2);
  }}
/>

<!-- Story 3 — Zero Total: both 0 → fallback total 1, all widths 0, no NaN. AC 8 -->
<Story
  name="Zero Total"
  args={{
    segments: [
      { label: "A", value: 0, color: "var(--amber)" },
      { label: "B", value: 0, color: "var(--cyan)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const vals = [0, 0];
    // AC 8 — || 1 fallback: total resolves to 1 (no division-by-zero)
    await expect(total(vals)).toBe(1);

    const rects = segmentRects(canvasElement);
    await expect(rects.length).toBe(2);
    rects.forEach((rect, i) => {
      expect(rectWidth(vals, i)).toBe(0);
      const w = rect.getAttribute("width") ?? "";
      // no NaN anywhere
      expect(w).not.toContain("NaN");
      expect(Number(w)).toBe(0);
    });

    const legend = canvasElement.querySelector("ul") as HTMLUListElement;
    await expect(legend.querySelectorAll("li").length).toBe(2);
  }}
/>

<!-- Story 4 — Negative Clamp: [-5, 5] → total 5, widths [0,1000], x [0,0]. AC 7 -->
<Story
  name="Negative Clamp"
  args={{
    segments: [
      { label: "Loss", value: -5, color: "var(--danger)" },
      { label: "Gain", value: 5, color: "var(--ok)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const vals = [-5, 5];
    // AC 7 — negative contributes 0 to total
    await expect(total(vals)).toBe(5);
    await expect(widths(vals)).toEqual([0, 1000]);

    const rects = segmentRects(canvasElement);
    await expect(rects.length).toBe(2);

    const expectWidths = [0, 1000];
    const expectX = [0, 0];
    rects.forEach((rect, i) => {
      expect(rectWidth(vals, i)).toBe(expectWidths[i]);
      expect(offsetX(vals, i)).toBe(expectX[i]);
      expect(rect).toHaveAttribute("width", String(rectWidth(vals, i)));
      expect(rect).toHaveAttribute("x", String(offsetX(vals, i)));
    });
  }}
/>

<!-- Story 5 — Custom Height: height 24 → viewBox 0 0 1000 24, every rect height 24. AC 6 -->
<Story
  name="Custom Height"
  args={{
    height: 24,
    segments: [
      { label: "One", value: 60, color: "var(--amber)" },
      { label: "Two", value: 40, color: "var(--cyan)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole("img") as unknown as SVGSVGElement;
    // AC 6 — height drives viewBox and every rect height
    await expect(svg).toHaveAttribute("viewBox", "0 0 1000 24");

    const rects = segmentRects(canvasElement);
    await expect(rects.length).toBe(2);
    for (const rect of rects) {
      await expect(rect).toHaveAttribute("height", "24");
    }
  }}
/>

<!-- Story 6 — No Value Labels: no value-label element in any <li>, labels still present. AC 13 -->
<Story
  name="No Value Labels"
  args={{
    segments: [
      { label: "Read", value: 70, color: "var(--cyan)" },
      { label: "Write", value: 30, color: "var(--amber)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const legend = canvasElement.querySelector("ul") as HTMLUListElement;
    const items = Array.from(legend.querySelectorAll("li"));
    await expect(items.length).toBe(2);

    const labels = ["Read", "Write"];
    items.forEach((li, i) => {
      // AC 13 — no value-label element when valueLabel is absent
      expect(li.querySelector('[data-part="value-label"]')).toBeNull();
      // label still present
      const label = li.querySelector(
        '[data-part="legend-label"]',
      ) as HTMLElement;
      expect(label).not.toBeNull();
      expect(label.textContent?.trim()).toBe(labels[i]);
    });
  }}
/>

<!-- Story 7 — Labelled: custom label → role="img" name "Power budget". AC 17 -->
<Story
  name="Labelled"
  args={{
    label: "Power budget",
    segments: [
      { label: "P", value: 50, color: "var(--amber)" },
      { label: "Q", value: 50, color: "var(--cyan)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole("img", {
      name: "Power budget",
    }) as unknown as SVGSVGElement;
    await expect(svg).toHaveAttribute("aria-label", "Power budget");
  }}
/>

<!-- Story 8 — Default Label: no label prop → aria-label "Proportion". AC 17 -->
<Story
  name="Default Label"
  args={{
    segments: [
      { label: "A", value: 50, color: "var(--amber)" },
      { label: "B", value: 50, color: "var(--cyan)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole("img", {
      name: "Proportion",
    }) as unknown as SVGSVGElement;
    await expect(svg).toHaveAttribute("aria-label", "Proportion");
  }}
/>

<!-- Story 9 — Decorative: aria-hidden + data-testid via ...rest. AC 19 -->
<Story
  name="Decorative"
  args={{
    "aria-hidden": true,
    "data-testid": "deco-bar",
    segments: [
      { label: "A", value: 50, color: "var(--amber)" },
      { label: "B", value: 50, color: "var(--cyan)" },
    ],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // AC 19 — aria-hidden removes the bar from the a11y tree
    await expect(canvas.queryByRole("img")).toBeNull();

    // ...rest forwarded onto the root <svg>
    const svg = canvasElement.querySelector("svg") as unknown as SVGSVGElement;
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(svg).toHaveAttribute("data-testid", "deco-bar");

    // AC 18 — legend stays in the tree as ordinary text
    const legend = canvasElement.querySelector("ul") as HTMLUListElement;
    await expect(legend).not.toBeNull();
    await expect(legend.querySelectorAll("li").length).toBe(2);
  }}
/>
