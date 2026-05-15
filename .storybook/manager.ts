import { addons } from 'storybook/manager-api';
import { phosphorTheme, paperTheme } from './theme.js';

addons.setConfig({ theme: phosphorTheme });

addons.getChannel().on('GLOBALS_UPDATED', ({ globals }: { globals: Record<string, string> }) => {
	const theme = globals.palette === 'paper' ? paperTheme : phosphorTheme;
	addons.setConfig({ theme });
});
