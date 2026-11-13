# Frontend asset builds

The commands below use Nx projects inferred from each plugin's `package.json`. Run them from `frontend/assets`, or use the repository-root examples in the next section.

## Build examples

### From `frontend/assets`

Build one plugin for development/watch (recommended; keeps only the selected plugin watcher active):

```sh
pnpm run build:dev meta.user:build --skip-nx-cache
```

Build every plugin for production by supplying the environment as the caller:

```sh
NODE_ENV=production pnpm run build:prod
```

Build only `<plugin.name>` for production:

```sh
NODE_ENV=production pnpm run build:prod:plugin meta.user:build
```

Replace `meta.user` with another Nx project name to target a different plugin. For example, to build only `editor.pdfjs` in development mode, run:

```sh
env -u NODE_ENV pnpm run build:dev editor.pdfjs:build --skip-nx-cache
```

The plugin-specific scripts are parameterized wrappers around `nx run`; there is no separate root script to maintain for each plugin. Pass the target directly after the script name, without a `--` separator: pnpm forwards that separator to Nx, preventing it from parsing the target. Extra Nx options, such as `--verbose`, follow the target. You can also invoke Nx directly for a development build:

```sh
pnpm exec nx build meta.user --skip-nx-cache
```

### From the repository root

Prefix the same package scripts with `pnpm --dir frontend/assets`. For example:

```sh
pnpm --dir frontend/assets run build:dev meta.user:build --skip-nx-cache
make cells-web-assets
```

## Modes and generated files

The root package scripts inherit `NODE_ENV`; they do not set or unset it. With `NODE_ENV` unset, the shared webpack configuration uses development mode and watches for changes. For CI, `make cells-web-assets` supplies `NODE_ENV=production` once to the pnpm command and its children. That recipe-local assignment does not change the calling terminal's environment, so later development commands do not need an unset prefix.

When invoking a production package script directly, supply `NODE_ENV=production` as shown above. The `build:prod` name alone does not select production mode. Nx build caching and the `res/dist` output locations are configured in `nx.json`; `NODE_ENV` is a cache input so development and production outputs do not share a cache entry.

### Development/watch mode and the Nx cache

Use `--skip-nx-cache` for development/watch commands. The shared `build` target is cacheable, so without this flag Nx can replay an earlier build's output and exit successfully without starting webpack or a watcher. A message such as `existing outputs match the cache` or `Nx read the output from the cache` means no watcher was started for that task, even if the replayed log shows a successful webpack compilation.

For example, to watch `access.settings` with verbose output:

```sh
pnpm run build:dev access.settings:build --skip-nx-cache --verbose
```

The watcher runs in the foreground, not detached. Leave that terminal open while editing source files; use another terminal for other commands. Stop the watcher with `Ctrl+C`. If the command returns to the prompt, it is no longer watching. If you previously exported `NODE_ENV=production` in your terminal yourself, run `unset NODE_ENV` before development; the package scripts intentionally respect the caller's environment.

Production commands can keep Nx caching enabled; they are intended to finish and exit.

Builds write generated files under each plugin's `res/dist` directory. These files are currently tracked by Git, so building all plugins can create many working-tree changes. Use a plugin-specific command when you only need to rebuild one plugin; only that plugin's generated files should be affected, though its own `res/dist` files may still change.

**Exception:** `gui.ajax` currently sets `NODE_ENV=production` inside its own `build` script. Nx development commands targeting `gui.ajax` therefore still run its production build steps instead of the general development/watch behavior described above.
