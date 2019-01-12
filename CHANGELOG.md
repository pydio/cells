# Changes between v1.2.4 and v1.2.5

[See Full Changelog](https://github.com/pydio/cells/compare/v1.2.4...v1.2.5)

- [#fe65697](https://github.com/pydio/cells/commit/fe6569779816b5202a4b8aab6081ea22983cadaf): Rebuild js
- [#4eead08](https://github.com/pydio/cells/commit/4eead08d023b2970ec1700f1e0b35590a85b455d): Fix js error
- [#7ba9589](https://github.com/pydio/cells/commit/7ba95893ce6743aae7f14486e60e1f009af71ffe): Fix FF scrolling issues (flexbox+overflow)
- [#cdcb097](https://github.com/pydio/cells/commit/cdcb097b6ccdfea2a1271ae74fd44ea2fb1f0d35): Audit public link access
- [#9c0ca70](https://github.com/pydio/cells/commit/9c0ca70178105d9addd2072b61c4ae5a00260e9c): Fix multiple read events when streaming a file : log only when offset if 0.
- [#f9fd187](https://github.com/pydio/cells/commit/f9fd18720e858d982faacba0eb6554ef5a878416): New translations from Crowdin
- [#58eb9fa](https://github.com/pydio/cells/commit/58eb9fad25868c70f1e64be7d267b62ab8154d66): Fix rename / mkdir / mkfile dialogs: prevent using / in filename, pre-select the base of the name (without extension).
- [#5b69ba0](https://github.com/pydio/cells/commit/5b69ba07e6f53ca22c853bd6a8872a335e83c762): Add parameter to form configs for insecureSkipVerify
- [#de5632d](https://github.com/pydio/cells/commit/de5632d03c9792be2bc117df0b9033971d0c0cc4): fix param name in pydio.json
- [#57f1fe6](https://github.com/pydio/cells/commit/57f1fe66b66d9abeab83398fa3557259ce58354d): add UnsecuredSkipVerify smtp cert
- [#b07ad7c](https://github.com/pydio/cells/commit/b07ad7c497ddcf279eab602229a506e1c761e76b): Prevent creating user with an existing login
- [#b8d2041](https://github.com/pydio/cells/commit/b8d204117cd2f5e52fee0a959f83542c6fc0fcb0): Fix AddressBook messages when opening in popover: context is not transmitted, wrap component in a PydioContextProvider
- [#27b97a0](https://github.com/pydio/cells/commit/27b97a0221a7246f0b8c72d9a5bb52608c6197aa): Fix issue with updates on encrypted datasource
- [#c1c7d01](https://github.com/pydio/cells/commit/c1c7d017e672dc4d1986bc1f3423367f96e01661): Make sure to initialize zapFields event to an empty string, as a nil field crashes...
