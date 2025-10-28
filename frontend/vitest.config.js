import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [
		react({
			// Include legacy .js files that contain JSX syntax under assets/.
			include: ['**/*.jsx', '**/*.tsx', 'assets/**/*.js'],
		}),
	],
	test: {
		// Enable Jest-like global APIs (describe, it, expect) without imports.
		globals: true,
		// Provide a browser-like DOM for React component testing.
		environment: 'jsdom',
		// Discover both .js and .jsx test files under the repo.
		include: ['**/*.{test,spec}.{js,jsx}'],
	},
});
