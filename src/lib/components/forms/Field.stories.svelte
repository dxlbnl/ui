<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Field from "./Field.svelte";
  import Input from "./Input.svelte";
  import Textarea from "./Textarea.svelte";
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
