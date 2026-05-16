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

<!-- AC-70: "Basic" story — table role, column headers, cell content -->
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

    // AC-51: table element with class dxl-table
    const table = canvas.getByRole("table") as HTMLElement;
    await expect(table).toBeVisible();
    await expect(table).toHaveClass("dxl-table");

    // AC-54: three <th scope="col"> elements
    const headers = canvas.getAllByRole("columnheader");
    await expect(headers.length).toBe(3);
    await expect(canvas.getByRole("columnheader", { name: /id/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /product/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /category/i })).toBeVisible();

    // AC-70: cell content visible
    await expect(canvas.getByRole("cell", { name: "CONDUIT-PDX2" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "Conduit PDX-2" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "Power" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "DISTRANS-AR1" })).toBeVisible();

    // AC-70: exactly 3 th and 6 td elements
    const allTh = canvasElement.querySelectorAll("th");
    await expect(allTh.length).toBe(3);
    const allTd = canvasElement.querySelectorAll("td");
    await expect(allTd.length).toBe(6);

    // AC-52: border-collapse: collapse
    await expect(getComputedStyle(table).borderCollapse).toBe("collapse");

    // AC-53: font-family includes mono/JetBrains
    const fontFamily = getComputedStyle(table).fontFamily.toLowerCase();
    await expect(fontFamily.includes("jetbrains") || fontFamily.includes("mono")).toBe(true);
  }} />

<!-- AC-71: "With Caption" story -->
<Story name="With Caption"
  args={{
    headers: ['ID', 'Product', 'Category'],
    rows: [['CONDUIT-PDX2', 'Conduit PDX-2', 'Power']],
    caption: 'Product inventory',
  }}
  play={async ({ canvasElement }) => {
    // AC-64: <caption> element is present with correct text
    const caption = canvasElement.querySelector("caption");
    await expect(caption).not.toBeNull();
    await expect(caption!.textContent!.trim()).toBe("Product inventory");
  }} />

<!-- AC-72: "Empty rows" story -->
<Story name="Empty rows"
  args={{
    headers: ['Col A', 'Col B'],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Headers still render
    await expect(canvas.getByRole("columnheader", { name: /col a/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /col b/i })).toBeVisible();

    // AC-67: tbody is empty — no <tr> children
    const tbody = canvasElement.querySelector("tbody") as HTMLElement;
    await expect(tbody).not.toBeNull();
    const rows = tbody.querySelectorAll("tr");
    await expect(rows.length).toBe(0);

    // AC-65: no <caption> when caption prop is omitted
    const caption = canvasElement.querySelector("caption");
    await expect(caption).toBeNull();
  }} />

<!-- AC-55 / AC-56 / AC-57 / AC-58: Header cell computed styles -->
<Story name="Header cell styles"
  args={{
    headers: ['Name', 'Value'],
    rows: [['Alpha', '1']],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const th = canvas.getByRole("columnheader", { name: /name/i }) as HTMLElement;
    const style = getComputedStyle(th);

    // AC-55: text-transform uppercase, font-weight 700
    await expect(style.textTransform).toBe("uppercase");
    await expect(style.fontWeight).toBe("700");

    // AC-56: color resolves to var(--ink-faint)
    const inkFaint = resolveTokenFgColor("--ink-faint");
    await expect(style.color).toBe(inkFaint);

    // AC-57: border-bottom resolves to var(--rule-strong), solid
    const ruleStrong = resolveTokenFgColor("--rule-strong");
    await expect(style.borderBottomColor).toBe(ruleStrong);
    await expect(style.borderBottomStyle).toBe("solid");

    // AC-58: font-size 10px, letter-spacing 0.1em
    await expect(style.fontSize).toBe("10px");
    await expect(style.letterSpacing).toBe("1px"); // 0.1em of 10px = 1px
  }} />

<!-- AC-60 / AC-61 / AC-62: Body cell computed styles -->
<Story name="Body cell styles"
  args={{
    headers: ['Name', 'Value'],
    rows: [['Alpha', '1']],
  }}
  play={async ({ canvasElement, userEvent }) => {
    const td = canvasElement.querySelector("td") as HTMLElement;
    await expect(td).not.toBeNull();
    const style = getComputedStyle(td);

    // AC-61: color resolves to var(--ink-dim)
    const inkDim = resolveTokenFgColor("--ink-dim");
    await expect(style.color).toBe(inkDim);

    // AC-62: vertical-align: middle
    await expect(style.verticalAlign).toBe("middle");

    // AC-60: border-bottom is dashed
    await expect(style.borderBottomStyle).toBe("dashed");
    await expect(style.borderBottomWidth).toBe("1px");

    // AC-63: hovering a tbody tr causes td background to resolve to var(--bg-rail)
    await userEvent.hover(td);
    const bgRail = resolveTokenColor("--bg-rail");
    await expect(getComputedStyle(td).backgroundColor).toBe(bgRail);
  }} />

<!-- AC-68: Attribute forwarding -->
<Story name="Attribute forwarding"
  args={{
    headers: ['Col'],
    'aria-label': 'Test table',
  }}
  play={async ({ canvasElement }) => {
    const table = canvasElement.querySelector("table.dxl-table") as HTMLElement;
    await expect(table).not.toBeNull();
    await expect(table.getAttribute("aria-label")).toBe("Test table");
  }} />
