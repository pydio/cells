# Changes between v2.0.5 and v2.0.6

[See Full Changelog](https://github.com/pydio/cells/compare/v2.0.5...v2.0.6)

- [#de50595](https://github.com/pydio/cells/commit/de50595cc9edc5852eda34c36509e2c1b40981bf): Do not rely on claims.DecodeUserUuid as external connectors may pass a different UUID
- [#d294095](https://github.com/pydio/cells/commit/d2940954a2ea0ca3f74d06cbd0133bee0852c06c): Fix auto-suffix on copy/move to make it case insensitive. Handle 423 error when resource is locked.
- [#6ffdf1a](https://github.com/pydio/cells/commit/6ffdf1a5b8a04d411d343b1484e424a23a7a3f7e): Fix unit test
- [#7836704](https://github.com/pydio/cells/commit/78367041139b121258a322d341d1f0e54706844e): Case insensitive comparison for auto-suffixing on copy/move, or we can have multiple nodes with different cases and create index issues
- [#56606a6](https://github.com/pydio/cells/commit/56606a64defefdaffed7e00fd17e5f17b976a57a): Use longer lock from scratch for computing move size
- [#b58b034](https://github.com/pydio/cells/commit/b58b0347743cd8bef9a3ed70d7c61c6e49f61cfe): Copy/move : add unlocking in case of error (deferred)
- [#4e0585c](https://github.com/pydio/cells/commit/4e0585c915df48c48b3f38237249060d8842f1c2): On ACL insertion, if duplicate and existing value is expired, replace it.
