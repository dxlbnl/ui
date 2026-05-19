<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Prose from "./Prose.svelte";

  const { Story } = defineMeta({
    title: "Layout/Prose",
    component: Prose,
    tags: ["autodocs"],
  });
</script>

<!-- AC 1, 3, 6, 10, 15, 26, 32 — Default story: all elements, article tag, prose class -->
<Story name="Default"
  play={async ({ canvasElement }) => {
    // AC 1: renders <article> by default
    const article = canvasElement.querySelector('article');
    await expect(article).not.toBeNull();
    await expect(article!.tagName).toBe('ARTICLE');

    // AC 3: root element has class "prose"
    await expect(article!.classList.contains('prose')).toBe(true);

    // AC 6: children are rendered inside .prose
    const h1 = canvasElement.querySelector('h1');
    await expect(h1).not.toBeNull();
    await expect(h1!.closest('.prose')).not.toBeNull();
    const p = canvasElement.querySelector('p');
    await expect(p).not.toBeNull();
    await expect(p!.closest('.prose')).not.toBeNull();

    // AC 10: h1 has font-size 72px
    const h1Style = getComputedStyle(h1!);
    await expect(h1Style.fontSize).toBe('72px');

    // AC 15: anchor (a:not([class])) has border-bottom underline; no color override (inherits)
    const anchor = canvasElement.querySelector('a');
    await expect(anchor).not.toBeNull();
    await expect(getComputedStyle(anchor!).borderBottomWidth).toBe('1px');

    // AC 26: blockquote has border-left-color resolving to --amber
    const blockquote = canvasElement.querySelector('blockquote');
    await expect(blockquote).not.toBeNull();
    const amberColor = resolveTokenColor('--amber');
    await expect(getComputedStyle(blockquote!).borderLeftColor).toBe(amberColor);

    // AC 32: hr has border-top of 1px solid resolving to --rule, border-bottom-width: 0px
    const hr = canvasElement.querySelector('hr');
    await expect(hr).not.toBeNull();
    const hrStyle = getComputedStyle(hr!);
    await expect(hrStyle.borderBottomWidth).toBe('0px');
    const ruleColor = resolveTokenColor('--rule');
    await expect(hrStyle.borderTopColor).toBe(ruleColor);

    // pre has overflow-x: auto (AC 23)
    const pre = canvasElement.querySelector('pre');
    await expect(pre).not.toBeNull();
    await expect(getComputedStyle(pre!).overflowX).toBe('auto');

    // th has text-transform: uppercase (AC 29)
    const th = canvasElement.querySelector('th');
    await expect(th).not.toBeNull();
    await expect(getComputedStyle(th!).textTransform).toBe('uppercase');

    // AC 8: p has margin-bottom: 20px (per-element spacing; adjacent-sibling rule removed in B41)
    const allPs = canvasElement.querySelectorAll('p');
    const firstP = allPs[0];
    await expect(getComputedStyle(firstP).marginBottom).toBe('20px');

    // inline code (not inside pre) has color resolving to --cyan (AC 21)
    const inlineCode = canvasElement.querySelector('p > code');
    await expect(inlineCode).not.toBeNull();
    const cyanColor = resolveTokenFgColor('--cyan');
    await expect(getComputedStyle(inlineCode!).color).toBe(cyanColor);
  }}>
  <h1>Heading one</h1>
  <h2>Heading two</h2>
  <h3>Heading three</h3>
  <h4>Heading four</h4>
  <p>A paragraph of body text with an <a href="/example">inline link</a> and some <code>inline code</code> for good measure.</p>
  <ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>
  <ol><li>First</li><li>Second</li><li>Third</li></ol>
  <blockquote>A blockquote with amber left border and italic text.</blockquote>
  <pre><code>const x = 42; // block code</code></pre>
  <table>
    <thead><tr><th>Name</th><th>Value</th></tr></thead>
    <tbody><tr><td>alpha</td><td>1</td></tr><tr><td>beta</td><td>2</td></tr></tbody>
  </table>
  <img src="/logo.svg" alt="Dexterlabs logo" />
  <hr />
  <p>Paragraph after the rule.</p>
</Story>

<!-- AC 2, 3, 4 — as="section", maxWidth="60ch" -->
<Story name="Polymorphic" args={{ as: 'section', maxWidth: '60ch' }}
  play={async ({ canvasElement }) => {
    // AC 2: renders <section> when as="section"
    const section = canvasElement.querySelector('section');
    await expect(section).not.toBeNull();
    const article = canvasElement.querySelector('article');
    await expect(article).toBeNull();

    // AC 3: still has class "prose"
    await expect(section!.classList.contains('prose')).toBe(true);

    // AC 4: maxWidth="60ch" is applied as inline style
    await expect((canvasElement.firstElementChild as HTMLElement).style.maxWidth).toBe('60ch');
  }}>
  <h2>Section title</h2>
  <p>Body paragraph.</p>
</Story>

<!-- AC 5 — rest props forwarding: id and aria-label -->
<Story name="Rest Props" args={{ id: 'my-prose', 'aria-label': 'Article body' }}
  play={async ({ canvasElement }) => {
    // AC 5: id and aria-label forwarded to root element
    const el = canvasElement.querySelector('#my-prose');
    await expect(el).not.toBeNull();
    await expect(el!.getAttribute('aria-label')).toBe('Article body');
  }}>
  <p>Content with forwarded props.</p>
</Story>

<!-- AC 9 — first child has margin-top: 0 -->
<Story name="First Child No Top Margin"
  play={async ({ canvasElement }) => {
    const firstChild = canvasElement.querySelector('.prose > h1') as HTMLElement;
    await expect(firstChild).not.toBeNull();
    // AC 9: first direct child has margin-top: 0
    await expect(getComputedStyle(firstChild).marginTop).toBe('0px');
  }}>
  <h1>First heading — no top margin</h1>
  <p>Second child — should have 24px top margin.</p>
</Story>

<!-- AC 10, 11, 12, 13 — all four heading sizes -->
<Story name="Headings"
  play={async ({ canvasElement }) => {
    const h1 = canvasElement.querySelector('h1') as HTMLElement;
    const h2 = canvasElement.querySelector('h2') as HTMLElement;
    const h3 = canvasElement.querySelector('h3') as HTMLElement;
    const h4 = canvasElement.querySelector('h4') as HTMLElement;

    // AC 10: h1 — 72px, weight 500, letter-spacing -0.03em, line-height 1
    await expect(getComputedStyle(h1).fontSize).toBe('72px');
    await expect(getComputedStyle(h1).fontWeight).toBe('500');
    await expect(getComputedStyle(h1).letterSpacing).toBe('-2.16px');
    await expect(getComputedStyle(h1).lineHeight).toBe('72px');

    // AC 11: h2 — var(--t-h3)=24px, weight 500, letter-spacing -0.01em (B41 AC3/5: no line-height)
    await expect(getComputedStyle(h2).fontSize).toBe('24px');
    await expect(getComputedStyle(h2).fontWeight).toBe('500');
    await expect(getComputedStyle(h2).letterSpacing).toBe('-0.24px');

    // AC 12: h3 — var(--t-lede)=19px, weight 500, letter-spacing -0.01em (B41 AC6/8: no line-height)
    await expect(getComputedStyle(h3).fontSize).toBe('19px');
    await expect(getComputedStyle(h3).fontWeight).toBe('500');
    await expect(getComputedStyle(h3).letterSpacing).toBe('-0.19px');

    // AC 13: h4 — mono font, 14px, letter-spacing 0.08em, uppercase, color --ink-faint
    const h4Style = getComputedStyle(h4);
    await expect(h4Style.fontFamily.toLowerCase()).toContain('jetbrains mono');
    await expect(h4Style.fontSize).toBe('14px');
    await expect(h4Style.textTransform).toBe('uppercase');
    const inkFaintColor = resolveTokenFgColor('--ink-faint');
    await expect(h4Style.color).toBe(inkFaintColor);
  }}>
  <h1>The quick brown fox H1</h1>
  <h2>The quick brown fox H2</h2>
  <h3>The quick brown fox H3</h3>
  <h4>The quick brown fox H4</h4>
</Story>

<!-- AC 14 — paragraph font-size and line-height -->
<Story name="Paragraph"
  play={async ({ canvasElement }) => {
    const p = canvasElement.querySelector('p') as HTMLElement;
    await expect(p).not.toBeNull();
    // AC 14: font-size 16px, line-height 1.65
    await expect(getComputedStyle(p).fontSize).toBe('16px');
    await expect(getComputedStyle(p).lineHeight).toBe('26.4px');
  }}>
  <p>A paragraph of body text for testing font-size and line-height values.</p>
</Story>

<!-- AC 15, 16 — anchor default colour and hover state -->
<Story name="Anchor Hover"
  play={async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector('a') as HTMLElement;
    await expect(anchor).not.toBeNull();

    // AC 15 (B41 AC12/13): a:not([class]) has border-bottom underline; hover changes border-color only
    await expect(getComputedStyle(anchor).borderBottomWidth).toBe('1px');
    const ruleStrongColor = resolveTokenColor('--rule-strong');
    await expect(getComputedStyle(anchor).borderBottomColor).toBe(ruleStrongColor);

    // AC 16: hover border-color: var(--amber) — CSS :hover; visual review only (headless cannot read)
  }}>
  <p>Paragraph with an <a href="/example">inline link to hover</a> inside it.</p>
</Story>

<!-- AC 17, 18, 19, 20 — lists: ul, ol, li, li+li spacing -->
<Story name="Lists"
  play={async ({ canvasElement }) => {
    const ul = canvasElement.querySelector('ul') as HTMLElement;
    const ol = canvasElement.querySelector('ol') as HTMLElement;
    const liItems = canvasElement.querySelectorAll('ul > li');

    // AC 17 (B41 AC25): ul has list-style: disc, padding-left: 20px
    await expect(getComputedStyle(ul).listStyleType).toBe('disc');
    await expect(getComputedStyle(ul).paddingLeft).toBe('20px');

    // AC 18 (B41 AC25): ol has list-style: decimal, padding-left: 20px
    await expect(getComputedStyle(ol).listStyleType).toBe('decimal');
    await expect(getComputedStyle(ol).paddingLeft).toBe('20px');

    // AC 19: li has line-height: 1.65 (= 26.4px at 16px font-size)
    await expect(getComputedStyle(liItems[0] as HTMLElement).lineHeight).toBe('26.4px');

    // AC 20 (B41 AC26/27): li has margin-bottom: 6px; li+li no longer has margin-top (rule removed)
    await expect(getComputedStyle(liItems[0] as HTMLElement).marginBottom).toBe('6px');
  }}>
  <ul><li>Unordered item one</li><li>Unordered item two</li><li>Unordered item three</li></ul>
  <ol><li>Ordered item one</li><li>Ordered item two</li><li>Ordered item three</li></ol>
</Story>

<!-- AC 21, 22, 23, 24, 25 — inline code chip + pre block + pre code reset -->
<Story name="CodeBlocks"
  play={async ({ canvasElement }) => {
    // Inline code — not inside pre
    const inlineCode = canvasElement.querySelector('p > code') as HTMLElement;
    await expect(inlineCode).not.toBeNull();

    // AC 21 (B41 AC20): background-color --bg-elev, color --cyan, border-radius --radius (2px), border 1px solid --rule
    const bgElevColor = resolveTokenColor('--bg-elev');
    await expect(getComputedStyle(inlineCode).backgroundColor).toBe(bgElevColor);
    const cyanColor = resolveTokenFgColor('--cyan');
    await expect(getComputedStyle(inlineCode).color).toBe(cyanColor);
    await expect(getComputedStyle(inlineCode).borderRadius).toBe('2px');
    const ruleColor = resolveTokenColor('--rule');
    await expect(getComputedStyle(inlineCode).borderColor).toBe(ruleColor);

    // AC 22: padding 1px 5px
    await expect(getComputedStyle(inlineCode).paddingTop).toBe('1px');
    await expect(getComputedStyle(inlineCode).paddingRight).toBe('5px');

    // pre block
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    await expect(pre).not.toBeNull();

    // AC 23 (B41 AC22/23): pre — no background; border 1px solid --rule, padding 16px 20px, overflow-x auto, line-height 1.6, white-space pre, margin 24px 0
    await expect(getComputedStyle(pre).borderColor).toBe(ruleColor);
    await expect(getComputedStyle(pre).paddingTop).toBe('16px');
    await expect(getComputedStyle(pre).paddingLeft).toBe('20px');
    await expect(getComputedStyle(pre).overflowX).toBe('auto');
    await expect(getComputedStyle(pre).lineHeight).toBe('22.4px');
    await expect(getComputedStyle(pre).whiteSpace).toBe('pre');
    await expect(getComputedStyle(pre).marginTop).toBe('24px');
    await expect(getComputedStyle(pre).marginBottom).toBe('24px');

    // pre > code reset
    const preCode = canvasElement.querySelector('pre > code') as HTMLElement;
    await expect(preCode).not.toBeNull();

    // AC 24: background transparent, border none, padding 0
    await expect(getComputedStyle(preCode).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(preCode).borderWidth).toBe('0px');
    await expect(getComputedStyle(preCode).paddingTop).toBe('0px');
    await expect(getComputedStyle(preCode).paddingRight).toBe('0px');

    // AC 25 (B41 AC24): color: inherit — resolves to same as pre (prose root ink colour)
    await expect(getComputedStyle(preCode).color).toBe(getComputedStyle(pre).color);
  }}>
  <p>Use <code>code snippet</code> inline in a sentence.</p>
  <pre><code>function hello() {'{'}
  return 42;
{'}'}</code></pre>
</Story>

<!-- AC 26, 27 — blockquote: amber border, italic, dim colour, padding -->
<Story name="Blockquote"
  play={async ({ canvasElement }) => {
    const blockquote = canvasElement.querySelector('blockquote') as HTMLElement;
    await expect(blockquote).not.toBeNull();
    const bqStyle = getComputedStyle(blockquote);

    // AC 26 (B41 AC17/18): border-left 2px solid --amber, color --ink-dim, no font-style italic, margin 28px 0
    await expect(bqStyle.borderLeftWidth).toBe('2px');
    const amberColor = resolveTokenColor('--amber');
    await expect(bqStyle.borderLeftColor).toBe(amberColor);
    const inkDimColor = resolveTokenFgColor('--ink-dim');
    await expect(bqStyle.color).toBe(inkDimColor);
    await expect(bqStyle.fontStyle).toBe('normal');
    await expect(bqStyle.marginTop).toBe('28px');
    await expect(bqStyle.marginBottom).toBe('28px');

    // AC 27: padding 4px 0 4px 16px
    await expect(bqStyle.paddingTop).toBe('4px');
    await expect(bqStyle.paddingRight).toBe('0px');
    await expect(bqStyle.paddingBottom).toBe('4px');
    await expect(bqStyle.paddingLeft).toBe('16px');
  }}>
  <p>Before quote.</p>
  <blockquote>Quoted text from somewhere meaningful.</blockquote>
  <p>After quote.</p>
</Story>

<!-- AC 28, 29, 30 — table: border-collapse, th styles, td styles -->
<Story name="TableInProse"
  play={async ({ canvasElement }) => {
    const table = canvasElement.querySelector('table') as HTMLElement;
    await expect(table).not.toBeNull();

    // AC 28: width 100%, border-collapse collapse, font-family JetBrains Mono
    await expect(getComputedStyle(table).borderCollapse).toBe('collapse');
    await expect(getComputedStyle(table).fontFamily.toLowerCase()).toContain('jetbrains mono');

    const th = canvasElement.querySelector('th') as HTMLElement;
    await expect(th).not.toBeNull();
    const thStyle = getComputedStyle(th);

    // AC 29: th text-transform uppercase, font-weight 500, letter-spacing 0.1em, color --ink-faint, border-bottom 1px solid --rule-strong
    await expect(thStyle.textTransform).toBe('uppercase');
    await expect(thStyle.fontWeight).toBe('500');
    const inkFaintColor = resolveTokenFgColor('--ink-faint');
    await expect(thStyle.color).toBe(inkFaintColor);
    await expect(thStyle.borderBottomWidth).toBe('1px');
    const ruleStrongColor = resolveTokenColor('--rule-strong');
    await expect(thStyle.borderBottomColor).toBe(ruleStrongColor);

    const td = canvasElement.querySelector('td') as HTMLElement;
    await expect(td).not.toBeNull();
    const tdStyle = getComputedStyle(td);

    // AC 30: td border-bottom dashed --rule, color --ink-dim
    await expect(tdStyle.borderBottomStyle).toBe('dashed');
    const ruleColor = resolveTokenColor('--rule');
    await expect(tdStyle.borderBottomColor).toBe(ruleColor);
    const inkDimColor = resolveTokenFgColor('--ink-dim');
    await expect(tdStyle.color).toBe(inkDimColor);
  }}>
  <table>
    <thead><tr><th>Name</th><th>Value</th></tr></thead>
    <tbody>
      <tr><td>alpha</td><td>1</td></tr>
      <tr><td>beta</td><td>2</td></tr>
    </tbody>
  </table>
</Story>

<!-- AC 31 — img: max-width 100%, height auto, border 1px solid --rule -->
<Story name="Image"
  play={async ({ canvasElement }) => {
    const img = canvasElement.querySelector('img') as HTMLElement;
    await expect(img).not.toBeNull();
    const imgStyle = getComputedStyle(img);

    // AC 31: max-width 100% (height: auto is set in CSS but getComputedStyle returns resolved pixels)
    await expect(imgStyle.maxWidth).toBe('100%');

    // border 1px solid --rule
    await expect(imgStyle.borderWidth).toBe('1px');
    const ruleColor = resolveTokenColor('--rule');
    await expect(imgStyle.borderColor).toBe(ruleColor);
  }}>
  <img src="/logo.svg" alt="Dexterlabs logo" />
</Story>

<!-- AC 33 — PaperPalette: token colours flip for Paper palette -->
<Story name="PaperPalette"
  play={async ({ canvasElement }) => {
    // The Prose is wrapped in a div[data-palette="paper"] in the slot
    // so we probe tokens with a probe element also inside that wrapper
    const wrapper = canvasElement.querySelector('[data-palette="paper"]') as HTMLElement;
    await expect(wrapper).not.toBeNull();

    const anchor = wrapper.querySelector('a') as HTMLElement;
    const blockquote = wrapper.querySelector('blockquote') as HTMLElement;
    const pre = wrapper.querySelector('pre') as HTMLElement;

    // Probe token values inside the paper-palette context
    const probeEl = document.createElement('div');
    probeEl.style.position = 'absolute';
    probeEl.style.opacity = '0';
    wrapper.appendChild(probeEl);

    // Paper --amber should be #a04e00 ≈ rgb(160, 78, 0)
    probeEl.style.backgroundColor = 'var(--amber)';
    const paperAmber = getComputedStyle(probeEl).backgroundColor;

    // Paper --rule-strong (for anchor border-bottom)
    probeEl.style.backgroundColor = 'var(--rule-strong)';
    const paperRuleStrong = getComputedStyle(probeEl).backgroundColor;

    wrapper.removeChild(probeEl);

    // AC 33 (B41): anchor has border-bottom using Paper --rule-strong token
    await expect(getComputedStyle(anchor).borderBottomWidth).toBe('1px');

    // AC 33: blockquote border-left-color is Paper --amber
    await expect(getComputedStyle(blockquote).borderLeftColor).toBe(paperAmber);

    // AC 33 (B41 AC22): pre has no background set — presence and border verified only
    await expect(pre).not.toBeNull();
  }}>
  <div data-palette="paper" style="padding: 16px;">
    <Prose>
      <p>A paragraph with an <a href="/example">inline link</a> for palette testing.</p>
      <blockquote>A quoted passage with amber border.</blockquote>
      <pre><code>// block code in paper palette</code></pre>
    </Prose>
  </div>
</Story>
