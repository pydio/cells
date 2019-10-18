# Changes between v2.0.0-rc0 and v2.0.0-rc1

[See Full Changelog](https://github.com/pydio/cells/compare/v2.0.0-rc0...v2.0.0-rc1)

- [#8922daf](https://github.com/pydio/cells/commit/8922daf1e0237a9409358a52a149977e23b085cd): OAuthRouter : add fallback and oob routers, plus error detection in all routers
- [#8ca1d1f](https://github.com/pydio/cells/commit/8ca1d1fec4e31b5086a29dac9ced66e0f2eb70da): Updates : sort binaries by version using correct SemVer
- [#00996ad](https://github.com/pydio/cells/commit/00996adb739263309e77fd9cb2b2915a2a656712): Fixing configuration for hydra provider
- [#40972bb](https://github.com/pydio/cells/commit/40972bb109cb57732a8acf86191fbe1325b6bcaa): Sort closing chan issue
- [#b128d0b](https://github.com/pydio/cells/commit/b128d0b8922e4585e4475aa52c143b74cd685bd7): ConflictFileContent : for uni, do not try to detect most recent, all take source. For bi, try to use a more comprehensive suffix than left/right
- [#9f4759a](https://github.com/pydio/cells/commit/9f4759aabb1bfeb1f1b186d8872bc289590086dd): Meta : do not read name from cache (can lead to ux mismatch on rename)
- [#5faf4a2](https://github.com/pydio/cells/commit/5faf4a2f857a426d868896586622c74d5d617d4a): Compression: fix Archive name not taken into account
- [#4d37277](https://github.com/pydio/cells/commit/4d372771ccff6b24f7258d44273ed842a31a97de): Should fix #154
- [#4ec9fac](https://github.com/pydio/cells/commit/4ec9faca7d1e4c8a73ad281a44ea9f1b8f235022): Replace old "s3" endpoint declaration
- [#a2a37d0](https://github.com/pydio/cells/commit/a2a37d0d61ff1ba1c53665f67080545c7eae2f78): Use SystemCertPool instead of NewCertPool to include system root CAs
