const path = require('path');

const assetsRoot = path.resolve(__dirname, '..');



/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
	stories: [
		'../*/res/**/*.stories.@(js|jsx|ts|tsx|mdx)',
		'../*/res/**/*.mdx',
	],
	addons: [
		'@storybook/addon-docs',
	],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	docs: { autodocs: 'tag' },
	viteFinal: async (config) => {
		const react = (await import('@vitejs/plugin-react')).default;
		config.plugins = config.plugins || [];
		// Replace default react plugin with one that also transforms .js files.
		config.plugins = config.plugins.filter((p) => {
			const n = p && (p.name || (Array.isArray(p) && p[0]?.name));
			return !(typeof n === 'string' && n.startsWith('vite:react'));
		});
		config.plugins.unshift(react({ include: [/\.jsx?$/, /\.tsx?$/] }));
		config.optimizeDeps = config.optimizeDeps || {};
		// Only scan story files for dep pre-bundling so the esbuild scanner never
		// walks into legacy .js files containing JSX (which it can't parse).
		config.optimizeDeps.entries = [
			path.resolve(assetsRoot, '*/res/**/*.stories.@(js|jsx|ts|tsx)'),
		];
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'@mocks': path.resolve(assetsRoot, '__mocks__'),
			'pydio/http/api': path.resolve(assetsRoot, '__mocks__/pydio-http-api.js'),
			'pydio/http/resources-manager': path.resolve(assetsRoot, '__mocks__/pydio/http/resources-manager.js'),
			'pydio/http/search-api': path.resolve(assetsRoot, '__mocks__/pydio/http/search-api.js'),
			'pydio/model/data-model': path.resolve(assetsRoot, '__mocks__/pydio/model/data-model.js'),
			'pydio/model/empty-node-provider': path.resolve(assetsRoot, '__mocks__/pydio/model/empty-node-provider.js'),
			'pydio/model/node': path.resolve(assetsRoot, '__mocks__/pydio/model/node.js'),
			'pydio/util/lang': path.resolve(assetsRoot, '__mocks__/pydio/util/lang.js'),
			pydio: path.resolve(assetsRoot, '__mocks__/pydio.js'),
			'material-ui/styles': path.resolve(assetsRoot, '__mocks__/material-ui-styles.js'),
			'material-ui': path.resolve(assetsRoot, '__mocks__/material-ui.js'),
			'cells-sdk': path.resolve(assetsRoot, '__mocks__/cells-sdk.js'),
			// Legacy HOCs written as .js with JSX are stubbed (mirrors vitest.config).
			'../hoc/asMetaField': path.resolve(assetsRoot, '__mocks__/hoc.js'),
			'../hoc/asMetaForm': path.resolve(assetsRoot, '__mocks__/hoc.js'),
			// Stories don't run tests. Stub out vitest so Storybook's preview runtime
			// (which loads @storybook/test) doesn't pull the root vitest@4 whose
			// expect API is incompatible with @storybook/test@8.6.
			vitest: path.resolve(assetsRoot, '__mocks__/vitest.js'),
		};
		return config;
	},
};

module.exports = config;
