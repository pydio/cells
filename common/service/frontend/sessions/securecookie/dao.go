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

// Package securecookie provides tools for using Bolt as a standard persistence layer for services
package securecookie

import (
	"context"
	"github.com/pydio/cells/v4/common/conn"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const Driver = "securecookie"

func init() {
	dao.RegisterSharedDAODriver(Driver, NewDAO, func(ctx context.Context, driver, dsn string) conn.Conn {
		// TODO
		return nil
	})
}

// DAO defines the functions specific to the boltdb dao
type DAO interface {
	IsCookie()
	dao.DAO
}

// Handler for the main functions of the DAO
type Handler struct {
	dao.DAO
}

func (h *Handler) IsCookie() {}

// NewDAO creates a new handler for the boltdb dao
func NewDAO(ctx context.Context, driver string, dsn string, prefix string, c conn.Conn) (dao.DAO, error) {
	// conn, err := dao.NewConn(ctx, driver, dsn)
	//if err != nil {
	//	return nil, err
	//}
	return &Handler{
		DAO: dao.AbstractDAO(c, driver, dsn, prefix),
	}, nil
}

// Init initialises the handler
func (h *Handler) Init(context.Context, configx.Values) error {
	return nil
}

// LocalAccess overrides DAO
func (h *Handler) LocalAccess() bool {
	return true
}
