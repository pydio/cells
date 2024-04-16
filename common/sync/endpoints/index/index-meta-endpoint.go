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

package index

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/model"
)

// ClientWithMeta is a wrapper for index client that implements the MetadataReceiver interface
type ClientWithMeta struct {
	Client
	metaClient tree.NodeReceiverClient
	runtimeCtx context.Context
}

// NewClientWithMeta creates a new client supporting metadata load
func NewClientWithMeta(ctx context.Context, dsName string, reader tree.NodeProviderClient, writer tree.NodeReceiverClient, sessionClient tree.SessionIndexerClient) *ClientWithMeta {
	m := &ClientWithMeta{
		runtimeCtx: ctx,
	}
	c := NewClient(dsName, reader, writer, sessionClient)
	m.Client = *c
	m.metaClient = tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMeta))
	return m
}

// Walk wraps the initial Walk function to load metadata on the fly
func (m *ClientWithMeta) Walk(ctx context.Context, walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {

	metaClient := tree.NewNodeProviderStreamerClient(grpc.ResolveConn(m.runtimeCtx, common.ServiceMeta))
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	metaStreamer, e := metaClient.ReadNodeStream(ctx)
	if e != nil {
		return e
	}
	walkWrapped := func(path string, node tree.N, err error) error {
		if err == nil {
			tn := &tree.Node{}
			node.As(tn)
			metaStreamer.Send(&tree.ReadNodeRequest{Node: tn})
			if resp, e := metaStreamer.Recv(); e == nil && resp.Node != nil && resp.Node.MetaStore != nil {
				node.SetRawMetadata(resp.Node.MetaStore)
			}
		}
		return walknFc(path, node, err)
	}
	return m.Client.Walk(nil, walkWrapped, root, recursive)

}

// CreateMetadata calls metaClient.CreateNode
func (m *ClientWithMeta) CreateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	log.Logger(ctx).Info("Create Meta : ", node.ZapUuid(), zap.String("namespace", namespace), zap.String("value", jsonValue))
	np := &tree.Node{}
	node.As(np)
	if np.MetaStore == nil {
		np.MetaStore = make(map[string]string, 1)
	}
	np.MetaStore[namespace] = jsonValue
	_, e := m.metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: np})
	return e
}

// UpdateMetadata calls metaClient.UpdateNode
func (m *ClientWithMeta) UpdateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	log.Logger(ctx).Info("Update Meta : ", node.ZapUuid(), zap.String("namespace", namespace), zap.String("value", jsonValue))
	np := &tree.Node{}
	node.As(np)
	if np.MetaStore == nil {
		np.MetaStore = make(map[string]string, 1)
	}
	np.MetaStore[namespace] = jsonValue
	_, e := m.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{To: np})
	return e
}

// DeleteMetadata calls metaClient.UpdateNode with the given namespace and an empty value
// (not DeleteNode, as it would remove all meta at once)
func (m *ClientWithMeta) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	log.Logger(ctx).Info("Delete Meta : ", node.ZapUuid(), zap.String("namespace", namespace))
	np := &tree.Node{}
	node.As(np)
	if np.MetaStore == nil {
		np.MetaStore = make(map[string]string, 1)
	}
	np.MetaStore[namespace] = ""
	_, e := m.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{To: np})
	return e
}
