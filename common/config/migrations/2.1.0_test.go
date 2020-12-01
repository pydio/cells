package migrations

import (
	"testing"

	hashiversion "github.com/hashicorp/go-version"

	"github.com/pydio/cells/common"
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

func checkVersion(v string) bool {
	vv, _ := hashiversion.NewVersion(v)
	if common.Version().LessThan(vv) {
		return false
	}

	return true
}

func TestMigration2_1_0(t *testing.T) {

	if !checkVersion("2.1.0") {
		t.Log("NOT RUN - CURRENT VERSION LOWER THAN THIS MIGRATION")
		return
	}

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("Testing initial upgrade of config", t, func() {

		// PrettyPrint(conf.Map())

		_, err := UpgradeConfigsIfRequired(conf)

		So(err, ShouldBeNil)

		// PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)

		So(conf.Val("services/pydio.web.oauth/connectors[0]/id").String(), ShouldEqual, "pydio")
		So(conf.Val("services/pydio.web.oauth/connectors[0]/config").Get(), ShouldBeNil)
	})
}
