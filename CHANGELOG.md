# Pydio Cells

 Changes in v1.2.1 - Bugfixes Release 

[See Full Changelog](https://github.com/pydio/cells/compare/v1.2.0...v1.2.1)

- [#29b9e7f](https://github.com/pydio/cells/commit/29b9e7f11286a8a07c4621018a6cf474434c9165): Fix config upgrade process requiring double restart
- [#224f9c5](https://github.com/pydio/cells/commit/224f9c514e81cc58e3ea1ca9d2941416f89fb852): Add an additional check when recycle root is not found on personal workspace
- [#4aab94f](https://github.com/pydio/cells/commit/4aab94fb41a591b92e0ec985a446d2f5e719f72d): Expose RolesCleaner
- [#747ea6e](https://github.com/pydio/cells/commit/747ea6e489b1547738b8950c4b910bceea5cfc71): Put back getAutoStart
- [#b8617c8](https://github.com/pydio/cells/commit/b8617c88e33e42456dfa1f521acd4c04aa4fa4d5): Do not leave comments in transpiled code
- [#b3697a1](https://github.com/pydio/cells/commit/b3697a1d5c57276030e6ab4fee1b9c2a8cbb42f3): Refactor uploader
- [#4adfaaf](https://github.com/pydio/cells/commit/4adfaafc5fe1a3c98664dfe413eede41cbd8d40d): Missing log call
- [#a82fa8e](https://github.com/pydio/cells/commit/a82fa8e59e962d1049ef9cd3d44b79e719c9fdac): Hide anon user by default
- [#5899d7b](https://github.com/pydio/cells/commit/5899d7b8aa501fa351ed9fd258cbf97ab55f9b59): Dav : leave prefix untouched in proxy and strip it in dav handler.
- [#ddda688](https://github.com/pydio/cells/commit/ddda688125861aef91fcc5b58bd1aed0d9b8abc4): Collabora default config
- [#acc2c8c](https://github.com/pydio/cells/commit/acc2c8c41f97acf8a1daab90d8a4057aee986e63): Remove unused file.
- [#8eb2cd3](https://github.com/pydio/cells/commit/8eb2cd3021f288eacfd6fc12ca5a4ebc0148de7b): Adding stack trace if in debug for every errors
- [#69c6899](https://github.com/pydio/cells/commit/69c6899e8905a7bdfcb6b54e7523ea55cf127a94): Fixing last bit of collabora
- [#a2fbab6](https://github.com/pydio/cells/commit/a2fbab6eceff1776351956c2b089a45bbdf9e246): Diaporama: fix exif orientation in preview
- [#c6a3193](https://github.com/pydio/cells/commit/c6a31933d739f0c47216f6f218af0649b30dc814): Fix port displayed for main proxy in Services page, also set consul and install services as disabled instead of red status.
- [#bcc191d](https://github.com/pydio/cells/commit/bcc191d029d161a9598086d0df8c8a4d85567d2e): Disable cookie session on binaries POST
- [#b72955f](https://github.com/pydio/cells/commit/b72955f288d4b62df4edc0d75ee33a457de01dfb): Import goqu sqlite3 adapter for tests.
- [#ed169f6](https://github.com/pydio/cells/commit/ed169f664e412d51903904ac2f0f28ae4246c7b7): Import goqu sqlite3 adapter for tests. Fix nil user.Attributes
- [#714f51c](https://github.com/pydio/cells/commit/714f51c1ee6a37e1b853581d00bce68d70a5bfca): ACL stmt fix
- [#0e5192c](https://github.com/pydio/cells/commit/0e5192c0c73d413556c16bc4ddc66bc0dc32222e): Fix user search being case sensitive : Fix Like statements: we should use ILike instead of Like (which converts to LIKE BINARY in mysql). Store a copy of user login in attributes, to allow non-binary search on this field.
- [#987cc4a](https://github.com/pydio/cells/commit/987cc4ae3cc614cbf1387846deeb17af6c7b18aa): Merge
- [#599f02e](https://github.com/pydio/cells/commit/599f02e5f54308d5969fc153ee47790155c99ffc): Fix to mysql dex lock issue
- [#98308d7](https://github.com/pydio/cells/commit/98308d717192833d45adad4c619ea999ee5dc447): Fix copy task : first create fresh folders then copy files (ignoring .pydio)
- [#1e48526](https://github.com/pydio/cells/commit/1e485267930587cb1f15f13c7a81f6cf0d2c5ff1): Fix concurrent CreateFolder's : could lead to inadequation between .pydio content and node uuid in index.
- [#732a752](https://github.com/pydio/cells/commit/732a752d3cb10171ee9b8741717aa20d37bd4933): Add clean operation on users roles when roles are deleted.
- [#41b7f5c](https://github.com/pydio/cells/commit/41b7f5c748ffdb59fa72ee841e65b6d9a668159c): Rework tasks panel
- [#7af298d](https://github.com/pydio/cells/commit/7af298db026526c71ceda48fe391fd8a37eff952): Merge remote-tracking branch 'origin/master'
- [#678c66e](https://github.com/pydio/cells/commit/678c66e4d975c924a30a413ed52c812ccd655200): Batcher logs format in debug mode
- [#5040114](https://github.com/pydio/cells/commit/5040114da0fb56649e030d2b5065291ac9f6362d): Implementing retry for upload
- [#3cee5fd](https://github.com/pydio/cells/commit/3cee5fd552bee77a115174d781adcecf46cf95ba): Manage multiple download - Fix download name when downloading a virtual root. Create constants for DOCSTORE_ID_XXX strings.
- [#865c35a](https://github.com/pydio/cells/commit/865c35a8b078b0aa12f44ccedbfc195810f90362): Ui: handle multiple selection - add parameter to choose default format for download (zip, tar, tar.gz)
- [#b8a87a4](https://github.com/pydio/cells/commit/b8a87a4c181067fb407cd0ebd7f50e15dcebdfc3): Unused proto
- [#4d2e657](https://github.com/pydio/cells/commit/4d2e6579b5785c1d0cf1b766d2e1cbe5b8d43921): Sort datasources in workspace folder picker
- [#8c4ed9c](https://github.com/pydio/cells/commit/8c4ed9ccb7e9eb5cafa9ea41e84fe32e83bd5b97): Massive renaming / Show correct port in Services admin interface for gateways
- [#16b70bc](https://github.com/pydio/cells/commit/16b70bc2364ac206fa641db8823d0bf2c6438e1b): AWS Js-sdk config: add s3ForcePathStyle parameter
- [#28](https://github.com/pydio/cells/pull/28): Add a few more keys. Some minor correction in French.
- [#02f3c14](https://github.com/pydio/cells/commit/02f3c14ac92a46a7da6d1f81a9782bb56feb5ed3): New Crowdin translations (#13)
- [#14](https://github.com/pydio/cells/pull/14): Get latest changes from remote master
- [#08e277d](https://github.com/pydio/cells/commit/08e277db7eea53db4af270c5bca27f9cd5defdbd): Add some admin commands for managing users profile and locks in main binary (in case admin does not have cell-ctls installed).
- [#0ccc28e](https://github.com/pydio/cells/commit/0ccc28ed86d26feaf97e786efea18c5443affcb7): Add comment on fork method
- [#bd1d54b](https://github.com/pydio/cells/commit/bd1d54bca11082d44514fd36bc9f977c2cd456f6): UX fixes - left column, top right icons, overlay icons in list.
- [#6be4080](https://github.com/pydio/cells/commit/6be4080204294fd92a1f324cc34c2cb2788196d6): Remove WebODF plugin
- [#a0eba8f](https://github.com/pydio/cells/commit/a0eba8f8ceaa3663c77ab132efbb5fcc2fd24e07): Group constants and add more comments.
- [#d082825](https://github.com/pydio/cells/commit/d082825581023ea4955154697d2f138a50372cc8): Merge remote-tracking branch 'origin/master'
- [#8f841dc](https://github.com/pydio/cells/commit/8f841dcda61b008bf445cec1749002c673308176): Missing xml node
- [#7a993a2](https://github.com/pydio/cells/commit/7a993a21011898ca2dd90480fd6c97db54089f42): Add front-srv/assets to exclude from linguist
