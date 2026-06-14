<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import CompareBars from "./CompareBars.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/CompareBars",
    component: CompareBars,
    tags: ["autodocs"],
  });

  // Geometry helpers — mirror the spec's formula exactly (never hard-coded literals).
  // max = Math.max(1, ...targets, ...values)
  // targetW(r) = (target / max) * 100            (ghost fill, unclamped)
  // actualW(r) = min(100, (value / max) * 100)    (actual fill, clamped to 100)
  interface Row {
    label: string;
    value: number;
    target: number;
    valueLabel?: string;
  }
  const maxOf = (rows: Row[]) =>
    Math.max(1, ...rows.map((r) => r.target), ...rows.map((r) => r.value));
  const over = (r: Row) => r.value > r.target;
  const ariaName = (r: Row) =>
    `${r.label}: ${r.value} of ${r.target}, ${over(r) ? "over target" : "within target"}`;

  // Reads the row elements / a named part within a row.
  const rowsOf = (scope: Element) =>
    Array.from(scope.querySelectorAll<HTMLElement>('[data-part="row"]'));
  const part = (scope: Element, name: string) =>
    scope.querySelector<HTMLElement>(`[data-part="${name}"]`) as HTMLElement;

  // Canonical 4-row budget — a mix of within-target rows and one over-target (Dining).
  const budget: Row[] = [
    { label: "Groceries", value: 240, target: 320, valueLabel: "€240 / 320" },
    { label: "Transport", value: 95, target: 120, valueLabel: "€95 / 120" },
    { label: "Dining", value: 180, target: 140, valueLabel: "€180 / 140" },
    { label: "Utilities", value: 88, target: 90, valueLabel: "€88 / 90" },
  ];
</script>

<!--
  The hero: a monthly budget as target-vs-actual rows. The play function walks the whole
  contract on this one realistic chart — the role="group" summary, one grid row per entry
  with its truncating mono label, the sunken track holding a ghost target fill behind the
  actual fill, both widths derived from the shared max, and the over/within tone (Dining is
  the lone over-target row, so it fills --danger while the rest fill --ok). Each row carries
  a role="img" name that states the over/under verdict as text.
-->
<Story
  name="Budget"
  args={{ rows: budget }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // the chart is one named group; for this input the shared max is 320
    const root = canvas.getByRole("group", { name: "Comparison" });
    const m = maxOf(budget);
    await expect(m).toBe(320);

    // one row per entry, in source order
    const rows = rowsOf(root);
    await expect(rows.length).toBe(4);

    // widths come from the formula (no bare literals). Compared numerically with
    // tolerance: the browser reserializes fractional CSSOM widths (27.5 → "27.5000…%"),
    // so string-equality is unsatisfiable while toBeCloseTo(…, 4) still catches a regression.
    const expectTargetN = budget.map((r) => (r.target / m) * 100);
    const expectActualN = budget.map((r) => Math.min(100, (r.value / m) * 100));

    rows.forEach((row, i) => {
      const r = budget[i];

      // label: text + uppercase mono --ink-dim + ellipsis truncation
      const label = part(row, "label");
      expect(label.textContent?.trim()).toBe(r.label);
      const ls = getComputedStyle(label);
      expect(ls.textTransform).toBe("uppercase");
      expect(ls.fontFamily).toContain("JetBrains Mono");
      expect(ls.color).toBe(resolveTokenFgColor("--ink-dim"));
      expect(ls.overflow).toBe("hidden");
      expect(ls.textOverflow).toBe("ellipsis");
      expect(ls.whiteSpace).toBe("nowrap");

      // row is a grid with a fixed label column
      const rs = getComputedStyle(row);
      expect(rs.display).toBe("grid");
      expect(rs.alignItems).toBe("center");
      expect(rs.gridTemplateColumns.split(" ")[0]).toBe("110px");

      // track box: relative, sunken surface, hairline rule border, fixed height
      const track = part(row, "track");
      const ts = getComputedStyle(track);
      expect(ts.position).toBe("relative");
      expect(ts.backgroundColor).toBe(resolveTokenColor("--bg-sunken"));
      expect(ts.borderTopColor).toBe(resolveTokenColor("--rule"));
      expect(ts.height).toBe("16px");

      // ghost target fill: width from formula, --bg-elev with a --rule-strong right edge
      const tf = part(row, "target-fill");
      expect(parseFloat(tf.style.width)).toBeCloseTo(expectTargetN[i], 4);
      const tfs = getComputedStyle(tf);
      expect(tfs.position).toBe("absolute");
      expect(tfs.backgroundColor).toBe(resolveTokenColor("--bg-elev"));
      expect(tfs.borderRightColor).toBe(resolveTokenColor("--rule-strong"));

      // actual fill: width from formula, stacked above (after) the ghost target,
      // tone --danger when over target else --ok
      const af = part(row, "actual-fill");
      expect(parseFloat(af.style.width)).toBeCloseTo(expectActualN[i], 4);
      expect(
        tf.compareDocumentPosition(af) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(getComputedStyle(af).backgroundColor).toBe(
        resolveTokenColor(over(r) ? "--danger" : "--ok"),
      );

      // value caption: text + mono nowrap, --danger when over else --ink-faint
      const vl = part(row, "value-label");
      expect(vl.textContent?.trim()).toBe(r.valueLabel);
      const vls = getComputedStyle(vl);
      expect(vls.fontFamily).toContain("JetBrains Mono");
      expect(vls.whiteSpace).toBe("nowrap");
      expect(vls.color).toBe(
        resolveTokenFgColor(over(r) ? "--danger" : "--ink-faint"),
      );

      // the row states its verdict in its accessible name
      expect(row).toHaveAttribute("role", "img");
      expect(row).toHaveAttribute("aria-label", ariaName(r));
    });

    // the over / within verdicts are queryable by accessible name
    await expect(
      canvas.getByRole("img", { name: "Dining: 180 of 140, over target" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("img", { name: "Groceries: 240 of 320, within target" }),
    ).toBeInTheDocument();
  }}
/>

<!--
  The numeric edges, side by side. The first chart shows the clamp and boundary branches:
  the row whose value is the global max pins the actual fill to exactly 100%, a row well
  under target fills proportionally, and a value === target row counts as within (not over).
  None of its rows carry a value caption, so no caption element renders. The second chart is
  empty — the max-guard keeps it free of NaN and it still exposes its role="group".
-->
<Story
  name="Edges & clamping"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const edges = canvasElement.querySelector(
      '[data-testid="edges"]',
    ) as Element;
    const rows = rowsOf(edges);
    await expect(rows.length).toBe(3);

    // Top: value 500 is the global max → actual clamps to exactly 100%, over → --danger
    const top = part(rows[0], "actual-fill");
    await expect(top.style.width).toBe("100%");
    await expect(getComputedStyle(top).backgroundColor).toBe(
      resolveTokenColor("--danger"),
    );
    await expect(part(rows[0], "target-fill").style.width).toBe("40%");

    // Under: 200 of 500 → 40%, within → --ok
    const under = part(rows[1], "actual-fill");
    await expect(under.style.width).toBe("40%");
    await expect(getComputedStyle(under).backgroundColor).toBe(
      resolveTokenColor("--ok"),
    );

    // Even: value === target is NOT over → --ok fill
    const even = part(rows[2], "actual-fill");
    await expect(getComputedStyle(even).backgroundColor).toBe(
      resolveTokenColor("--ok"),
    );

    // no fill ever exceeds 100%, none of these rows supply a value caption
    for (const row of rows) {
      await expect(
        parseFloat(part(row, "actual-fill").style.width),
      ).toBeLessThanOrEqual(100);
      await expect(row.querySelector('[data-part="value-label"]')).toBeNull();
    }

    // the empty chart: max-guard keeps it NaN-free, no rows, group still present
    await expect(maxOf([])).toBe(1);
    const empty = canvasElement.querySelector(
      '[data-testid="empty"]',
    ) as Element;
    await expect(rowsOf(empty).length).toBe(0);
    await expect(empty.getAttribute("role")).toBe("group");
    await expect(empty.innerHTML).not.toContain("NaN");
  }}
>
  {#snippet template()}
    <div class="col">
      <CompareBars
        data-testid="edges"
        rows={[
          { label: "Top", value: 500, target: 200 },
          { label: "Under", value: 200, target: 500 },
          { label: "Even", value: 90, target: 90 },
        ]}
      />
      <CompareBars data-testid="empty" label="Empty" rows={[]} />
    </div>
  {/snippet}
</Story>

<!--
  The root is polymorphic and labelled: a custom accessible name names the group, and `as`
  swaps the root element while `...rest` (here data-testid) forwards onto it — so the chart
  can be a real <section> landmark in a page.
-->
<Story
  name="Labelled section"
  args={{
    label: "Monthly budget",
    as: "section",
    "data-testid": "compare-root",
    rows: budget,
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const root = canvas.getByRole("group", { name: "Monthly budget" });
    await expect(root).toHaveAttribute("aria-label", "Monthly budget");
    await expect(root.tagName).toBe("SECTION");
    await expect(root).toHaveAttribute("data-testid", "compare-root");
    await expect(rowsOf(root).length).toBe(4);
  }}
/>

<style>
  .col {
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 520px;
  }
</style>
