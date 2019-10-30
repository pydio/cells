// +build integration

package pydio8

import (
	"context"
	"testing"

	sdkconfig "github.com/pydio/pydio-sdk-go/config"

	. "github.com/smartystreets/goconvey/convey"
)

func getPydio8Config() *sdkconfig.SdkConfig {

	config := &sdkconfig.SdkConfig{
		Protocol: "http",
		Url:      "INTEGRATION_URL",
		Path:     "",
		User:     "INTEGRATION_USER",
		Password: "INTEGRATION_PASSWORD",
	}

	return config
}

func TestPydio8GetAllUsers(t *testing.T) {
	Convey("Test get all users", t, func() {
		config := getPydio8Config()

		pydio8Store := NewPydio8UserStore(config)

		users, err := pydio8Store.ListUsers(context.Background(), nil)
		So(err, ShouldBeNil)
		So(len(users), ShouldBeGreaterThan, 0)
	})
}

func TestPydio8GetAllConfig(t *testing.T) {
	Convey("Test get all users", t, func() {
		config := getPydio8Config()

		pydio8Store := NewPydio8UserStore(config)

		_, err := pydio8Store.ListConfig(context.Background(), nil)
		So(err, ShouldBeNil)
	})
}
