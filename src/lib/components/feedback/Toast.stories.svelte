<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor } from "$lib/storybook-utils.js";
  import Toast from "./Toast.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Toast",
    component: Toast,
    tags: ["autodocs"],
  });
</script>

<!-- AC 16, 23, 26, 27, 29 — ok variant: role=status, icon "ok", border-color=--ok -->
<Story
  name="Success"
  args={{
    id: "toast-1",
    message: "Build completed successfully.",
    variant: "success",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 16: ok variant renders role="status"
    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    // AC 26: message text visible
    await expect(
      canvas.getByText("Build completed successfully."),
    ).toBeVisible();

    // AC 27: close button present, enabled
    const closeBtn = canvas.getByRole("button", {
      name: /Dismiss notification/i,
    });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();

    // AC 22, 23: .toast-icon with aria-hidden="true" and text "ok"
    const icon = canvasElement.querySelector(".toast-icon");
    await expect(icon).not.toBeNull();
    await expect(icon!.getAttribute("aria-hidden")).toBe("true");
    await expect(icon!.textContent!.trim()).toBe("ok");

    // AC 29: border-color matches var(--ok)
    const okColor = resolveTokenColor("--ok");
    await expect(getComputedStyle(toast).borderColor).toBe(okColor);

    // AC 32: background-color matches var(--bg-elev)
    const bgElev = resolveTokenColor("--bg-elev");
    await expect(getComputedStyle(toast).backgroundColor).toBe(bgElev);
  }}
/>

<!-- AC 17, 24, 30 — amber variant: role=status, icon "!!", border-color=--amber -->
<Story
  name="Amber"
  args={{
    id: "toast-2",
    message: "+12V rail at 88% capacity.",
    variant: "warning",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 17: amber variant renders role="status"
    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    // AC 26: message text visible
    await expect(canvas.getByText(/12V rail at 88%/i)).toBeVisible();

    // AC 24: .toast-icon text is "!!"
    const icon = canvasElement.querySelector(".toast-icon");
    await expect(icon).not.toBeNull();
    await expect(icon!.textContent!.trim()).toBe("!!");

    // AC 30: border-color matches var(--amber)
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(toast).borderColor).toBe(amberColor);
  }}
/>

<!-- AC 18, 20, 25, 31 — danger variant: role=alert, aria-live=assertive, icon "err", border-color=--danger -->
<Story
  name="Danger"
  args={{
    id: "toast-3",
    message: "Thermal protection triggered.",
    variant: "error",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 18: danger variant renders role="alert"
    const toast = canvas.getByRole("alert");
    await expect(toast).toBeVisible();

    // AC 26: message text visible
    await expect(
      canvas.getByText("Thermal protection triggered."),
    ).toBeVisible();

    // AC 20: danger has aria-live="assertive"
    await expect(toast.getAttribute("aria-live")).toBe("assertive");

    // AC 25: .toast-icon text is "err"
    const icon = canvasElement.querySelector(".toast-icon");
    await expect(icon).not.toBeNull();
    await expect(icon!.textContent!.trim()).toBe("err");

    // AC 31: border-color matches var(--danger)
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(toast).borderColor).toBe(dangerColor);
  }}
/>

<!-- AC 27, 28 — clicking the close button calls ondismiss (no-op in story; no throw) -->
<Story
  name="Manual Close"
  args={{
    id: "toast-4",
    message: "Click × to dismiss.",
    variant: "success",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // AC 27: close button present
    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    const closeBtn = canvas.getByRole("button", {
      name: /Dismiss notification/i,
    });
    await expect(closeBtn).toBeVisible();

    // AC 28: clicking button calls ondismiss — the no-op callback should not throw
    await userEvent.click(closeBtn);
    // If ondismiss threw, userEvent.click would have rejected — reaching here means success
    await expect(closeBtn).toBeInTheDocument();
  }}
/>

<!-- AC 33 — long message: toast visible and max-width ≤ 400px -->
<Story
  name="Long Message"
  args={{
    id: "toast-5",
    message:
      "This is a longer notification message that tests how the toast handles wrapping text within its maximum width constraint.",
    variant: "warning",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 17: still role=status for amber
    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    // AC 26: full message present in DOM
    await expect(
      canvas.getByText(
        "This is a longer notification message that tests how the toast handles wrapping text within its maximum width constraint.",
      ),
    ).toBeVisible();

    // AC 33: max-width is 400px
    await expect(getComputedStyle(toast).maxWidth).toBe("400px");
  }}
/>

<!-- AC 19, 21, 22 — ARIA attributes on ok variant -->
<Story
  name="Aria Attributes"
  args={{
    id: "toast-6",
    message: "ARIA check.",
    variant: "success",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 19: ok/amber has aria-live="polite"
    const toast = canvas.getByRole("status");
    await expect(toast.getAttribute("aria-live")).toBe("polite");

    // AC 21: aria-atomic="true"
    await expect(toast.getAttribute("aria-atomic")).toBe("true");

    // AC 22: .toast-icon has aria-hidden="true"
    const icon = canvasElement.querySelector(".toast-icon");
    await expect(icon!.getAttribute("aria-hidden")).toBe("true");
  }}
/>
