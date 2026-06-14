<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Gauge from "./Gauge.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/Gauge",
    component: Gauge,
    tags: ["autodocs"],
  });

  // Geometry helpers — mirror the spec's formula exactly (never hard-coded literals).
  // r = (size - width - 3) / 2 ; c = 2π·r ; dash = `${(clamp(pct,0,100)/100)*c} ${c}`
  const radius = (size: number, width: number) => (size - width - 3) / 2;
  const circumference = (size: number, width: number) =>
    2 * Math.PI * radius(size, width);
  const dashArray = (pct: number, size: number, width: number) => {
    const c = circumference(size, width);
    const p = Math.max(0, Math.min(100, pct));
    return `${(p / 100) * c} ${c}`;
  };
</script>

<!--
  A demo cell: a gauge with its `{pct}%` caption centred below, mirroring the design
  sample's `Cell` wrapper. The caption is *demo scaffolding* — the percentage label lives
  in the surrounding composition, never inside Gauge (B52 out-of-scope). Caption colour
  tracks the tone, matching `style={{ color: var(--{tone}) }}` in the reference.
-->
{#snippet cell(pct: number, tone: string, size: number, testid: string)}
  <div class="cell">
    <Gauge {pct} {tone} {size} data-testid={testid} />
    <span class="cap" style="color:var(--{tone})">{pct}%</span>
  </div>
{/snippet}

<!--
  Tones — the design sample's row of four tone dials, each with its `{pct}%` caption. The
  hero demo. Its play function walks all four gauges and checks the shared rendering
  contract: the SVG dimensions and ARIA range, the two concentric circles, the arc colour
  per tone, and the arc length computed from pct. It then checks the two endpoints the row
  happens to cover — danger at 100% drawing a complete ring, and the -90° rotation that
  makes every arc start at the top.
-->
<Story
  name="Tones"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const cases = [
      { testid: "g-ok", pct: 24, tone: "--ok" },
      { testid: "g-cyan", pct: 62, tone: "--cyan" },
      { testid: "g-amber", pct: 88, tone: "--amber" },
      { testid: "g-danger", pct: 100, tone: "--danger" },
    ];

    // each cell renders one gauge
    await expect(canvas.getAllByRole("progressbar").length).toBe(4);

    for (const { testid, pct, tone } of cases) {
      const gauge = canvasElement.querySelector(`[data-testid="${testid}"]`) as Element;

      // it's a progressbar reporting its value within a fixed 0–100 range
      await expect(gauge.getAttribute("role")).toBe("progressbar");
      await expect(gauge).toHaveAttribute("aria-valuenow", String(pct));
      await expect(gauge).toHaveAttribute("aria-valuemin", "0");
      await expect(gauge).toHaveAttribute("aria-valuemax", "100");

      // the root is an <svg> sized to the size prop (56)
      await expect(gauge.tagName.toLowerCase()).toBe("svg");
      await expect(gauge).toHaveAttribute("width", "56");
      await expect(gauge).toHaveAttribute("height", "56");
      await expect(gauge).toHaveAttribute("viewBox", "0 0 56 56");

      // two concentric circles — the background track and the value arc — share the same
      // centre, radius, and stroke width; only their stroke colour and dash differ
      const circles = gauge.querySelectorAll("circle");
      await expect(circles.length).toBe(2);
      for (const circle of Array.from(circles)) {
        await expect(circle).toHaveAttribute("cx", "28");
        await expect(circle).toHaveAttribute("cy", "28");
        await expect(circle).toHaveAttribute("fill", "none");
        await expect(circle).toHaveAttribute("stroke-width", "4");
        await expect(circle).toHaveAttribute("r", String(radius(56, 4)));
      }

      // the arc is drawn in the tone colour, and its visible length (dasharray) is the
      // fraction of the circumference that pct represents
      const arc = gauge.querySelector('[data-part="arc"]') as Element;
      await expect(getComputedStyle(arc).stroke).toBe(resolveTokenFgColor(tone));
      await expect(arc).toHaveAttribute(
        "stroke-dasharray",
        dashArray(pct, 56, 4),
      );

      // the `{pct}%` caption the demo adds below the dial shows the value
      await expect(canvas.getByText(`${pct}%`)).toBeVisible();
    }

    // at 100% the arc fills the whole ring — its dash length equals the full circumference
    const dangerArc = canvasElement.querySelector(
      '[data-testid="g-danger"] [data-part="arc"]',
    ) as Element;
    const fullC = circumference(56, 4);
    await expect(dangerArc).toHaveAttribute(
      "stroke-dasharray",
      `${fullC} ${fullC}`,
    );

    // the dial is rotated -90° so the arc starts at the top rather than at 3 o'clock
    // (a -90° rotation matrix is a≈0, b≈-1, c≈1, d≈0)
    const matrix = new DOMMatrixReadOnly(
      getComputedStyle(
        canvasElement.querySelector('[data-testid="g-ok"]') as Element,
      ).transform,
    );
    await expect(Math.round(matrix.a)).toBe(0);
    await expect(Math.round(matrix.b)).toBe(-1);
    await expect(Math.round(matrix.c)).toBe(1);
    await expect(Math.round(matrix.d)).toBe(0);
  }}
>
  {#snippet template()}
    <div class="row">
      {@render cell(24, "ok", 56, "g-ok")}
      {@render cell(62, "cyan", 56, "g-cyan")}
      {@render cell(88, "amber", 56, "g-amber")}
      {@render cell(100, "danger", 56, "g-danger")}
    </div>
  {/snippet}
</Story>

<!--
  Sizes & geometry — the props that reshape the dial, shown side by side: the bare defaults,
  a large thick dial (the design's "size 84" cell), an empty (0%) dial, and values pushed
  past each end of the 0–100 range to show how they clamp.
-->
<Story
  name="Sizes & geometry"
  play={async ({ canvasElement }) => {
    // With nothing but pct, the dial falls back to its defaults: a 42px box, 4px strokes,
    // a --rule-strong track behind an --amber value arc.
    const def = canvasElement.querySelector('[data-testid="g-default"]') as Element;
    await expect(def).toHaveAttribute("width", "42");
    await expect(def).toHaveAttribute("height", "42");
    await expect(def).toHaveAttribute("viewBox", "0 0 42 42");
    const defCircles = def.querySelectorAll("circle");
    await expect(defCircles.length).toBe(2);
    for (const circle of Array.from(defCircles)) {
      await expect(circle).toHaveAttribute("stroke-width", "4");
      await expect(circle).toHaveAttribute("r", String(radius(42, 4)));
    }
    const track = def.querySelector('[data-part="track"]') as Element;
    const defArc = def.querySelector('[data-part="arc"]') as Element;
    // the track is the neutral --rule-strong ring; the value arc defaults to --amber
    await expect(getComputedStyle(track).stroke).toBe(
      resolveTokenFgColor("--rule-strong"),
    );
    await expect(getComputedStyle(defArc).stroke).toBe(
      resolveTokenFgColor("--amber"),
    );
    // the track is drawn first (underneath) and the value arc second (on top)
    await expect(defCircles[0]).toBe(track);
    await expect(defCircles[1]).toBe(defArc);

    // A larger size and thicker stroke scale the box and re-derive the radius from both
    // (r = (84 - 6 - 3) / 2 = 37.5), so the ring stays inside the viewBox.
    const large = canvasElement.querySelector('[data-testid="g-large"]') as Element;
    await expect(large).toHaveAttribute("width", "84");
    await expect(large).toHaveAttribute("height", "84");
    await expect(large).toHaveAttribute("viewBox", "0 0 84 84");
    const largeR = String(radius(84, 6)); // (84-6-3)/2 = 37.5
    await expect(largeR).toBe("37.5");
    const largeCircles = large.querySelectorAll("circle");
    await expect(largeCircles.length).toBe(2);
    for (const circle of Array.from(largeCircles)) {
      await expect(circle).toHaveAttribute("cx", "42");
      await expect(circle).toHaveAttribute("cy", "42");
      await expect(circle).toHaveAttribute("r", largeR);
      await expect(circle).toHaveAttribute("stroke-width", "6");
    }
    await expect(
      large.querySelector('[data-part="arc"]') as Element,
    ).toHaveAttribute("stroke-dasharray", dashArray(70, 84, 6));

    // At 0% the value arc has no visible length — its dash starts at 0.
    const zero = canvasElement.querySelector('[data-testid="g-zero"]') as Element;
    await expect(zero).toHaveAttribute("aria-valuenow", "0");
    const zeroDash = (zero.querySelector('[data-part="arc"]') as Element).getAttribute(
      "stroke-dasharray",
    ) as string;
    await expect(zeroDash.split(" ")[0]).toBe("0");
    await expect(zeroDash).toBe(`0 ${circumference(56, 4)}`);

    // A value above 100 clamps to 100: the reported value caps and the arc fills the ring.
    const over = canvasElement.querySelector('[data-testid="g-over"]') as Element;
    await expect(over).toHaveAttribute("aria-valuenow", "100");
    const overC = circumference(56, 4);
    await expect(
      over.querySelector('[data-part="arc"]') as Element,
    ).toHaveAttribute("stroke-dasharray", `${overC} ${overC}`);

    // A negative value clamps to 0: the reported value floors and the arc is empty.
    const under = canvasElement.querySelector('[data-testid="g-under"]') as Element;
    await expect(under).toHaveAttribute("aria-valuenow", "0");
    const underDash = (under.querySelector('[data-part="arc"]') as Element).getAttribute(
      "stroke-dasharray",
    ) as string;
    await expect(underDash.split(" ")[0]).toBe("0");
  }}
>
  {#snippet template()}
    <div class="row">
      <div class="cell">
        <Gauge pct={50} data-testid="g-default" />
        <span class="cap">default</span>
      </div>
      <div class="cell">
        <Gauge pct={70} tone="amber" size={84} width={6} data-testid="g-large" />
        <span class="cap">size 84</span>
      </div>
      <div class="cell">
        <Gauge pct={0} tone="amber" size={56} data-testid="g-zero" />
        <span class="cap">0%</span>
      </div>
      <div class="cell">
        <Gauge pct={150} tone="amber" size={56} data-testid="g-over" />
        <span class="cap">over</span>
      </div>
      <div class="cell">
        <Gauge pct={-10} tone="amber" size={56} data-testid="g-under" />
        <span class="cap">under</span>
      </div>
    </div>
  {/snippet}
</Story>

<!--
  Accessibility — two ways a gauge can sit in a page. One carries a descriptive label so
  screen readers announce it; the other is purely decorative (e.g. paired with visible
  text) and is hidden from assistive tech by passing aria-hidden straight through.
-->
<Story
  name="Accessibility"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // a label gives the gauge its accessible name
    const labelled = canvas.getByRole("progressbar", { name: "Disk usage" });
    await expect(labelled).toHaveAttribute("aria-label", "Disk usage");

    // the decorative gauge's aria-hidden takes it out of the accessibility tree, so the
    // labelled one is the only gauge a screen reader can reach
    await expect(canvas.getAllByRole("progressbar").length).toBe(1);

    // arbitrary attributes (here aria-hidden and data-testid) pass straight through to the
    // root <svg>, which is how a consumer opts a gauge out of the a11y tree
    const deco = canvasElement.querySelector('[data-testid="deco-gauge"]') as Element;
    await expect(deco.tagName.toLowerCase()).toBe("svg");
    await expect(deco).toHaveAttribute("aria-hidden", "true");
  }}
>
  {#snippet template()}
    <div class="row">
      <div class="cell">
        <Gauge pct={40} tone="cyan" size={56} label="Disk usage" />
        <span class="cap">labelled</span>
      </div>
      <div class="cell">
        <Gauge
          pct={40}
          tone="cyan"
          size={56}
          aria-hidden={true}
          data-testid="deco-gauge"
        />
        <span class="cap">decorative</span>
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .row {
    display: flex;
    gap: 40px;
    align-items: center;
    flex-wrap: wrap;
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
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
