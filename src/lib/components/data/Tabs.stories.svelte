<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Tabs from "./Tabs.svelte";

  // No component: — Tabs requires Snippet values for tab.panel,
  // which cannot be passed through plain args. Full <Tabs> is rendered
  // in each story slot (composition pattern).
  const { Story } = defineMeta({
    title: "Data/Tabs",
    tags: ["autodocs"],
  });
</script>

<!-- AC-46: "Underline" story — tablist, aria-selected, panel visibility -->
<Story name="Underline"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-25: tab bar has role="tablist"
    const tablist = canvas.getByRole("tablist");
    await expect(tablist).toBeVisible();

    // AC-24: root div has class tabs and tabs--underline
    const root = canvasElement.querySelector(".tabs") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toHaveClass("tabs--underline");

    // AC-26: each tab is a button with role="tab"
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs.length).toBe(3);

    // AC-29: first tab (Overview) is active by default
    const overviewTab = canvas.getByRole("tab", { name: /overview/i });
    await expect(overviewTab).toHaveAttribute("aria-selected", "true");

    // AC-30: other tabs are inactive
    const specsTab = canvas.getByRole("tab", { name: /specs/i });
    await expect(specsTab).toHaveAttribute("aria-selected", "false");
    const notesTab = canvas.getByRole("tab", { name: /notes/i });
    await expect(notesTab).toHaveAttribute("aria-selected", "false");

    // AC-27: each tab has id="tab-{id}"
    await expect(overviewTab.getAttribute("id")).toBe("tab-overview");
    await expect(specsTab.getAttribute("id")).toBe("tab-specs");

    // AC-28: each tab has aria-controls="panel-{id}"
    await expect(overviewTab.getAttribute("aria-controls")).toBe("panel-overview");

    // AC-31: panels have role="tabpanel", id, aria-labelledby
    const overviewPanel = canvasElement.querySelector("#panel-overview") as HTMLElement;
    await expect(overviewPanel).not.toBeNull();
    await expect(overviewPanel.getAttribute("role")).toBe("tabpanel");
    await expect(overviewPanel.getAttribute("aria-labelledby")).toBe("tab-overview");

    // AC-32: active panel is visible (no hidden attribute)
    await expect(overviewPanel.hasAttribute("hidden")).toBe(false);
    await expect(within(overviewPanel).getByText(/Overview panel content/)).toBeVisible();

    // AC-33: inactive panels have hidden attribute
    const specsPanel = canvasElement.querySelector("#panel-specs") as HTMLElement;
    await expect(specsPanel.hasAttribute("hidden")).toBe(true);
    const notesPanel = canvasElement.querySelector("#panel-notes") as HTMLElement;
    await expect(notesPanel.hasAttribute("hidden")).toBe(true);
  }}>
  {#snippet children()}
    {#snippet overviewPanel()}
      <p>Overview panel content — introducing the system.</p>
    {/snippet}
    {#snippet specsPanel()}
      <p>Technical specifications go here.</p>
    {/snippet}
    {#snippet notesPanel()}
      <p>Design notes and rationale.</p>
    {/snippet}
    <Tabs tabs={[
      { id: 'overview', label: 'Overview', panel: overviewPanel },
      { id: 'specs',    label: 'Specs',    panel: specsPanel },
      { id: 'notes',   label: 'Notes',    panel: notesPanel },
    ]} />
  {/snippet}
</Story>

<!-- AC-48: "Pill variant" story -->
<Story name="Pill variant"
  play={async ({ canvasElement }) => {
    // AC-24: root has tabs--pill class
    const root = canvasElement.querySelector(".tabs") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toHaveClass("tabs--pill");

    // AC-40: active tab background resolves to var(--amber)
    const activeTab = within(canvasElement).getByRole("tab", { name: /overview/i });
    await expect(activeTab).toHaveAttribute("aria-selected", "true");
    const amberBg = resolveTokenColor("--amber");
    await expect(getComputedStyle(activeTab).backgroundColor).toBe(amberBg);

    // AC-41: active tab color resolves to var(--bg)
    const bgColor = resolveTokenColor("--bg");
    await expect(getComputedStyle(activeTab).color).toBe(bgColor);
  }}>
  {#snippet children()}
    {#snippet overviewPanel()}
      <p>Overview content.</p>
    {/snippet}
    {#snippet specsPanel()}
      <p>Specs content.</p>
    {/snippet}
    {#snippet notesPanel()}
      <p>Notes content.</p>
    {/snippet}
    <Tabs variant="pill" tabs={[
      { id: 'overview', label: 'Overview', panel: overviewPanel },
      { id: 'specs',    label: 'Specs',    panel: specsPanel },
      { id: 'notes',   label: 'Notes',    panel: notesPanel },
    ]} />
  {/snippet}
</Story>

<!-- AC-47: "Tab switch interaction" story -->
<Story name="Tab switch interaction"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // Initial state: Overview active
    const overviewTab = canvas.getByRole("tab", { name: /overview/i });
    await expect(overviewTab).toHaveAttribute("aria-selected", "true");

    const overviewPanel = canvasElement.querySelector("#panel-overview") as HTMLElement;
    await expect(overviewPanel.hasAttribute("hidden")).toBe(false);

    // AC-34: click Specs tab
    const specsTab = canvas.getByRole("tab", { name: /specs/i });
    await userEvent.click(specsTab);

    // AC-34: Specs tab becomes aria-selected="true"
    await expect(specsTab).toHaveAttribute("aria-selected", "true");

    // AC-34: Overview tab loses aria-selected
    await expect(overviewTab).toHaveAttribute("aria-selected", "false");

    // AC-35: Specs panel becomes visible (no hidden attribute)
    const specsPanel = canvasElement.querySelector("#panel-specs") as HTMLElement;
    await expect(specsPanel.hasAttribute("hidden")).toBe(false);
    await expect(within(specsPanel).getByText(/Technical specifications/)).toBeVisible();

    // AC-35: Overview panel gains hidden attribute
    await expect(overviewPanel.hasAttribute("hidden")).toBe(true);
  }}>
  {#snippet children()}
    {#snippet overviewPanel()}
      <p>This is the overview panel content.</p>
    {/snippet}
    {#snippet specsPanel()}
      <p>Technical specifications go here.</p>
    {/snippet}
    {#snippet notesPanel()}
      <p>Design notes and rationale.</p>
    {/snippet}
    <Tabs tabs={[
      { id: 'overview', label: 'Overview', panel: overviewPanel },
      { id: 'specs',    label: 'Specs',    panel: specsPanel },
      { id: 'notes',   label: 'Notes',    panel: notesPanel },
    ]} />
  {/snippet}
</Story>

<!-- AC-37: "Second tab initially active" story -->
<Story name="Second tab initially active"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-37: second tab has aria-selected="true" on initial render
    const specsTab = canvas.getByRole("tab", { name: /specs/i });
    await expect(specsTab).toHaveAttribute("aria-selected", "true");

    const overviewTab = canvas.getByRole("tab", { name: /overview/i });
    await expect(overviewTab).toHaveAttribute("aria-selected", "false");

    // AC-37: second panel is visible, first is hidden
    const specsPanel = canvasElement.querySelector("#panel-specs") as HTMLElement;
    await expect(specsPanel.hasAttribute("hidden")).toBe(false);

    const overviewPanel = canvasElement.querySelector("#panel-overview") as HTMLElement;
    await expect(overviewPanel.hasAttribute("hidden")).toBe(true);
  }}>
  {#snippet children()}
    {#snippet overviewPanel()}
      <p>Overview content.</p>
    {/snippet}
    {#snippet specsPanel()}
      <p>Specs panel — initially active.</p>
    {/snippet}
    {#snippet notesPanel()}
      <p>Notes content.</p>
    {/snippet}
    <Tabs active="specs" tabs={[
      { id: 'overview', label: 'Overview', panel: overviewPanel },
      { id: 'specs',    label: 'Specs',    panel: specsPanel },
      { id: 'notes',   label: 'Notes',    panel: notesPanel },
    ]} />
  {/snippet}
</Story>

<!-- AC-38 / AC-39: Underline active tab amber border-bottom, inactive transparent -->
<Story name="Underline active border"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-38: active tab border-bottom-color resolves to var(--amber)
    const activeTab = canvas.getByRole("tab", { name: /overview/i }) as HTMLElement;
    await expect(activeTab).toHaveAttribute("aria-selected", "true");
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(activeTab).borderBottomColor).toBe(amberColor);

    // AC-39: inactive tab border-bottom-color is transparent
    const inactiveTab = canvas.getByRole("tab", { name: /specs/i }) as HTMLElement;
    await expect(getComputedStyle(inactiveTab).borderBottomColor).toBe("rgba(0, 0, 0, 0)");
  }}>
  {#snippet children()}
    {#snippet overviewPanel()}
      <p>Overview content.</p>
    {/snippet}
    {#snippet specsPanel()}
      <p>Specs content.</p>
    {/snippet}
    <Tabs tabs={[
      { id: 'overview', label: 'Overview', panel: overviewPanel },
      { id: 'specs',    label: 'Specs',    panel: specsPanel },
    ]} />
  {/snippet}
</Story>

<!-- AC-42 / AC-43: Tab labels use uppercase mono font -->
<Story name="Tab label typography"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole("tab", { name: /overview/i }) as HTMLElement;

    // AC-42: text-transform: uppercase
    await expect(getComputedStyle(tab).textTransform).toBe("uppercase");

    // AC-43: font-family includes mono/JetBrains
    const fontFamily = getComputedStyle(tab).fontFamily.toLowerCase();
    await expect(fontFamily.includes("jetbrains") || fontFamily.includes("mono")).toBe(true);
  }}>
  {#snippet children()}
    {#snippet overviewPanel()}
      <p>Content.</p>
    {/snippet}
    {#snippet specsPanel()}
      <p>Content.</p>
    {/snippet}
    <Tabs tabs={[
      { id: 'overview', label: 'Overview', panel: overviewPanel },
      { id: 'specs',    label: 'Specs',    panel: specsPanel },
    ]} />
  {/snippet}
</Story>

<!-- AC-44: Tabs forwards ...rest attributes to root div -->
<Story name="Attribute forwarding"
  play={async ({ canvasElement }) => {
    const root = canvasElement.querySelector(".tabs") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.getAttribute("id")).toBe("my-tabs");
    await expect(root.getAttribute("aria-label")).toBe("Product information");
  }}>
  {#snippet children()}
    {#snippet panelA()}
      <p>Content A.</p>
    {/snippet}
    <Tabs id="my-tabs" aria-label="Product information" tabs={[
      { id: 'a', label: 'Tab A', panel: panelA },
    ]} />
  {/snippet}
</Story>
