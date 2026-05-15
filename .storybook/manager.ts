import { addons } from 'storybook/manager-api';
import { phosphorTheme, paperTheme } from './theme.js';

addons.setConfig({ theme: phosphorTheme });

function applyPalette(globals: Record<string, string>) {
	const theme = (globals.palette ?? 'phosphor') === 'paper' ? paperTheme : phosphorTheme;
	addons.setConfig({ theme });
}

// Use addons.ready() — getChannel() before init returns a mock that never receives events
addons.ready().then((channel) => {
	channel.on('setGlobals', ({ globals }: { globals: Record<string, string> }) => applyPalette(globals));
	channel.on('globalsUpdated', ({ globals }: { globals: Record<string, string> }) => applyPalette(globals));
});
