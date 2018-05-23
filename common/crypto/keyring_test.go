// +build linux

package crypto

// We only run these tests on Linux: special characters may fail on MacOS
// TODO write a darwin test for that

import (
	"testing"

	"github.com/smartystreets/goconvey/convey"
	"github.com/zalando/go-keyring"
)

func TestKeyring(t *testing.T) {

	var (
		password    = "pass\r\\0nword"
		user        = "tester"
		serviceName = "pydio.tests"
	)

	convey.Convey("Save password in keyring", t, func() {
		err := SetKeyringPassword(serviceName, user, []byte(password))
		convey.So(err, convey.ShouldBeNil)
	})

	convey.Convey("Get password as Bytes", t, func() {
		bytes, err := GetKeyringPassword(serviceName, user, false)
		convey.So(err, convey.ShouldBeNil)
		convey.So(string(bytes), convey.ShouldEqual, password)
	})

	convey.Convey("Delete password from keyring", t, func() {
		err := keyring.Delete(serviceName, user)
		convey.So(err, convey.ShouldBeNil)
	})
}
