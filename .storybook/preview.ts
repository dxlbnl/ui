import type { Preview } from '@storybook/sveltekit';
import { phosphorTheme, paperTheme } from './theme.js';
import '../src/app.css';

const preview: Preview = {
	globalTypes: {
		palette: {
			name: 'Palette',
			description: 'Color palette',
			defaultValue: 'phosphor',
			toolbar: {
				icon: 'circlehollow',
				items: [
					{ value: 'phosphor', icon: 'circle', title: 'Phosphor (dark)' },
					{ value: 'paper', icon: 'circlehollow', title: 'Paper (light)' },
				],
			},
		},
	},
	decorators: [
		(Story, context) => {
			const palette = context.globals?.palette ?? 'phosphor';
			if (palette === 'paper') {
				document.documentElement.setAttribute('data-palette', 'paper');
			} else {
				document.documentElement.removeAttribute('data-palette');
			}
			return Story();
		},
	],
	parameters: {
		backgrounds: { disable: true },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			test: 'todo',
		},
		docs: {
			theme: phosphorTheme,
		},
	},
};

export default preview;
