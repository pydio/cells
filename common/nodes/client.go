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

// Package nodes provides high-level clients for talking to the main data tree in certain context.
//
// It follows the "wrapper" pattern of http handlers to filter all requests inputs and outputs. The "Router" is object
// is used by all services or gateways when accessing to data as a given user.
// Between others, it will
// - Load ACLs and perform checks to make sure user is allowed to read/write the data
// - Perform other meta-related or acl-related checks like Quota management, locks, etc.
// - Perform encryption/decryption of actual data on the fly
// - Compress / Decompress archives,
// - Add metadata collected from any services on the nodes outputted by the responses,
// - etc...
package nodes

import (
	"context"
	"sync"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

const (
	ViewsLibraryName     = "pydio.lib.views"
	MetaAclCheckDownload = "acl-check-download"
	MetaAclCheckSyncable = "acl-check-syncable"
)

// Client the main accessor to access nodes while going through a preset stack of Handler.
// Actual implementations are composed of a Core Handler (executor), a Pool and ordered middlewares.
// It implements all methods of a Handler
type Client interface {
	Handler
	WrapCallback(provider CallbackFunc) error
	BranchInfoForNode(ctx context.Context, node *tree.Node) (branch BranchInfo, err error)
	CanApply(ctx context.Context, operation *tree.NodeChangeEvent) (*tree.NodeChangeEvent, error)
	GetClientsPool(ctx context.Context) SourcesPool
}

var (
	// IsUnitTestEnv flag prevents among others the ClientPool to look for declared
	// datasources in the registry. As none is present while running unit tests, it
	// otherwise times out.
	IsUnitTestEnv = false
)

var metaClient tree.NodeReceiverClient

var mcOnce sync.Once

// CoreMetaWriter lazily loads a ServiceMeta grpc client
func CoreMetaWriter(ctx context.Context) tree.NodeReceiverClient {
	mcOnce.Do(func() {
		metaClient = tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMeta))
	})
	return metaClient
}

// CoreMetaSet directly saves a core metadata associated with a node UUID
func CoreMetaSet(ctx context.Context, nodeUUID string, metaKey, metaValue string, internalDS bool) error {
	node := &tree.Node{Uuid: nodeUUID}
	node.MustSetMeta(metaKey, metaValue)
	if internalDS {
		node.MustSetMeta(common.MetaNamespaceDatasourceInternal, true)
	}
	_, e := CoreMetaWriter(ctx).CreateNode(ctx, &tree.CreateNodeRequest{Node: node, UpdateIfExists: true})
	return e
}

// MustCoreMetaSet saves a core metadata without returning errors
func MustCoreMetaSet(ctx context.Context, nodeUUID string, metaKey, metaValue string, internalDS bool) {
	if nodeUUID == "" {
		log.Logger(ctx).Error("Error while trying to set Meta " + metaKey + " to " + metaValue + ": nodeUUID is empty!")
	} else if e := CoreMetaSet(ctx, nodeUUID, metaKey, metaValue, internalDS); e == nil {
		log.Logger(ctx).Debug("Set Meta " + metaKey + " to " + metaValue)
	} else {
		log.Logger(ctx).Error("Error while trying to set Meta "+metaKey+" to "+metaValue, zap.Error(e))
	}

}
