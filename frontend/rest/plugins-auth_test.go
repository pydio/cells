package rest

import (
	"testing"

	"github.com/pydio/cells/v5/common/config"

	. "github.com/smartystreets/goconvey/convey"
)

func TestCoreAuthConfigProxy(t *testing.T) {
	Convey("core.auth config proxy validates forgot password external link", t, func() {
		store := config.Proxy(config.NewStore())

		Convey("allows safe values", func() {
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{}), ShouldBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "",
			}), ShouldBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "https://example.com/reset",
			}), ShouldBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "http://example.com/reset",
			}), ShouldBeNil)
		})

		Convey("rejects unsafe values", func() {
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "javascript:alert(1)",
			}), ShouldNotBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "data:text/html,<script>alert(1)</script>",
			}), ShouldNotBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "ftp://example.com/reset",
			}), ShouldNotBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "https:///missing-host",
			}), ShouldNotBeNil)
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "not a url",
			}), ShouldNotBeNil)
		})

		Convey("rejects unexpected value types", func() {
			So(store.Val("frontend", "plugin", "core.auth").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": true,
			}), ShouldNotBeNil)
		})

		Convey("does not affect other paths", func() {
			So(store.Val("frontend", "plugin", "other.plugin").Set(map[string]interface{}{
				"FORGOT_PASSWORD_EXTERNAL_LINK": "javascript:alert(1)",
			}), ShouldBeNil)
		})
	})
}
