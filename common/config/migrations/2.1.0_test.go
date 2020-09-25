package migrations

import (
	"testing"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/utils/std"
	"github.com/pydio/go-os/config"
	"github.com/pydio/go-os/config/source/memory"
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

	common.VersionNumber = "2.1.0"

	memorySource := memory.NewSource(
		memory.WithJSON(data),
	)

	// Create new config
	c := config.NewConfig(config.WithSource(memorySource))

	var conf std.Map
	c.Get().Scan(&conf)

	Convey("Testing initial upgrade of config", t, func() {

		PrettyPrint(conf)

		_, err := UpgradeConfigsIfRequired(conf)
		So(err, ShouldBeNil)

		PrettyPrint(c)
		So(conf.IsEmpty(), ShouldBeFalse)

		So(conf.Get("services/pydio.api.websocket"), ShouldBeNil)
	})
}
