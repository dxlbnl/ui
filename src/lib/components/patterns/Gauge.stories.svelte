<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Gauge from "./Gauge.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/Gauge",
    component: Gauge,
    tags: ["autodocs"],
  });

  // Geometry helpers — mirror the spec's formula exactly (never hard-coded literals).
  // r = (size - width - 3) / 2 ; c = 2π·r ; dash = `${(clamp(pct,0,100)/100)*c} ${c}`
  const radius = (size: number, width: number) => (size - width - 3) / 2;
  const circumference = (size: number, width: number) =>
    2 * Math.PI * radius(size, width);
  const clampPct = (pct: number) => Math.max(0, Math.min(100, pct));
  const dashArray = (pct: number, size: number, width: number) => {
    const c = circumference(size, width);
    return `${(clampPct(pct) / 100) * c} ${c}`;
  };
</script>

<!-- Story 1 — Ok Low (24%): two circles, role+min+max+valuenow, stroke=--ok, dasharray, rotate(-90deg). AC 1,2,4,5,8,12 -->
<Story
  name="Ok Low"
  args={{ pct: 24, tone: "ok", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;

    // AC 12 — role + range + clamped value
    await expect(gauge).toHaveAttribute("aria-valuenow", "24");
    await expect(gauge).toHaveAttribute("aria-valuemin", "0");
    await expect(gauge).toHaveAttribute("aria-valuemax", "100");

    // AC 1 — root <svg> dimensions for size=56
    await expect(gauge.tagName.toLowerCase()).toBe("svg");
    await expect(gauge).toHaveAttribute("width", "56");
    await expect(gauge).toHaveAttribute("height", "56");
    await expect(gauge).toHaveAttribute("viewBox", "0 0 56 56");

    // AC 2 — exactly two circles, shared cx/cy/r/fill/stroke-width
    const circles = canvasElement.querySelectorAll("circle");
    await expect(circles.length).toBe(2);
    const expR = String(radius(56, 4));
    for (const circle of Array.from(circles)) {
      await expect(circle).toHaveAttribute("cx", "28");
      await expect(circle).toHaveAttribute("cy", "28");
      await expect(circle).toHaveAttribute("r", expR);
      await expect(circle).toHaveAttribute("fill", "none");
      await expect(circle).toHaveAttribute("stroke-width", "4");
    }

    // AC 4 — progress arc stroke colour = --ok (foreground/paint channel)
    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    await expect(getComputedStyle(arc).stroke).toBe(resolveTokenFgColor("--ok"));

    // AC 5 — stroke-dasharray for 24% computed from the formula
    await expect(arc).toHaveAttribute("stroke-dasharray", dashArray(24, 56, 4));

    // AC 8 — svg rotated -90deg so the arc starts at 12 o'clock
    await expect(getComputedStyle(gauge).transform).not.toBe("none");
    const matrix = new DOMMatrixReadOnly(getComputedStyle(gauge).transform);
    // rotate(-90deg) => a≈0, b≈-1, c≈1, d≈0
    await expect(Math.round(matrix.a)).toBe(0);
    await expect(Math.round(matrix.b)).toBe(-1);
    await expect(Math.round(matrix.c)).toBe(1);
    await expect(Math.round(matrix.d)).toBe(0);
  }}
/>

<!-- Story 2 — Cyan Mid (62%): stroke=--cyan, dasharray for 62%, valuenow. AC 4,5 -->
<Story
  name="Cyan Mid"
  args={{ pct: 62, tone: "cyan", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-valuenow", "62");

    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    await expect(getComputedStyle(arc).stroke).toBe(
      resolveTokenFgColor("--cyan"),
    );
    await expect(arc).toHaveAttribute("stroke-dasharray", dashArray(62, 56, 4));
  }}
/>

<!-- Story 3 — Amber High (88%): stroke=--amber, dasharray for 88%. AC 4,5 -->
<Story
  name="Amber High"
  args={{ pct: 88, tone: "amber", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-valuenow", "88");

    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    await expect(getComputedStyle(arc).stroke).toBe(
      resolveTokenFgColor("--amber"),
    );
    await expect(arc).toHaveAttribute("stroke-dasharray", dashArray(88, 56, 4));
  }}
/>

<!-- Story 4 — Danger Full (100%): stroke=--danger, dash = "{c} {c}", valuenow=100. AC 4,7,12 -->
<Story
  name="Danger Full"
  args={{ pct: 100, tone: "danger", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-valuenow", "100");

    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    await expect(getComputedStyle(arc).stroke).toBe(
      resolveTokenFgColor("--danger"),
    );

    // AC 7 — full arc: first dash value equals the full circumference
    const c = circumference(56, 4);
    await expect(arc).toHaveAttribute("stroke-dasharray", `${c} ${c}`);
    await expect(arc).toHaveAttribute("stroke-dasharray", dashArray(100, 56, 4));
  }}
/>

<!-- Story 5 — Zero (0%): dasharray starts "0", valuenow=0. AC 6 -->
<Story
  name="Zero"
  args={{ pct: 0, tone: "amber", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-valuenow", "0");

    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    // AC 6 — zero-length arc: "0 {c}"
    const c = circumference(56, 4);
    await expect(arc).toHaveAttribute("stroke-dasharray", `0 ${c}`);
    const dash = arc.getAttribute("stroke-dasharray") ?? "";
    await expect(dash.split(" ")[0]).toBe("0");
  }}
/>

<!-- Story 6 — Large Thick: size=84,width=6 → width/height=84, both stroke-width=6, r/c from formula. AC 1,2,9 -->
<Story
  name="Large Thick"
  args={{ pct: 70, tone: "amber", size: 84, width: 6 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;

    // AC 1 — size reflected on root svg
    await expect(gauge).toHaveAttribute("width", "84");
    await expect(gauge).toHaveAttribute("height", "84");
    await expect(gauge).toHaveAttribute("viewBox", "0 0 84 84");

    // AC 9 — width changes both stroke-width and the computed r (=37.5)
    const circles = canvasElement.querySelectorAll("circle");
    await expect(circles.length).toBe(2);
    const expR = String(radius(84, 6)); // (84-6-3)/2 = 37.5
    await expect(expR).toBe("37.5");
    for (const circle of Array.from(circles)) {
      await expect(circle).toHaveAttribute("cx", "42");
      await expect(circle).toHaveAttribute("cy", "42");
      await expect(circle).toHaveAttribute("r", expR);
      await expect(circle).toHaveAttribute("stroke-width", "6");
    }

    // AC 5 — dasharray for 70% with the new geometry
    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    await expect(arc).toHaveAttribute("stroke-dasharray", dashArray(70, 84, 6));
  }}
/>

<!-- Story 7 — Clamped Above (pct=150): valuenow=100, dash = "{c} {c}". AC 11 -->
<Story
  name="Clamped Above"
  args={{ pct: 150, tone: "amber", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-valuenow", "100");

    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    const c = circumference(56, 4);
    await expect(arc).toHaveAttribute("stroke-dasharray", `${c} ${c}`);
  }}
/>

<!-- Story 8 — Clamped Below (pct=-10): valuenow=0, dash starts "0". AC 10 -->
<Story
  name="Clamped Below"
  args={{ pct: -10, tone: "amber", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-valuenow", "0");

    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    const dash = arc.getAttribute("stroke-dasharray") ?? "";
    await expect(dash.split(" ")[0]).toBe("0");
  }}
/>

<!-- Story 9 — Default Geometry (pct=50 only): width=42, viewBox 0 0 42 42, stroke-width=4, arc=--amber, track=--rule-strong. AC 1,3,4,16 -->
<Story
  name="Default Geometry"
  args={{ pct: 50 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar") as unknown as SVGElement;

    // AC 1 / AC 16 — default size=42
    await expect(gauge).toHaveAttribute("width", "42");
    await expect(gauge).toHaveAttribute("height", "42");
    await expect(gauge).toHaveAttribute("viewBox", "0 0 42 42");

    const circles = canvasElement.querySelectorAll("circle");
    await expect(circles.length).toBe(2);
    // AC 16 — default width=4 on both circles, computed r from formula
    const expR = String(radius(42, 4));
    for (const circle of Array.from(circles)) {
      await expect(circle).toHaveAttribute("stroke-width", "4");
      await expect(circle).toHaveAttribute("r", expR);
    }

    // AC 3 — track (first circle) stroke resolves to --rule-strong
    const track = canvasElement.querySelector(
      '[data-part="track"]',
    ) as unknown as SVGElement;
    await expect(getComputedStyle(track).stroke).toBe(
      resolveTokenFgColor("--rule-strong"),
    );

    // AC 4 / AC 16 — default tone=amber on the progress arc
    const arc = canvasElement.querySelector(
      '[data-part="arc"]',
    ) as unknown as SVGElement;
    await expect(getComputedStyle(arc).stroke).toBe(
      resolveTokenFgColor("--amber"),
    );

    // track is the first circle, arc the second
    await expect(circles[0]).toBe(track);
    await expect(circles[1]).toBe(arc);
  }}
/>

<!-- Story 10 — Labelled: aria-label="Disk usage". AC 13 -->
<Story
  name="Labelled"
  args={{ pct: 40, label: "Disk usage", size: 56 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole("progressbar", {
      name: "Disk usage",
    }) as unknown as SVGElement;
    await expect(gauge).toHaveAttribute("aria-label", "Disk usage");
  }}
/>

<!-- Story 11 — Decorative (aria-hidden): removed from a11y tree, svg has aria-hidden + data-testid forwarded. AC 14,17 -->
<Story
  name="Decorative"
  args={{ pct: 40, "aria-hidden": true, "data-testid": "deco-gauge" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // AC 14 — aria-hidden removes it from the accessibility tree
    await expect(canvas.queryByRole("progressbar")).toBeNull();

    // AC 17 — ...rest forwarded onto the root <svg>
    const svg = canvasElement.querySelector("svg") as unknown as SVGElement;
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(svg).toHaveAttribute("data-testid", "deco-gauge");
  }}
/>
