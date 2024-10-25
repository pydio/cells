/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

	"gorm.io/gorm"

	service "github.com/pydio/cells/v4/common/proto/service"
)

// DAO interface
type DAO interface {
	Migrate(ctx context.Context) error

	AddPolicy(ctx context.Context, resourceId string, policy *service.ResourcePolicy) error
	AddPolicies(ctx context.Context, update bool, resourceId string, rules []*service.ResourcePolicy) error
	GetPoliciesForResource(ctx context.Context, resourceId string) ([]*service.ResourcePolicy, error)
	GetPoliciesForSubject(ctx context.Context, subject string) ([]*service.ResourcePolicy, error)
	ReplacePoliciesSubject(ctx context.Context, oldSubject, newSubject string) (int, error)
	DeletePoliciesForResource(ctx context.Context, resourceId string) error
	DeletePoliciesForResourceAndAction(ctx context.Context, resourceId string, action service.ResourcePolicyAction) error
	DeletePoliciesBySubject(ctx context.Context, subject string) error

	service.Converter[*gorm.DB]
}

func NewDAO(db *gorm.DB) DAO {
	return withCache(&gormImpl{DB: db})
}
