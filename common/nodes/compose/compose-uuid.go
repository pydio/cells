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

package compose

import (
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/core"
	"github.com/pydio/cells/v5/common/nodes/encryption"
	"github.com/pydio/cells/v5/common/nodes/events"
	"github.com/pydio/cells/v5/common/nodes/put"
	"github.com/pydio/cells/v5/common/nodes/uuid"
	"github.com/pydio/cells/v5/common/nodes/version"
)

func UuidClient(oo ...nodes.Option) nodes.Client {
	return NewClient(uuidComposer(oo...)...)
}

func uuidComposer(oo ...nodes.Option) []nodes.Option {
	return append(oo,
		nodes.WithCore(&core.Executor{}),
		nodes.WithTracer("UuidClient", 2),
		acl.WithAccessList(),
		uuid.WithWorkspace(),
		uuid.WithDatasource(),
		events.WithAudit(),
		acl.WithFilter(),
		//events.WithRead(), why not?
		put.WithJobsDynamicMiddlewares(),
		put.WithPutInterceptor(),
		put.WithHashInterceptor(),
		acl.WithLock(),
		put.WithUploadLimiter(),
		acl.WithContentLockFilter(),
		acl.WithQuota(),

		version.WithVersions(),
		encryption.WithEncryption(),
		core.WithFlatInterceptor(),
		core.WithStructInterceptor(),
	)
}
