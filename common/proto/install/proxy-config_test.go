package install

import (
	"testing"

	json "github.com/pydio/cells/v5/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	jsonTest = `
      {
        "Binds": [
          "sub1.pydio:8081"
        ],
        "TLSConfig": {
          "SelfSigned": {
            "Hostnames": ["sub1.pydio"]
          }
        },
        "HeaderMods": [
          { "Key": "X-Pydio-Header", "Value": "header-value1" }
        ],
        "Routing": [
           {"Matcher": "*", "Effect": 1},
           {"Matcher": "public", "Effect": 1, "Action":"Rewrite","Value": "/p"},
           {
				"Matcher": "io", 
				"Effect": 0,
				"CorsOptions": {
					"AllowedOrigins": ["http://download.pydio.com"],
					"AllowedMethods": ["GET","POST","PUT","DELETE","OPTIONS"],
					"AllowedHeaders": ["X-Pydio-Header","X-Pydio-Value"],
					"ExposedHeaders": ["X-Pydio-Header"],
					"MaxAge": 30,
					"AllowCredentials": false,
					"AllowPrivateNetwork": true,
					"OptionsPassthrough": true,
					"OptionsSuccessStatus": 304
				}
			}
        ],
		"CorsOptions": {
			"AllowedOrigins": ["http://sub1.pydio"],
			"AllowedMethods": ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
			"AllowedHeaders": ["X-Pydio-Header","X-Pydio-Value"],
			"ExposedHeaders": ["X-Pydio-Header"],
			"MaxAge": 60,
			"AllowCredentials": false,
			"AllowPrivateNetwork": true,
			"OptionsPassthrough": true,
			"OptionsSuccessStatus": 304
		}
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
		So(p.CorsOptions, ShouldNotBeNil)
		So(p.CorsOptions.AllowedMethods, ShouldHaveLength, 6)

		Convey("Test resolve", func() {
			r1 := p.FindRouteRule("api")
			So(r1.Effect, ShouldEqual, RuleEffect_ACCEPT)
			So(r1.CorsOptions, ShouldBeNil)

			r2 := p.FindRouteRule("io")
			So(r2.Effect, ShouldEqual, RuleEffect_DENY)
			So(r2.CorsOptions, ShouldNotBeNil)

			r3 := p.FindRouteRule("public")
			So(r3.Effect, ShouldEqual, RuleEffect_ACCEPT)
			So(r3.Action, ShouldEqual, "Rewrite")
		})

		So(p.HeaderMods, ShouldHaveLength, 1)
		So(p.HeaderMods[0].Key, ShouldEqual, "X-Pydio-Header")
		So(p.HeaderMods[0].Value, ShouldEqual, "header-value1")

		So(p.GetTLSSelfSigned().GetHostnames(), ShouldEqual, []string{"sub1.pydio"})
	})
}
