# Changes between v4.9.94-alpha01 and v4.9.94-alpha02

[See Full Changelog](https://github.com/pydio/cells/compare/v4.9.94-alpha01...v4.9.94-alpha02)

- [#8f6b2d0](https://github.com/pydio/cells/commit/8f6b2d03bb002467f52b26b56ad8371dd6d2907c): fix(metadata): datetime validation errors (#884)
- [#029d6d5](https://github.com/pydio/cells/commit/029d6d56169f54fe7a1bcf652ac09df5db3e0719): chore: modifying helm chart
- [#b43b7f9](https://github.com/pydio/cells/commit/b43b7f96aea34f2d4a4d03e10b8a5b23a1f281c1): feat: more i18n messages
- [#1b8ec86](https://github.com/pydio/cells/commit/1b8ec8624a684cc057677f212e95d25062edc219): chore: helm chart version
- [#08408ce](https://github.com/pydio/cells/commit/08408cecbec938a90d8d5cfceccc892db285204d): chore: modifying helm chart
- [#263c1b7](https://github.com/pydio/cells/commit/263c1b713a5ed72a954828a561621647c7d8ccf7): refactor(i18n): deduplicate group headings using type keys (#876)
- [#ccc7a40](https://github.com/pydio/cells/commit/ccc7a40ba1146db0539f0d9b212f6b76a3f21103): build(deps): bump google.golang.org/grpc from 1.79.2 to 1.79.3 (#875)
- [#041b59f](https://github.com/pydio/cells/commit/041b59fe51c4a047806c4270386800339800a445): build(deps): bump google.golang.org/grpc in /cmd/cells-fuse (#881)
- [#5e811bf](https://github.com/pydio/cells/commit/5e811bf37b3081fde789c9731a4a55768ae27240): build(deps): bump github.com/smallstep/certificates (#877)
- [#361a5ec](https://github.com/pydio/cells/commit/361a5ec505ef81e6d6918a255e4e4598039ab857): fix(gui.ajax): Regenerate core libs after sdk update (#880)
- [#b6cc9b9](https://github.com/pydio/cells/commit/b6cc9b92c1d6d424f369cb67914feba901a27b08): fix(idm): Rename duplicate enum UserMetaOp (#879)
- [#f080229](https://github.com/pydio/cells/commit/f0802296f0e64d0c1da28a23aa0abf2ad1fab7cf): feat(i18n): localize validation error messages (#872)
- [#4e434b3](https://github.com/pydio/cells/commit/4e434b38ba651430a43332cfd7d29462a789077d): feat(i18n): add translations for search and admin metadata (#870)
- [#44ccd08](https://github.com/pydio/cells/commit/44ccd08a7a624a968b26759261bca3c1ae18967a): feat(metadata): prefill schema defaults on initial load for PTU (#869)
- [#46ea3d8](https://github.com/pydio/cells/commit/46ea3d89cd21fe5b4f17fc03785d6162d68ccccd): A few more messages + DE/FR translation
- [#b4b9dfe](https://github.com/pydio/cells/commit/b4b9dfea8ca426dd88b07ce7c4c3e30875397630): chore(deps): update cells-fuse gomod
- [#e76b393](https://github.com/pydio/cells/commit/e76b393d0b0902e9036fa4587c1000d9747f744a): chore(deps): update a bunch of deps in gomod
- [#d8a9ff5](https://github.com/pydio/cells/commit/d8a9ff5fd5d46227467fbf2c5672171aef719890): fix(pages): i18n and modal search polishing
- [#774793b](https://github.com/pydio/cells/commit/774793b91d6161f74bec442e2a7e236f2ef57145): feat(metadata): validation flow and info panel save button UX (#866)
- [#20a53dc](https://github.com/pydio/cells/commit/20a53dceec09f8fa3dfd27b66bef0c7a4df86690): new messages + DE/FR translation
- [#356ae31](https://github.com/pydio/cells/commit/356ae317550ee264135cc7e9646d82d313cf7e84): fix(migration): fix PaT migration issues (re-enable unit tests for MySQL/PG), Policies migration issues
- [#6056551](https://github.com/pydio/cells/commit/6056551641cbcb5651da9cd44099575ae6faa5d7): fix(metadata): adds edit/display behavior for datetime fields (#863)
- [#01427cf](https://github.com/pydio/cells/commit/01427cfccde970382b18661999a1e23efe10707f): build: next development cycle
- [#88844ea](https://github.com/pydio/cells/commit/88844ea2e6d62230f97c59d27cf4942c066db232): feat(metadata): behaviour for the edit/display mode infopanel (#862)
- [#fa2e6c7](https://github.com/pydio/cells/commit/fa2e6c718a782a66a79fe5ddbcb32dd6c29f7b24): refactor: remove requestToClose in favor of the onCommitClose (#859)
- [#4ea9446](https://github.com/pydio/cells/commit/4ea944619c68f6bc1c83cf19445384bc7dfb48c0): feat(metadata): add togglable fields with focus-based editing (#858)
- [#6f8e725](https://github.com/pydio/cells/commit/6f8e7251fb9bc380b9d6fc88081418f8ea80bf26): fix(metadata): validation flow in multiple and single file tagging (#856)
- [#e218b39](https://github.com/pydio/cells/commit/e218b39c5f1c99e4283a6f9dcd4700f0e94994ba): fix(i18n): extract i18n strings for Pages
- [#a87e380](https://github.com/pydio/cells/commit/a87e3808564bd6c6d176449375d507cc07550a4b): fix(metadata): remove setFields action and fix form state handling (#855)
- [#4b0d755](https://github.com/pydio/cells/commit/4b0d75554e6711877a820310197a60f2aee41331): feat(WPB-23537): UX for popover file tagging (#853)
- [#f0a692a](https://github.com/pydio/cells/commit/f0a692acd3296d67731abe7f334631b75aa2c19b): fix(namespace): Fix where clause in Del method (#854)
- [#f07a604](https://github.com/pydio/cells/commit/f07a604b9a7c7938611d4e0a0766a869aa792064): fix(search): Fix failing indexer search for Mongo storage (#852)
