<script lang="ts">
  interface SwatchGroup {
    label: string;
    tokens: { name: string; value: string }[];
  }

  interface Props {
    groups: SwatchGroup[];
    palette?: 'paper' | 'phosphor';
  }

  let { groups, palette = 'phosphor' }: Props = $props();
</script>

<div class="swatch-root" data-palette={palette === 'paper' ? 'paper' : undefined}>
  {#each groups as group}
    <div class="swatch-group">
      <h3 class="group-label">{group.label}</h3>
      <div class="swatch-row">
        {#each group.tokens as token}
          <div class="swatch-item">
            <div
              class="swatch-color"
              data-token={token.name}
              data-testid={token.name}
              style="background-color: var({token.name})"
            ></div>
            <span class="swatch-name">{token.name}</span>
            <span class="swatch-value">{token.value}</span>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .swatch-root {
    padding: 16px;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--mono);
  }
  .swatch-group {
    margin-bottom: 24px;
  }
  .group-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin: 0 0 12px 0;
    font-weight: 500;
  }
  .swatch-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .swatch-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .swatch-color {
    width: 80px;
    height: 48px;
    border-radius: 4px;
    border: 1px solid var(--rule);
  }
  .swatch-name {
    font-size: 11px;
    color: var(--ink-dim);
  }
  .swatch-value {
    font-size: 10px;
    color: var(--ink-faint);
  }
</style>
