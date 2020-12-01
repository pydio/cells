package migrations

import (
	"testing"

	"github.com/pydio/cells/x/configx"
	. "github.com/smartystreets/goconvey/convey"
)

func TestMigration2_2_0(t *testing.T) {

	data := []byte(`{
		"defaults": {
			"urlInternal": "http://192.168.1.1:8080",
			"url": "http://example.com"
		},
		"services": {
			"pydio.grpc.data.sync": {
			  "sources": "[\"mnt\",\"pydiods1\",\"personal\",\"cellsdata\",\"updated:1589793099\"]"
			}
		},
		"version": "2.1.0"
	}`)

	Convey("Testing initial upgrade of config", t, func() {

		// Create new config
		conf := configx.New(configx.WithJSON())
		conf.Set(data)

		_, err := UpgradeConfigsIfRequired(conf)
		So(err, ShouldBeNil)

		// PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

}
