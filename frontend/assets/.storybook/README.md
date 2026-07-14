# Storybook

Isolated component workbench for `frontend/assets` plugins.

## Run

```bash
pnpm install
pnpm storybook
```

Opens on http://localhost:6006.

## Where to put stories

Colocate next to the component:

```
<plugin>/res/js/**/MyComponent.stories.tsx
```

The Storybook config globs `*/res/**/*.stories.@(js|jsx|ts|tsx|mdx)`.

## Example stories

- `meta.user/res/js/fieldsv2/TextInput.stories.tsx` — simple controlled Mantine input.
- `meta.user/res/js/components/FieldEdit.stories.tsx` — complex polymorphic editor that
  switches input type from `meta.type`. Uses a stateful harness so stories are interactive.

## Config notes (gotchas already solved)

`.storybook/main.js` wires Vite so legacy plugin code works. Mirrors `vitest.config.js`:

1. **`.js` files containing JSX** — legacy plugins (`hoc/asMetaField.js`, etc.) use JSX
   inside `.js`. We replace Vite's react plugin with one that transforms `.jsx?/.tsx?`
   and point `optimizeDeps.entries` at story files only, so the esbuild dep-scanner
   never tries to parse legacy `.js` JSX.
2. **Mocks/aliases** — `pydio/*`, `cells-sdk`, `material-ui`, `@mocks`, and the
   `../hoc/asMeta*` HOCs are aliased to `__mocks__/`, identical to vitest.
3. **`vitest` stub** — root has `vitest@4`, but `@storybook/test` (loaded by the
   preview runtime for the `expect` global) needs the vitest≤2 expect API. We alias
   `vitest` to `__mocks__/vitest.js` (no-op shims). Stories don't run tests.

When adding aliases, update **both** `.storybook/main.js` and `vitest.config.js`.

## Providers

`preview.jsx` wraps every story in `MantineProvider` and imports `@mantine/core` +
`@mantine/dates` styles. Add other global providers there; per-story needs use decorators.

## Build static

```bash
pnpm build-storybook
```

Output goes to `storybook-static/` (gitignored).
