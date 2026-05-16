<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Rule from "./Rule.svelte";
  import Stack from "./Stack.svelte";

  const { Story } = defineMeta({
    title: "Layout/Rule",
    tags: ["autodocs"],
  });

  // Helper: resolve a CSS custom property to its computed color (foreground channel).
  // Used to compare border-top-color against token values.
  const resolveTokenBorderColor = (token: string): string => {
    const el = document.createElement("div");
    el.style.color = `var(${token})`;
    el.style.position = "absolute";
    el.style.opacity = "0";
    document.body.appendChild(el);
    const value = getComputedStyle(el).color;
    document.body.removeChild(el);
    return value;
  };

  // ── All Variants ──────────────────────────────────────────────────────────
  // AC 62, 63, 64, 65, 89:
  //   first hr  → border-top-style solid, color = var(--rule)
  //   second hr → border-top-style dashed, color = var(--rule)
  //   third hr  → border-top-style solid, color = var(--rule-strong) ≠ var(--rule)
  const playAllVariants = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const hrs = canvasElement.querySelectorAll("hr");
    await expect(hrs.length).toBe(3);

    const [solid, dashed, strong] = Array.from(hrs) as HTMLElement[];

    // Solid variant
    const solidStyle = getComputedStyle(solid);
    await expect(solidStyle.borderTopStyle).toBe("solid");
    await expect(solidStyle.borderTopWidth).toBe("1px");
    const ruleColor = resolveTokenBorderColor("--rule");
    await expect(solidStyle.borderTopColor).toBe(ruleColor);

    // Dashed variant
    const dashedStyle = getComputedStyle(dashed);
    await expect(dashedStyle.borderTopStyle).toBe("dashed");
    await expect(dashedStyle.borderTopWidth).toBe("1px");
    await expect(dashedStyle.borderTopColor).toBe(ruleColor);

    // Strong variant — same style but different color from solid
    const strongStyle = getComputedStyle(strong);
    await expect(strongStyle.borderTopStyle).toBe("solid");
    const ruleStrongColor = resolveTokenBorderColor("--rule-strong");
    await expect(strongStyle.borderTopColor).toBe(ruleStrongColor);
    await expect(strongStyle.borderTopColor).not.toBe(ruleColor);
  };

  // ── In Context ────────────────────────────────────────────────────────────
  // AC 66, 68, 90: hr is visible, margin = 0px on all sides, aria-hidden forwarded
  const playInContext = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const hr = canvasElement.querySelector("hr") as HTMLElement;
    await expect(hr).not.toBeNull();
    await expect(hr).toBeVisible();
    const style = getComputedStyle(hr);
    await expect(style.marginTop).toBe("0px");
    await expect(style.marginBottom).toBe("0px");
    await expect(style.marginLeft).toBe("0px");
    await expect(style.marginRight).toBe("0px");
    // AC 68: aria-hidden forwarded via ...rest
    const hiddenHr = canvasElement.querySelector("[data-testid='rule-hidden']") as HTMLElement;
    await expect(hiddenHr).not.toBeNull();
    await expect(hiddenHr.getAttribute("aria-hidden")).toBe("true");
  };
</script>

<Story name="All Variants" play={playAllVariants}>
  <Stack gap="md">
    <span>Solid (default)</span>
    <Rule variant="solid" />
    <span>Dashed</span>
    <Rule variant="dashed" />
    <span>Strong</span>
    <Rule variant="strong" />
  </Stack>
</Story>

<Story name="In Context" play={playInContext}>
  <Stack gap="md">
    <h3>Section Heading</h3>
    <Rule />
    <p>Body text below the rule. The rule carries no margin of its own — spacing comes from the Stack gap.</p>
    <Rule aria-hidden="true" data-testid="rule-hidden" />
  </Stack>
</Story>
