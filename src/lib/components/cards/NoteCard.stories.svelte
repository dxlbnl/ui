<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import NoteCard from "./NoteCard.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Cards/NoteCard",
    component: NoteCard,
    tags: ["autodocs"],
  });
</script>

<Story name="With Lede" args={{ href: "#note-0x06", idx: 6, kind: "PROJECT-LOG", title: "Shipping the Site", lede: "Turning a messy prototype into a stable place to document the work and sell hardware.", date: "1 May 2026" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // renders as <a> by default
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    // idx=6 → "0x06" hex ID displayed
    const hexEl = canvas.getByText("0x06");
    await expect(hexEl).toBeVisible();

    // kind label rendered in uppercase
    const kindEl = canvas.getByText("PROJECT-LOG");
    await expect(kindEl).toBeVisible();

    // title renders as h3
    const heading = canvasElement.querySelector("h3") as HTMLElement;
    await expect(heading).toBeVisible();
    await expect(heading.textContent).toContain("Shipping the Site");

    // lede renders as a <p> element
    const ledeEl = canvasElement.querySelector("p.note-lede") as HTMLElement;
    await expect(ledeEl).toBeVisible();
    await expect(ledeEl.textContent).toContain("Turning a messy prototype");

    // date rendered in footer
    const dateEl = canvas.getByText(/1 May 2026/);
    await expect(dateEl).toBeVisible();

    // Footer "READ" is present
    const readEl = canvas.getByText(/READ/);
    await expect(readEl).toBeVisible();

    // resting border-color matches --rule token
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(getComputedStyle(root).borderColor).toBe(ruleColor);
  }} />

<Story name="Minimal" args={{ href: "#note-0x01", idx: 1, kind: "LOG", title: "First entry" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    // idx=1 → "0x01"
    const hexEl = canvas.getByText("0x01");
    await expect(hexEl).toBeVisible();

    // no lede — .note-lede element should not be present
    const ledeEl = canvasElement.querySelector(".note-lede");
    await expect(ledeEl).toBeNull();

    // no date — .note-foot element should not be present
    const footEl = canvasElement.querySelector(".note-foot");
    await expect(footEl).toBeNull();
  }} />

<Story name="High Index" args={{ href: "#note-0xff", idx: 255, title: "High index" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hexEl = canvas.getByText("0xFF");
    await expect(hexEl).toBeVisible();
  }} />

<Story name="As Div" args={{ as: "div", idx: 1, title: "Test" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  }} />
