# Change Log
All notable changes to this project will be documented in this file.

## [3.4.1] - 2017-07-03
### Added
- [Pull #116](https://github.com/sendgrid/sendgrid-go/pull/116): Fixing mimetypes in the NewSingleEmail function
- Big thanks to [Depado](https://github.com/Depado) for the pull request!

## [3.4.0] - 2017-06-14
### Added
- [Pull #96](https://github.com/sendgrid/sendgrid-go/pull/96): Send a Single Email to a Single Recipient
- Big thanks to [Oranagwa Osmond](https://github.com/andela-ooranagwa) for the pull request!

## [3.3.1] - 2016-10-18
### Fixed
- [Pull #95](https://github.com/sendgrid/sendgrid-go/pull/95): Use log instead of fmt for printing errors
- Big thanks to [Gábor Lipták](https://github.com/gliptak) for the pull request!

## [3.3.0] - 2016-10-10
### Added
- [Pull #92](https://github.com/sendgrid/sendgrid-go/pull/92): Inbound Parse Webhook support
- Checkout the [README](https://github.com/sendgrid/sendgrid-go/tree/master/helpers/inbound) for details.

## [3.2.3] - 2016-10-10
### Added
- [Pull #91](https://github.com/sendgrid/sendgrid-go/pull/91): Simplified code in mail helper
- Big thanks to [Roberto Ortega](https://github.com/berto) for the pull request!

## [3.2.2] - 2016-09-08
### Added
- Merged pull request: [update prismPath and update prism binary](https://github.com/sendgrid/sendgrid-go/pull/80)
- Special thanks to [Tom Pytleski](https://github.com/pytlesk4) for the pull request!

## [3.2.1] - 2016-08-24
### Added
- Table of Contents in the README
- Added a [USE_CASES.md](https://github.com/sendgrid/sendgrid-go/blob/master/USE_CASES.md) section, with the first use case example for transactional templates

## [3.2.0] - 2016-08-17
### Added
- Merged pull request: [make contents var args in NewV3MailInit](https://github.com/sendgrid/sendgrid-go/pull/75)
- The `NewV3MailInit` [Mail Helper](https://github.com/sendgrid/sendgrid-go/tree/master/helpers/mail) constructor can now take in multiple content objects.
- Thanks to [Adrien Delorme](https://github.com/azr) for the pull request!

## [3.1.0] - 2016-07-28
- Dependency update to v2.2.0 of [sendGrid-rest](https://github.com/sendgrid/rest/releases/tag/v2.2.0)
- Pull [#9](https://github.com/sendgrid/rest/pull/9): Allow for setting a custom HTTP client
- [Here](https://github.com/sendgrid/rest/blob/master/rest_test.go#L127) is an example of usage
- This enables usage of the [sendgrid-go library](https://github.com/sendgrid/sendgrid-go) on [Google App Engine (GAE)](https://cloud.google.com/appengine/)
- Special thanks to [Chris Broadfoot](https://github.com/broady) and [Sridhar Venkatakrishnan](https://github.com/sridharv) for providing code and feedback!

## [3.0.6] - 2016-07-26 ##
### Added
- [Troubleshooting](https://github.com/sendgrid/sendgrid-go/blob/master/TROUBLESHOOTING.md) section

## [3.0.5] - 2016-07-20
### Added
- README updates
- Update introduction blurb to include information regarding our forward path
- Update the v3 /mail/send example to include non-helper usage
- Update the generic v3 example to include non-fluent interface usage

## [3.0.4] - 2016-07-12
### Added
- Update docs, unit tests and examples to include Sender ID
### Fixed
- Missing example query params for the examples

## [3.0.3] - 2016-07-08
### Fixed
- [Can't disable subscription tracking #68](https://github.com/sendgrid/sendgrid-go/issues/68)

## [3.0.2] - 2016-07-07
### Added
- Tests now mocked automatically against [prism](https://stoplight.io/prism/)

## [3.0.1] - 2016-07-05
### Added
- Accept: application/json header per https://sendgrid.com/docs/API_Reference/Web_API_v3/How_To_Use_The_Web_API_v3/requests.html

### Updated
- Content based on our updated [Swagger/OAI doc](https://github.com/sendgrid/sendgrid-oai)

## [3.0.0] - 2016-06-14
### Added
- Breaking change to support the v3 Web API
- New HTTP client
- v3 Mail Send helper

## [2.0.0] - 2015-05-02
### Changed
- Fixed a nasty bug with orphaned connections but drops support for Go versions < 1.3. Thanks [trinchan](https://github.com/sendgrid/sendgrid-go/pull/24)

## [1.2.0] - 2015-04-27
### Added
- Support for API keys

