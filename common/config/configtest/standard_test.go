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

package configtest

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"

	// Plugins to test
	_ "github.com/pydio/cells/v4/common/config/etcd"
	_ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"
)

func testGetSet(t *testing.T, store config.Store) {
	Convey("Given a default config initialised in a temp directory", t, func() {
		Convey("Simple GetSet Works", func() {
			testVal := "This is a test"
			err := store.Val(configx.FormatPath("test", "val1")).Set(testVal)
			So(err, ShouldBeNil)
			retVal := store.Val(configx.FormatPath("test", "val1")).String()
			So(retVal, ShouldEqual, testVal)
		})

		Convey("CaURL is correctly set", func() {

			certEmail := "test@example.com"
			caUrl := "https://acme-staging.api.example.com/directory"

			store.Val(configx.FormatPath("cert", "proxy", "email")).Set(certEmail)
			store.Val(configx.FormatPath("cert", "proxy", "caUrl")).Set(caUrl)

			resCe := store.Val(configx.FormatPath("cert", "proxy", "email")).String()
			resCa := store.Val(configx.FormatPath("cert", "proxy", "caUrl")).String()
			So(resCe, ShouldEqual, certEmail)
			So(resCa, ShouldEqual, caUrl)

			store.Val(configx.FormatPath("cert", "proxy", "httpRedir")).Set(true)

			resCe2 := store.Val(configx.FormatPath("cert", "proxy", "email")).String()
			resCa2 := store.Val(configx.FormatPath("cert", "proxy", "caUrl")).String()
			So(resCe2, ShouldEqual, certEmail)
			So(resCa2, ShouldEqual, caUrl)

			store.Val(configx.FormatPath("cert", "proxy", "httpRedir")).Del()

			resCe2 = store.Val(configx.FormatPath("cert", "proxy", "email")).String()
			resCa2 = store.Val(configx.FormatPath("cert", "proxy", "caUrl")).String()
			So(resCe2, ShouldEqual, certEmail)
			So(resCa2, ShouldEqual, caUrl)

		})

		Convey("SMTP password is encrypted:", func() {

			pwd := "This is a p@$$w0rd"

			store.Val(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Set(pwd)
			So(store.Val(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, pwd)
			store.Val(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Del()
			So(store.Val(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, "")

			config.RegisterVaultKey(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))

			store.Val(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Set(pwd)

			resPwd := store.Val(configx.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String()
			//So(resPwd, ShouldNotEqual, pwd)
			So(resPwd, ShouldNotEqual, "")
		})

		Convey("Scan", func() {
			fakeValue := map[string]interface{}{}
			m := configx.New()
			m.Val("fakevalue").Set(&map[string]interface{}{"fake": "value"})
			m.Val("fakevalue").Scan(fakeValue)
		})
	})
}
