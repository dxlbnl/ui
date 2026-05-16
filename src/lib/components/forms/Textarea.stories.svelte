<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Textarea from "./Textarea.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Forms/Textarea",
    component: Textarea,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ placeholder: "What changed, what broke, what shipped…" }}
  play={async ({ canvasElement }) => {
    const ta = within(canvasElement).getByRole("textbox");
    await expect(ta).toBeVisible();
    await expect(getComputedStyle(ta).resize).toBe("vertical");
    await expect(getComputedStyle(ta).minHeight).toBe("60px");
  }} />

<Story name="With Content" args={{ value: "Conduit arrived. Rail draws 62mA @ +12V." }}
  play={async ({ canvasElement }) => {
    const ta = within(canvasElement).getByRole("textbox");
    await expect(ta).toHaveValue("Conduit arrived. Rail draws 62mA @ +12V.");
  }} />

<Story name="Error State" args={{ error: true, value: "Bad data" }}
  play={async ({ canvasElement }) => {
    const ta = within(canvasElement).getByRole("textbox");
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(ta).borderColor).toBe(dangerColor);
  }} />

<Story name="Disabled" args={{ disabled: true, value: "Locked content" }}
  play={async ({ canvasElement }) => {
    const ta = within(canvasElement).getByRole("textbox");
    await expect(ta).toBeDisabled();
    await expect(getComputedStyle(ta).opacity).toBe("0.4");
  }} />
