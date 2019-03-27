package config

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	workingDir = os.TempDir() + "/cells/tests/config"
)

func TestGetSet(t *testing.T) {

	Convey("Given a default config initialised in a temp directory", t, func() {

		err := os.MkdirAll(workingDir, 0755)
		So(err, ShouldBeNil)

		PydioConfigDir = workingDir

		conf := Default()
		So(conf, ShouldNotBeNil)

		Convey("Simple GetSet Works", func() {
			testVal := "This is a test"
			Set(testVal, "test", "val1")
			retVal := Get("test", "val1").String("")
			So(retVal, ShouldEqual, testVal)
		})

		Convey("CaURL is correctly set", func() {

			certEmail := "test@example.com"
			caUrl := "https://acme-staging.api.example.com/directory"

			Set(certEmail, "cert", "proxy", "email")
			Set(caUrl, "cert", "proxy", "caUrl")

			resCe := Get("cert", "proxy", "email").String("")
			resCa := Get("cert", "proxy", "caUrl").String("")
			So(resCe, ShouldEqual, certEmail)
			So(resCa, ShouldEqual, caUrl)

			Set(true, "cert", "proxy", "httpRedir")

			resCe2 := Get("cert", "proxy", "email").String("")
			resCa2 := Get("cert", "proxy", "caUrl").String("")
			So(resCe2, ShouldEqual, certEmail)
			So(resCa2, ShouldEqual, caUrl)

			Del("cert", "proxy", "httpRedir")

			resCe2 = Get("cert", "proxy", "email").String("")
			resCa2 = Get("cert", "proxy", "caUrl").String("")
			So(resCe2, ShouldEqual, certEmail)
			So(resCa2, ShouldEqual, caUrl)

		})

		Convey("SMTP password is encrypted:", func() {

			pwd := "This is a p@$$w0rd"

			Set(pwd, "services", "pydio.grpc.mailer", "sender", "password")
			So(Get("services", "pydio.grpc.mailer", "sender", "password").String(""), ShouldEqual, pwd)
			Del("services", "pydio.grpc.mailer", "sender", "password")
			So(Get("services", "pydio.grpc.mailer", "sender", "password").String(""), ShouldEqual, "")

			RegisterVaultKey("services", "pydio.grpc.mailer", "sender", "password")

			Set(pwd, "services", "pydio.grpc.mailer", "sender", "password")

			resPwd := Get("services", "pydio.grpc.mailer", "sender", "password").String("")
			So(resPwd, ShouldNotEqual, pwd)
			So(resPwd, ShouldNotEqual, "")
		})
	})
}
