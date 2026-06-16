<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor } from "storybook/test";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";
  import Accordion from "./Accordion.svelte";
  import AccordionItem from "./AccordionItem.svelte";

  const { Story } = defineMeta({
    component: Accordion,
    title: "Data/Accordion",
    tags: ["autodocs"],
  });
</script>

<!-- AC-20: "Default" story — three items, first open -->
<Story
  name="Default"
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
    await waitFor(() => expect(firstBody).toBeVisible());

    // AC-10: body content of open item is visible
    await waitFor(() =>
      expect(
        canvas.getByText(/Start by reading the quick-start guide/),
      ).toBeVisible(),
    );

    // AC-17: summary has list-style: none (no browser disclosure triangle)
    const firstSummary = allDetails[0].querySelector("summary") as HTMLElement;
    await expect(getComputedStyle(firstSummary).listStyleType).toBe("none");
  }}
>
  <AccordionItem label="Getting Started" open={true}>
    <p>
      Start by reading the quick-start guide and familiarising yourself with the
      token set.
    </p>
  </AccordionItem>
  <AccordionItem label="Installation">
    <p>Run pnpm install to set up all dependencies.</p>
  </AccordionItem>
  <AccordionItem label="Configuration">
    <p>Edit the tokens file to match your brand palette.</p>
  </AccordionItem>
</Story>

<!-- All items closed -->
<Story
  name="All Closed"
  play={async ({ canvasElement }) => {
    // AC-8: all details elements lack open attribute
    const allDetails = canvasElement.querySelectorAll("details.acc-item");
    await expect(allDetails.length).toBe(3);
    for (const d of allDetails) {
      await expect(d.hasAttribute("open")).toBe(false);
    }
  }}
>
  <AccordionItem label="Section Alpha">
    <p>Content for Alpha.</p>
  </AccordionItem>
  <AccordionItem label="Section Beta">
    <p>Content for Beta.</p>
  </AccordionItem>
  <AccordionItem label="Section Gamma">
    <p>Content for Gamma.</p>
  </AccordionItem>
</Story>

<!-- AC-21: "Toggle Interaction" story — click to open, click again to close -->
<Story
  name="Toggle Interaction"
  play={async ({ canvasElement, userEvent }) => {
    const details = canvasElement.querySelector(
      "details.acc-item",
    ) as HTMLElement;
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
    await waitFor(() => expect(bodyText).toBeVisible());

    // AC-11: icon has transform applied when open
    await expect(getComputedStyle(icon).transform).not.toBe("none");

    // AC-12: icon color resolves to var(--amber) when open
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(icon).color).toBe(amberColor);

    // AC-13: trigger background resolves to var(--bg-elev) when open
    const openTrigger = details.querySelector(".acc-trigger") as HTMLElement;
    const bgElev = resolveTokenColor("--bg-elev");
    await waitFor(() =>
      expect(getComputedStyle(openTrigger).backgroundColor).toBe(bgElev),
    );

    // AC-9: click again → details loses open attribute
    await userEvent.click(summary);
    await expect(details.hasAttribute("open")).toBe(false);
  }}
>
  <AccordionItem label="Toggle Me">
    <p>Interact with this item to test toggle behaviour.</p>
  </AccordionItem>
</Story>

<!-- "Rich Body" — open item with structured content in the body -->
<Story
  name="Rich Body"
  play={async ({ canvasElement }) => {
    // AC-6: body content rendered inside .acc-body
    const body = canvasElement.querySelector(".acc-body");
    await expect(body).not.toBeNull();
    await waitFor(() => expect(body).toBeVisible());

    // Body content is accessible
    await waitFor(() =>
      expect(within(canvasElement).getByText("VDD")).toBeVisible(),
    );
    await expect(within(canvasElement).getByText("+3.3V")).toBeVisible();
    await expect(within(canvasElement).getByText("VCC")).toBeVisible();
    await expect(within(canvasElement).getByText("+5V")).toBeVisible();
  }}
>
  <AccordionItem label="Power Rails" open={true}>
    <dl
      style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin:0;"
    >
      <dt>VDD</dt>
      <dd>+3.3V</dd>
      <dt>VCC</dt>
      <dd>+5V</dd>
      <dt>VBUS</dt>
      <dd>+12V</dd>
    </dl>
  </AccordionItem>
</Story>

<!-- AC-16: Accordion wrapper has 1px solid border -->
<Story
  name="Wrapper Border"
  play={async ({ canvasElement }) => {
    const accordionRoot = canvasElement.querySelector(
      ".accordion",
    ) as HTMLElement;
    await expect(accordionRoot).not.toBeNull();

    const ruleColor = resolveTokenFgColor("--rule");
    const style = getComputedStyle(accordionRoot);
    await expect(style.borderTopStyle).toBe("solid");
    await expect(style.borderTopWidth).toBe("1px");
    await expect(style.borderTopColor).toBe(ruleColor);
  }}
>
  <AccordionItem label="Border Test">
    <p>The accordion wrapper should have a 1px solid rule border.</p>
  </AccordionItem>
</Story>

<!-- AC-14 / AC-15: last item has no border-bottom; non-last items do -->
<Story
  name="Item Borders"
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
  }}
>
  <AccordionItem label="First">
    <p>First item.</p>
  </AccordionItem>
  <AccordionItem label="Second">
    <p>Second item.</p>
  </AccordionItem>
  <AccordionItem label="Last">
    <p>Last item — no bottom border.</p>
  </AccordionItem>
</Story>

<!-- AC 41 / AC 42: "Animated" story — verifies DOM toggle behaviour of CSS animation -->
<Story
  name="Animated"
  play={async ({ canvasElement, userEvent }) => {
    // AC 35: <details> starts without the open attribute (closed)
    const details = canvasElement.querySelector(
      "details.acc-item",
    ) as HTMLElement;
    await expect(details.hasAttribute("open")).toBe(false);

    // AC 35: .acc-body is present in the DOM regardless of open state
    const accBody = details.querySelector(".acc-body") as HTMLElement;
    await expect(accBody).not.toBeNull();

    // AC 36: click summary → <details> gains open attribute
    const summary = details.querySelector("summary.acc-trigger") as HTMLElement;
    await userEvent.click(summary);
    await expect(details.hasAttribute("open")).toBe(true);

    // AC 36: after opening, .acc-body is visible
    await waitFor(() => expect(accBody).toBeVisible());

    // AC 37: click summary again → <details> loses open attribute
    await userEvent.click(summary);
    await expect(details.hasAttribute("open")).toBe(false);
  }}
>
  <AccordionItem label="CSS Height Animation">
    <p>
      This item uses a CSS-only height transition via interpolate-size and
      @starting-style.
    </p>
  </AccordionItem>
</Story>

<!-- B27 AC-20: .accordion Stack root must have no style="border: 1px solid var(--rule)" attribute -->
<Story
  name="No Inline Border Style"
  play={async ({ canvasElement }) => {
    // Before B27: <Stack style="border: 1px solid var(--rule);"> carries a style= attribute.
    // After B27: the border moves to scoped CSS on .accordion; no style= attribute on the root.
    const accordionRoot = canvasElement.querySelector(
      ".accordion",
    ) as HTMLElement;
    await expect(accordionRoot.getAttribute("style")).toBeNull();
  }}
>
  <AccordionItem label="Border Style Test">
    <p>The accordion root must not carry an inline style= attribute.</p>
  </AccordionItem>
</Story>

<!-- AC-18: Accordion forwards ...rest attributes to root div -->
<Story
  name="Attribute Forwarding"
  args={{
    id: "test-accordion",
    "aria-label": "Settings sections",
  }}
  play={async ({ canvasElement }) => {
    const accordionRoot = canvasElement.querySelector(
      ".accordion",
    ) as HTMLElement;
    await expect(accordionRoot).not.toBeNull();
    await expect(accordionRoot.getAttribute("id")).toBe("test-accordion");
    await expect(accordionRoot.getAttribute("aria-label")).toBe(
      "Settings sections",
    );
  }}
>
  <AccordionItem label="REST Forwarding">
    <p>The wrapper must forward id and aria-label.</p>
  </AccordionItem>
</Story>

<!-- B65: AccordionItem actions snippet — inline controls in the summary header.
     One lean story carrying the full click-guard contract (AC-3, 6, 8, 9, 10, 11)
     plus the omitted-prop regression (AC-4). The first item renders an `actions`
     snippet with a real <button> whose onclick increments a counter recorded in a
     data-count attribute (so the play function can prove the control's own handler
     fired). The second item has NO actions, proving no .acc-actions wrapper exists
     when the prop is omitted. Item starts open so the "click does not close it" and
     "title click toggles (to closed)" assertions run from a known state. -->
<Story
  name="With Actions"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const allDetails = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("details.acc-item"),
    );
    await expect(allDetails.length).toBe(2);

    const actionsItem = allDetails[0];
    const plainItem = allDetails[1];

    const summary = actionsItem.querySelector(
      "summary.acc-trigger",
    ) as HTMLElement;

    // AC-3: the actions content renders inside the <summary>, wrapped in a single
    // .acc-actions element, and the interactive control is queryable by role + name.
    const actionsWrapper = summary.querySelector(".acc-actions") as HTMLElement;
    await expect(actionsWrapper).not.toBeNull();
    const button = canvas.getByRole("button", { name: "Delete section" });
    await expect(button).toBeVisible();
    await expect(actionsWrapper.contains(button)).toBe(true);

    // AC-6: DOM order within the summary is title → actions → icon. The actions
    // wrapper sits BETWEEN the flexed title and the chevron.
    const summaryChildren = Array.from(summary.children);
    const titleEl = summary.querySelector(".acc-title") as HTMLElement;
    const iconEl = summary.querySelector(".acc-icon") as HTMLElement;
    const titleIdx = summaryChildren.indexOf(titleEl);
    const actionsIdx = summaryChildren.indexOf(actionsWrapper);
    const iconIdx = summaryChildren.indexOf(iconEl);
    await expect(titleIdx).toBeGreaterThanOrEqual(0);
    await expect(actionsIdx).toBeGreaterThan(titleIdx);
    await expect(iconIdx).toBeGreaterThan(actionsIdx);
    // AC-7: the chevron is the last child of the summary.
    await expect(iconIdx).toBe(summaryChildren.length - 1);

    // AC-5: the title takes the remaining horizontal space (flex grows it).
    await expect(parseFloat(getComputedStyle(titleEl).flexGrow)).toBeGreaterThan(
      0,
    );

    // The item starts open; record the start state and prove it is UNCHANGED by the
    // actions click (whatever it was — here open).
    const openBeforeClick = actionsItem.hasAttribute("open");
    await expect(openBeforeClick).toBe(true);

    // AC-8 + AC-9: clicking the actions button does NOT toggle the <details>
    // (preventDefault on the wrapper cancels the summary's default toggle), AND the
    // control's own handler still fires (the counter increments).
    await expect(button.getAttribute("data-count")).toBe("0");
    await userEvent.click(button);
    await expect(actionsItem.hasAttribute("open")).toBe(openBeforeClick);
    await expect(button.getAttribute("data-count")).toBe("1");

    // AC-11 + AC-9: keyboard activation of the control does NOT toggle the
    // <details>, and the control's handler still fires. Focus the button, then
    // activate via Enter and Space.
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(actionsItem.hasAttribute("open")).toBe(openBeforeClick);
    await expect(button.getAttribute("data-count")).toBe("2");

    button.focus();
    await userEvent.keyboard(" ");
    await expect(actionsItem.hasAttribute("open")).toBe(openBeforeClick);
    await expect(button.getAttribute("data-count")).toBe("3");

    // AC-10: the guard is scoped to .acc-actions only — a click on the title area
    // (outside the actions wrapper) DOES toggle the <details> normally. The item
    // started open, so this title click closes it.
    await userEvent.click(titleEl);
    await expect(actionsItem.hasAttribute("open")).toBe(!openBeforeClick);

    // AC-4: the second item has NO actions prop → no .acc-actions wrapper exists,
    // and it behaves exactly as today (summary still has title + icon only).
    const plainSummary = plainItem.querySelector(
      "summary.acc-trigger",
    ) as HTMLElement;
    await expect(plainSummary.querySelector(".acc-actions")).toBeNull();
    await expect(plainSummary.querySelector(".acc-title")).not.toBeNull();
    await expect(plainSummary.querySelector(".acc-icon")).not.toBeNull();
  }}
>
  <AccordionItem label="With Controls" open={true}>
    {#snippet actions()}
      <button
        type="button"
        data-count="0"
        aria-label="Delete section"
        onclick={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.setAttribute(
            "data-count",
            String(Number(b.getAttribute("data-count")) + 1),
          );
        }}
      >
        ✕
      </button>
    {/snippet}
    <p>
      This row has inline controls in its header. Clicking a control must not
      toggle the accordion.
    </p>
  </AccordionItem>
  <AccordionItem label="No Controls">
    <p>This row has no actions snippet and behaves as before.</p>
  </AccordionItem>
</Story>
