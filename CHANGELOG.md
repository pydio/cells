# Changes between v2.1.0-rc0 and v2.1.0-rc1

[See Full Changelog](https://github.com/pydio/cells/compare/v2.1.0-rc0...v2.1.0-rc1)

- [#c3a3d3e](https://github.com/pydio/cells/commit/c3a3d3e93a2d4cdc24ae12e52fad9f4de1ecdb33): Re-adapt styling
- [#3fa3d7d](https://github.com/pydio/cells/commit/3fa3d7d8dbee77613e7fdab28e0204d55c6cd021): Typo in full-s3 version-store(s)
- [#68e7eab](https://github.com/pydio/cells/commit/68e7eaba1b46b2cd8f906169de0191c8e7385ae2): CanReadPath : must handle virtual nodes case (pass resolver function)
- [#bec4f01](https://github.com/pydio/cells/commit/bec4f015350329c3ae2b921e7da0ff7ed8418289): New method accessList.CanReadPath to avoid false-negatives on moving or deleted nodes
- [#c44ee05](https://github.com/pydio/cells/commit/c44ee05205c4f7a1686801eaf14c70fbf74e3cab): Typo in pagination
- [#eceef7e](https://github.com/pydio/cells/commit/eceef7e65746bb7d3693cfd97cfc10fbe7320253): Typo in language key
- [#4c9525f](https://github.com/pydio/cells/commit/4c9525f2018f4f6f46fd471693aae9998e2d968a): A few more msgs + DE/FR translation
- [#835b1cf](https://github.com/pydio/cells/commit/835b1cf00e3212ccba670ba17103710d25711d34): Improve tasks logs (loader and pagination)
- [#8f445dd](https://github.com/pydio/cells/commit/8f445ddf1a1d56e7305534244b6442f88111119d): Fix to migration
- [#deeefb4](https://github.com/pydio/cells/commit/deeefb43c0d74b8141da3c51b6f7abf8de0720eb): Copy/move : use full target node path when checking for new node
- [#3c44642](https://github.com/pydio/cells/commit/3c44642d049ce43986d5198adc0e1b69a50b1479): TreePaginator : prevent displaying page 1/1 WorkspacesList : disable massive load of workspace roots, lazy load when opening popover
- [#bf5d4d6](https://github.com/pydio/cells/commit/bf5d4d6474edbde8fd8c083ead8cfb083cfa0527): Avoid recursion when deleting recycleRoot folders
- [#8fcf2ee](https://github.com/pydio/cells/commit/8fcf2ee301d19006b6bffb7dfe830e603fa433a7): Missing checks for nil value
- [#2ec2416](https://github.com/pydio/cells/commit/2ec2416675c60b1573c9aa4ac6eee5d511fca9f4): Pass accessList instead of ws list in WorkspaceCanSeeNode - Cache ancestors in EventRouter
- [#ec68dd6](https://github.com/pydio/cells/commit/ec68dd6e313685b6d01965c45f97c1ea8d0ba9db): Implement more precise filtering
- [#c5248e7](https://github.com/pydio/cells/commit/c5248e721b78adf677d8e01e952395c26b6696ba): AncestorsListFromContext : prepend input node when orParents is set
