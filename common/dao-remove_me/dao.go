//go:build exclude
// +build exclude

/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

// Package dao provides abstraction of persistence layer used by pydio services.
package dao

import (
	"context"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type DriverProviderFunc func() (string, string)

type DAOTodoProviderFunc[T any] func(ctx context.Context) T

type ConnProviderFunc func(ctx context.Context, driver, dsn string) ConnDriver

type DaoProviderFunc func(ctx context.Context, driver, dsn, prefix string) (DAO, error)

type IndexerWrapperFunc func(context.Context, DAO) (storage.IndexDAO, error)

type Storer interface{}

type DaoWrapperFunc[T Storer] func(context.Context) (T, error)

type TODODaoWrapperFunc[T any] func(context.Context, T) (T, error)

var daoConns map[string]ConnProviderFunc

// DAO interface definition
type DAO interface {
	registry.Dao

	Init(context.Context, configx.Values) error
	GetConn(context.Context) (Conn, error)
	SetConn(context.Context, Conn)
	CloseConn(context.Context) error

	// Prefix is used to prevent collision between table names
	// in case this DAO accesses a shared DB.
	Prefix() string
	// LocalAccess returns true if DAO relies on an on-file DB
	LocalAccess() bool
	// Stats may return info about the underlying driver/conn
	Stats() map[string]interface{}
}

func init() {
	daoConns = make(map[string]ConnProviderFunc)
}

// RegisterSharedDAODriver registers factories for DAOs and Connections that can be shared across multiple nodes
// TODO : Did we use the "Shared" notion somewhere ( = remote DB )
func RegisterSharedDAODriver(name string, daoF DaoProviderFunc, connF ConnProviderFunc) {
	return
}
