package config

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestProxySetterWithContext(t *testing.T) {
	Convey("proxy setter applies through context-based access", t, func() {
		const testPath = "test/proxy-context"
		const blockedValue = "blocked"

		RegisterProxy(testPath, ProxySetter(func(s Store, val interface{}, pa ...string) error {
			if str, ok := val.(string); ok && str == blockedValue {
				return context.Canceled
			}
			return s.Val(pa...).Set(val)
		}))

		store := Proxy(NewStore())

		So(store.Context(context.Background()).Val("test", "proxy-context").Set(blockedValue), ShouldEqual, context.Canceled)
		So(store.Context(context.Background()).Val("test", "proxy-context").Set("allowed"), ShouldBeNil)
		So(store.Val("test", "proxy-context").String(), ShouldEqual, "allowed")
	})
}
