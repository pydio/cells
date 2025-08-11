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
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/std"

	_ "github.com/pydio/cells/v5/common/config/etcd"
	_ "github.com/pydio/cells/v5/common/config/memory"

	. "github.com/smartystreets/goconvey/convey"
)

func TestGetSet(t *testing.T) {
	test.RunGenericTests(testCases, t, func(ctx context.Context, t *testing.T, testcase testCase) {
		store, err := config.OpenStore(ctx, testcase.store)
		if err != nil {
			t.Fatal(err)
		}

		Convey("Given a default config initialised in a temp directory", t, func() {
			Convey("Simple GetSet Works", func() {
				testVal := "This is a test"
				err := store.Val(std.FormatPath("test", "val1")).Set(testVal)
				So(err, ShouldBeNil)
				retVal := store.Val(std.FormatPath("test", "val1")).String()
				So(retVal, ShouldEqual, testVal)
			})

			Convey("CaURL is correctly set", func() {

				certEmail := "test@example.com"
				caUrl := "https://acme-staging.api.example.com/directory"

				store.Val(std.FormatPath("cert", "proxy", "email")).Set(certEmail)
				store.Val(std.FormatPath("cert", "proxy", "caUrl")).Set(caUrl)

				resCe := store.Val(std.FormatPath("cert", "proxy", "email")).String()
				resCa := store.Val(std.FormatPath("cert", "proxy", "caUrl")).String()
				So(resCe, ShouldEqual, certEmail)
				So(resCa, ShouldEqual, caUrl)

				store.Val(std.FormatPath("cert", "proxy", "httpRedir")).Set(true)

				resCe2 := store.Val(std.FormatPath("cert", "proxy", "email")).String()
				resCa2 := store.Val(std.FormatPath("cert", "proxy", "caUrl")).String()
				So(resCe2, ShouldEqual, certEmail)
				So(resCa2, ShouldEqual, caUrl)

				store.Val(std.FormatPath("cert", "proxy", "httpRedir")).Del()

				resCe2 = store.Val(std.FormatPath("cert", "proxy", "email")).String()
				resCa2 = store.Val(std.FormatPath("cert", "proxy", "caUrl")).String()
				So(resCe2, ShouldEqual, certEmail)
				So(resCa2, ShouldEqual, caUrl)

			})

			SkipConvey("SMTP password is encrypted:", func() {

				pwd := "This is a p@$$w0rd"

				store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Set(pwd)
				So(store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, pwd)

				store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Del()
				So(store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, "")

				config.RegisterVaultKey(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))

				store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Set(pwd)

				resPwd := store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String()

				//So(resPwd, ShouldNotEqual, pwd)
				So(resPwd, ShouldNotEqual, "")
			})

			Convey("Scan", func() {
				fakeValue := map[string]interface{}{}
				m := configx.New()
				m.Val("fakevalue").Set(map[string]interface{}{"fake": "value"})
				m.Val("fakevalue").Scan(&fakeValue)
			})

			Convey("Reference", func() {
				store.Val("referencevalue").Set(map[string]any{
					"$ref": "rp#/ref",
				})

				store.Val("referencevalue/key").Set("val")
				So(store.Val("referencevalue/key").Get(), ShouldEqual, "val")
			})
		})
	})
}
