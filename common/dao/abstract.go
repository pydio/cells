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

package dao

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/merger"
	"strings"
)

// AbstractDAO returns a reference to a newly created struct that
// contains the necessary information to access a database.
// Prefix parameter is used to specify a prefix to avoid collision
// between table names in case this DAO accesses a shared DB: it thus
// will be an empty string in most of the cases.
func AbstractDAO(conn Conn, driver, dsn, prefix string) DAO {
	return &abstract{
		conn:   conn,
		driver: driver,
		dsn:    dsn,
		prefix: prefix,
	}
}

type abstract struct {
	conn   Conn
	id     string
	driver string
	dsn    string
	prefix string
}

// Equals implements merger.Differ interface
func (h *abstract) Equals(differ merger.Differ) bool {
	if di, ok := differ.(*abstract); ok {
		return di.ID() == h.ID() && di.Name() == h.Name()
	}
	return false
}

// IsDeletable implements merger.Differ interface
func (h *abstract) IsDeletable(m map[string]string) bool {
	return true
}

// IsMergeable implements merger.Differ interface
func (h *abstract) IsMergeable(differ merger.Differ) bool {
	return differ.GetUniqueId() == h.ID()
}

// GetUniqueId implements merger.Differ interface
func (h *abstract) GetUniqueId() string {
	return h.ID()
}

// Merge implements merger.Differ interface
func (h *abstract) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

// Init will be overridden by implementations
func (h *abstract) Init(_ context.Context, _ configx.Values) error {
	return nil
}

// Driver returns driver name
func (h *abstract) Driver() string {
	return h.driver
}

// Prefix returns prefix name
func (h *abstract) Prefix() string {
	return h.prefix
}

// Stats will be overridden by implementations1
func (h *abstract) Stats() map[string]interface{} {
	return map[string]interface{}{}
}

// GetConn to the DB for the DAO
func (h *abstract) GetConn(_ context.Context) (Conn, error) {
	if h == nil {
		return nil, fmt.Errorf("not implemented")
	}
	return h.conn, nil
}

// SetConn assigns the db connection to the DAO
func (h *abstract) SetConn(_ context.Context, conn Conn) {
	h.conn = conn
}

// CloseConn closes the db connection
func (h *abstract) CloseConn(ctx context.Context) error {
	return closeConn(ctx, h.conn)
}

// LocalAccess returns false by default, can be overridden by implementations
func (h *abstract) LocalAccess() bool {
	return false
}

// Name returns a readable name for this DAO
func (h *abstract) Name() string {
	if strings.Contains(h.dsn, "://") {
		return h.dsn
	} else {
		return h.driver + "://" + h.dsn
	}
}

// ID returns a unique id for storing in registry
func (h *abstract) ID() string {
	if h.id == "" {
		s := md5.New()
		s.Write([]byte(h.Name()))
		h.id = hex.EncodeToString(s.Sum(nil))
	}
	return h.id
}

// Metadata returns a map of properties for registry.Item
func (h *abstract) Metadata() map[string]string {
	mm := map[string]string{}
	if h.prefix != "" {
		mm["Prefix"] = h.prefix
	}
	return mm
}

// As can check if object is convertible to registry.Dao
func (h *abstract) As(i interface{}) bool {
	if hh, ok := i.(*registry.Dao); ok {
		*hh = h
		return true
	}
	return false
}

// Dsn returns dao DSN
func (h *abstract) Dsn() string {
	return h.dsn
}
