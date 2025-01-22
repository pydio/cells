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

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	policiesCacheConf = cache.Config{
		Eviction:    "1h",
		CleanWindow: "1h",
	}
)

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

	dataSourceName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
	var dsConfig *object.DataSource
	if er := config.Get(ctx, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dataSourceName).Scan(&dsConfig); er != nil {
		log.Logger(ctx).Error("cannot scan datasource config when reading PolicyForNode")
	}
	policyName := dsConfig.GetVersioningPolicyName()
	if policyName == "" {
		return nil
	}
	pk := cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, policiesCacheConf)

	var v *tree.VersioningPolicy
	if pk.Get(policyName, &v) {
		return v
	}

	dc := docstorec.DocStoreClient(ctx)
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
		pk.Set(policyName, p)
		return p
	}

	return nil
}

// DataSourceForPolicy finds the LoadedSource for a given VersioningPolicy - Uses "DS: default"+"Bucket: versions" for
// backward compatibility.
func DataSourceForPolicy(ctx context.Context, policy *tree.VersioningPolicy) (nodes.LoadedSource, error) {
	if policy.VersionsDataSourceName == "default" {
		return getRouter().GetClientsPool(ctx).GetDataSourceInfo(common.PydioVersionsNamespace)
	}
	if ls, err := getRouter().GetClientsPool(ctx).GetDataSourceInfo(policy.VersionsDataSourceName); err == nil {
		if policy.VersionsDataSourceBucket != "" {
			ls.ObjectsBucket = policy.VersionsDataSourceBucket
		}
		return ls, nil
	} else {
		return nodes.LoadedSource{}, err
	}
}

func DefaultLocation(ctx context.Context, originalUUID, versionUUID string) *tree.Node {
	c := config.Get(ctx, "services", "pydio.versions-store")
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
