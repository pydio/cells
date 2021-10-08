# Changes between v3.0.0-rc2 and v3.0.0-rc3

[See Full Changelog](https://github.com/pydio/cells/compare/v3.0.0-rc2...v3.0.0-rc3)

- [#d17c180](https://github.com/pydio/cells/commit/d17c180046e272679f44d1ed919a5fafe61bbb9f): Fixing order of updates
- [#9b3e081](https://github.com/pydio/cells/commit/9b3e0816932775caf4b5aa523754ea9fe9670ed0): Sync start : remove logs on first try when pinging object service.
- [#0855bf5](https://github.com/pydio/cells/commit/0855bf51c6230793d4bb40b3bda1fe2b65f156cb): We may have an unclosed stream
- [#48b3ce7](https://github.com/pydio/cells/commit/48b3ce73316bcd94961e883318e774d074ff6457): Fixing nodes indexing for really long mpath
- [#1156bd9](https://github.com/pydio/cells/commit/1156bd9a8e95bbe5b5220dbe478e8975f88900d9): Change public links password update : delete/recreate user to force disconnection if link is already loaded.
- [#7920bb6](https://github.com/pydio/cells/commit/7920bb6bab29d09c869b360fa24a223b86d556a9): /frontend/state : always send an empty state
- [#a9d69a8](https://github.com/pydio/cells/commit/a9d69a85e81d7e9991a2eed89bb1fc12b9b3e871): Fix login box minHeight on public links
- [#dc7d50a](https://github.com/pydio/cells/commit/dc7d50a0c0e129517f1904c6f77efac979fd0ddf): Merge remote-tracking branch 'origin/master'
- [#95f209c](https://github.com/pydio/cells/commit/95f209ce43a10f01323db4448d6a8b3dfc9c8a2b): Bleve : forceReloadCore is type is unknown.
- [#4db9a82](https://github.com/pydio/cells/commit/4db9a826ef4badcaa27b5a807789f2ff03ac8bc4): Change cluster
- [#04ccb2f](https://github.com/pydio/cells/commit/04ccb2f8b11ace192e704b707dedf538b58c78bd): Merge remote-tracking branch 'origin/master'
- [#818b523](https://github.com/pydio/cells/commit/818b523f4d6089d29504da103e49f18fca2b5443): Look up package.info in /opt/pydio
- [#1c82b8c](https://github.com/pydio/cells/commit/1c82b8cb969b0e15915ef84de5688da6f109989e): Rather use same conventions for all images
- [#493b02b](https://github.com/pydio/cells/commit/493b02b4bf666c60e3db895642ab9f518375a0b6): Add a package.info file
- [#0f48503](https://github.com/pydio/cells/commit/0f4850338e60803028c76badc2d477e312bfc1af): HttpWrappers : specific case for /frontend/state endpoint to always return an xml state to the UX.
- [#8e7acee](https://github.com/pydio/cells/commit/8e7aceeac2cf91b00047aa56fb507840aa8b6280): Merge remote-tracking branch 'origin/master'
- [#53e8194](https://github.com/pydio/cells/commit/53e81945eafe55fd03ad3754eee2f475308d360e): Show mimefont badge for docs with ImagePreview
- [#ad1cb93](https://github.com/pydio/cells/commit/ad1cb9352b31efae08c92a929076c94ab9001507): Add standard "CELLS_LOG" environment flag
- [#5e2fd4d](https://github.com/pydio/cells/commit/5e2fd4d146ed66f54379c9c540a6d44f1200d6ef): i18n bundle initializations can lead to a lock
- [#c0b43ad](https://github.com/pydio/cells/commit/c0b43ad42175f731cc4bb4840145ef3f9005fe8c): Fix indexation issue on UpdateContent event
- [#fee6855](https://github.com/pydio/cells/commit/fee6855f1d47e132a29302aa042140cefddc735e): Handle loginLanguage from sessionStorage
- [#9132d11](https://github.com/pydio/cells/commit/9132d11f351964918b22f1071e77757bc6e23f2b): Login language changed: temp store in sessionStorage
- [#3d90a0e](https://github.com/pydio/cells/commit/3d90a0ebf5c14eecb3698cb096ff81db890a5f30): Added WARN level in logs filter
- [#815bc04](https://github.com/pydio/cells/commit/815bc04c6ad2c1d092faf0e4fde5c2a6a606fcb2): Hide [DEV NOTICE] about specific proxy registering
- [#9430018](https://github.com/pydio/cells/commit/9430018025f90bf7cdc48fc6f52e6224aa3a3c1f): Fix top-bar zIndex for Mobile display
- [#6f160a2](https://github.com/pydio/cells/commit/6f160a2487acb795109751d4948bc6f13297679a): Updater board : handle backend.PackagingInfo display
- [#433e7be](https://github.com/pydio/cells/commit/433e7be57289f7dd58da6e4cba9ea4413a19bf14): Read and display content of package.info file if found
- [#537646e](https://github.com/pydio/cells/commit/537646eb67fe8e8fc8faa1a52f20b84215eda50e): Fix config values merged on save, plus API returns updated values.
- [#4cf5cd1](https://github.com/pydio/cells/commit/4cf5cd164c3889bfd1a51b0486906c35d22dff3f): Fix wrong comparison
- [#e9880a3](https://github.com/pydio/cells/commit/e9880a37e11d758e02dd8f888d6bb6cda43edd56): Update "started/stopping" messages (capitalized)
- [#38e0437](https://github.com/pydio/cells/commit/38e0437a5211295745eecfff4e7a1b9c23a4cf14): Login middlewares : if "lang" is set and login succeed, update user language (acl).
- [#3e767bb](https://github.com/pydio/cells/commit/3e767bbedbd108566f7ea57979ded19c33427254): Authfront session login : optional "lang" param
- [#8fb852a](https://github.com/pydio/cells/commit/8fb852ab9f5d9fccbd490dd606959b7b40e5c989): Fix defaults for language, always use core.pydio main option (or "en-us" value)
- [#429a49e](https://github.com/pydio/cells/commit/429a49ed0ed3ae5d03e89e4570657b8b0ec6ed5d): Re-adapt installer background and palette, fix i18n picker
- [#ab6a19b](https://github.com/pydio/cells/commit/ab6a19b29a021a9cf89b65cc9499618247a17d77): Recompile install languages
