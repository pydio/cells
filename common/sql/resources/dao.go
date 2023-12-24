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

// Package resources provides ready-to-use SQL schemes and DAOs for attaching resource policies to any data
package resources

import (
	"context"
	"github.com/pydio/cells/v4/common/dao"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/storage"
	"gorm.io/gorm"
)

// DAO interface
type DAO interface {
	dao.DAO
	AddPolicy(resourceId string, policy *service.ResourcePolicy) error
	AddPolicies(update bool, resourceId string, rules []*service.ResourcePolicy) error
	GetPoliciesForResource(resourceId string) ([]*service.ResourcePolicy, error)
	DeletePoliciesForResource(resourceId string) error
	DeletePoliciesForResourceAndAction(resourceId string, action service.ResourcePolicyAction) error
	DeletePoliciesBySubject(subject string) error

	BuildPolicyConditionForAction(q *service.ResourcePolicyQuery, action service.ResourcePolicyAction) (expr any, e error)
}

func NewDAO(ctx context.Context, store storage.Storage) (dao.DAO, error) {
	var db *gorm.DB

	if store.Get(&db) {
		return &ResourcesGORM{DB: db}, nil
	}

	return nil, storage.UnsupportedDriver(store)
}
