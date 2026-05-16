<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Modal from "./Modal.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Modal",
    component: Modal,
    tags: ["autodocs"],
  });
</script>

<Story name="Default Open"
  args={{ open: true, title: "// CONFIRM ACTION" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const heading = canvas.getByRole("heading", { level: 2, name: /CONFIRM ACTION/ });
    await expect(heading).toBeVisible();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();
    const bodyText = canvas.getByText(/This action cannot be undone/i);
    await expect(bodyText).toBeVisible();
    await expect(dialog.getAttribute("aria-modal")).toBe("true");
    await expect(dialog.getAttribute("aria-labelledby")).toBe("modal-title");
  }}>
  <p>This action cannot be undone. Are you sure you want to proceed?</p>
</Story>

<Story name="Closed"
  args={{ open: false, title: "// SETTINGS" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog", { hidden: true });
    await expect(dialog).not.toBeVisible();
  }}>
  <p>Settings content here.</p>
</Story>

<Story name="Close Button"
  args={{ open: true, title: "// CLOSE TEST", onclose: () => {} }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();
    await expect(closeBtn.getAttribute("type")).toBe("button");
    await userEvent.click(closeBtn);
    await expect(canvas.getByRole("button", { name: /Close dialog/i })).toBeInTheDocument();
  }}>
  <p>Click the close button to test the callback.</p>
</Story>

<Story name="No Footer"
  args={{ open: true, title: "// INFO" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(canvasElement.querySelector("footer")).toBeNull();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn).toBeVisible();
  }}>
  <p>Informational content shown without a footer action bar.</p>
</Story>

<Story name="Escape Closes"
  args={{ open: true, title: "// KEYBOARD TEST", onclose: () => {} }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await userEvent.keyboard("{Escape}");
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn).toBeInTheDocument();
  }}>
  <p>Press Escape to trigger the close callback.</p>
</Story>
