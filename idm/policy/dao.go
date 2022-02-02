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

// Package policy provides advanced policy features to fine tune end-user permissions.
package policy

import (
	"context"

	"github.com/ory/ladon"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
)

type DAO interface {
	sql.DAO
	ladon.Warden
	ladon.Manager

	StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error)
	ListPolicyGroups(ctx context.Context) ([]*idm.PolicyGroup, error)
	DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
	}
	return nil
}
