<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Accordion from "./Accordion.svelte";
  import AccordionItem from "./AccordionItem.svelte";

  const { Story } = defineMeta({
    title: "Data/Accordion",
    tags: ["autodocs"],
  });
</script>

<!-- AC-20: "Default" story — three items, first open -->
<Story name="Default"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // All summaries are visible (AC-3: summary is first child of details)
    const summaries = canvasElement.querySelectorAll("summary.acc-trigger");
    await expect(summaries.length).toBe(3);
    for (const s of summaries) {
      await expect(s).toBeVisible();
    }

    // AC-7: first <details> has open attribute on initial render
    const allDetails = canvasElement.querySelectorAll("details.acc-item");
    await expect(allDetails.length).toBe(3);
    await expect(allDetails[0].hasAttribute("open")).toBe(true);

    // AC-8: second and third items do NOT have open attribute
    await expect(allDetails[1].hasAttribute("open")).toBe(false);
    await expect(allDetails[2].hasAttribute("open")).toBe(false);

    // AC-1: Accordion root has class accordion
    const accordionRoot = canvasElement.querySelector(".accordion");
    await expect(accordionRoot).not.toBeNull();

    // AC-2: AccordionItem root has class acc-item
    await expect(allDetails[0]).toHaveClass("acc-item");

    // AC-4: summary contains acc-title span with label text
    const firstTitle = allDetails[0].querySelector(".acc-title");
    await expect(firstTitle).not.toBeNull();
    await expect(firstTitle!.textContent).toContain("Getting Started");

    // AC-5: summary contains acc-icon span with › glyph, aria-hidden="true"
    const firstIcon = allDetails[0].querySelector(".acc-icon");
    await expect(firstIcon).not.toBeNull();
    await expect(firstIcon!.textContent!.trim()).toBe("›");
    await expect(firstIcon!.getAttribute("aria-hidden")).toBe("true");

    // AC-6: body content is in .acc-body sibling of summary
    const firstBody = allDetails[0].querySelector(".acc-body");
    await expect(firstBody).not.toBeNull();
    await expect(firstBody).toBeVisible();

    // AC-10: body content of open item is visible
    await expect(canvas.getByText(/Start by reading the quick-start guide/)).toBeVisible();

    // AC-17: summary has list-style: none (no browser disclosure triangle)
    const firstSummary = allDetails[0].querySelector("summary") as HTMLElement;
    await expect(getComputedStyle(firstSummary).listStyleType).toBe("none");
  }}>
  <Accordion>
    <AccordionItem label="Getting Started" open={true}>
      <p>Start by reading the quick-start guide and familiarising yourself with the token set.</p>
    </AccordionItem>
    <AccordionItem label="Installation">
      <p>Run pnpm install to set up all dependencies.</p>
    </AccordionItem>
    <AccordionItem label="Configuration">
      <p>Edit the tokens file to match your brand palette.</p>
    </AccordionItem>
  </Accordion>
</Story>

<!-- All items closed -->
<Story name="All Closed"
  play={async ({ canvasElement }) => {
    // AC-8: all details elements lack open attribute
    const allDetails = canvasElement.querySelectorAll("details.acc-item");
    await expect(allDetails.length).toBe(3);
    for (const d of allDetails) {
      await expect(d.hasAttribute("open")).toBe(false);
    }
  }}>
  <Accordion>
    <AccordionItem label="Section Alpha">
      <p>Content for Alpha.</p>
    </AccordionItem>
    <AccordionItem label="Section Beta">
      <p>Content for Beta.</p>
    </AccordionItem>
    <AccordionItem label="Section Gamma">
      <p>Content for Gamma.</p>
    </AccordionItem>
  </Accordion>
</Story>

<!-- AC-21: "Toggle Interaction" story — click to open, click again to close -->
<Story name="Toggle Interaction"
  play={async ({ canvasElement, userEvent }) => {
    const details = canvasElement.querySelector("details.acc-item") as HTMLElement;
    await expect(details).not.toBeNull();

    // AC-8: starts closed
    await expect(details.hasAttribute("open")).toBe(false);

    // AC-11 / AC-12 / AC-13: check icon color and trigger bg when CLOSED
    const icon = details.querySelector(".acc-icon") as HTMLElement;
    const faintColor = resolveTokenFgColor("--ink-faint");
    await expect(getComputedStyle(icon).color).toBe(faintColor);

    // AC-9: click summary → details gains open attribute
    const summary = details.querySelector("summary.acc-trigger") as HTMLElement;
    await userEvent.click(summary);
    await expect(details.hasAttribute("open")).toBe(true);

    // AC-10: body content is visible after opening
    const bodyText = within(canvasElement).getByText(/Interact with this item/);
    await expect(bodyText).toBeVisible();

    // AC-11: icon has transform applied when open
    await expect(getComputedStyle(icon).transform).not.toBe("none");

    // AC-12: icon color resolves to var(--amber) when open
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(icon).color).toBe(amberColor);

    // AC-13: trigger background resolves to var(--bg-elev) when open
    const openTrigger = details.querySelector(".acc-trigger") as HTMLElement;
    const bgElev = resolveTokenColor("--bg-elev");
    await waitFor(() => expect(getComputedStyle(openTrigger).backgroundColor).toBe(bgElev));

    // AC-9: click again → details loses open attribute
    await userEvent.click(summary);
    await expect(details.hasAttribute("open")).toBe(false);
  }}>
  <Accordion>
    <AccordionItem label="Toggle Me">
      <p>Interact with this item to test toggle behaviour.</p>
    </AccordionItem>
  </Accordion>
</Story>

<!-- "Rich Body" — open item with structured content in the body -->
<Story name="Rich Body"
  play={async ({ canvasElement }) => {
    // AC-6: body content rendered inside .acc-body
    const body = canvasElement.querySelector(".acc-body");
    await expect(body).not.toBeNull();
    await expect(body).toBeVisible();

    // Body content is accessible
    await expect(within(canvasElement).getByText("VDD")).toBeVisible();
    await expect(within(canvasElement).getByText("+3.3V")).toBeVisible();
    await expect(within(canvasElement).getByText("VCC")).toBeVisible();
    await expect(within(canvasElement).getByText("+5V")).toBeVisible();
  }}>
  <Accordion>
    <AccordionItem label="Power Rails" open={true}>
      <dl style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin:0;">
        <dt>VDD</dt><dd>+3.3V</dd>
        <dt>VCC</dt><dd>+5V</dd>
        <dt>VBUS</dt><dd>+12V</dd>
      </dl>
    </AccordionItem>
  </Accordion>
</Story>

<!-- AC-16: Accordion wrapper has 1px solid border -->
<Story name="Wrapper Border"
  play={async ({ canvasElement }) => {
    const accordionRoot = canvasElement.querySelector(".accordion") as HTMLElement;
    await expect(accordionRoot).not.toBeNull();

    const ruleColor = resolveTokenFgColor("--rule");
    const style = getComputedStyle(accordionRoot);
    await expect(style.borderTopStyle).toBe("solid");
    await expect(style.borderTopWidth).toBe("1px");
    await expect(style.borderTopColor).toBe(ruleColor);
  }}>
  <Accordion>
    <AccordionItem label="Border Test">
      <p>The accordion wrapper should have a 1px solid rule border.</p>
    </AccordionItem>
  </Accordion>
</Story>

<!-- AC-14 / AC-15: last item has no border-bottom; non-last items do -->
<Story name="Item Borders"
  play={async ({ canvasElement }) => {
    const allDetails = canvasElement.querySelectorAll("details.acc-item");
    await expect(allDetails.length).toBe(3);

    // AC-15: non-last items have a bottom border
    const firstStyle = getComputedStyle(allDetails[0] as HTMLElement);
    await expect(firstStyle.borderBottomStyle).toBe("solid");
    await expect(firstStyle.borderBottomWidth).toBe("1px");

    // AC-14: last item has no bottom border
    const lastStyle = getComputedStyle(allDetails[2] as HTMLElement);
    await expect(lastStyle.borderBottomWidth).toBe("0px");
  }}>
  <Accordion>
    <AccordionItem label="First">
      <p>First item.</p>
    </AccordionItem>
    <AccordionItem label="Second">
      <p>Second item.</p>
    </AccordionItem>
    <AccordionItem label="Last">
      <p>Last item — no bottom border.</p>
    </AccordionItem>
  </Accordion>
</Story>

<!-- AC-18: Accordion forwards ...rest attributes to root div -->
<Story name="Attribute Forwarding"
  play={async ({ canvasElement }) => {
    const accordionRoot = canvasElement.querySelector(".accordion") as HTMLElement;
    await expect(accordionRoot).not.toBeNull();
    await expect(accordionRoot.getAttribute("id")).toBe("test-accordion");
    await expect(accordionRoot.getAttribute("aria-label")).toBe("Settings sections");
  }}>
  <Accordion id="test-accordion" aria-label="Settings sections">
    <AccordionItem label="REST Forwarding">
      <p>The wrapper must forward id and aria-label.</p>
    </AccordionItem>
  </Accordion>
</Story>
