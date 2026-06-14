<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProgressBar from "./ProgressBar.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  // B60 — over-budget (overflow) state for the existing ProgressBar.
  // These stories live in a SEPARATE file so the existing ProgressBar.stories.svelte
  // (the seven regression stories) stay byte-for-byte untouched.
  // ALL test utilities are imported from "storybook/test" (B61) — never from "vitest".
  const { Story } = defineMeta({
    title: "Patterns/ProgressBar (Overflow)",
    component: ProgressBar,
    tags: ["autodocs"],
  });
</script>

<!-- Story 1 — Normal (below 100, overflow on)
     AC-1, AC-2, AC-8, AC-10: overflow=true but value<=100 → tone-styled, NO notch.
     value=42, color="ok" → ok fill, ok readout, width "42%", aria-valuenow=42. -->
<Story
  name="Normal"
  args={{ value: 42, color: "ok", overflow: true, label: "Groceries" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeVisible();

    // AC-2/AC-10 — not over-budget: aria-valuenow is the clamped value
    await expect(progressbar).toHaveAttribute("aria-valuenow", "42");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");

    // AC-8 — fill inline width is the clamped percent (assert the string, not px)
    const fill = canvasElement.querySelector(
      ".progress-fill",
    ) as HTMLElement | null;
    await expect(fill).not.toBeNull();
    await expect(fill!.style.width).toBe("42%");

    // AC-3/AC-10 — fill colour is the tone (--ok), NOT --danger
    await expect(getComputedStyle(fill!).backgroundColor).toBe(
      resolveTokenColor("--ok"),
    );

    // AC-5 — no notch when not over-budget
    await expect(
      canvasElement.querySelector('[data-part="notch"]'),
    ).toBeNull();

    // AC-7/AC-14 — readout text and tone colour
    const readout = canvas.getByText("42%");
    await expect(readout).toBeVisible();
    await expect(getComputedStyle(readout).color).toBe(
      resolveTokenFgColor("--ok"),
    );
  }}
/>

<!-- Story 2 — Full (exactly 100, overflow on)
     AC-2, AC-10: value=100 is NOT > 100 → not over-budget → tone-styled, no notch.
     value=100, color="amber" → amber fill, amber readout, no notch, aria-valuenow=100. -->
<Story
  name="Full"
  args={{ value: 100, color: "amber", overflow: true, label: "Utilities" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");

    await expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");

    const fill = canvasElement.querySelector(
      ".progress-fill",
    ) as HTMLElement | null;
    await expect(fill).not.toBeNull();

    // AC-4/AC-8 — fill width clamps to 100%
    await expect(fill!.style.width).toBe("100%");

    // AC-10 — amber tone fill at exactly 100 (NOT danger)
    await expect(getComputedStyle(fill!).backgroundColor).toBe(
      resolveTokenColor("--amber"),
    );

    // AC-5 — no notch at exactly 100
    await expect(
      canvasElement.querySelector('[data-part="notch"]'),
    ).toBeNull();

    // AC-7/AC-10 — readout text "100%" in amber tone
    const readout = canvas.getByText("100%");
    await expect(readout).toBeVisible();
    await expect(getComputedStyle(readout).color).toBe(
      resolveTokenFgColor("--amber"),
    );
  }}
/>

<!-- Story 3 — Over-budget (>100)
     AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-12: the canonical over-budget demo.
     value=112, color="ok", overflow=true → danger overrides ok, width clamps "100%",
     notch present (danger), readout "112%" in danger, aria-valuenow capped at 100. -->
<Story
  name="Over Budget"
  args={{
    value: 112,
    color: "ok",
    overflow: true,
    label: "Dining — over budget",
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");

    // AC-12 — aria-valuenow capped at 100, aria-valuemax 100 (never exceeds max)
    await expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    await expect(progressbar).toHaveAttribute("aria-valuemin", "0");

    const fill = canvasElement.querySelector(
      ".progress-fill",
    ) as HTMLElement | null;
    await expect(fill).not.toBeNull();

    // AC-4 — fill width clamps to the inline string "100%"
    await expect(fill!.style.width).toBe("100%");

    // AC-3 — danger fill overrides the ok tone
    await expect(getComputedStyle(fill!).backgroundColor).toBe(
      resolveTokenColor("--danger"),
    );

    // AC-5 — exactly one notch, pinned to the right edge, danger background + geometry
    const notches = canvasElement.querySelectorAll('[data-part="notch"]');
    await expect(notches.length).toBe(1);
    const notch = notches[0] as HTMLElement;
    const notchStyle = getComputedStyle(notch);
    await expect(notchStyle.backgroundColor).toBe(
      resolveTokenColor("--danger"),
    );
    await expect(notchStyle.position).toBe("absolute");
    await expect(notchStyle.right).toBe("0px");
    await expect(notchStyle.top).toBe("-1px");
    await expect(notchStyle.bottom).toBe("-1px");
    await expect(notchStyle.width).toBe("3px");

    // AC-7 — readout shows the real rounded percent, may exceed 100
    const readout = canvas.getByText("112%");
    await expect(readout).toBeVisible();

    // AC-6 — readout colour is danger
    await expect(getComputedStyle(readout).color).toBe(
      resolveTokenFgColor("--danger"),
    );
  }}
/>

<!-- Story 4 — Over-budget regression: default (no overflow prop) unchanged
     AC-1, AC-9, AC-11: value=150, color="danger", NO overflow → existing clamp behaviour.
     aria-valuenow=100, readout "100%", NO notch, width "100%", danger fill from color (not overflow). -->
<Story
  name="Default Ignores Overflow"
  args={{ value: 150, color: "danger", label: "Overflow" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");

    // AC-9/AC-12 — default clamps to 100
    await expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");

    const fill = canvasElement.querySelector(
      ".progress-fill",
    ) as HTMLElement | null;
    await expect(fill).not.toBeNull();

    // AC-9 — fill width clamps to "100%"
    await expect(fill!.style.width).toBe("100%");

    // AC-9 — danger fill because color="danger" (NOT because of overflow)
    await expect(getComputedStyle(fill!).backgroundColor).toBe(
      resolveTokenColor("--danger"),
    );

    // AC-5/AC-9 — opt-in: with no overflow prop there is NO notch even at 150
    await expect(
      canvasElement.querySelector('[data-part="notch"]'),
    ).toBeNull();

    // AC-9 — readout is the clamped "100%", not "150%"
    await expect(canvas.getByText("100%")).toBeVisible();
    await expect(canvas.queryByText("150%")).toBeNull();
  }}
/>
