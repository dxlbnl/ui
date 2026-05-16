<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ActivityRow from "./ActivityRow.svelte";

  const { Story } = defineMeta({
    title: "Patterns/ActivityRow",
    tags: ["autodocs"],
  });
</script>

<Story name="Activity Feed"
  play={async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll(".activity-row");
    await expect(rows.length).toBe(3);
    const lastRow = rows[rows.length - 1];
    await expect(getComputedStyle(lastRow).borderBottomStyle).toBe("none");
  }}>
  <div style="border: 1px solid var(--rule); padding: 0 14px;">
    <ActivityRow timestamp="14:22" description="PDX-2 thermal check passed" status="ok" />
    <ActivityRow timestamp="13:55" description="New order: #DXL-0044" status="amber" />
    <ActivityRow timestamp="09:30" description="System boot — all rails nominal" status="ok" />
  </div>
</Story>
