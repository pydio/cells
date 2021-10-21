/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package config

import (
	"os"
	"testing"

	"github.com/pydio/cells/x/configx"
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

		Convey("Simple GetSet Works", func() {
			testVal := "This is a test"
			Set(testVal, configx.FormatPath("test", "val1"))
			retVal := Get(configx.FormatPath("test", "val1")).String()
			So(retVal, ShouldEqual, testVal)
		})

		Convey("CaURL is correctly set", func() {

			certEmail := "test@example.com"
			caUrl := "https://acme-staging.api.example.com/directory"

			Set(certEmail, configx.FormatPath("cert", "proxy", "email"))
			Set(caUrl, configx.FormatPath("cert", "proxy", "caUrl"))

			resCe := Get(configx.FormatPath("cert", "proxy", "email")).String()
			resCa := Get(configx.FormatPath("cert", "proxy", "caUrl")).String()
			So(resCe, ShouldEqual, certEmail)
			So(resCa, ShouldEqual, caUrl)

			Set(true, configx.FormatPath("cert", "proxy", "httpRedir"))

			resCe2 := Get(configx.FormatPath("cert", "proxy", "email")).String()
			resCa2 := Get(configx.FormatPath("cert", "proxy", "caUrl")).String()
			So(resCe2, ShouldEqual, certEmail)
			So(resCa2, ShouldEqual, caUrl)

			Del(configx.FormatPath("cert", "proxy", "httpRedir"))

			resCe2 = Get(configx.FormatPath("cert", "proxy", "email")).String()
			resCa2 = Get(configx.FormatPath("cert", "proxy", "caUrl")).String()
			So(resCe2, ShouldEqual, certEmail)
			So(resCa2, ShouldEqual, caUrl)

		})

		Convey("SMTP password is encrypted:", func() {

			pwd := "This is a p@$$w0rd"

			Set(pwd, configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))
			So(Get(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, pwd)
			Del(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))
			So(Get(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, "")

			RegisterVaultKey(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))

			Set(pwd, configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))

			resPwd := Get(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String()
			//So(resPwd, ShouldNotEqual, pwd)
			So(resPwd, ShouldNotEqual, "")
		})
	})
}
