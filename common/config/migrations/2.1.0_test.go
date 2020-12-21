package migrations

import (
	"testing"

	hashiversion "github.com/hashicorp/go-version"

	"github.com/pydio/cells/x/configx"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	data = []byte(`{
		"services": {
			"pydio.grpc.auth": {
				"dex": {
					"connectors": [{
						"id": "pydio",
						"name": "pydio",
						"type": "pydio",
						"config": {
							"pydioconnectors": [{
								"id": "pydioapi",
								"type": "pydioapi",
								"name": "Pydio API"
							}, {
								"id": "othertype",
								"type": "othertype",
								"name": "othertype"
							}]
						}
					}]
				}
			}
		}
	}`)
)

func TestMigration2_1_0(t *testing.T) {

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("Testing initial upgrade of config", t, func() {

		// PrettyPrint(conf.Map())

		target, _ := hashiversion.NewVersion("2.1.0")
		_, err := UpgradeConfigsIfRequired(conf, target)

		So(err, ShouldBeNil)

		// PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)

		So(conf.Val("services/pydio.web.oauth/connectors[0]/id").String(), ShouldEqual, "pydio")
		So(conf.Val("services/pydio.grpc.auth/connectors[0]/config").Get(), ShouldBeNil)
	})
}
