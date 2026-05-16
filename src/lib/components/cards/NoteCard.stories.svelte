<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import NoteCard from "./NoteCard.svelte";

  const { Story } = defineMeta({
    title: "Cards/NoteCard",
    tags: ["autodocs"],
  });

  // Helper: resolve a CSS custom property to its computed foreground color value.
  // Used for border-color assertions since border-color resolves as an RGB string.
  const resolveTokenFgColor = (token: string): string => {
    const el = document.createElement("div");
    el.style.color = `var(${token})`;
    el.style.position = "absolute";
    el.style.opacity = "0";
    document.body.appendChild(el);
    const value = getComputedStyle(el).color;
    document.body.removeChild(el);
    return value;
  };

  // ── With Lede ─────────────────────────────────────────────────────────────
  // AC 48, 50, 52, 54, 55, 57, 60: a element, hex id, kind label, h3 title,
  // lede p, date footer, resting border-color matches --rule
  const playWithLede = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // AC 48: renders as <a> by default
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();

    // AC 50: idx=6 → "0x06" hex ID displayed
    const hexEl = canvas.getByText("0x06");
    await expect(hexEl).toBeVisible();

    // AC 52: kind label rendered in uppercase
    const kindEl = canvas.getByText("PROJECT-LOG");
    await expect(kindEl).toBeVisible();

    // AC 54: title renders as h3
    const heading = canvasElement.querySelector("h3") as HTMLElement;
    await expect(heading).not.toBeNull();
    await expect(heading).toBeVisible();
    await expect(heading.textContent).toContain("Shipping the Site");

    // AC 55: lede renders as a <p> element
    const ledeEl = canvasElement.querySelector("p.note-lede") as HTMLElement;
    await expect(ledeEl).not.toBeNull();
    await expect(ledeEl).toBeVisible();
    await expect(ledeEl.textContent).toContain("Turning a messy prototype");

    // AC 57: date rendered in footer
    const dateEl = canvas.getByText(/1 May 2026/);
    await expect(dateEl).toBeVisible();

    // Footer "READ" is present
    const readEl = canvas.getByText(/READ/);
    await expect(readEl).toBeVisible();

    // AC 60: resting border-color matches --rule token
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(getComputedStyle(root).borderColor).toBe(ruleColor);
  };

  // ── Minimal ───────────────────────────────────────────────────────────────
  // AC 50, 53, 56, 58: hex id, kind defaults to LOG, no lede p, no date footer
  const playMinimal = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();

    // AC 50: idx=1 → "0x01"
    const hexEl = canvas.getByText("0x01");
    await expect(hexEl).toBeVisible();

    // AC 56: no lede — .note-lede element should not be present
    const ledeEl = canvasElement.querySelector(".note-lede");
    await expect(ledeEl).toBeNull();

    // AC 58: no date — .note-foot element should not be present
    const footEl = canvasElement.querySelector(".note-foot");
    await expect(footEl).toBeNull();
  };

  // ── High Index ────────────────────────────────────────────────────────────
  // AC 50: idx=255 → "0xFF" (uppercase, two hex digits)
  const playHighIndex = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const hexEl = canvas.getByText("0xFF");
    await expect(hexEl).toBeVisible();
  };

  // ── As Div ────────────────────────────────────────────────────────────────
  // AC 49: as="div" renders a <div> root element
  const playAsDiv = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  };
</script>

<Story name="With Lede" play={playWithLede}>
  <NoteCard
    href="#note-0x06"
    idx={6}
    kind="PROJECT-LOG"
    title="Shipping the Site"
    lede="Turning a messy prototype into a stable place to document the work and sell hardware."
    date="1 May 2026"
    data-testid="card"
  />
</Story>

<Story name="Minimal" play={playMinimal}>
  <NoteCard
    href="#note-0x01"
    idx={1}
    kind="LOG"
    title="First entry"
    data-testid="card"
  />
</Story>

<Story name="High Index" play={playHighIndex}>
  <NoteCard
    href="#note-0xff"
    idx={255}
    title="High index"
    data-testid="card"
  />
</Story>

<Story name="As Div" play={playAsDiv}>
  <NoteCard
    as="div"
    idx={1}
    title="Test"
    data-testid="card"
  />
</Story>
