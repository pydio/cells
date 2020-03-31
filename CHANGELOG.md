# Changes between v2.0.4 and v2.0.5

[See Full Changelog](https://github.com/pydio/cells/compare/v2.0.4...v2.0.5)

- [#5791808](https://github.com/pydio/cells/commit/57918080b5d2a66c2988468a8c056067ab505285): Fix nil not nil
- [#efdca4d](https://github.com/pydio/cells/commit/efdca4dd94a82cda97e7c44741584800f392880c): Set longer expiration on move locks based on number of files (not just byte size)
- [#0d57619](https://github.com/pydio/cells/commit/0d576191e8c8f7405d2e26d6ed0626487b7b9f85): Rather rely on existing PackageLabel property
- [#a7689b9](https://github.com/pydio/cells/commit/a7689b98e24c12fe60fec3284eb56a25f8f71802): Better formatting of version cmd output
- [#3c515a2](https://github.com/pydio/cells/commit/3c515a23325d75052d5915a3e4924df8f6686ecb): Adding go template to version command
- [#4901cee](https://github.com/pydio/cells/commit/4901ceecce7f6b294149f8d174acaac4c3fb3fb3): Remove trailing slash for /dav path in the main gateway
- [#d4a4054](https://github.com/pydio/cells/commit/d4a4054df278d9b3a1e6c7a6e6fb28610956e5a4): Fix CPU issue with vault decryption keeping recomputing the master key from pwd
- [#17a368f](https://github.com/pydio/cells/commit/17a368f3d4f1dfbdca38f1c7e18c61b5c1b48601): When updating two nodes with same Uuid, we just replace metadata
- [#e10d6b5](https://github.com/pydio/cells/commit/e10d6b59a9126e4e10bdab1d8adcb51da6dea386): Datasources : combine ip and host to prevent creating duplicates on same node, prevent creating FS datasources with nested paths.
- [#06797f3](https://github.com/pydio/cells/commit/06797f3f14329cc863fb56fb4904a0b0e4cb9609): Update github.com/pydio/packr
- [#1ede60a](https://github.com/pydio/cells/commit/1ede60a0ff4fab4de639c39777aebe94c1bdbc7d): HandlerLock: Fix context again
- [#b8e707e](https://github.com/pydio/cells/commit/b8e707e6a4249414de769e6e9937473878a8dc4b): EnqueueMoves: better mutex handling
- [#a4f5667](https://github.com/pydio/cells/commit/a4f5667d116001eab29be989fac9bd75fe7edeb9): ContentLock was broken
- [#e6bb141](https://github.com/pydio/cells/commit/e6bb14135deaeabd593f4d707d52a7d6f03765a0): Fix target management in AclLock.WrappedCanApply (srcContext can be nil for copy/create event)
- [#527d737](https://github.com/pydio/cells/commit/527d73736edc3544572d30cc8b0b5dafe185ba8a): Unlock branch after copy move in the sync. Compute a lock expiry date based on the size of data to move.
- [#26ea603](https://github.com/pydio/cells/commit/26ea6031097ed92ac7a6bedec44fd02a6b77ab43): Fix AppearsIn in UuidRouter (multi workspaces, workspaces with multiple roots)
- [#820dcbf](https://github.com/pydio/cells/commit/820dcbf7e82c6dd8d1d54365182439a84935bc1a): Updating index by UUID would trigger two inserts. Plus send Create event if previous eTag is temporary
- [#c9d43fb](https://github.com/pydio/cells/commit/c9d43fb510ab2f9298568ba846adc84a3c083731): Skip LockAcl in UnitTestEnv
- [#0f730f1](https://github.com/pydio/cells/commit/0f730f1f83adb4f53bfbb03fec8bd07c51918582): Fixing test
- [#1418e6f](https://github.com/pydio/cells/commit/1418e6f8e5d9c86010b868086eea47a8ee5256dd): Fixing wrong expiry setting
- [#c9ba574](https://github.com/pydio/cells/commit/c9ba5745157678fde566c2eb460cdbed49db28ee): Adding lock to move nodes
- [#c55ecea](https://github.com/pydio/cells/commit/c55ecea21fdd0312f6e56b0df16449b0235a1565): Setting acl locks
- [#f246161](https://github.com/pydio/cells/commit/f246161e1376c0834a16cbcddd211800a159a05d): Locking syste,
- [#d9ca9c7](https://github.com/pydio/cells/commit/d9ca9c7811facb0cf26eb92833d81d1a5ef28653): Adding lock to move nodes
- [#54e362f](https://github.com/pydio/cells/commit/54e362f29bd190d6b94a8db1b493db2b099fe4c2): the command should now correctly show the helper if no flag was set.
- [#1b4668a](https://github.com/pydio/cells/commit/1b4668a5c22467aa8dede3c24ac784801265d7d8): Setting acl locks
- [#7e32dca](https://github.com/pydio/cells/commit/7e32dcac399aa0d54263826c5cf1f2319bc4e6c9): Make sure to pass the current TLSClientConfig, in the context.
- [#da8f886](https://github.com/pydio/cells/commit/da8f886dae8eb9c487c24285fa23012428ae53c4): Make sure to return after the 1st authentication
- [#7dae0dd](https://github.com/pydio/cells/commit/7dae0dda4a1358fb6c42d1145e55c34508c84fda): Locking syste,
- [#f4e3fc2](https://github.com/pydio/cells/commit/f4e3fc2ec2c8a8de8dab16d14bf206bf764e8cf6): Update webdav library
- [#317b4a8](https://github.com/pydio/cells/commit/317b4a82e506dcaaaf6159a0312e9ec5db9013cc): Small command enhancements by JThabet
- [#a411cb7](https://github.com/pydio/cells/commit/a411cb744778cb6cc894c7896ab1fd26a755a0a7): Switch to pydio/packr
- [#c6c9bfc](https://github.com/pydio/cells/commit/c6c9bfcd1f1f12a718c4989324abec5642099f95): Switch to packr modded
