<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Field from "./Field.svelte";
  import Input from "./Input.svelte";
  import Textarea from "./Textarea.svelte";
  import Radio from "./Radio.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Forms/Field",
    component: Field,
    tags: ["autodocs"],
  });
</script>

<Story name="Default — Hint"
  args={{ label: "Bench Note", inputId: "bench-note", hint: "Describe the work session." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Bench Note");
    await expect(input).toBeVisible();
    await expect(input.tagName).toBe("INPUT");
    const hint = canvas.getByText("Describe the work session.");
    await expect(hint).toBeVisible();
    const inkFaint = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(hint).color).toBe(inkFaint);
  }}>
  <Input id="bench-note" aria-describedby="bench-note-hint" type="text" placeholder="Placeholder…" />
</Story>

<Story name="Error State"
  args={{ label: "Email", inputId: "email-field", error: "Invalid email address." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Email");
    await expect(input).toBeVisible();
    await expect(input.getAttribute("aria-invalid")).toBe("true");
    const errorText = canvas.getByText("Invalid email address.");
    await expect(errorText).toBeVisible();
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(errorText).color).toBe(dangerColor);
    const textbox = canvas.getByRole("textbox", { name: "Email" });
    await expect(textbox.getAttribute("aria-describedby")).toBe("email-field-hint");
  }}>
  <Input id="email-field" aria-describedby="email-field-hint" aria-invalid="true" error={true} type="email" value="bad@" />
</Story>

<Story name="Disabled"
  args={{ label: "Locked", inputId: "locked-field", hint: "Field is locked." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Locked");
    await expect(input).toBeDisabled();
    await expect(canvas.getByText("Field is locked.")).toBeVisible();
  }}>
  <Input id="locked-field" type="text" value="read-only" disabled />
</Story>

<Story name="With Textarea"
  args={{ label: "Notes", inputId: "notes-field", hint: "Up to 500 characters." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Notes");
    await expect(control.tagName).toBe("TEXTAREA");
  }}>
  <Textarea id="notes-field" aria-describedby="notes-field-hint" />
</Story>

<!-- AC-54 through AC-62: Field auto-injects aria-invalid + aria-describedby via context -->
<Story name="Auto ARIA Wiring"
  args={{ label: "Email", inputId: "auto-email", error: "Invalid email address." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    // AC-55: id is set from Field context (no manual id on the Input)
    await expect(input.getAttribute("id")).toBe("auto-email");
    // AC-56: aria-invalid is "true" because Field has an error prop
    await expect(input.getAttribute("aria-invalid")).toBe("true");
    // AC-57: aria-describedby is "{inputId}-hint" because error is set
    await expect(input.getAttribute("aria-describedby")).toBe("auto-email-hint");
    // AC-61: the hint span with the error text is visible
    const hint = canvas.getByText("Invalid email address.");
    await expect(hint).toBeVisible();
    await expect(hint.getAttribute("id")).toBe("auto-email-hint");
  }}>
  <Input />
</Story>

<Story name="Required Field"
  args={{ label: "Project Name", inputId: "project-name" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project Name" });
    await expect(input).toBeRequired();
    await expect(canvasElement.querySelector(".field-hint")).toBeNull();
  }}>
  <Input id="project-name" type="text" required />
</Story>

<!-- AC-60: Radio inside Field receives aria-invalid + aria-describedby from context -->
<Story name="Auto ARIA Wiring — Radio"
  args={{ label: "Module type", inputId: "radio-ac60", error: "Select one option." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole("radio");
    await expect(radio.getAttribute("aria-invalid")).toBe("true");
    await expect(radio.getAttribute("aria-describedby")).toBe("radio-ac60-hint");
    const hint = canvas.getByText("Select one option.");
    await expect(hint).toBeVisible();
  }}>
  <Radio name="mod" value="osc" label="Oscillator" />
</Story>
