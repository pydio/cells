package config

import (
	"context"
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestProxySetterWithDirectAccess(t *testing.T) {
	Convey("proxy setter applies through direct store access", t, func() {
		store := newProxyTestStore("direct")

		So(store.Val("test", "proxy-direct").Set(blockedProxyTestValue), ShouldEqual, context.Canceled)
		So(store.Val("test", "proxy-direct").Set("allowed"), ShouldBeNil)
		So(store.Val("test", "proxy-direct").String(), ShouldEqual, "allowed")
	})
}

func TestProxySetterWithContext(t *testing.T) {
	Convey("proxy setter applies through context-based access", t, func() {
		store := newProxyTestStore("context")

		So(store.Context(context.Background()).Val("test", "proxy-context").Set(blockedProxyTestValue), ShouldEqual, context.Canceled)
		So(store.Context(context.Background()).Val("test", "proxy-context").Set("allowed"), ShouldBeNil)
		So(store.Val("test", "proxy-context").String(), ShouldEqual, "allowed")
	})
}

func TestProxySetterWithContextAndNestedVal(t *testing.T) {
	Convey("proxy setter survives context followed by nested Val calls", t, func() {
		store := newProxyTestStore("nested")

		ctxValues := store.Context(context.Background())
		intermediate := ctxValues.Val("test")
		So(intermediate, ShouldHaveSameTypeAs, &proxyValues{})
		So(intermediate.Val("proxy-nested").Set(blockedProxyTestValue), ShouldEqual, context.Canceled)
		So(intermediate.Val("proxy-nested").Set("allowed"), ShouldBeNil)
		So(store.Val("test", "proxy-nested").String(), ShouldEqual, "allowed")
	})
}

const blockedProxyTestValue = "blocked"

func newProxyTestStore(suffix string) Store {
	path := fmt.Sprintf("test/proxy-%s", suffix)
	RegisterProxy(path, ProxySetter(func(s Store, val interface{}, pa ...string) error {
		if str, ok := val.(string); ok && str == blockedProxyTestValue {
			return context.Canceled
		}
		return s.Val(pa...).Set(val)
	}))
	return Proxy(NewStore())
}
