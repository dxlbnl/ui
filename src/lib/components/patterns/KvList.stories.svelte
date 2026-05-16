<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import KvList from "./KvList.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/KvList",
    component: KvList,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ items: [{ key: "+12V Output", value: "3.0A" }, { key: "-12V Output", value: "1.5A" }, { key: "Efficiency", value: ">92%", color: "amber" }, { key: "Width", value: "4 HP" }] }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.firstElementChild;
    await expect(root).toBeVisible();
    await expect(canvas.getByText(/\+12V Output/i)).toBeVisible();
    await expect(canvas.getByText("3.0A")).toBeVisible();
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(canvas.getByText(">92%")).color).toBe(amberColor);
    const rows = canvasElement.querySelectorAll(".kv-row");
    await expect(rows.length).toBe(4);
    const lastRow = rows[rows.length - 1];
    await expect(getComputedStyle(lastRow).borderBottomStyle).toBe("none");
  }} />

<Story name="Single Item" args={{ items: [{ key: "Status", value: "Nominal", color: "ok" }] }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvasElement.querySelectorAll(".kv-row");
    await expect(rows.length).toBe(1);
    const okColor = resolveTokenFgColor("--ok");
    await expect(getComputedStyle(canvas.getByText("Nominal")).color).toBe(okColor);
    await expect(getComputedStyle(rows[0]).borderBottomStyle).toBe("none");
  }} />

<Story name="All Colors" args={{ items: [{ key: "Ok", value: "Pass", color: "ok" }, { key: "Amber", value: "Warn", color: "amber" }, { key: "Danger", value: "Fail", color: "danger" }, { key: "Cyan", value: "Info", color: "cyan" }, { key: "Default", value: "Normal" }] }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvasElement.querySelectorAll(".kv-row");
    await expect(rows.length).toBe(5);
    const okColor = resolveTokenFgColor("--ok");
    await expect(getComputedStyle(canvas.getByText("Pass")).color).toBe(okColor);
    const inkColor = resolveTokenFgColor("--ink");
    await expect(getComputedStyle(canvas.getByText("Normal")).color).toBe(inkColor);
  }} />
