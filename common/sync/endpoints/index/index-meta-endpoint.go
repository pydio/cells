package index

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/sync/model"
)

// ClientWithMeta is a wrapper for index client that implements the MetadataReceiver interface
type ClientWithMeta struct {
	Client
	metaClient tree.NodeReceiverClient
}

// NewClientWithMeta creates a new client supporting metadata load
func NewClientWithMeta(dsName string, reader tree.NodeProviderClient, writer tree.NodeReceiverClient, sessionClient tree.SessionIndexerClient) *ClientWithMeta {
	m := &ClientWithMeta{}
	c := NewClient(dsName, reader, writer, sessionClient)
	m.Client = *c
	m.metaClient = tree.NewNodeReceiverClient(registry.GetClient(common.ServiceMeta))
	return m
}

// Walk wraps the initial Walk function to load metadata on the fly
func (m *ClientWithMeta) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {

	metaClient := tree.NewNodeProviderStreamerClient(registry.GetClient(common.ServiceMeta))
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	metaStreamer, e := metaClient.ReadNodeStream(ctx)
	if e != nil {
		return e
	}
	defer metaStreamer.Close()
	walkWrapped := func(path string, node *tree.Node, err error) {
		if err == nil {
			metaStreamer.Send(&tree.ReadNodeRequest{Node: node})
			if resp, e := metaStreamer.Recv(); e == nil && resp.Node != nil && resp.Node.MetaStore != nil {
				if node.MetaStore == nil {
					node.MetaStore = make(map[string]string, len(resp.Node.MetaStore))
				}
				for k, v := range resp.Node.MetaStore {
					node.MetaStore[k] = v
				}
			}
		}
		walknFc(path, node, err)
	}
	return m.Client.Walk(walkWrapped, root, recursive)

}

// CreateMetadata calls metaClient.CreateNode
func (m *ClientWithMeta) CreateMetadata(ctx context.Context, node *tree.Node, namespace string, jsonValue string) error {
	log.Logger(ctx).Info("Create Meta : ", node.ZapUuid(), zap.String("namespace", namespace), zap.String("value", jsonValue))
	if node.MetaStore == nil {
		node.MetaStore = make(map[string]string, 1)
	}
	node.MetaStore[namespace] = jsonValue
	_, e := m.metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: node})
	return e
}

// UpdateMetadata calls metaClient.UpdateNode
func (m *ClientWithMeta) UpdateMetadata(ctx context.Context, node *tree.Node, namespace string, jsonValue string) error {
	log.Logger(ctx).Info("Update Meta : ", node.ZapUuid(), zap.String("namespace", namespace), zap.String("value", jsonValue))
	if node.MetaStore == nil {
		node.MetaStore = make(map[string]string, 1)
	}
	node.MetaStore[namespace] = jsonValue
	_, e := m.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{To: node})
	return e
}

// DeleteMetadata calls metaClient.UpdateNode with the given namespace and an empty value
// (not DeleteNode, as it would remove all meta at once)
func (m *ClientWithMeta) DeleteMetadata(ctx context.Context, node *tree.Node, namespace string) error {
	log.Logger(ctx).Info("Delete Meta : ", node.ZapUuid(), zap.String("namespace", namespace))
	if node.MetaStore == nil {
		node.MetaStore = make(map[string]string, 1)
	}
	node.MetaStore[namespace] = ""
	_, e := m.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{To: node})
	return e
}
