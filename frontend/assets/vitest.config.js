import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [
		react({
			// Include legacy .js files that contain JSX syntax under assets/.
			include: ['**/*.jsx', '**/*.tsx', '**/*.js'],
		}),
	],
	resolve: {
		alias: {
			'@mocks': path.resolve(__dirname, '__mocks__'),

			// Provide a lightweight stub for the legacy global Pydio module in tests.
			pydio: path.resolve(__dirname, '__mocks__/pydio.js'),
			'material-ui/styles': path.resolve(__dirname, '__mocks__/material-ui-styles.js'),
			'material-ui': path.resolve(__dirname, '__mocks__/material-ui.js'),
			'../hoc/asMetaField': path.resolve(__dirname, '__mocks__/hoc.js'),
			'../hoc/asMetaForm': path.resolve(__dirname, '__mocks__/hoc.js'),
		},
	},
	test: {
		// Provide a browser-like DOM for React component testing.
		environment: 'jsdom',
		// Discover both .js and .jsx test files under the repo.
		include: ['**/*.{test,spec}.{js,jsx}'],
	},
});
