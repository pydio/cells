//go:build storage

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

package oauth_test

import (
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/idm/oauth"
	"github.com/pydio/cells/v4/idm/oauth/dao/sql"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRange(t *testing.T) {
	/*
		Convey("Test Range of string", t, func() {
			str := rangeFromStr("http://localhost:[30000-30005]")
			So(len(str), ShouldEqual, 6)

			strFail := rangeFromStr("http://localhost:[30000-29995]")
			So(len(strFail), ShouldEqual, 1)
		})
	*/
}

var (
	testCases = test.TemplateSQL(sql.NewRegistryDAO)
)

func TestRegistry(t *testing.T) {

	test.RunStorageTests(testCases, t, func(ctx context.Context) {
		Convey("Basic Resolve", t, func() {
			fakeStore, _ := config.OpenStore(ctx, "mem://")
			ctx = propagator.With(ctx, config.ContextKey, fakeStore)
			dao, err := manager.Resolve[oauth.Registry](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)
		})
	})
	/*
		Convey("Test Registry", t, func() {
			r := NewRegistrySQL()
			req := &consent.LoginRequest{
				ID:         "testlogin",
				ClientID:   "testclient",
				RequestURL: "testurl",
			}

			fmt.Println("And the client is ? ", req.ID, req.ClientID, req.RequestURL)

			r.ConsentManager().CreateLoginRequest(context.TODO(), req)

			resp, _ := r.ConsentManager().GetLoginRequest(context.TODO(), "testlogin")
			fmt.Println("And the client is ? ", resp.ID, resp.ClientID, resp.RequestURL)
		})*/
}
