# Changes between v2.1.6 and v2.1.11

[See Full Changelog](https://github.com/pydio/cells/compare/v2.1.6...v2.1.11)

- [#7b21c9b](https://github.com/pydio/cells/commit/7b21c9befe72662a76b3c761639ae7e2c9de39bd): Update of dexidp
- [#7e608a9](https://github.com/pydio/cells/commit/7e608a95526510dd724d857eaf07e64e5d55bb63): Additional unit tests in frontend package
- [#43fd478](https://github.com/pydio/cells/commit/43fd4782490476af53dcf1a1cdc2796e25b70397): Adapt cherry-pick to stable
- [#fde9da6](https://github.com/pydio/cells/commit/fde9da62bbd20c7b31a899dabbef76cf10ac59c6): Various enforcements on share links preset options
- [#f96e295](https://github.com/pydio/cells/commit/f96e2958e7808d5552226d40f264cce8cd2cb293): Fix build on go 1.13 for hotfix builds.
- [#3acd650](https://github.com/pydio/cells/commit/3acd65057067b818d8e61138e5c6d6696732c6ad): Removing log that display all potential duplicate nodes
- [#f8118b5](https://github.com/pydio/cells/commit/f8118b56fc8e9219d0bfb1134c5cf6683d27851d): add log to cellsflows log
- [#6eaea13](https://github.com/pydio/cells/commit/6eaea13efb1824766944ebca6afa6bc533ac0733): fix oversize logdata
- [#5d812b8](https://github.com/pydio/cells/commit/5d812b836c9ce1e48d8daa19323af9e72a807a99): New loginCI [bool] config in pydio.grpc.user to allow case-insensitive login
- [#3a5234d](https://github.com/pydio/cells/commit/3a5234d608bc82b94c590830dabe65271cb2aa76): Support mixed case logins - may slow down searches per login (LOWER does not use index) - Should be configurable
- [#7c84988](https://github.com/pydio/cells/commit/7c84988e9f76581867886a325bbff74ea5778a75): Ensuring recycle bins are being created automatically and improve patch recycle acl command
- [#2815320](https://github.com/pydio/cells/commit/28153203fa46f665026cc04533913e9e211ed8ac): Remove unused label
- [#0f21859](https://github.com/pydio/cells/commit/0f218598139f891785bfff28b6dfb4ddafa65cde): Add docker-compose (and Traefik) examples
- [#defa513](https://github.com/pydio/cells/commit/defa51367a726720f5d25e653c5477ddef26487f): Lower default prune limit for number of tasks kept for each job.
- [#0d0d42e](https://github.com/pydio/cells/commit/0d0d42ed9f7bd9de8a6fbebd50d21f387150a8c6): Make "parent" commands public to more easily extend them.
- [#db802ae](https://github.com/pydio/cells/commit/db802aeb339ce1b5e6955c73e9e1a8aca70195db): Raise alert threshold for mass delete - Improve log for nodes duplicates
- [#96111bc](https://github.com/pydio/cells/commit/96111bc3fafa349bad5867e1ff2c3fd377732853): Additional failsafe when sync detects massive deletion
- [#079e3c9](https://github.com/pydio/cells/commit/079e3c9e35ab3589a724eef287e1bf28e65b7cdc): 100% Vietnamese and Italian, more Russian and Chinese simplified
- [#dcc5d70](https://github.com/pydio/cells/commit/dcc5d7043cf7b55b7d3cb4c4b8bd875fbbcc3d18): 100% Vietnamese and Italian, more Russian and Chinese simplified
- [#65cd50e](https://github.com/pydio/cells/commit/65cd50ef874ed5a917c375040ffca4541ef57900): Add trimpath flag in main build
