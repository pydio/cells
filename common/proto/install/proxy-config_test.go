package install

import (
	"testing"

	json "github.com/pydio/cells/v4/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	jsonTest = `
      {
        "Binds": [
          "sub1.pydio:8081"
        ],
        "TLSConfig": {
          "SelfSigned": {}
        },
        "HeaderMods": [
          { "Key": "X-Pydio-Header", "Value": "header-value1" }
        ],
        "Routing": [
           {"Matcher": "*", "Effect": 1},
           {"Matcher": "public", "Effect": 1, "Action":"Rewrite","Value": "/p"},
           {"Matcher": "io", "Effect": 0}
        ]
      }
`
)

func TestProxyUnmarshal(t *testing.T) {
	Convey("Test unmarshal proxy", t, func() {
		p := &ProxyConfig{}
		er := json.Unmarshal([]byte(jsonTest), p)
		So(er, ShouldBeNil)
		So(p.Routing, ShouldHaveLength, 3)
		So(p.Routing[0].Effect, ShouldEqual, RuleEffect_ACCEPT)
		So(p.Routing[2].Effect, ShouldEqual, RuleEffect_DENY)

		Convey("Test resolve", func() {
			r1 := p.FindRouteRule("api")
			So(r1.Effect, ShouldEqual, RuleEffect_ACCEPT)

			r2 := p.FindRouteRule("io")
			So(r2.Effect, ShouldEqual, RuleEffect_DENY)

			r3 := p.FindRouteRule("public")
			So(r3.Effect, ShouldEqual, RuleEffect_ACCEPT)
			So(r3.Action, ShouldEqual, "Rewrite")
		})

		So(p.HeaderMods, ShouldHaveLength, 1)
		So(p.HeaderMods[0].Key, ShouldEqual, "X-Pydio-Header")
		So(p.HeaderMods[0].Value, ShouldEqual, "header-value1")
	})
}
