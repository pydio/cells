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

// Package dao provides abstraction of persistence layer used by pydio services.
package dao

import (
	"fmt"

	"github.com/pydio/cells/v4/common/utils/configx"
)

type MigratorFunc func(from DAO, to DAO, dryRun bool) (map[string]int, error)
type DriverProviderFunc func() (string, string)

type ConnProviderFunc func(driver, dsn string) ConnDriver
type DaoProviderFunc func(driver, dsn, prefix string) (DAO, error)
type IndexerWrapperFunc func(DAO) (IndexDAO, error)

var daoConns map[string]ConnProviderFunc
var daoDrivers map[string]DaoProviderFunc
var indexersDrivers map[string]IndexerWrapperFunc

func init() {
	daoConns = make(map[string]ConnProviderFunc)
	daoDrivers = make(map[string]DaoProviderFunc)
	indexersDrivers = make(map[string]IndexerWrapperFunc)
}

func RegisterDAODriver(name string, daoF DaoProviderFunc, connF ConnProviderFunc) {
	daoDrivers[name] = daoF
	daoConns[name] = connF
}

func RegisterIndexerDriver(name string, daoF IndexerWrapperFunc) {
	indexersDrivers[name] = daoF
}

// DAO interface definition
type DAO interface {
	Init(configx.Values) error
	GetConn() Conn
	SetConn(Conn)
	CloseConn() error
	Driver() string

	// Prefix is used to prevent collision between table names
	// in case this DAO accesses a shared DB.
	Prefix() string
	LocalAccess() bool
}

type handler struct {
	conn   Conn
	driver string
	prefix string
}

// InitDAO finalize DAO creation based on registered drivers
func InitDAO(driver, dsn, prefix string, wrapper func(DAO) DAO, cfg ...configx.Values) (DAO, error) {
	f, ok := daoDrivers[driver]
	if !ok {
		return nil, fmt.Errorf("cannot find driver %s, maybe it was not properly registered", driver)
	}
	d, e := f(driver, dsn, prefix)
	if e != nil {
		return nil, e
	}
	if wrapper != nil {
		d = wrapper(d)
		if d == nil {
			return nil, fmt.Errorf("unsupported driver type")
		}
	}
	if len(cfg) > 0 {
		if er := d.Init(cfg[0]); er != nil {
			return nil, er
		}
	}
	return d, nil
}

func InitIndexer(driver, dsn, prefix string, wrapper func(DAO) DAO, cfg ...configx.Values) (DAO, error) {
	d, e := InitDAO(driver, dsn, prefix, nil)
	if e != nil {
		return nil, e
	}
	i, ok := indexersDrivers[driver]
	if !ok {
		return nil, fmt.Errorf("cannot find indexer %s, maybe it was not properly registered", driver)
	}
	// Wrap DAO as Indexer
	if d, e = i(d); e != nil {
		return nil, e
	}
	// Wrap with input wrapper
	d = wrapper(d)
	if d == nil {
		return nil, fmt.Errorf("unsupported driver type")
	}
	if len(cfg) > 0 {
		if er := d.Init(cfg[0]); er != nil {
			return nil, er
		}
	}
	return d.(IndexDAO), nil
}

// NewDAO returns a reference to a newly created struct that
// contains the necessary information to access a database.
// Prefix parameter is used to specify a prefix to avoid collision
// between table names in case this DAO accesses a shared DB: it thus
// will be an empty string in most of the cases.
func NewDAO(conn Conn, driver string, prefix string) DAO {
	return &handler{
		conn:   conn,
		driver: driver,
		prefix: prefix,
	}
}

func (h *handler) Init(c configx.Values) error {
	return nil
}

func (h *handler) Driver() string {
	return h.driver
}

func (h *handler) Prefix() string {
	return h.prefix
}

// GetConn to the DB for the DAO
func (h *handler) GetConn() Conn {
	if h == nil {
		return nil
	}
	return h.conn
}

// SetConn assigns the db connection to the DAO
func (h *handler) SetConn(conn Conn) {
	h.conn = conn
}

// CloseConn closes the db connection
func (h *handler) CloseConn() error {
	return closeConn(h.conn)
}

func (h *handler) LocalAccess() bool {
	return false
}
