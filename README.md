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

## Enhanced Document Editing

The fork now includes **Euro-Office integration** for collaborative document editing:

- **Direct Euro-Office editor** embedded in the web interface
- **WOPI protocol** integration for real-time collaboration
- **File type auto-detection** for Office documents (.docx, .xlsx, .pptx, etc.)
- **Configurable editor preferences** (Euro-Office vs LibreOffice)
- **Session management** with timeout controls
- **Batch operations** for multiple files
- **Version history** tracking per document

### Euro-Office Configuration
Configure Euro-Office via `common/config/eurooffice.yaml`:

```yaml
# Core Euro-Office settings
services:
  pydio.web.editor:
    eurooffice:
      # Internal URL for Euro-Office discovery (used by backend)
      internal_url: "http://localhost:8080"
      # Public URL for frontend access (used by browser)
      public_url: "http://localhost:8080"
      # WOPI host base URL (must match Euro-Office server)
      wopi_host_base_url: "http://localhost:8080"
      # Auto-refresh window for access tokens (seconds)
      auto_refresh_window: 3600
      # Default language for UI
      default_language: "en"
      # File extensions to open with Euro-Office
      extensions: ["docx", "xlsx", "pptx", "doc", "xls", "ppt", "pdf"]
      # Enable/disable Euro-Office editor globally
      enabled: true
      # Fallback to LibreOffice when Euro-Office not available
      fallback_to_libreoffice: true

# Backend configuration for Euro-Office WOPI handler
gateway:
  restv2:
    editor:
      eurooffice:
        # WOPI server endpoint
        wopi_server: "http://localhost:8080/wopi"
        # Authentication token for WOPI requests
        auth_token: "${EUROOFFICE_WOPI_TOKEN:-}"
        # Proof key validation
        validate_proof: true
        # Auto-save interval (seconds)
        auto_save_interval: 30
        # Enable real-time collaboration
        enable_realtime: true
```

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
