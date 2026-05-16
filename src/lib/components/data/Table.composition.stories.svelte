<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Table from "./Table.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  // No component: — this file covers the custom-rows (children snippet) story
  // which renders <Table> directly in the slot with <tr> children containing
  // sub-components (TagPill). Cannot use component: Table here because
  // the children prop is a Snippet and cannot be passed via args.
  const { Story } = defineMeta({
    title: "Data/Table Composition",
    tags: ["autodocs"],
  });
</script>

<!-- AC-66: "Custom rows (snippet)" — children prop overrides rows; TagPill renders inside a cell -->
<Story name="Custom rows (snippet)"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-51: table element exists
    const table = canvas.getByRole("table");
    await expect(table).toBeVisible();

    // AC-66: children snippet renders inside tbody; rows prop is ignored
    const tbody = canvasElement.querySelector("tbody") as HTMLElement;
    await expect(tbody).not.toBeNull();
    const rows = tbody.querySelectorAll("tr");
    await expect(rows.length).toBe(2);

    // TagPill text is visible inside a cell (AC-66: snippet slot renders)
    await expect(canvas.getByText("Power")).toBeVisible();
    await expect(canvas.getByText("Envelope")).toBeVisible();

    // Column headers still present
    await expect(canvas.getByRole("columnheader", { name: /id/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /product/i })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: /category/i })).toBeVisible();

    // rows prop data should NOT appear (children overrides rows)
    const ignoredCells = canvasElement.querySelectorAll("td");
    let foundIgnored = false;
    for (const td of ignoredCells) {
      if (td.textContent?.includes("IGNORED-ROW")) {
        foundIgnored = true;
        break;
      }
    }
    await expect(foundIgnored).toBe(false);
  }}>
  <Table
    headers={['ID', 'Product', 'Category']}
    rows={[['IGNORED-ROW', 'Should not appear', 'None']]}
  >
    <tr>
      <td>CONDUIT-PDX2</td>
      <td>Conduit PDX-2</td>
      <td><TagPill>Power</TagPill></td>
    </tr>
    <tr>
      <td>DISTRANS-AR1</td>
      <td>Distrans AR-1</td>
      <td><TagPill variant="amber">Envelope</TagPill></td>
    </tr>
  </Table>
</Story>
