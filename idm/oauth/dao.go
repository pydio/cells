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

// Package acl provides persistence and access to Access Control List
package oauth

import (
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/sql"
)

// DAO interface
type DAO interface {
	dao.DAO
}

type PatDao interface {
	Load(idToken string) (*auth.PersonalAccessToken, error)
	Store(token *auth.PersonalAccessToken) error
	Delete(idToken string) error
	List(byType auth.PatType, byUser string) ([]*auth.PersonalAccessToken, error)
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
	}
	return nil
}
