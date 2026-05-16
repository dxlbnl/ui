<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Rule from "./Rule.svelte";
  import Stack from "./Stack.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Layout/Rule",
    tags: ["autodocs"],
  });
</script>

<Story name="All Variants"
  play={async ({ canvasElement }) => {
    const hrs = canvasElement.querySelectorAll("hr");
    await expect(hrs.length).toBe(3);

    const [solid, dashed, strong] = Array.from(hrs) as HTMLElement[];

    // Solid variant
    const solidStyle = getComputedStyle(solid);
    await expect(solidStyle.borderTopStyle).toBe("solid");
    await expect(solidStyle.borderTopWidth).toBe("1px");
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(solidStyle.borderTopColor).toBe(ruleColor);

    // Dashed variant
    const dashedStyle = getComputedStyle(dashed);
    await expect(dashedStyle.borderTopStyle).toBe("dashed");
    await expect(dashedStyle.borderTopWidth).toBe("1px");
    await expect(dashedStyle.borderTopColor).toBe(ruleColor);

    // Strong variant — same style but different color from solid
    const strongStyle = getComputedStyle(strong);
    await expect(strongStyle.borderTopStyle).toBe("solid");
    const ruleStrongColor = resolveTokenFgColor("--rule-strong");
    await expect(strongStyle.borderTopColor).toBe(ruleStrongColor);
    await expect(strongStyle.borderTopColor).not.toBe(ruleColor);
  }}>
  <Stack gap="md">
    <span>Solid (default)</span>
    <Rule variant="solid" />
    <span>Dashed</span>
    <Rule variant="dashed" />
    <span>Strong</span>
    <Rule variant="strong" />
  </Stack>
</Story>

<Story name="In Context"
  play={async ({ canvasElement }) => {
    const hr = within(canvasElement).getAllByRole("separator")[0];
    await expect(hr).toBeVisible();
    const style = getComputedStyle(hr);
    await expect(style.marginTop).toBe("0px");
    await expect(style.marginBottom).toBe("0px");
    await expect(style.marginLeft).toBe("0px");
    await expect(style.marginRight).toBe("0px");
    // aria-hidden forwarded via ...rest
    const hiddenHr = canvasElement.querySelector("[data-testid='rule-hidden']") as HTMLElement;
    await expect(hiddenHr.getAttribute("aria-hidden")).toBe("true");
  }}>
  <Stack gap="md">
    <h3>Section Heading</h3>
    <Rule />
    <p>Body text below the rule. The rule carries no margin of its own — spacing comes from the Stack gap.</p>
    <Rule aria-hidden="true" data-testid="rule-hidden" />
  </Stack>
</Story>
