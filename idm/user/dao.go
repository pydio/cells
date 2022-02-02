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

// Package user implements basic user and group persistence layer.
//
// It is currently backed by a SQL db.
package user

import (
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/index"
	"github.com/pydio/cells/v4/common/sql/resources"
)

// DAO interface
type DAO interface {
	resources.DAO
	index.DAO

	// Add creates or updates a user in the underlying repository.
	// It returns the resulting user, a true flag in case of an update
	// of an existing user and/or an error if something went wrong.
	Add(interface{}) (interface{}, []*tree.Node, error)

	Del(sql.Enquirer, chan *idm.User) (numRows int64, e error)
	Search(sql.Enquirer, *[]interface{}, ...bool) error
	Count(sql.Enquirer, ...bool) (int, error)
	Bind(userName string, password string) (*idm.User, error)
	CleanRole(roleId string) error
	TouchUser(userUuid string) error
}

// NewDAO wraps passed DAO with specific Pydio implementation of User DAO and returns it.
func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{Handler: v.(*sql.Handler)}
	}
	return nil
}
