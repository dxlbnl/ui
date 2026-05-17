<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Select from "./Select.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const OPTIONS = [
    { value: "osc", label: "Oscillator" },
    { value: "env", label: "Envelope" },
    { value: "util", label: "Utility" },
  ];

  const { Story } = defineMeta({
    title: "Forms/Select",
    component: Select,
    tags: ["autodocs"],
  });

  let _lastOnchange: string | undefined;
  function captureOnchange(v: string) { _lastOnchange = v; }
</script>

<Story name="Default" args={{ options: OPTIONS, placeholder: "SELECT…" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeEnabled();
    await expect(trigger.textContent).toContain("SELECT…");
    await expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await expect(canvas.queryByRole("listbox")).toBeNull();
  }} />

<Story name="Open Panel" args={{ options: OPTIONS, placeholder: "SELECT…" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await userEvent.click(trigger);
    await expect(canvas.getByRole("listbox")).toBeVisible();
    await expect(canvas.getAllByRole("option")).toHaveLength(3);
    await expect(trigger.getAttribute("aria-expanded")).toBe("true");
  }} />

<Story name="With Selection" args={{ options: OPTIONS, value: "env" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger.textContent).toContain("Envelope");
    await userEvent.click(trigger);
    const options = canvas.getAllByRole("option");
    const envelopeOption = options.find((o) => o.textContent && o.textContent.includes("Envelope"))!;
    await expect(envelopeOption.getAttribute("aria-selected")).toBe("true");
    for (const option of options) {
      if (option !== envelopeOption) {
        await expect(option.getAttribute("aria-selected")).toBe("false");
      }
    }
  }} />

<Story name="Disabled" args={{ options: OPTIONS, disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    // AC-21: disabled button cannot be interacted with; toBeDisabled() proves keyboard/click
    // events have no effect (browser prevents activation on disabled elements)
    await expect(trigger).toBeDisabled();
    await expect(getComputedStyle(trigger).opacity).toBe("0.4");
    await expect(trigger.getAttribute("aria-expanded")).toBe("false");
  }} />

<Story name="Error State" args={{ options: OPTIONS, error: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(trigger).borderColor).toBe(dangerColor);
  }} />

<!-- B15: Keyboard Navigation story — exercises the ARIA Listbox keyboard pattern. -->
<Story name="Keyboard Navigation"
  args={{
    options: [
      { value: "osc", label: "Oscillator" },
      { value: "env", label: "Envelope" },
      { value: "util", label: "Utility" },
    ],
    onchange: captureOnchange,
  }}
  play={async ({ canvasElement, userEvent }) => {
    _lastOnchange = undefined;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");

    // Step 1: open the panel
    await userEvent.click(trigger);
    await expect(trigger.getAttribute("aria-expanded")).toBe("true");

    // AC-6: highlight initialises to first option when no selection
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-0");

    // AC-7: highlighted option has class "highlighted"
    const options = canvas.getAllByRole("option");
    await expect(options[0]).toHaveClass("highlighted");

    // AC-12: ArrowUp from index 0 wraps to last (index 2)
    await userEvent.keyboard("{ArrowUp}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-2");

    // Return to index 0 via Home
    await userEvent.keyboard("{Home}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-0");

    // AC-8: ArrowDown moves to index 1
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-1");

    // AC-11: ArrowUp moves back to index 0
    await userEvent.keyboard("{ArrowUp}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-0");

    await userEvent.keyboard("{ArrowDown}");

    // AC-8 cont: ArrowDown to index 2
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-2");

    // AC-9: ArrowDown wraps last→first
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-0");

    // AC-14: End jumps to last
    await userEvent.keyboard("{End}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-2");

    // AC-13: Home jumps to first
    await userEvent.keyboard("{Home}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-0");

    // Move to index 1 (Envelope)
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-1");

    // AC-19: only highlighted option has class "highlighted"
    const optionsNow = canvas.getAllByRole("option");
    await expect(optionsNow[1]).toHaveClass("highlighted");
    await expect(optionsNow[0]).not.toHaveClass("highlighted");

    // AC-15: Enter calls onchange with the highlighted option's value
    // AC-16, AC-17: panel closes, trigger displays confirmed label
    await userEvent.keyboard("{Enter}");
    await expect(_lastOnchange).toBe("env");
    await expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await expect(canvas.queryByRole("listbox")).toBeNull();
    await expect(trigger.textContent).toMatch(/ENVELOPE/i);

    // AC-22: re-open highlights the selected option (index 1)
    await userEvent.click(trigger);
    await expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await expect(trigger.getAttribute("aria-activedescendant")).toBe("select-opt-1");

    // AC-18: Escape closes without changing selection
    await userEvent.keyboard("{Escape}");
    await expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await expect(trigger.textContent).toMatch(/ENVELOPE/i);

    // AC-5: aria-activedescendant absent when panel is closed
    await expect(trigger.getAttribute("aria-activedescendant")).toBeNull();
  }} />
