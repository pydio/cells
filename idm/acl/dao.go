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
package acl

import (
	"context"
	"time"

	"github.com/pydio/cells/v5/common/proto/idm"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/service"
)

var Drivers = service.StorageDrivers{}

type ExpirationProvider interface {
	GetExpiredBefore() int64
	GetExpiredAfter() int64
}

type ExpirationPeriod struct {
	Start time.Time
	End   time.Time
}

func ReadExpirationPeriod(p ExpirationProvider) *ExpirationPeriod {
	if p.GetExpiredBefore() == 0 && p.GetExpiredAfter() == 0 {
		return nil
	}
	period := &ExpirationPeriod{}
	if p.GetExpiredAfter() > 0 {
		period.Start = time.Unix(p.GetExpiredAfter(), 0)
	}
	if p.GetExpiredBefore() > 0 {
		period.End = time.Unix(p.GetExpiredBefore(), 0)
	}
	return period
}

// DAO interface
type DAO interface {
	Migrate(context.Context) error
	Add(context.Context, bool, ...*idm.ACL) error
	SetExpiry(context.Context, service2.Enquirer, *time.Time, *ExpirationPeriod) (int64, error)
	Del(context.Context, service2.Enquirer, *ExpirationPeriod) (numRows int64, e error)
	Search(context.Context, service2.Enquirer, *[]interface{}, *ExpirationPeriod) error
}
