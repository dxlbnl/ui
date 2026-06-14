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
  // Bound parent value for the controlled (sm) story — instance scope so the inline
  // play function can read it back after a click.
  let boundView = $state("list");
</script>

<!--
  Size md (string options) — the hero demo, matching the design sample's md row. Its play
  function carries the bulk of the contract: structure (AC-1/2/3), string label (AC-4),
  rest-forwarding (AC-5), selection + onchange (AC-6/7/8), active/inactive colours (AC-15),
  typography (AC-17), md size (AC-18), and the full roving-tabindex keyboard model
  (AC-11/12/13).
-->
<Story
  name="Size md"
  args={{
    options: stringOptions,
    value: "month",
    label: "Period",
    id: "period-sc",
    "data-testid": "sc-md",
    onchange: fn(),
  }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);

    // AC-1 / AC-2: radiogroup root carries .segmented and is inline-flex
    const group = canvas.getByRole("radiogroup");
    const root = canvasElement.querySelector(".segmented") as HTMLElement;
    await expect(root).toBe(group);
    await expect(getComputedStyle(root).display).toBe("inline-flex");

    // AC-5: ...rest forwarded onto the root
    await expect(root.getAttribute("id")).toBe("period-sc");
    await expect(root.getAttribute("data-testid")).toBe("sc-md");

    // AC-1: one radio per option. AC-3: each is a <button type="button" role="radio">
    const radios = canvas.getAllByRole("radio");
    await expect(radios.length).toBe(3);
    for (const radio of radios) {
      await expect((radio as HTMLElement).tagName).toBe("BUTTON");
      await expect(radio.getAttribute("type")).toBe("button");
      await expect(radio.getAttribute("role")).toBe("radio");
    }

    const weekSeg = canvas.getByRole("radio", { name: /week/i });
    const monthSeg = canvas.getByRole("radio", { name: /month/i });
    const yearSeg = canvas.getByRole("radio", { name: /year/i });

    // AC-4: string option label equals the string
    await expect(weekSeg.textContent!.trim().toLowerCase()).toBe("week");

    // AC-6: value="month" → month checked, others not, exactly one
    await expect(monthSeg.getAttribute("aria-checked")).toBe("true");
    await expect(weekSeg.getAttribute("aria-checked")).toBe("false");
    await expect(yearSeg.getAttribute("aria-checked")).toBe("false");
    await expect(radios.filter((r) => r.getAttribute("aria-checked") === "true").length).toBe(1);

    // AC-17: mono + uppercase. AC-18: md size → fontSize 11px
    const monthStyle = getComputedStyle(monthSeg);
    await expect(monthStyle.textTransform).toBe("uppercase");
    await expect(monthStyle.fontFamily.toLowerCase()).toContain("mono");
    await expect(monthStyle.fontSize).toBe("11px");

    // AC-15: active month → bg --amber, color --bg; inactive week → --ink-faint, transparent
    await expect(monthStyle.backgroundColor).toBe(resolveTokenColor("--amber"));
    await expect(monthStyle.color).toBe(resolveTokenFgColor("--bg"));
    const weekStyle = getComputedStyle(weekSeg);
    await expect(weekStyle.color).toBe(resolveTokenFgColor("--ink-faint"));
    await expect(weekStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");

    // AC-7: clicking year moves the checked state. AC-8: onchange fires once with "year"
    await userEvent.click(yearSeg);
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");
    await expect(monthSeg.getAttribute("aria-checked")).toBe("false");
    await expect(args.onchange).toHaveBeenCalledTimes(1);
    await expect(args.onchange).toHaveBeenLastCalledWith("year");
    // AC-8: re-selecting the active segment still fires onchange (idempotent)
    await userEvent.click(yearSeg);
    await expect(args.onchange).toHaveBeenCalledTimes(2);
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");

    // AC-11: roving tabindex follows selection (year active → tabindex 0, rest -1)
    await expect(yearSeg.getAttribute("tabindex")).toBe("0");
    await expect(weekSeg.getAttribute("tabindex")).toBe("-1");

    // AC-12/13: keyboard model — automatic activation, wrap-around, Home/End
    await expect(yearSeg).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}"); // last → wraps to first
    await expect(weekSeg).toHaveFocus();
    await expect(weekSeg.getAttribute("aria-checked")).toBe("true");
    await expect(weekSeg.getAttribute("tabindex")).toBe("0");
    await userEvent.keyboard("{ArrowDown}"); // next
    await expect(monthSeg).toHaveFocus();
    await expect(monthSeg.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{ArrowUp}"); // previous
    await expect(weekSeg).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}"); // first → wraps to last
    await expect(yearSeg).toHaveFocus();
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{Home}");
    await expect(weekSeg).toHaveFocus();
    await expect(weekSeg.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{End}");
    await expect(yearSeg).toHaveFocus();
    await expect(yearSeg.getAttribute("aria-checked")).toBe("true");

    // exactly one checked after the sweep; onchange fired on keyboard activation
    const after = canvas.getAllByRole("radio");
    await expect(after.filter((r) => r.getAttribute("aria-checked") === "true").length).toBe(1);
    await expect(args.onchange).toHaveBeenLastCalledWith("year");
  }}
/>

<!--
  Size sm ({value,label} options, bound) — the design sample's sm row. Folds in the
  label/value split (AC-4), bindable value (AC-10), and the sm size (AC-18).
-->
<Story
  name="Size sm"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const listSeg = canvas.getByRole("radio", { name: /list/i });
    const gridSeg = canvas.getByRole("radio", { name: /grid/i });

    // AC-4: visible label "List", initially selected via bound value "list"
    await expect(listSeg.textContent!.trim().toLowerCase()).toBe("list");
    await expect(listSeg.getAttribute("aria-checked")).toBe("true");

    // AC-18: sm size → fontSize 10px
    await expect(getComputedStyle(listSeg).fontSize).toBe("10px");

    // AC-10 / AC-4: clicking "Grid" updates the bound variable to the value "grid"
    await userEvent.click(gridSeg);
    await expect(boundView).toBe("grid");
    await expect(gridSeg.getAttribute("aria-checked")).toBe("true");
    await expect(listSeg.getAttribute("aria-checked")).toBe("false");
    await expect(canvas.getByTestId("bound-readout").textContent).toContain("grid");
  }}
>
  {#snippet template()}
    <div>
      <SegmentedControl options={viewOptions} label="View" size="sm" bind:value={boundView} />
      <span data-testid="bound-readout">bound={boundView}</span>
    </div>
  {/snippet}
</Story>

<!--
  Edge states — two configurations that need distinct render props: an unselected control
  (AC-9 zero checked, AC-11 first segment is the entry point) and a single-segment control
  with an aria-label override (AC-14).
-->
<Story
  name="Edge states"
  play={async ({ canvasElement, userEvent }) => {
    // Unselected control — no value supplied
    const unselected = canvasElement.querySelector('[data-testid="sc-unselected"]') as HTMLElement;
    const uRadios = within(unselected).getAllByRole("radio");
    // AC-9: zero checked initially
    await expect(uRadios.filter((r) => r.getAttribute("aria-checked") === "true").length).toBe(0);
    // AC-11: with no value, the first segment is the keyboard entry point
    await expect(uRadios[0].getAttribute("tabindex")).toBe("0");
    await expect(uRadios[1].getAttribute("tabindex")).toBe("-1");
    await expect(uRadios[2].getAttribute("tabindex")).toBe("-1");
    // AC-9: after the first click, exactly one is checked
    await userEvent.click(uRadios[1]);
    await expect(within(unselected).getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true").length).toBe(1);
    await expect(uRadios[1].getAttribute("aria-checked")).toBe("true");

    // Single-segment control with an aria-label override
    const single = canvasElement.querySelector('[data-testid="sc-single"]') as HTMLElement;
    // AC-14: explicit aria-label via ...rest overrides the label-derived name
    await expect(single.getAttribute("role")).toBe("radiogroup");
    await expect(single.getAttribute("aria-label")).toBe("Custom group name");
    const seg = within(single).getByRole("radio");
    await expect(seg.getAttribute("aria-checked")).toBe("true");
    // AC-14: Arrow/Home/End keep focus + selection on the only segment, no throw
    await userEvent.click(seg);
    await expect(seg).toHaveFocus();
    for (const key of ["{ArrowRight}", "{ArrowLeft}", "{Home}", "{End}"]) {
      await userEvent.keyboard(key);
      await expect(seg.getAttribute("aria-checked")).toBe("true");
    }
  }}
>
  {#snippet template()}
    <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
      <SegmentedControl options={stringOptions} label="Unselected" data-testid="sc-unselected" />
      <SegmentedControl
        options={["only"]}
        value="only"
        label="Solo"
        aria-label="Custom group name"
        data-testid="sc-single"
      />
    </div>
  {/snippet}
</Story>
