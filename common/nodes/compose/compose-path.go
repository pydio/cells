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
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/nodes/archive"
	"github.com/pydio/cells/v4/common/nodes/binaries"
	"github.com/pydio/cells/v4/common/nodes/core"
	"github.com/pydio/cells/v4/common/nodes/encryption"
	"github.com/pydio/cells/v4/common/nodes/events"
	"github.com/pydio/cells/v4/common/nodes/path"
	"github.com/pydio/cells/v4/common/nodes/put"
	"github.com/pydio/cells/v4/common/nodes/sync"
	"github.com/pydio/cells/v4/common/nodes/version"
	"github.com/pydio/cells/v4/common/nodes/virtual"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

func PathClient(ctx context.Context, oo ...nodes.Option) nodes.Client {
	oo = append(oo, nodes.WithContext(ctx))
	return NewClient(pathComposer(oo...)...)
}

func PathClientAdmin(ctx context.Context, oo ...nodes.Option) nodes.Client {
	oo = append(oo, nodes.WithContext(ctx))
	return NewClient(append(oo, pathComposer(nodes.AsAdmin())...)...)
}

func pathComposer(oo ...nodes.Option) []nodes.Option {

	return append(oo,
		nodes.WithCore(func(pool *openurl.Pool[nodes.SourcesPool]) nodes.Handler {
			exe := &core.Executor{}
			exe.SetClientsPool(pool)
			return exe
		}),
		nodes.WithTracer("PathClient", 2),
		acl.WithAccessList(),
		binaries.WithStore(common.PydioThumbstoreNamespace, true, false, false),
		binaries.WithStore(common.PydioDocstoreBinariesNamespace, false, true, true),
		path.WithPermanentPrefix(),
		archive.WithArchives(),
		path.WithWorkspace(),
		path.WithMultipleRoots(),
		virtual.WithResolver(), // !options.BrowseVirtualNodes && !options.AdminView
		virtual.WithBrowser(),  // options.BrowseVirtualNodes
		path.WithRootResolver(),
		path.WithDatasource(),
		sync.WithCache(), // options.SynchronousCache
		events.WithAudit(),
		acl.WithFilter(),
		events.WithRead(),
		put.WithPutInterceptor(),
		put.WithHashInterceptor(),
		acl.WithLock(),
		put.WithUploadLimiter(),
		acl.WithContentLockFilter(),
		acl.WithQuota(),
		sync.WithFolderTasks(), // options.SynchronousTasks
		version.WithVersions(),
		encryption.WithEncryption(),
		core.WithFlatInterceptor(),
		core.WithStructInterceptor(),
	)
}
