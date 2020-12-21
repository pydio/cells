package migrations

import (
	"testing"

	"github.com/hashicorp/go-version"

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

		target, _ := version.NewVersion("2.2.0")
		save, err := UpgradeConfigsIfRequired(conf, target)
		So(save, ShouldBeTrue)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

}

func TestMigration2_2_0_Self(t *testing.T) {

	data := []byte(`{
		"cert": {
			"proxy": {
			  "self": true,
			  "ssl": true
			}
   	    },
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

		target, _ := version.NewVersion("2.2.0")
		b, err := UpgradeConfigsIfRequired(conf, target)
		So(b, ShouldBeTrue)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

}
