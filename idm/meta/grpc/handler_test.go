//go:build storage

/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/idm/meta"
	"github.com/pydio/cells/v4/idm/meta/dao/sql"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewDAO)
)

func TestRole(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {

		dao, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}

		h := &Handler{}

		Convey("Test DAO", t, func() {
			nsDao := dao.GetNamespaceDao()
			So(nsDao, ShouldNotBeNil)
		})

		Convey("Test NS Handler", t, func() {

			namespaces := []*idm.UserMetaNamespace{{
				Namespace: "namespace",
				Label:     "label",
			}}
			_, err := h.UpdateUserMetaNamespace(ctx, &idm.UpdateUserMetaNamespaceRequest{Namespaces: namespaces, Operation: idm.UpdateUserMetaNamespaceRequest_PUT})
			So(err, ShouldBeNil)

		})

	})
}
