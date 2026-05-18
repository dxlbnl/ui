<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Alert from "./Alert.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/Alert",
    component: Alert,
    tags: ["autodocs"],
  });
</script>

<!-- AC-5: success variant — borderLeftColor matches --ok token -->
<Story
  name="Ok"
  args={{ variant: "success", title: "Build successful", message: "All rails nominal." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-9: root element has NO role attribute
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    await expect(alertEl!.getAttribute("role")).toBeNull();

    // title and message visible
    await expect(canvas.getByText("Build successful")).toBeVisible();
    await expect(canvas.getByText("All rails nominal.")).toBeVisible();

    // .alert-tag glyph present with aria-hidden
    const tag = canvas.getByText("ok");
    await expect(tag).toHaveAttribute("aria-hidden", "true");

    // AC-5: borderLeftColor matches --ok
    const okColor = resolveTokenFgColor("--ok");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(okColor);
  }}
/>

<!-- AC-6: warning variant — borderLeftColor matches --amber token -->
<Story
  name="Amber"
  args={{ variant: "warning", title: "High load", message: "+12V rail at 88%." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-9: no role attribute
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    await expect(alertEl!.getAttribute("role")).toBeNull();

    await expect(canvas.getByText("High load")).toBeVisible();

    // .alert-tag glyph for warning
    const tag = canvas.getByText("!!");
    await expect(tag).toHaveAttribute("aria-hidden", "true");

    // AC-6: borderLeftColor matches --amber
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(amberColor);
  }}
/>

<!-- AC-7: error variant — borderLeftColor matches --danger token -->
<Story
  name="Danger"
  args={{ variant: "error", title: "Thermal fault", message: "Over-temperature protection triggered." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-9: no role attribute
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    await expect(alertEl!.getAttribute("role")).toBeNull();

    await expect(canvas.getByText("Thermal fault")).toBeVisible();

    // .alert-tag glyph for error
    const tag = canvas.getByText("err");
    await expect(tag).toHaveAttribute("aria-hidden", "true");

    // AC-7: borderLeftColor matches --danger
    const dangerColor = resolveTokenFgColor("--danger");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(dangerColor);
  }}
/>

<!-- AC-8: info variant — borderLeftColor matches --cyan token -->
<Story
  name="Info"
  args={{ variant: "info", title: "Firmware update available", message: "v2.1.0 → v2.2.0." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-9: no role attribute
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    await expect(alertEl!.getAttribute("role")).toBeNull();

    await expect(canvas.getByText("Firmware update available")).toBeVisible();

    // .alert-tag glyph for info
    const tag = canvas.getByText("inf");
    await expect(tag).toHaveAttribute("aria-hidden", "true");

    // AC-8: borderLeftColor matches --cyan
    const cyanColor = resolveTokenFgColor("--cyan");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(cyanColor);
  }}
/>

<!-- AC-11: when title is absent/empty, .alert-title is not visible -->
<Story
  name="No Title"
  args={{ variant: "success", message: "Status OK — no title provided." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();

    // AC-11: no .alert-title text visible when title is absent
    const titleEl = canvasElement.querySelector(".alert-title");
    // Either the element is absent, or it has no visible text
    if (titleEl) {
      await expect(titleEl.textContent?.trim()).toBeFalsy();
    }

    await expect(canvas.getByText("Status OK — no title provided.")).toBeVisible();
  }}
/>
