# Pydio Cells v5 — Personal Fork

An independent, experimental fork of [Pydio Cells](https://github.com/pydio/cells), exploring a more open and self-hosting-friendly direction for the Cells platform.

> **Work in progress:** This fork is not a production-ready replacement for Pydio Cells. Features, compatibility, deployment instructions, and project direction may change.

## Project direction

The goal is to build on the existing Cells v5 codebase rather than start another file-platform rewrite from scratch.

Current areas of interest:

- **Document editing:** offer [Euro-Office](https://github.com/Euro-Office), an open-source collaborative office suite, as an optional editor without relying on the Cells Enterprise edition.
- **Open integrations:** keep core functionality and integrations accessible without making essential capabilities dependent on an enterprise-only edition.
- **Self-hosting:** make the platform practical to operate on independently managed infrastructure.
- **Maintainability:** preserve useful upstream work and make changes deliberately, with clear documentation.

Euro-Office integration is implemented as an optional editor plugin. It is **disabled by default**. When disabled, Cells skips starting the WOPI service and continues to use whichever other editor plugins are enabled.

To enable it, configure these values under `frontend.plugin.editor.eurooffice` in the Cells configuration, then restart Cells:

```yaml
frontend:
  plugin:
    editor.eurooffice:
      PYDIO_PLUGIN_ENABLED: true
      EUROOFFICE_INTERNAL_URL: "http://euro-office:8080"
      EUROOFFICE_PUBLIC_URL: "https://office.example.com"
      WOPI_HOST_BASE_URL: "https://cells.example.com"
```

`EUROOFFICE_INTERNAL_URL` is used by Cells to fetch Euro-Office discovery data. `EUROOFFICE_PUBLIC_URL` is reached by the user's browser. `WOPI_HOST_BASE_URL` is the public Cells origin that Euro-Office must call back to. Use URLs reachable from each respective network location and HTTPS for public deployments. The corresponding disabled example is in `common/config/eurooffice.yaml`.

The integration currently covers editor discovery, launch, and WOPI document access. It does not add a separate session-management, batch-editing, or version-history feature.

### Euro-Office deployment and resource notes

Follow the [official Docker installation guide](https://euro-office.github.io/documentation/installation/docker/) for the Document Server. Its current prerequisites list 4 GB RAM minimum and 5 GB disk for the image. Euro-Office includes document and conversion services; its documented architecture also uses Redis, RabbitMQ, and a SQL database. Budget those resources in addition to Cells and its own database/services.

For a production deployment, set a persistent `JWT_SECRET`, keep `JWT_ENABLED=true`, set `WOPI_ENABLED=true` for this integration, and leave the example app disabled. The official guide documents these settings and health check. Use its supported image and persistence instructions rather than the old sample values that used to be in this repository.

## Current status

This repository is based on the Pydio Cells v5 development code. It currently retains substantial upstream code and project structure; fork-specific changes are at an early stage.

- Upstream: [pydio/cells](https://github.com/pydio/cells)
- Euro-Office: [Euro-Office organization on GitHub](https://github.com/Euro-Office)
- Development branch: `v5-dev`
- Language: Go
- License: [GNU Affero General Public License v3](LICENSE)

Some fork-specific work remains experimental; check the relevant feature documentation before relying on it.

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
