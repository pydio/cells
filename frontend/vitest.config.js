import { defineConfig } from 'vitest/config';

export default defineConfig({
	// only run tests in files with .test.js or .spec.js extensions
	test: {
		include: ['**/*.{test,spec}.js'],
	},
});
