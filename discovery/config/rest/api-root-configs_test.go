package rest

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestValidateConfigPayload(t *testing.T) {
	Convey("validateConfigPayload", t, func() {
		Convey("allows safe forgot password external links", func() {
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{}), ShouldBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "",
			}), ShouldBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "https://example.com/reset",
			}), ShouldBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "http://example.com/reset",
			}), ShouldBeNil)
		})

		Convey("rejects unsafe forgot password external links", func() {
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "javascript:alert(1)",
			}), ShouldNotBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "data:text/html,<script>alert(1)</script>",
			}), ShouldNotBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "ftp://example.com/reset",
			}), ShouldNotBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "https:///missing-host",
			}), ShouldNotBeNil)
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "not a url",
			}), ShouldNotBeNil)
		})

		Convey("rejects unexpected value types", func() {
			So(validateConfigPayload("frontend/plugin/core.auth", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": true,
			}), ShouldNotBeNil)
		})

		Convey("ignores unrelated config paths", func() {
			So(validateConfigPayload("frontend/plugin/other.plugin", map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "javascript:alert(1)",
			}), ShouldBeNil)
		})
	})
}
