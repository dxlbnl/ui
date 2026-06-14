<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, fn } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Pager from "./Pager.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Pager",
    component: Pager,
    tags: ["autodocs"],
  });
</script>

<!--
  Story 1 — Mid Range (both arrows enabled).
  ACs: 1 (label text in DOM), 2 (prev click → args.onPrev once), 3 (next click →
  args.onNext once), 8 (each callback fires only for its own button), 9 (both buttons
  by accessible name), 10 (nav landmark), 12 (label aria-live="polite"), 13 (container
  surface), 14 (enabled arrow colour + metrics), 16 (label typography + default width).
-->
<Story
  name="Mid Range"
  args={{
    label: "May 2026",
    onPrev: fn(),
    onNext: fn(),
    prevDisabled: false,
    nextDisabled: false,
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);

    // AC-10: root is a <nav> landmark with the default aria-label "Pagination"
    const nav = canvas.getByRole("navigation", { name: "Pagination" });
    await expect(nav).toBeVisible();

    // AC-9: both arrow buttons resolvable by their default accessible names
    const prev = canvas.getByRole("button", { name: "Previous" });
    const next = canvas.getByRole("button", { name: "Next" });
    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();

    // AC-1: the label prop renders verbatim in the DOM (uppercasing is CSS-only)
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(label).not.toBeNull();
    await expect(label.textContent!.trim()).toBe("May 2026");

    // AC-12: the label span is an aria-live="polite" region
    await expect(label.getAttribute("aria-live")).toBe("polite");

    // AC-2: clicking prev fires onPrev exactly once and does NOT fire onNext (AC-8)
    await userEvent.click(prev);
    await expect(args.onPrev).toHaveBeenCalledTimes(1);
    await expect(args.onNext).not.toHaveBeenCalled();

    // AC-3: clicking next fires onNext exactly once and does NOT fire onPrev again (AC-8)
    await userEvent.click(next);
    await expect(args.onNext).toHaveBeenCalledTimes(1);
    await expect(args.onPrev).toHaveBeenCalledTimes(1);

    // AC-13: container surface — inline-flex, centered, --rule-strong border, --bg-rail bg
    const navEl = nav as HTMLElement;
    await expect(getComputedStyle(navEl).display).toBe("inline-flex");
    await expect(getComputedStyle(navEl).alignItems).toBe("center");
    await expect(getComputedStyle(navEl).borderTopWidth).toBe("1px");
    await expect(getComputedStyle(navEl).borderTopStyle).toBe("solid");
    await expect(getComputedStyle(navEl).borderTopColor).toBe(
      resolveTokenFgColor("--rule-strong"),
    );
    await expect(getComputedStyle(navEl).backgroundColor).toBe(
      resolveTokenColor("--bg-rail"),
    );

    // AC-14: enabled arrow metrics + colour
    const prevEl = prev as HTMLElement;
    const prevFont = getComputedStyle(prevEl).fontFamily.toLowerCase();
    await expect(prevFont.includes("jetbrains") || prevFont.includes("mono")).toBe(true);
    await expect(getComputedStyle(prevEl).fontSize).toBe("14px");
    await expect(getComputedStyle(prevEl).paddingTop).toBe("6px");
    await expect(getComputedStyle(prevEl).paddingRight).toBe("12px");
    await expect(getComputedStyle(prevEl).paddingBottom).toBe("6px");
    await expect(getComputedStyle(prevEl).paddingLeft).toBe("12px");
    await expect(getComputedStyle(prevEl).cursor).toBe("pointer");
    await expect(getComputedStyle(prevEl).color).toBe(resolveTokenFgColor("--ink-dim"));

    // AC-16: label typography + default min-width 132px
    await expect(label.textContent!.trim()).toBe("May 2026");
    const labelFont = getComputedStyle(label).fontFamily.toLowerCase();
    await expect(labelFont.includes("jetbrains") || labelFont.includes("mono")).toBe(true);
    await expect(getComputedStyle(label).fontSize).toBe("12px");
    await expect(getComputedStyle(label).letterSpacing).toBe("0.96px");
    await expect(getComputedStyle(label).textTransform).toBe("uppercase");
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--ink"));
    await expect(getComputedStyle(label).paddingTop).toBe("0px");
    await expect(getComputedStyle(label).paddingRight).toBe("10px");
    await expect(getComputedStyle(label).paddingBottom).toBe("0px");
    await expect(getComputedStyle(label).paddingLeft).toBe("10px");
    await expect(getComputedStyle(label).textAlign).toBe("center");
    await expect(getComputedStyle(label).minWidth).toBe("132px");
  }}
/>

<!--
  Story 2 — Prev Disabled (first item).
  ACs: 4 (prev has native disabled attr), 5 (clicking disabled prev does NOT fire
  args.onPrev), 15 (disabled arrow colour --rule-strong + not-allowed). Positive
  control: clicking the enabled next DOES fire args.onNext once (so AC-5 is non-vacuous).
-->
<Story
  name="Prev Disabled"
  args={{
    label: "Mar 2026",
    onPrev: fn(),
    onNext: fn(),
    prevDisabled: true,
    nextDisabled: false,
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole("button", { name: "Previous" });
    const next = canvas.getByRole("button", { name: "Next" });

    // AC-4: prev carries the native disabled attribute
    await expect(prev).toBeDisabled();
    await expect((prev as HTMLButtonElement).disabled).toBe(true);

    // AC-5: attempting to click the disabled prev does NOT fire onPrev
    await userEvent.click(prev);
    await expect(args.onPrev).not.toHaveBeenCalled();

    // Positive control: the enabled next IS live, so the AC-5 no-op is meaningful
    await expect(next).not.toBeDisabled();
    await userEvent.click(next);
    await expect(args.onNext).toHaveBeenCalledTimes(1);

    // AC-15: disabled arrow colour resolves to --rule-strong with not-allowed cursor
    const prevEl = prev as HTMLElement;
    await expect(getComputedStyle(prevEl).color).toBe(
      resolveTokenFgColor("--rule-strong"),
    );
    await expect(getComputedStyle(prevEl).cursor).toBe("not-allowed");
  }}
/>

<!--
  Story 3 — Next Disabled (last item).
  ACs: 6 (next has native disabled attr), 7 (clicking disabled next does NOT fire
  args.onNext). Positive control: clicking the enabled prev DOES fire args.onPrev once.
-->
<Story
  name="Next Disabled"
  args={{
    label: "Jun 2026",
    onPrev: fn(),
    onNext: fn(),
    prevDisabled: false,
    nextDisabled: true,
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole("button", { name: "Previous" });
    const next = canvas.getByRole("button", { name: "Next" });

    // AC-6: next carries the native disabled attribute
    await expect(next).toBeDisabled();
    await expect((next as HTMLButtonElement).disabled).toBe(true);

    // AC-7: attempting to click the disabled next does NOT fire onNext
    await userEvent.click(next);
    await expect(args.onNext).not.toHaveBeenCalled();

    // Positive control: the enabled prev IS live, so the AC-7 no-op is meaningful
    await expect(prev).not.toBeDisabled();
    await userEvent.click(prev);
    await expect(args.onPrev).toHaveBeenCalledTimes(1);
  }}
/>

<!--
  Story 4 — Accessibility & Custom Width.
  ACs: 9 (custom prevLabel/nextLabel override button names), 10 (custom aria-label via
  ...rest overrides the nav landmark name), 16 (custom minWidth reflected as px). Also
  re-checks the enabled-vs-disabled arrow colour contract via the token resolver.
-->
<Story
  name="Accessibility & Custom Width"
  args={{
    label: "Page 3 of 9",
    onPrev: fn(),
    onNext: fn(),
    prevDisabled: false,
    nextDisabled: false,
    prevLabel: "Previous page",
    nextLabel: "Next page",
    minWidth: 180,
    "aria-label": "Result pages",
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-10: consumer-supplied aria-label overrides the default nav landmark name
    const nav = canvas.getByRole("navigation", { name: "Result pages" });
    await expect(nav).toBeVisible();

    // AC-9: custom prevLabel/nextLabel become the buttons' accessible names
    const prev = canvas.getByRole("button", { name: "Previous page" });
    const next = canvas.getByRole("button", { name: "Next page" });
    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();

    // AC-16: custom minWidth is reflected on the label span as px
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(label).not.toBeNull();
    await expect(label.textContent!.trim()).toBe("Page 3 of 9");
    await expect(getComputedStyle(label).minWidth).toBe("180px");

    // Enabled arrow colour contract holds for both buttons (AC-14 token)
    const inkDim = resolveTokenFgColor("--ink-dim");
    await expect(getComputedStyle(prev as HTMLElement).color).toBe(inkDim);
    await expect(getComputedStyle(next as HTMLElement).color).toBe(inkDim);
  }}
/>
