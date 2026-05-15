<script lang="ts">
  // No props — renders a fixed specimen of all typography classes and semantic elements
</script>

<div class="specimen-root">

  <!-- Heading classes -->
  <section class="section">
    <p class="eyebrow">Heading classes</p>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.h1</code>
        <span class="token-size">72px</span>
      </span>
      <div class="h1 specimen-clip" data-testid="specimen-h1">Design System</div>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.h2</code>
        <span class="token-size">36px</span>
      </span>
      <div class="h2" data-testid="specimen-h2">Design System</div>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.h3</code>
        <span class="token-size">24px</span>
      </span>
      <div class="h3" data-testid="specimen-h3">Design System</div>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.hero-heading</code>
        <span class="token-size">clamp(48–112px)</span>
      </span>
      <div class="hero-heading specimen-clip">Hero</div>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.display-heading</code>
        <span class="token-size">140px</span>
      </span>
      <div class="display-heading specimen-clip">Dx</div>
    </div>
  </section>

  <!-- Body classes -->
  <section class="section">
    <p class="eyebrow">Body classes</p>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.body-text</code>
        <span class="token-size">16px</span>
      </span>
      <div class="body-text" data-testid="specimen-body-text">The quick brown fox jumps over the lazy dog.</div>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.body-lede</code>
        <span class="token-size">19px</span>
      </span>
      <div class="body-lede" data-testid="specimen-body-lede">The quick brown fox jumps over the lazy dog.</div>
    </div>
  </section>

  <!-- Mono label classes -->
  <section class="section">
    <p class="eyebrow">Mono label classes</p>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.mono-label</code>
        <span class="token-size">14px</span>
      </span>
      <div class="mono-label" data-testid="specimen-mono-label">Status · Active · v1.0</div>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta">
        <code class="token-label">.eyebrow</code>
        <span class="token-size">12px</span>
      </span>
      <div class="eyebrow" data-testid="specimen-eyebrow">Category label</div>
    </div>
  </section>

  <!-- Semantic elements -->
  <section class="section">
    <p class="eyebrow">Semantic elements</p>

    <div class="specimen-row">
      <span class="specimen-meta"><code class="token-label">code</code></span>
      <p>Use <code data-testid="specimen-code">var(--bg)</code> for backgrounds.</p>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta"><code class="token-label">pre</code></span>
      <pre data-testid="specimen-pre">const color = 'var(--amber)';</pre>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta"><code class="token-label">blockquote</code></span>
      <blockquote data-testid="specimen-blockquote">Design is not just what it looks like. Design is how it works.</blockquote>
    </div>

    <div class="specimen-row">
      <span class="specimen-meta"><code class="token-label">table</code></span>
      <table data-testid="specimen-table">
        <thead>
          <tr><th data-testid="specimen-th">Token</th><th>Value</th><th>Usage</th></tr>
        </thead>
        <tbody>
          <tr><td data-testid="specimen-td">--bg</td><td>#0b0d0c</td><td>Page background</td></tr>
          <tr><td>--ink</td><td>#d6e2dc</td><td>Primary text</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</div>

<style>
  .specimen-root {
    padding: 16px;
    background: var(--bg);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .specimen-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 12px;
  }
  .specimen-meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .token-label {
    font-size: 11px;
  }
  .token-size {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--ink-faint);
  }
  .specimen-clip {
    overflow: hidden;
    white-space: nowrap;
  }
</style>
