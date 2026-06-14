<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import CompareBars from "./CompareBars.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  // Geometry helpers — mirror the spec's formula exactly (never hard-coded literals).
  // max        = Math.max(1, ...targets, ...values)
  // targetW(r) = (target / max) * 100                  (ghost fill, unclamped)
  // actualW(r) = Math.min(100, (value / max) * 100)    (actual fill, clamped to 100)
  interface Row {
    label: string;
    value: number;
    target: number;
    valueLabel?: string;
  }
  const maxOf = (rows: Row[]) =>
    Math.max(1, ...rows.map((r) => r.target), ...rows.map((r) => r.value));
  const actualW = (r: Row, m: number) =>
    `${Math.min(100, (r.value / m) * 100)}%`;
  const over = (r: Row) => r.value > r.target;
  const ariaName = (r: Row) =>
    `${r.label}: ${r.value} of ${r.target}, ${over(r) ? "over target" : "within target"}`;

  // Typed DOM helpers — querySelector results feed getComputedStyle / .style / attrs,
  // so cast at the boundary to keep strict TS at 0 errors once the component exists.
  const rowEls = (root: HTMLElement): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>('[data-part="row"]'));
  const part = (scope: HTMLElement, name: string): HTMLElement | null =>
    scope.querySelector<HTMLElement>(`[data-part="${name}"]`);

  // Canonical 4-row budget example.
  const budget: Row[] = [
    { label: "Groceries", value: 240, target: 320, valueLabel: "€240 / 320" },
    { label: "Transport", value: 95, target: 120, valueLabel: "€95 / 120" },
    { label: "Dining", value: 180, target: 140, valueLabel: "€180 / 140" },
    { label: "Utilities", value: 88, target: 90, valueLabel: "€88 / 90" },
  ];

  const { Story } = defineMeta({
    title: "Patterns/CompareBars",
    component: CompareBars,
    tags: ["autodocs"],
  });
</script>

<!-- Story 1 — Budget (canonical 4 rows). AC 1,2,3,4,6,7,9,10,12,13,14,15 -->
<Story
  name="Budget"
  args={{ rows: budget }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 1 — max === 320 for this input
    const m = maxOf(budget);
    await expect(m).toBe(320);

    // AC 16 — root role="group" with default name 'Comparison'
    const root = canvas.getByRole("group", { name: "Comparison" });
    await expect(root).not.toBeNull();

    // AC 2 — exactly one row per entry, in source order
    const rows = rowEls(canvasElement);
    await expect(rows.length).toBe(4);

    // Expected widths derived from the formula (NOT bare literals).
    // Numeric form drives the tolerant DOM comparison; the string form is a
    // formula sanity check only (NOT compared against CSSOM-serialized values,
    // which the browser reserializes differently for fractional percentages —
    // e.g. 27.5 → "27.500000000000004").
    const expectTargetN = budget.map((r) => (r.target / m) * 100);
    const expectActualN = budget.map((r) => Math.min(100, (r.value / m) * 100));
    // Sanity: the formula yields the canonical spec percentages. Compared
    // numerically with tolerance — the spec quotes rounded strings (e.g. "27.5%"),
    // but the formula itself produces 27.500000000000004 in IEEE-754, so a raw
    // string-equality against the spec literal is unsatisfiable even before the DOM.
    expectTargetN.forEach((n, i) =>
      expect(n).toBeCloseTo([100, 37.5, 43.75, 28.125][i], 4),
    );
    expectActualN.forEach((n, i) =>
      expect(n).toBeCloseTo([75, 29.6875, 56.25, 27.5][i], 4),
    );

    rows.forEach((row, i) => {
      const r = budget[i];

      // AC 13 — label text + uppercase + mono + --ink-dim + ellipsis truncation
      const label = part(row, "label") as HTMLElement;
      expect(label).not.toBeNull();
      expect(label.textContent?.trim()).toBe(r.label);
      const ls = getComputedStyle(label);
      expect(ls.textTransform).toBe("uppercase");
      expect(ls.fontFamily).toContain("JetBrains Mono");
      expect(ls.color).toBe(resolveTokenFgColor("--ink-dim"));
      expect(ls.overflow).toBe("hidden");
      expect(ls.textOverflow).toBe("ellipsis");
      expect(ls.whiteSpace).toBe("nowrap");

      // AC 12 — row grid columns + display:grid + align-items:center
      const rs = getComputedStyle(row);
      expect(rs.display).toBe("grid");
      expect(rs.alignItems).toBe("center");
      // 110px 1fr auto → resolves to "110px <track>px <value>px"; first track is 110px
      expect(rs.gridTemplateColumns.split(" ")[0]).toBe("110px");

      // AC 9 — track box: relative, --bg-sunken, 1px --rule border, 16px height
      const track = part(row, "track") as HTMLElement;
      expect(track).not.toBeNull();
      const ts = getComputedStyle(track);
      expect(ts.position).toBe("relative");
      expect(ts.backgroundColor).toBe(resolveTokenColor("--bg-sunken"));
      expect(ts.borderTopColor).toBe(resolveTokenColor("--rule"));
      expect(ts.borderTopWidth).toBe("1px");
      expect(ts.height).toBe("16px");

      // AC 3 — target (ghost) fill width from formula. Compare numerically with
      // tolerance: the browser reserializes fractional CSSOM widths (e.g.
      // 27.5 → "27.500000000000004%"), so string-equality is unsatisfiable.
      // toBeCloseTo(…, 4) is strict to 0.0001% and still fails on a formula regression.
      const tf = part(row, "target-fill") as HTMLElement;
      expect(tf).not.toBeNull();
      expect(parseFloat(tf.style.width)).toBeCloseTo(expectTargetN[i], 4);
      // AC 10 — ghost fill: --bg-elev + right border --rule-strong
      const tfs = getComputedStyle(tf);
      expect(tfs.position).toBe("absolute");
      expect(tfs.backgroundColor).toBe(resolveTokenColor("--bg-elev"));
      expect(tfs.borderRightColor).toBe(resolveTokenColor("--rule-strong"));

      // AC 4 — actual fill width from formula (numeric tolerance, see AC 3 note).
      const af = part(row, "actual-fill") as HTMLElement;
      expect(af).not.toBeNull();
      expect(parseFloat(af.style.width)).toBeCloseTo(expectActualN[i], 4);

      // AC 11 — actual fill stacks above the ghost target (after it in source order)
      expect(
        tf.compareDocumentPosition(af) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      // AC 6 — actual fill colour: --danger when over, else --ok
      const afColor = getComputedStyle(af).backgroundColor;
      expect(afColor).toBe(
        resolveTokenColor(over(r) ? "--danger" : "--ok"),
      );

      // AC 14 + AC 7 — valueLabel text + mono + nowrap, colour --danger/--ink-faint
      const vl = part(row, "value-label") as HTMLElement;
      expect(vl).not.toBeNull();
      expect(vl.textContent?.trim()).toBe(r.valueLabel);
      const vls = getComputedStyle(vl);
      expect(vls.fontFamily).toContain("JetBrains Mono");
      expect(vls.whiteSpace).toBe("nowrap");
      expect(vls.color).toBe(
        resolveTokenFgColor(over(r) ? "--danger" : "--ink-faint"),
      );

      // AC 15 — per-row role="img" + summarizing aria-label (over/under as text)
      expect(row).toHaveAttribute("role", "img");
      expect(row).toHaveAttribute("aria-label", ariaName(r));
    });

    // AC 15 — only Dining is over-target; queryable by accessible name
    await expect(
      canvas.getByRole("img", { name: "Dining: 180 of 140, over target" }),
    ).not.toBeNull();
    await expect(
      canvas.getByRole("img", {
        name: "Groceries: 240 of 320, within target",
      }),
    ).not.toBeNull();
  }}
/>

<!-- Story 2 — Single over-target row. AC 4,5,6,7,15 -->
<Story
  name="Single Over Target"
  args={{
    rows: [{ label: "Dining", value: 180, target: 140, valueLabel: "180/140" }],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const r: Row = {
      label: "Dining",
      value: 180,
      target: 140,
      valueLabel: "180/140",
    };
    const m = maxOf([r]);
    await expect(m).toBe(180);

    const rows = rowEls(canvasElement);
    await expect(rows.length).toBe(1);
    const row = rows[0];

    // AC 4 / AC 5 — value is the global max → actual fill clamps to exactly 100%
    const af = part(row, "actual-fill") as HTMLElement;
    await expect(actualW(r, m)).toBe("100%");
    await expect(af.style.width).toBe("100%");

    // AC 4 — target fill width = (target/max)*100 %. Compare numerically with
    // tolerance: the DOM serializes 77.77777777777779 to "77.7778%", so raw
    // string-equality is unsatisfiable. toBeCloseTo(…, 4) still fails on a regression.
    const tf = part(row, "target-fill") as HTMLElement;
    await expect(parseFloat(tf.style.width)).toBeCloseTo((r.target / m) * 100, 4);

    // AC 6 / AC 7 — over-target → --danger actual fill + --danger valueLabel
    await expect(getComputedStyle(af).backgroundColor).toBe(
      resolveTokenColor("--danger"),
    );
    const vl = part(row, "value-label") as HTMLElement;
    await expect(getComputedStyle(vl).color).toBe(
      resolveTokenFgColor("--danger"),
    );

    // AC 15 — accessible name conveys over-target as text
    await expect(
      canvas.getByRole("img", { name: "Dining: 180 of 140, over target" }),
    ).not.toBeNull();
  }}
/>

<!-- Story 3 — Value clamps at 100% + no-valueLabel branch. AC 4,5,6,14 -->
<Story
  name="Clamp At 100"
  args={{
    rows: [
      { label: "Under", value: 200, target: 500 },
      { label: "Top", value: 500, target: 200 },
    ],
  }}
  play={async ({ canvasElement }) => {
    const rows = rowEls(canvasElement);
    await expect(rows.length).toBe(2);

    const under: Row = { label: "Under", value: 200, target: 500 };
    const top: Row = { label: "Top", value: 500, target: 200 };
    const m = maxOf([under, top]);
    await expect(m).toBe(500);

    // Row 0 — Under: actual 40%, target 100%, --ok (200 <= 500)
    const af0 = part(rows[0], "actual-fill") as HTMLElement;
    const tf0 = part(rows[0], "target-fill") as HTMLElement;
    await expect(af0.style.width).toBe("40%");
    await expect(af0.style.width).not.toContain("NaN");
    await expect(tf0.style.width).toBe("100%");
    await expect(getComputedStyle(af0).backgroundColor).toBe(
      resolveTokenColor("--ok"),
    );

    // Row 1 — Top: value is the global max → actual clamps to exactly 100%, --danger
    const af1 = part(rows[1], "actual-fill") as HTMLElement;
    const tf1 = part(rows[1], "target-fill") as HTMLElement;
    await expect(actualW(top, m)).toBe("100%");
    await expect(af1.style.width).toBe("100%");
    await expect(tf1.style.width).toBe("40%");
    await expect(getComputedStyle(af1).backgroundColor).toBe(
      resolveTokenColor("--danger"),
    );

    // No fill width string ever exceeds 100 (clamp guard).
    for (const row of rows) {
      const af = part(row, "actual-fill") as HTMLElement;
      const pct = parseFloat(af.style.width);
      await expect(pct).toBeLessThanOrEqual(100);
    }

    // AC 14 — neither row supplied valueLabel → no value-label element renders
    for (const row of rows) {
      await expect(part(row, "value-label")).toBeNull();
    }
  }}
/>

<!-- Story 4 — value === target boundary (NOT over). AC 6,7,8,15 -->
<Story
  name="Even Boundary"
  args={{
    rows: [{ label: "Even", value: 90, target: 90, valueLabel: "90 / 90" }],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const r: Row = {
      label: "Even",
      value: 90,
      target: 90,
      valueLabel: "90 / 90",
    };
    const m = maxOf([r]);
    await expect(m).toBe(90);

    const rows = rowEls(canvasElement);
    await expect(rows.length).toBe(1);
    const row = rows[0];

    // Both fills 100% (value === target === max)
    const af = part(row, "actual-fill") as HTMLElement;
    const tf = part(row, "target-fill") as HTMLElement;
    await expect(af.style.width).toBe("100%");
    await expect(tf.style.width).toBe("100%");

    // AC 8 — value === target is NOT over → --ok fill + --ink-faint valueLabel
    await expect(over(r)).toBe(false);
    await expect(getComputedStyle(af).backgroundColor).toBe(
      resolveTokenColor("--ok"),
    );
    const vl = part(row, "value-label") as HTMLElement;
    await expect(getComputedStyle(vl).color).toBe(
      resolveTokenFgColor("--ink-faint"),
    );

    // AC 15 — accessible name says "within target"
    await expect(
      canvas.getByRole("img", { name: "Even: 90 of 90, within target" }),
    ).not.toBeNull();
  }}
/>

<!-- Story 5 — Empty / edge. AC 1 (max=1 guard), 2, 16 -->
<Story
  name="Empty"
  args={{ rows: [] }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 1 — max guard: Math.max(1, …) === 1 with no rows
    await expect(maxOf([])).toBe(1);

    // AC 2 — zero rows render
    await expect(rowEls(canvasElement).length).toBe(0);

    // AC 16 — root still present as role="group" with default name
    const root = canvas.getByRole("group", { name: "Comparison" });
    await expect(root).not.toBeNull();

    // No NaN leaked into any markup
    await expect(canvasElement.innerHTML).not.toContain("NaN");
  }}
/>

<!-- Story 6 — Labelled + polymorphic root. AC 16,18 -->
<Story
  name="Labelled Polymorphic"
  args={{
    label: "Monthly budget",
    as: "section",
    "data-testid": "compare-root",
    rows: budget,
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 16 — custom accessible name on the group
    const root = canvas.getByRole("group", {
      name: "Monthly budget",
    }) as HTMLElement;
    await expect(root).toHaveAttribute("aria-label", "Monthly budget");

    // AC 18 — as="section" renders a <section>, ...rest forwards data-testid
    await expect(root.tagName).toBe("SECTION");
    await expect(root).toHaveAttribute("data-testid", "compare-root");

    // Rows still render under the polymorphic root
    await expect(rowEls(canvasElement).length).toBe(4);
  }}
/>
