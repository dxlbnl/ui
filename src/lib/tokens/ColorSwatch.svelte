<script lang="ts">
	interface TokenGroup {
		label: string;
		tokens: string[];
	}

	interface Props {
		groups: TokenGroup[];
	}

	let { groups }: Props = $props();
</script>

<div class="swatch-root">
	{#each groups as group}
		<div class="swatch-group">
			<p class="eyebrow">{group.label}</p>
			<div class="swatch-row">
				{#each group.tokens as token}
					<div class="swatch-item">
						<div
							class="swatch-color"
							data-testid={token}
							style="background: var({token})"
						></div>
						<span class="swatch-name">{token}</span>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.swatch-root {
		padding: var(--u3);
		background: var(--bg);
		display: flex;
		flex-direction: column;
		gap: var(--u4);
	}

	.swatch-group {
		display: flex;
		flex-direction: column;
		gap: var(--u2);
	}

	.swatch-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--u2);
	}

	.swatch-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.swatch-color {
		width: 80px;
		height: 48px;
		border-radius: var(--radius-card);
		border: 1px solid var(--rule);
	}

	.swatch-name {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-dim);
	}
</style>
