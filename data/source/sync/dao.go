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

// Package sync provides service for synchronizing objects to indexes
package sync

import (
	"context"

	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/sync/endpoints/s3"
)

var Drivers = service.StorageDrivers{}

type DAO interface {
	s3.ChecksumMapper
	CleanResourcesOnDeletion(ctx context.Context) (string, error)
}
