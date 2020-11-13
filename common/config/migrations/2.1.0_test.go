package migrations

import (
	"testing"

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

	// common.version = "2.1.0"

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("Testing initial upgrade of config", t, func() {

		PrettyPrint(conf.Map())

		_, err := UpgradeConfigsIfRequired(conf)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)

		So(conf.Val("services/pydio.api.websocket").Get(), ShouldNotBeNil)
	})
}
