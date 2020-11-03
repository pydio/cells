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
	"fmt"
	"sync"
	"testing"

	"github.com/micro/go-micro/metadata"

	"github.com/pydio/cells/common/proto/idm"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/meta"
	"github.com/pydio/cells/x/configx"

	// Test against sqlite
	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	wg  sync.WaitGroup
	ctx context.Context
)

func TestMain(m *testing.M) {
	var options = configx.New()

	sqlDAO := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	mockDAO := meta.NewDAO(sqlDAO)
	if err := mockDAO.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	ctx = servicecontext.WithDAO(ctx, mockDAO)
	ctx = metadata.NewContext(ctx, map[string]string{})

	m.Run()
	wg.Wait()
}

func TestRole(t *testing.T) {

	h := &Handler{}

	Convey("Test DAO", t, func() {
		dao := servicecontext.GetDAO(ctx).(meta.DAO)
		nsDao := dao.GetNamespaceDao()
		So(nsDao, ShouldNotBeNil)
	})

	Convey("Test NS Handler", t, func() {

		namespaces := []*idm.UserMetaNamespace{{
			Namespace: "namespace",
			Label:     "label",
		}}
		resp := &idm.UpdateUserMetaNamespaceResponse{}
		err := h.UpdateUserMetaNamespace(ctx, &idm.UpdateUserMetaNamespaceRequest{Namespaces: namespaces, Operation: idm.UpdateUserMetaNamespaceRequest_PUT}, resp)
		So(err, ShouldBeNil)

	})

}
