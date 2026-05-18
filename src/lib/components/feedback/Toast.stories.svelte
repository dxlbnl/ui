<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Toast from "./Toast.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Toast",
    component: Toast,
    tags: ["autodocs"],
  });
</script>

<!-- AC-13: success variant — title "Build complete", .alert-tag "ok", borderLeftColor on .alert -->
<Story
  name="Success"
  args={{
    id: "toast-1",
    title: "Build complete",
    message: "Build completed successfully.",
    variant: "success",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-12: Toast wrapper keeps role="status"
    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    // AC-11: .alert-title visible with the title text
    const titleEl = canvasElement.querySelector(".alert-title");
    await expect(titleEl).not.toBeNull();
    await expect(titleEl!.textContent!.trim()).toBe("Build complete");

    // message text visible
    await expect(
      canvas.getByText("Build completed successfully."),
    ).toBeVisible();

    // AC-16: dismiss button still present (rendered by Toast, not Alert)
    const closeBtn = canvas.getByRole("button", {
      name: /Dismiss notification/i,
    });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();

    // AC-13: .alert-tag (not .toast-icon) with text "ok"
    const tag = canvasElement.querySelector(".alert-tag");
    await expect(tag).not.toBeNull();
    await expect(tag!.getAttribute("aria-hidden")).toBe("true");
    await expect(tag!.textContent!.trim()).toBe("ok");

    // AC-17: borderLeftColor on .alert child element, not Toast root
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    const okColor = resolveTokenFgColor("--ok");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(okColor);
  }}
/>

<!-- AC-14: warning variant — title "High load", .alert-tag "!!", borderLeftColor on .alert -->
<Story
  name="Warning"
  args={{
    id: "toast-2",
    title: "High load",
    message: "+12V rail at 88% capacity.",
    variant: "warning",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-12: Toast wrapper keeps role="status"
    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    // AC-11: .alert-title visible
    const titleEl = canvasElement.querySelector(".alert-title");
    await expect(titleEl).not.toBeNull();
    await expect(titleEl!.textContent!.trim()).toBe("High load");

    // message text visible
    await expect(canvas.getByText(/12V rail at 88%/i)).toBeVisible();

    // AC-16: dismiss button still present
    const closeBtn = canvas.getByRole("button", {
      name: /Dismiss notification/i,
    });
    await expect(closeBtn).toBeVisible();

    // AC-14: .alert-tag with text "!!"
    const tag = canvasElement.querySelector(".alert-tag");
    await expect(tag).not.toBeNull();
    await expect(tag!.textContent!.trim()).toBe("!!");

    // AC-17: borderLeftColor on .alert child element
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(amberColor);
  }}
/>

<!-- AC-15: error variant — title "Fault", .alert-tag "err", role="alert", borderLeftColor on .alert -->
<Story
  name="Error"
  args={{
    id: "toast-3",
    title: "Fault",
    message: "Thermal protection triggered.",
    variant: "error",
    ondismiss: () => {},
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-12: error variant keeps role="alert" on Toast wrapper
    const toast = canvas.getByRole("alert");
    await expect(toast).toBeVisible();

    // AC-11: .alert-title visible
    const titleEl = canvasElement.querySelector(".alert-title");
    await expect(titleEl).not.toBeNull();
    await expect(titleEl!.textContent!.trim()).toBe("Fault");

    // message text visible
    await expect(
      canvas.getByText("Thermal protection triggered."),
    ).toBeVisible();

    // AC-12: aria-live="assertive" on Toast wrapper
    await expect(toast.getAttribute("aria-live")).toBe("assertive");

    // AC-16: dismiss button still present
    const closeBtn = canvas.getByRole("button", {
      name: /Dismiss notification/i,
    });
    await expect(closeBtn).toBeVisible();

    // AC-15: .alert-tag with text "err"
    const tag = canvasElement.querySelector(".alert-tag");
    await expect(tag).not.toBeNull();
    await expect(tag!.textContent!.trim()).toBe("err");

    // AC-17: borderLeftColor on .alert child element
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    const dangerColor = resolveTokenFgColor("--danger");
    await expect(getComputedStyle(alertEl!).borderLeftColor).toBe(dangerColor);
  }}
/>

<!-- AC-16: clicking dismiss button calls ondismiss without error -->
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

    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    // AC-16: dismiss button rendered by Toast
    const closeBtn = canvas.getByRole("button", {
      name: /Dismiss notification/i,
    });
    await expect(closeBtn).toBeVisible();

    // clicking should not throw
    await userEvent.click(closeBtn);
    await expect(closeBtn).toBeInTheDocument();
  }}
/>

<!-- max-width constraint still 400px after refactor -->
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

    const toast = canvas.getByRole("status");
    await expect(toast).toBeVisible();

    await expect(
      canvas.getByText(
        "This is a longer notification message that tests how the toast handles wrapping text within its maximum width constraint.",
      ),
    ).toBeVisible();

    await expect(getComputedStyle(toast).maxWidth).toBe("400px");
  }}
/>

<!-- AC-12: ARIA attributes (role, aria-live, aria-atomic) stay on Toast wrapper -->
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

    // AC-12: aria-live="polite" on Toast wrapper (success/warning)
    const toast = canvas.getByRole("status");
    await expect(toast.getAttribute("aria-live")).toBe("polite");

    // AC-12: aria-atomic="true" on Toast wrapper
    await expect(toast.getAttribute("aria-atomic")).toBe("true");

    // AC-12: role is on Toast wrapper, NOT inside Alert
    // Verify the .alert child element has no role attribute
    const alertEl = canvasElement.querySelector(".alert");
    await expect(alertEl).not.toBeNull();
    await expect(alertEl!.getAttribute("role")).toBeNull();

    // AC-11: when no title passed, .alert-title has no visible text
    const titleEl = canvasElement.querySelector(".alert-title");
    if (titleEl) {
      await expect(titleEl.textContent?.trim()).toBeFalsy();
    }
  }}
/>
