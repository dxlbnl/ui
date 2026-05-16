<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import InputWrap from "./InputWrap.svelte";
  import Input from "./Input.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Forms/InputWrap",
    component: InputWrap,
    tags: ["autodocs"],
  });
</script>

<!-- addonPre: slot holds the Input child; InputWrap wraps it with the addon -->
<Story name="Addon Prefix" args={{ addonPre: "+12V" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addonEl = canvas.getByText("+12V");
    await expect(addonEl).toBeVisible();
    const bgElev = resolveTokenColor("--bg-elev");
    await expect(getComputedStyle(addonEl).backgroundColor).toBe(bgElev);
    await expect(canvas.getByRole("spinbutton")).toBeVisible();
  }}>
  <Input type="number" value="75" />
</Story>

<Story name="Addon Suffix" args={{ addonSuf: "mA" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addonEl = canvas.getByText("mA");
    await expect(addonEl).toBeVisible();
  }}>
  <Input type="number" value="62" />
</Story>

<Story name="Clearable — No Value" args={{ clearable: true, value: "" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clearBtn = canvas.getByRole("button", { name: "Clear" });
    await expect(clearBtn).not.toBeVisible();
  }}>
  <Input type="text" />
</Story>

<Story name="Clearable — With Value" args={{ clearable: true, value: "DISTRANS-AR1" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clearBtn = canvas.getByRole("button", { name: "Clear" });
    await expect(clearBtn).toBeVisible();
  }}>
  <Input type="text" value="DISTRANS-AR1" />
</Story>
