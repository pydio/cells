# Changes between v4.0.3 and v4.0.4

[See Full Changelog](https://github.com/pydio/cells/compare/v4.0.3...v4.0.4)

- [#348ad33](https://github.com/pydio/cells/commit/348ad33a24c286a6b772a9cbea141409cee81402): New plugin for capturing webcam and screencast using Uppy.io (i18n)
- [#6b134b3](https://github.com/pydio/cells/commit/6b134b34e4f6972950b12133f6548085d7b7cba3): New messages + DE/FR translation
- [#bbb4ded](https://github.com/pydio/cells/commit/bbb4ded1fbc2a27ae2ee796a2d693363908b5ff1): New messages + DE/FR translation
- [#7dee2e7](https://github.com/pydio/cells/commit/7dee2e72976f1f1a79c41666d1728f9944122430): New plugin for capturing webcam and screencast using Uppy.io
- [#9efc9b4](https://github.com/pydio/cells/commit/9efc9b4595584dd9345b3eef3c7cce5083c72feb): Expose buildPresignedPutUrl in PydioApi object
- [#b1d039b](https://github.com/pydio/cells/commit/b1d039be1afbab0e6db6104b8a0bf75aee99103f): Adding locking to startup so that distributed services can start up at the same time
- [#9a03ac8](https://github.com/pydio/cells/commit/9a03ac84111d2c977977c65a10d28f6bef465a5c): Adding locking to startup so that distributed services can start up at the same time
- [#1b92c8f](https://github.com/pydio/cells/commit/1b92c8fd99448b816b3b25aa64452d9ccd687f06): Adding locking to startup so that distributed services can start up at the same time
- [#bb19db4](https://github.com/pydio/cells/commit/bb19db492db1215b4bfb03e76593bdde9739771d): Scheduler: fix log paths and debug on conditional filters
- [#4f0a085](https://github.com/pydio/cells/commit/4f0a08561f52ffdc37f24dc725bbdf6d8e4e2b90): Adding locking to startup so that distributed services can start up at the same time
- [#6577e06](https://github.com/pydio/cells/commit/6577e06b28cb455ea3b3c21919c5f64f1c309560): Refix exif extraction for binaries (images that do **not** have exif were breaking)
- [#8a98893](https://github.com/pydio/cells/commit/8a98893639b0f24356b5736b00e70731147a7b63): Simplify public link ID parsing, and fix issue with query params
- [#c9b2616](https://github.com/pydio/cells/commit/c9b2616c65d7c7366b2ce3a741d80a3d55b84da8): Fix acl-cache, do not change nil maps to empty ones. Use generics to clone maps (or nil).
- [#5e31231](https://github.com/pydio/cells/commit/5e31231263cd3a481256bedad804e39e1b893fef): Scheduler tasks: use new "debug" level to display Zaps as JSON
- [#65348e1](https://github.com/pydio/cells/commit/65348e12484032bd1f692722538001cdee242b65): Introduce a Debug level in jobs/tasks logger to send all actions input/output as well as filters and queries outputs.
- [#c4c7d9d](https://github.com/pydio/cells/commit/c4c7d9d0f2fd16596c05158abfb6aed067f22660): Fix truncated label on generic editor button
- [#209f97d](https://github.com/pydio/cells/commit/209f97da67cc982acec5bac42695d74b0f1bf773): Rewire context cancellation for datasource sync
- [#47f3728](https://github.com/pydio/cells/commit/47f3728dec9826622c3b4c4e982cb897753b28df): Struct datasource restore ChecksumProvider on wrapped s3 client.
- [#55ba219](https://github.com/pydio/cells/commit/55ba219e7e6d9e0c9b0ef06698b8bf62fd8aaa9e): acl in-memory cache may share memory address and create concurrent map accesses, eg. during massive uploads in personal-files.
- [#9932a90](https://github.com/pydio/cells/commit/9932a90f76033ee781dd37e5c3ca61afce7a5743): Fix TaskActivity to always display full log Msg
- [#e3accac](https://github.com/pydio/cells/commit/e3accaca0b163e13b49fc8a32124dbfdd1cd7263): Properly pass internal flag when updating hash, otherwise internal items are indexed. Fix exif orientation support for binaries.
- [#5a71379](https://github.com/pydio/cells/commit/5a71379f00b1a1aa49b465f20e68391b6814bcea): Next development cycle
