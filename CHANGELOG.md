# Changes between v4.0.0-beta3 and v4.0.0-beta4

[See Full Changelog](https://github.com/pydio/cells/compare/v4.0.0-beta3...v4.0.0-beta4)

- [#59a4f65](https://github.com/pydio/cells/commit/59a4f6574980f0067b9ffa05e999ad170b15b6d3): Fixing etcd delete action issue
- [#439135d](https://github.com/pydio/cells/commit/439135d526120e86ae808de572721f96e209d624): Small fixes on Search Form open/close UX
- [#7c15b18](https://github.com/pydio/cells/commit/7c15b186610c89692ace89fb1aa1205e371f5c9d): Recompile installer languages
- [#647910a](https://github.com/pydio/cells/commit/647910a710cd116b2d7ad362b0cd5de77e27f0a9): Fix i18n message during web install
- [#3a9930a](https://github.com/pydio/cells/commit/3a9930a37347bc21217286002aa0e21f3fc78de4): Fix i18n message during web install
- [#854d883](https://github.com/pydio/cells/commit/854d8839dc23ea252fe152d67cb72670ad3de785): Fixing etcd
- [#bb3fc42](https://github.com/pydio/cells/commit/bb3fc42485fc80239afea310d14dd62bb22e50c3): Fix unique watch, make one per server
- [#c7d12d0](https://github.com/pydio/cells/commit/c7d12d04844e375b70ee8326f481cb908365a7fa): Fix i18n message
- [#a2e1b57](https://github.com/pydio/cells/commit/a2e1b5758a59a3b99e9a615add4139c032f20f4b): Remove unused service.Dependency() option
- [#500bb09](https://github.com/pydio/cells/commit/500bb09f420cf731ff710444d9d448a49d2c241e): Remove log.Fatal when possible, make error more explicit otherwise.
- [#e81eb63](https://github.com/pydio/cells/commit/e81eb637349d00f5e1727ec36379b373c3989784): Fixing delete update for config
- [#ed33508](https://github.com/pydio/cells/commit/ed33508bf011b09fb625d921a8f5124567a7bc8d): New ServeOption WaitUntilServe to make sure discovery services are started before starting forks. New Env CELLS_TRACE_FATAL for better capturing hidden dependencies log.Fatal calls.
- [#3110703](https://github.com/pydio/cells/commit/31107039e1e22d8b5a24f1a217059fc9ce83e470): Fix tasks progress display
- [#f2dae45](https://github.com/pydio/cells/commit/f2dae4591d600abd9cbe999cf892b3cb818b4443): Try to use new admin config check command in docker-entrypoint.sh
- [#e473c8c](https://github.com/pydio/cells/commit/e473c8c9c47eef8a3b0f6be5b7f626438e7635d1): Add 'admin config check' command to check if an install has already been performed. Add readOnly flag in configs to avoid creating an empty json in that case.
- [#dafd0ea](https://github.com/pydio/cells/commit/dafd0ea46da3ab7a0252ea4bff79660add463a85): More Spanish
- [#d144617](https://github.com/pydio/cells/commit/d1446174dddee417bbf80abb5568ceea0d3cd3a3): More Spanish
- [#98b1e66](https://github.com/pydio/cells/commit/98b1e66b5333b12cbddabeb420b82fc691dd7552): Fix space after 'open browser window'
- [#9abe08b](https://github.com/pydio/cells/commit/9abe08b0afc69bec545066f86641fb39c117c595): Fix redirect http to https
