<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, fn } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import SegmentedControl from "./SegmentedControl.svelte";

  const { Story } = defineMeta({
    title: "Forms/SegmentedControl",
    component: SegmentedControl,
    tags: ["autodocs"],
  });

  const stringOptions = ["week", "month", "year"];

  const viewOptions = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "chart", label: "Chart" },
  ];
</script>

<script lang="ts">
  // Controlled (bind:value) story state — instance-script scope so the inline
  // play function can read `boundValue` after the click. Mirrors the Popover idiom.
  let boundValue = $state("grid");
</script>


<!--
  Story 1 — Default (md, string options).
  ACs: 1 (radiogroup + one radio per option), 2 (.segmented class + inline-flex),
       3 (button type="button" role="radio"), 4 (label === string), 6 (month checked,
       others not), 17 (mono uppercase), 18 (md fontSize 11px), 5 (...rest forwarding).
-->
<Story name="Default"
  args={{
    options: stringOptions,
    value: "month",
    label: "Period",
    id: "period-sc",
    "data-testid": "sc-default",
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-1: container has role="radiogroup"
    const group = canvas.getByRole("radiogroup");
    await expect(group).toBeVisible();

    // AC-2: root carries .segmented class and renders display: inline-flex
    const root = canvasElement.querySelector(".segmented") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBe(group);
    await expect(getComputedStyle(root).display).toBe("inline-flex");

    // AC-5: ...rest forwarded onto root (id + data-testid both present)
    await expect(root.getAttribute("id")).toBe("period-sc");
    await expect(root.getAttribute("data-testid")).toBe("sc-default");

    // AC-1: exactly one radio per option
    const radios = canvas.getAllByRole("radio");
    await expect(radios.length).toBe(3);

    // AC-3: each segment is a <button type="button"> with role="radio"
    for (const radio of radios) {
      await expect((radio as HTMLElement).tagName).toBe("BUTTON");
      await expect(radio.getAttribute("type")).toBe("button");
      await expect(radio.getAttribute("role")).toBe("radio");
    }

    // AC-4: label text equals the string for string options
    const weekSeg = canvas.getByRole("radio", { name: /week/i });
    const monthSeg = canvas.getByRole("radio", { name: /month/i });
    const yearSeg = canvas.getByRole("radio", { name: /year/i });
    await expect(weekSeg.textContent!.trim().toLowerCase()).toBe("week");
    await expect(monthSeg.textContent!.trim().toLowerCase()).toBe("month");

    // AC-6: the segment matching value is checked, others not; exactly one checked
    await expect(monthSeg.getAttribute("aria-checked")).toBe("true");
    await expect(weekSeg.getAttribute("aria-checked")).toBe("false");
    await expect(yearSeg.getAttribute("aria-checked")).toBe("false");
    const checked = radios.filter((r) => r.getAttribute("aria-checked") === "true");
    await expect(checked.length).toBe(1);

    // AC-17: labels are mono + uppercase
    await expect(getComputedStyle(monthSeg).textTransform).toBe("uppercase");
    const fontFamily = getComputedStyle(monthSeg).fontFamily.toLowerCase();
    await expect(fontFamily.includes("jetbrains") || fontFamily.includes("mono")).toBe(true);

    // AC-18: md (default) size renders fontSize 11px
    await expect(getComputedStyle(monthSeg).fontSize).toBe("11px");
  }} />

<!--
  Story 2 — Small ({value,label} options).
  ACs: 4 (label/value split — clicking "List" selects "list"), 18 (sm fontSize 10px).
-->
<Story name="Small"
  args={{
    options: viewOptions,
    value: "list",
    label: "View",
    size: "sm",
    onchange: fn(),
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);

    const listSeg = canvas.getByRole("radio", { name: /list/i });
    const gridSeg = canvas.getByRole("radio", { name: /grid/i });

    // AC-4: visible label is "List" but the activation value is "list"
    await expect(listSeg.textContent!.trim().toLowerCase()).toBe("list");
    await expect(listSeg.getAttribute("aria-checked")).toBe("true");

    // AC-18: sm size renders fontSize 10px
    await expect(getComputedStyle(listSeg).fontSize).toBe("10px");

    // AC-4: clicking "Grid" fires onchange with the value "grid" (not "Grid")
    await userEvent.click(gridSeg);
    await expect(args.onchange).toHaveBeenCalledWith("grid");
  }} />

<!--
  Story 3 — Selection interaction.
  ACs: 7 (checked moves on click), 8 (onchange called once with the right value,
       idempotent re-select still fires onchange).
-->
<Story name="Selection interaction"
  args={{
    options: stringOptions,
    value: "month",
    label: "Period",
    onchange: fn(),
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const weekSeg = canvas.getByRole("radio", { name: /week/i });
    const monthSeg = canvas.getByRole("radio", { name: /month/i });
    const yearSeg = canvas.getByRole("radio", { name: /year/i });

    // initial: month checked
    await expect(monthSeg.getAttribute("aria-checked")).toBe("true");

    // AC-7: click "year" → year becomes checked, month is cleared
    await userEvent.click(yearSeg);
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");
    await expect(monthSeg.getAttribute("aria-checked")).toBe("false");
    await expect(weekSeg.getAttribute("aria-checked")).toBe("false");

    // exactly one checked after the click
    const radios = canvas.getAllByRole("radio");
    const checked = radios.filter((r) => r.getAttribute("aria-checked") === "true");
    await expect(checked.length).toBe(1);

    // AC-8: onchange called exactly once, with the clicked segment's value
    await expect(args.onchange).toHaveBeenCalledTimes(1);
    await expect(args.onchange).toHaveBeenLastCalledWith("year");

    // AC-8: re-clicking the already-active segment still calls onchange (idempotent),
    // active state does not change
    await userEvent.click(yearSeg);
    await expect(args.onchange).toHaveBeenCalledTimes(2);
    await expect(args.onchange).toHaveBeenLastCalledWith("year");
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");
  }} />

<!--
  Story 4 — Controlled (bind:value).
  ACs: 10 (bound parent variable updates on click; rendered checked state follows).
  Composition story: local $state bound with bind:value.
-->
<Story name="Controlled (bind:value)"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // initial bound value is "grid"
    const gridSeg = canvas.getByRole("radio", { name: /grid/i });
    const chartSeg = canvas.getByRole("radio", { name: /chart/i });
    await expect(gridSeg.getAttribute("aria-checked")).toBe("true");

    // AC-10: clicking "Chart" updates the bound parent variable to "chart"
    await userEvent.click(chartSeg);
    await expect(boundValue).toBe("chart");

    // rendered checked state follows the bound value
    await expect(chartSeg.getAttribute("aria-checked")).toBe("true");
    await expect(gridSeg.getAttribute("aria-checked")).toBe("false");

    // surface the live bound value for the interaction panel
    await expect(within(canvasElement).getByTestId("bound-readout").textContent).toContain("chart");
  }}>
  {#snippet template()}
    <div>
      <SegmentedControl
        options={viewOptions}
        label="View"
        bind:value={boundValue}
      />
      <span data-testid="bound-readout">bound={boundValue}</span>
    </div>
  {/snippet}
</Story>

<!--
  Story 5 — Unselected initial state.
  ACs: 9 (no value → zero checked initially; exactly one after first click),
       11 (no value → first segment tabindex="0", rest -1).
-->
<Story name="Unselected initial state"
  args={{
    options: stringOptions,
    label: "Period",
  }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");

    // AC-9: no value supplied → zero segments checked
    const checkedInitial = radios.filter((r) => r.getAttribute("aria-checked") === "true");
    await expect(checkedInitial.length).toBe(0);

    // AC-11: with no value, the first segment is the keyboard entry point (tabindex 0)
    await expect(radios[0].getAttribute("tabindex")).toBe("0");
    await expect(radios[1].getAttribute("tabindex")).toBe("-1");
    await expect(radios[2].getAttribute("tabindex")).toBe("-1");

    // AC-9: after the first click, exactly one segment is checked
    await userEvent.click(radios[1]);
    const checkedAfter = canvas
      .getAllByRole("radio")
      .filter((r) => r.getAttribute("aria-checked") === "true");
    await expect(checkedAfter.length).toBe(1);
    await expect(radios[1].getAttribute("aria-checked")).toBe("true");
  }} />

<!--
  Story 6 — Active / inactive colours.
  ACs: 15 (active bg var(--amber), active color var(--bg), inactive color
       var(--ink-faint), inactive bg transparent).
-->
<Story name="Active / inactive colours"
  args={{
    options: stringOptions,
    value: "week",
    label: "Period",
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const activeSeg = canvas.getByRole("radio", { name: /week/i }) as HTMLElement;
    const inactiveSeg = canvas.getByRole("radio", { name: /month/i }) as HTMLElement;

    await expect(activeSeg.getAttribute("aria-checked")).toBe("true");

    // AC-15: active background resolves to var(--amber)
    const amberBg = resolveTokenColor("--amber");
    await expect(getComputedStyle(activeSeg).backgroundColor).toBe(amberBg);

    // AC-15: active color resolves to var(--bg)
    const bgFg = resolveTokenFgColor("--bg");
    await expect(getComputedStyle(activeSeg).color).toBe(bgFg);

    // AC-15: inactive segment color resolves to var(--ink-faint)
    const inkFaint = resolveTokenFgColor("--ink-faint");
    await expect(getComputedStyle(inactiveSeg).color).toBe(inkFaint);

    // AC-15: inactive segment background is transparent
    await expect(getComputedStyle(inactiveSeg).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  }} />

<!--
  Story 7 — Keyboard navigation (roving tabindex, automatic activation).
  ACs: 11 (roving tabindex), 12 (Arrow keys move + select, wrap-around),
       13 (Home/End), onchange fires on keyboard activation.
-->
<Story name="Keyboard navigation"
  args={{
    options: stringOptions,
    value: "week",
    label: "Period",
    onchange: fn(),
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const weekSeg = canvas.getByRole("radio", { name: /week/i });
    const monthSeg = canvas.getByRole("radio", { name: /month/i });
    const yearSeg = canvas.getByRole("radio", { name: /year/i });

    // AC-11: checked segment has tabindex 0, others -1
    await expect(weekSeg.getAttribute("tabindex")).toBe("0");
    await expect(monthSeg.getAttribute("tabindex")).toBe("-1");
    await expect(yearSeg.getAttribute("tabindex")).toBe("-1");

    // focus the active segment
    await userEvent.click(weekSeg);
    await expect(weekSeg).toHaveFocus();

    // AC-12: ArrowRight → next segment focused + selected
    await userEvent.keyboard("{ArrowRight}");
    await expect(monthSeg).toHaveFocus();
    await expect(monthSeg.getAttribute("aria-checked")).toBe("true");
    await expect(weekSeg.getAttribute("aria-checked")).toBe("false");
    // roving tabindex follows selection
    await expect(monthSeg.getAttribute("tabindex")).toBe("0");
    await expect(weekSeg.getAttribute("tabindex")).toBe("-1");

    // AC-12: ArrowDown behaves like ArrowRight → next
    await userEvent.keyboard("{ArrowDown}");
    await expect(yearSeg).toHaveFocus();
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");

    // AC-12: ArrowRight from last wraps to first
    await userEvent.keyboard("{ArrowRight}");
    await expect(weekSeg).toHaveFocus();
    await expect(weekSeg.getAttribute("aria-checked")).toBe("true");

    // AC-12: ArrowLeft from first wraps to last
    await userEvent.keyboard("{ArrowLeft}");
    await expect(yearSeg).toHaveFocus();
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");

    // AC-12: ArrowUp behaves like ArrowLeft → previous
    await userEvent.keyboard("{ArrowUp}");
    await expect(monthSeg).toHaveFocus();
    await expect(monthSeg.getAttribute("aria-checked")).toBe("true");

    // AC-13: Home → first segment focused + selected
    await userEvent.keyboard("{Home}");
    await expect(weekSeg).toHaveFocus();
    await expect(weekSeg.getAttribute("aria-checked")).toBe("true");

    // AC-13: End → last segment focused + selected
    await userEvent.keyboard("{End}");
    await expect(yearSeg).toHaveFocus();
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");

    // exactly one checked after the keyboard sweep
    const radios = canvas.getAllByRole("radio");
    const checked = radios.filter((r) => r.getAttribute("aria-checked") === "true");
    await expect(checked.length).toBe(1);

    // onchange fired on keyboard activation (every move selected a new segment)
    await expect(args.onchange).toHaveBeenCalled();
    await expect(args.onchange).toHaveBeenLastCalledWith("year");
  }} />

<!--
  Story 8 — Single segment + aria-label override.
  ACs: 14 (single-segment edge: Arrow/Home/End keep focus + selection, no throw;
       aria-label override via ...rest wins over the label prop).
-->
<Story name="Single segment"
  args={{
    options: ["only"],
    value: "only",
    label: "Solo",
    "aria-label": "Custom group name",
  }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // AC-14: explicit aria-label via ...rest overrides the label-derived name
    const group = canvas.getByRole("radiogroup", { name: "Custom group name" });
    await expect(group).toBeVisible();

    const seg = canvas.getByRole("radio");
    await expect(seg.getAttribute("aria-checked")).toBe("true");

    // AC-14: Arrow/Home/End keep focus + selection on the only segment, no throw
    await userEvent.click(seg);
    await expect(seg).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(seg.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(seg.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{Home}");
    await expect(seg.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{End}");
    await expect(seg.getAttribute("aria-checked")).toBe("true");
  }} />
