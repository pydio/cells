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
		}
	}`)

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("Testing initial upgrade of config", t, func() {

		_, err := UpgradeConfigsIfRequired(conf)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Val("defaults").Map())
		So(conf, ShouldNotBeNil)
	})
}
