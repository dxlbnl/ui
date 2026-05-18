<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import InputWrap from "./InputWrap.svelte";
  import Input from "./Input.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Forms/InputWrap/Composition",
    component: InputWrap,
    tags: ["autodocs"],
  });
</script>

{#snippet mailIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" aria-hidden="true">
    <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58.22,53.15H52.27ZM157.29,128,216,74.19V181.81Z"/>
  </svg>
{/snippet}

<Story name="Icon Prefix"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toBeVisible();
    // icon-pre span is aria-hidden so the input is still accessible
    const iconPre = canvasElement.querySelector(".icon-pre");
    await expect(iconPre).not.toBeNull();
    await expect(iconPre!.getAttribute("aria-hidden")).toBe("true");

    // AC-7: SVG fill must resolve to --ink-faint (via fill: currentColor inheriting from .icon-pre)
    const svgEl = canvasElement.querySelector(".icon-pre svg");
    await expect(svgEl).not.toBeNull();
    const probe = document.createElement("div");
    probe.style.cssText = "color:var(--ink-faint);position:absolute;opacity:0";
    document.body.appendChild(probe);
    const inkFaintColor = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    await expect(getComputedStyle(svgEl!).fill).toBe(inkFaintColor);
  }}>
  <InputWrap iconPre={mailIcon}>
    <Input type="email" placeholder="you@domain.com" />
  </InputWrap>
</Story>
