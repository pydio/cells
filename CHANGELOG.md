# Changes between v2.0.7 and v2.0.8

[See Full Changelog](https://github.com/pydio/cells/compare/v2.0.7...v2.0.8)

- [#5213b0b](https://github.com/pydio/cells/commit/5213b0b8ac298d96715eb08c4c2fa33dd69cf3bd): Index on error: send scheduler command instead of running internal sync.
- [#8d05907](https://github.com/pydio/cells/commit/8d059074ec40aebbac337ee43e1105f646afc086): Additional check when decoding public key
- [#8939bff](https://github.com/pydio/cells/commit/8939bff7c6eff5e428b48044566bb0a3c2b65bf7): Migrate idm/user tables to use fK and delete cascade instead of time-consuming cleaning query
- [#a5e23b5](https://github.com/pydio/cells/commit/a5e23b5cc69a6409d0d901cc3bb827ffbb1cbf1f): Fix update through proxy
- [#29cab63](https://github.com/pydio/cells/commit/29cab632bd58a2c049f062cd374b233535aaeee2): Additional check on ContinuationToken
- [#3995cc7](https://github.com/pydio/cells/commit/3995cc70e7e124fc9f6c7bce69dc81e23741c153): Check continuationToken validity
- [#dec19bd](https://github.com/pydio/cells/commit/dec19bd7600e1528818f7ded950d70a5e84888ac): Disable patch.Done() in uniDirection on error
- [#fe52ddd](https://github.com/pydio/cells/commit/fe52ddd7dbe8e93e558b3d853319b87cce2700ce): Fix errors in patch
