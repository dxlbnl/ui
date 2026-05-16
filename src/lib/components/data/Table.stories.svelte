<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Table from "./Table.svelte";

  const { Story } = defineMeta({
    title: "Data/Table",
    component: Table,
    tags: ["autodocs"],
  });
</script>

<Story name="Basic"
  args={{
    headers: ['ID', 'Product', 'Category'],
    rows: [
      ['CONDUIT-PDX2', 'Conduit PDX-2', 'Power'],
      ['DISTRANS-AR1', 'Distrans AR-1', 'Envelope'],
    ]
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const table = canvas.getByRole("table");
    await expect(table).toBeVisible();
    await expect(table).toHaveClass("dxl-table");

    const headers = canvas.getAllByRole("columnheader");
    await expect(headers.length).toBe(3);
    await expect(canvas.getByRole("columnheader", { name: /id/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /product/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /category/i })).toBeVisible();

    await expect(canvas.getByRole("cell", { name: "CONDUIT-PDX2" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "Conduit PDX-2" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "Power" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "DISTRANS-AR1" })).toBeVisible();

    const allTh = canvasElement.querySelectorAll("th");
    await expect(allTh.length).toBe(3);
    const allTd = canvasElement.querySelectorAll("td");
    await expect(allTd.length).toBe(6);

    await expect(getComputedStyle(table).borderCollapse).toBe("collapse");

    const fontFamily = getComputedStyle(table).fontFamily.toLowerCase();
    await expect(fontFamily.includes("jetbrains") || fontFamily.includes("mono")).toBe(true);
  }} />

<Story name="With Caption"
  args={{
    headers: ['ID', 'Product', 'Category'],
    rows: [['CONDUIT-PDX2', 'Conduit PDX-2', 'Power']],
    caption: 'Product inventory',
  }}
  play={async ({ canvasElement }) => {
    const caption = canvasElement.querySelector("caption");
    await expect(caption).not.toBeNull();
    await expect(caption!.textContent!.trim()).toBe("Product inventory");
  }} />

<Story name="Empty rows"
  args={{
    headers: ['Col A', 'Col B'],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("columnheader", { name: /col a/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /col b/i })).toBeVisible();

    const tbody = canvasElement.querySelector("tbody");
    await expect(tbody).not.toBeNull();
    const rows = tbody!.querySelectorAll("tr");
    await expect(rows.length).toBe(0);

    const caption = canvasElement.querySelector("caption");
    await expect(caption).toBeNull();
  }} />

<Story name="Header cell styles"
  args={{
    headers: ['Name', 'Value'],
    rows: [['Alpha', '1']],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const th = canvas.getByRole("columnheader", { name: /name/i });
    const style = getComputedStyle(th);

    await expect(style.textTransform).toBe("uppercase");
    await expect(style.fontWeight).toBe("700");

    const inkFaint = resolveTokenFgColor("--ink-faint");
    await expect(style.color).toBe(inkFaint);

    const ruleStrong = resolveTokenFgColor("--rule-strong");
    await expect(style.borderBottomColor).toBe(ruleStrong);
    await expect(style.borderBottomStyle).toBe("solid");

    await expect(style.fontSize).toBe("10px");
    await expect(style.letterSpacing).toBe("1px");
  }} />

<Story name="Body cell styles"
  args={{
    headers: ['Name', 'Value'],
    rows: [['Alpha', '1']],
  }}
  play={async ({ canvasElement }) => {
    const td = canvasElement.querySelector("td");
    await expect(td).not.toBeNull();
    const style = getComputedStyle(td!);

    const inkDim = resolveTokenFgColor("--ink-dim");
    await expect(style.color).toBe(inkDim);

    await expect(style.verticalAlign).toBe("middle");

    await expect(style.borderBottomStyle).toBe("dashed");
    await expect(style.borderBottomWidth).toBe("1px");

    // On hover: tbody tr:hover td { background: var(--bg-rail) } — visual documentation only;
    // CSS :hover pseudo-class is not reliably triggered in Vitest browser mode.
  }} />

<Story name="Attribute forwarding"
  args={{
    headers: ['Col'],
    'aria-label': 'Test table',
  }}
  play={async ({ canvasElement }) => {
    const table = canvasElement.querySelector("table.dxl-table");
    await expect(table).not.toBeNull();
    await expect(table!.getAttribute("aria-label")).toBe("Test table");
  }} />
