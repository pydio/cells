import React from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mdi/font/css/materialdesignicons.css';

/** @type {import('@storybook/react').Preview} */
const preview = {
	parameters: {
		controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
	},
	decorators: [
		(Story) => (
			<MantineProvider>
				<Story />
			</MantineProvider>
		),
	],
};

export default preview;
