# Pydio Cells v5 — Personal Fork

An independent, experimental fork of [Pydio Cells](https://github.com/pydio/cells), exploring a more open and self-hosting-friendly direction for the Cells platform.

> **Work in progress:** This fork is not a production-ready replacement for Pydio Cells. Features, compatibility, deployment instructions, and project direction may change.

## Project direction

The goal is to build on the existing Cells v5 codebase rather than start another file-platform rewrite from scratch.

Current areas of interest:

- **Document editing:** investigate integration with [Euro-Office](https://github.com/Euro-Office), an open-source collaborative office suite project, as the preferred office integration.
- **Open integrations:** keep core functionality and integrations accessible without making essential capabilities dependent on an enterprise-only edition.
- **Self-hosting:** make the platform practical to operate on independently managed infrastructure.
- **Maintainability:** preserve useful upstream work and make changes deliberately, with clear documentation.

These are project goals, not claims that the integrations or changes are already implemented. In particular, Euro-Office integration is planned work.

## Current status

This repository is based on the Pydio Cells v5 development code. It currently retains substantial upstream code and project structure; fork-specific changes are at an early stage.

- Upstream: [pydio/cells](https://github.com/pydio/cells)
- Euro-Office: [Euro-Office organization on GitHub](https://github.com/Euro-Office)
- Development branch: `v5-dev`
- Language: Go
- License: [GNU Affero General Public License v3](LICENSE)

Expect incomplete work and upstream behavior until changes are implemented and documented here.

## Building from source

### Requirements

The current `go.mod` declares Go **1.27.3** as its toolchain version. Use a compatible Go toolchain.

### Get the source

```sh
git clone https://github.com/italiatroller-1990/cells-personal-fork.git
cd cells-personal-fork
git switch v5-dev
```

### Build

The repository includes the upstream development build target:

```sh
make dev
```

Runtime configuration and database requirements are still being reviewed for this fork. Do not assume that upstream deployment documentation describes the final supported setup here.

## Tests

Run the Go test suite with:

```sh
go test ./...
```

The project is large, and a successful build or test run does not by itself mean every feature is production-ready.

## Contributing

This is currently a personal development fork. Before proposing substantial changes, open an issue or discussion so the intended behavior and scope can be agreed upon.

Please include relevant tests and documentation with code changes. Be clear about whether a feature is implemented, experimental, or only planned.

## Upstream project and attribution

This project is derived from [Pydio Cells](https://github.com/pydio/cells). The upstream project, its contributors, and its documentation remain important references for understanding the codebase.

- [Pydio website](https://pydio.com/)
- [Upstream source repository](https://github.com/pydio/cells)
- [Upstream developer guide](https://pydio.com/en/docs/developer-guide)

This fork is independent and is not presented as an official Pydio project.

## License

This fork retains the upstream project's **AGPLv3** licensing. See [LICENSE](LICENSE) for the license text.
