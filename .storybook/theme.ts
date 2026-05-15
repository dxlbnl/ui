import { create } from 'storybook/theming';

export const phosphorTheme = create({
	base: 'dark',

	// Surfaces
	appBg: '#0f1211',
	appContentBg: '#0b0d0c',
	appPreviewBg: '#0b0d0c',
	appBorderColor: '#1d2321',
	appBorderRadius: 2,

	// Typography
	fontBase: '"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif',
	fontCode: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',

	// Colors
	colorPrimary: '#ffb347',
	colorSecondary: '#ffb347',

	// Text
	textColor: '#d6e2dc',
	textMutedColor: '#a4b0a9',
	textInverseColor: '#0b0d0c',

	// Toolbar
	barTextColor: '#a4b0a9',
	barHoverColor: '#d6e2dc',
	barSelectedColor: '#ffb347',
	barBg: '#0f1211',

	// Input
	inputBg: '#141817',
	inputBorder: '#2a3330',
	inputTextColor: '#d6e2dc',
	inputBorderRadius: 2,

	// Branding
	brandTitle: 'Dexterlabs',
	brandUrl: 'https://dexterlabs.nl',
	brandTarget: '_blank',
});

export const paperTheme = create({
	base: 'light',

	// Surfaces
	appBg: '#e6e2d6',
	appContentBg: '#efece4',
	appPreviewBg: '#efece4',
	appBorderColor: '#cfcabc',
	appBorderRadius: 2,

	// Typography
	fontBase: '"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif',
	fontCode: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',

	// Colors
	colorPrimary: '#a04e00',
	colorSecondary: '#a04e00',

	// Text
	textColor: '#14110b',
	textMutedColor: '#3f3b30',
	textInverseColor: '#efece4',

	// Toolbar
	barTextColor: '#3f3b30',
	barHoverColor: '#14110b',
	barSelectedColor: '#a04e00',
	barBg: '#e6e2d6',

	// Input
	inputBg: '#f5f2ea',
	inputBorder: '#a8a192',
	inputTextColor: '#14110b',
	inputBorderRadius: 2,

	// Branding
	brandTitle: 'Dexterlabs',
	brandUrl: 'https://dexterlabs.nl',
	brandTarget: '_blank',
});
