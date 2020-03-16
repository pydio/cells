# Changes between v2.0.3 and v2.0.4

[See Full Changelog](https://github.com/pydio/cells/compare/v2.0.3...v2.0.4)

- [#af08026](https://github.com/pydio/cells/commit/af080263c9c4812591c7b9ece07d1bbb087cc205): Additional check for workspace roots to avoid errors (e.g. cec and admins only)
- [#9a48d1b](https://github.com/pydio/cells/commit/9a48d1b7a6c5c7dee18ef9b1f77db91e5a464365): Merge remote-tracking branch 'origin/master'
- [#9f213c8](https://github.com/pydio/cells/commit/9f213c8eda2406284e497bae61e30c91ff1c86ad): New cmd cells user set-pwd, and improve set-profile with a prompt if profile parameter is not set.
- [#79dbb95](https://github.com/pydio/cells/commit/79dbb9589f0eb32581763fc2fec17aae2682df60): Ensuring we recreate a signature if one doesn't exist or has been tampered with
- [#35382ea](https://github.com/pydio/cells/commit/35382ea9dc1466c7826acf029c348de864103a23): Fixing activity logs
- [#5e809a0](https://github.com/pydio/cells/commit/5e809a0cae931fb712f0f390f35dcbb91af5598b): Forgotten string + DE & FR translation
- [#1c09483](https://github.com/pydio/cells/commit/1c094833190cd011453efa7736f718ee38dc3b62): Forgotten string + DE & FR translation
- [#5a93aab](https://github.com/pydio/cells/commit/5a93aab5d72826feb529867ebd6c784e06a33922): Specific non-editable plugins
- [#b1e0a8b](https://github.com/pydio/cells/commit/b1e0a8b86a61f1b59af5f5f04b331902dbdac6c2): front: remove legacy watch on manifests files
- [#1c1f8d4](https://github.com/pydio/cells/commit/1c1f8d446458f84802eeef8d75069f1fd4ecabc5): Handle front plugin "auto" status
- [#61c57fa](https://github.com/pydio/cells/commit/61c57fae118adc2bd798d27e2c2c29a6b56fb957): Front plugin new status "auto"
- [#da103fa](https://github.com/pydio/cells/commit/da103fa981af42c9c9313d69fc5e30a031376ead): Capture hidden forms onSubmit events to avoid Enter key to reload the page.
- [#ec40d2b](https://github.com/pydio/cells/commit/ec40d2bac0d2bc22a570ff667967f475420a2d91): Fix possible concurrent read/write in jobs handler (putTaskStream)
- [#47c925b](https://github.com/pydio/cells/commit/47c925b49d9bed6148ca974aa73a0a64561b4ec5): Fix edge-cases for azure/gcs gateways
- [#ba1d38c](https://github.com/pydio/cells/commit/ba1d38cd166e0f1391363aba07263af7e8a7094b): Clean contextual meta from user-meta on s3 copy
- [#a105284](https://github.com/pydio/cells/commit/a105284fdc80aad8c7ec269c5420cc6db43d3f54): Do not pass claims in minio meta : can create too long headers
- [#6431356](https://github.com/pydio/cells/commit/6431356ad10eaab7bbee6e59f1d59f870f1fc6b3): Fix copy-move test action : discard messages by using buffered chans
- [#de26d5d](https://github.com/pydio/cells/commit/de26d5d0f5979ab3d42edaf21523d6c84f727eed): Missing reader.Close()
- [#308f3ae](https://github.com/pydio/cells/commit/308f3ae2aa7870faa4f1c14a9fc7f3900eb0e7a7): Handle S3 files etag edge-cases and CopyObject limitation for 5GB. Pass io.Reader progress to Copy operation for better large file copy monitoring.
- [#907b214](https://github.com/pydio/cells/commit/907b214ed5adf877a28aafa69f0f2486862f17ef): Scheduler task: always limit progress update to 1% diff
- [#01feae9](https://github.com/pydio/cells/commit/01feae9f8c41ce6981202d6bbd88c2c1a227348a): Fixing activity logs
