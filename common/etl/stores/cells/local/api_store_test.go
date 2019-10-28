// +build integration

package local

import (
	"context"
	"testing"

	"github.com/pydio/cells/common/micro/registry/nats"
	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	nats.Enable()
}

func TestAPIGetAllUsers(t *testing.T) {
	Convey("Test get all users", t, func() {
		apiStore := NewAPIStore()

		users, err := apiStore.ListUsers(context.Background(), nil, nil)
		So(err, ShouldBeNil)
		So(len(users), ShouldBeGreaterThan, 0)
	})
}

func TestAPIGetAllConfig(t *testing.T) {
	Convey("Test get all config", t, func() {
		apiStore := NewAPIStore()

		config, err := apiStore.ListConfig(context.Background(), nil)

		So(err, ShouldBeNil)
	})
}
