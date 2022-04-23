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

package meta

import (
	"context"
	"github.com/smartystreets/goconvey/convey"
	"testing"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	mockDAO DAO
	ctx     = context.Background()
)

func TestMain(m *testing.M) {
	options := configx.New()
	if d, e := dao.InitDAO(ctx, sqlite.Driver, sqlite.SharedMemDSN, "test", NewDAO, options); e != nil {
		panic(e)
	} else {
		mockDAO = d.(DAO)
	}

	m.Run()
}

func TestDAOInit(t *testing.T) {
	convey.Convey("Init Meta DAO", t, func() {
		convey.So(mockDAO, convey.ShouldNotBeNil)
	})
}
