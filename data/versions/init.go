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

package versions

import (
	"context"
	"path"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var policiesCache cache.Short

func init() {

	manager := actions.GetActionsManager()

	manager.Register(versionActionName, func() actions.ConcreteAction {
		return &VersionAction{}
	})

	manager.Register(pruneVersionsActionName, func() actions.ConcreteAction {
		return &PruneVersionsAction{}
	})

	manager.Register(onDeleteVersionsActionName, func() actions.ConcreteAction {
		return &OnDeleteVersionsAction{}
	})

}

// PolicyForNode checks datasource name and find corresponding VersioningPolicy (if set). Returns nil otherwise.
func PolicyForNode(ctx context.Context, node *tree.Node) *tree.VersioningPolicy {

	if policiesCache == nil {
		policiesCache = cache.NewShort(cache.WithEviction(1*time.Hour), cache.WithCleanWindow(1*time.Hour))
	}

	dataSourceName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
	policyName := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dataSourceName, "VersioningPolicyName").String()
	if policyName == "" {
		return nil
	}

	if v, ok := policiesCache.Get(policyName); ok {
		return v.(*tree.VersioningPolicy)
	}

	dc := docstore.NewDocStoreClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDocStore))
	r, e := dc.GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    common.DocStoreIdVersioningPolicies,
		DocumentID: policyName,
	})
	if e != nil || r.Document == nil {
		return nil
	}

	var p *tree.VersioningPolicy
	if er := json.Unmarshal([]byte(r.Document.Data), &p); er == nil {
		log.Logger(ctx).Debug("[VERSION] found policy for node", zap.Any("p", p))
		policiesCache.Set(policyName, p)
		return p
	}

	return nil
}

// DataSourceForPolicy finds the LoadedSource for a given VersioningPolicy - Uses "DS: default"+"Bucket: versions" for
// backward compatibility.
func DataSourceForPolicy(ctx context.Context, policy *tree.VersioningPolicy) (nodes.LoadedSource, error) {
	if policy.VersionsDataSourceName == "default" {
		return getRouter(ctx).GetClientsPool().GetDataSourceInfo(common.PydioVersionsNamespace)
	}
	if ls, err := getRouter(ctx).GetClientsPool().GetDataSourceInfo(policy.VersionsDataSourceName); err == nil {
		if policy.VersionsDataSourceBucket != "" {
			ls.ObjectsBucket = policy.VersionsDataSourceBucket
		}
		return ls, nil
	} else {
		return nodes.LoadedSource{}, err
	}
}

func DefaultLocation(originalUUID, versionUUID string) *tree.Node {
	c := config.Get("services", "pydio.versions-store")
	dsName := c.Val("datasource").Default(configx.Reference("#/defaults/datasource")).String()
	vPath := originalUUID + "__" + versionUUID
	return &tree.Node{
		Uuid: vPath,
		Path: path.Join(dsName, vPath),
		Type: tree.NodeType_LEAF,
		MetaStore: map[string]string{
			common.MetaNamespaceDatasourceName: `"` + dsName + `"`,
			common.MetaNamespaceDatasourcePath: `"` + vPath + `"`,
		},
	}
}
