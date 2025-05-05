package put

import (
	"context"
	"io"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/scheduler/actions"
)

func WithJobsDynamicMiddlewares() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &DynamicJobsHandler{})
	}
}

var mdCacheConfig = cache.Config{
	Prefix:          "nodes/multiparts/metadata",
	Eviction:        "30s",
	CleanWindow:     "120s",
	DiscardFallback: true,
}

type DynamicJobsHandler struct {
	abstract.Handler
}

func (m *DynamicJobsHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	m.AdaptOptions(c, options)
	return m
}

func (m *DynamicJobsHandler) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	if acl.HasAdminKey(ctx) {
		return m.Next.MultipartCreate(ctx, node, requestData)
	}
	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && (branchInfo.Binary || branchInfo.IndexedBinary) {
		return m.Next.MultipartCreate(ctx, node, requestData)
	}
	var checkedMeta map[string]interface{}
	var err error
	if ctx, node, checkedMeta, err = m.applyInputDescriptors(ctx, node, 0); err != nil {
		log.Logger(ctx).Warn("Error while applying jobs middlewares", zap.Error(err))
	} else if checkedMeta != nil && len(checkedMeta) > 0 {
		if requestData.CheckedMetadata == nil {
			requestData.CheckedMetadata = map[string]interface{}{}
		}
		for k, v := range checkedMeta {
			requestData.CheckedMetadata[k] = v
		}
	}
	uploadID, er := m.Next.MultipartCreate(ctx, node, requestData)
	if er != nil {
		return "", er
	}
	if len(checkedMeta) > 0 {
		uNode := node.Clone()
		for k, v := range checkedMeta {
			uNode.MustSetMeta(k, v)
		}
		cl := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC))
		if _, er = cl.UpdateNode(ctx, &tree.UpdateNodeRequest{From: uNode, To: uNode}); er != nil {
			log.Logger(ctx).Warn("Failed to update node", zap.Error(er))
		} else {
			log.Logger(ctx).Info("Successfully updated node")
		}
	}
	return uploadID, nil
}

func (m *DynamicJobsHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	skipDescriptorsMeta := false
	if acl.HasAdminKey(ctx) {
		skipDescriptorsMeta = true
	}
	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && (branchInfo.Binary || branchInfo.IndexedBinary) {
		skipDescriptorsMeta = true
	}
	var additionalMetadata map[string]interface{}
	if !skipDescriptorsMeta {
		var checkedMeta map[string]interface{}
		var err error
		if ctx, node, checkedMeta, err = m.applyInputDescriptors(ctx, node, requestData.Size); err != nil {
			log.Logger(ctx).Warn("Error while applying jobs middlewares", zap.Error(err))
		} else if checkedMeta != nil && len(checkedMeta) > 0 {
			additionalMetadata = checkedMeta
			if requestData.CheckedMetadata == nil {
				requestData.CheckedMetadata = map[string]interface{}{}
			}
			for k, v := range checkedMeta {
				requestData.CheckedMetadata[k] = v
			}
		}
	} else {
		additionalMetadata = requestData.CheckedMetadata
	}
	oi, er := m.Next.PutObject(ctx, node, reader, requestData)
	if er != nil {
		return oi, er
	}
	if additionalMetadata != nil && len(additionalMetadata) > 0 {
		uNode := node.Clone()
		for k, v := range additionalMetadata {
			uNode.MustSetMeta(k, v)
		}
		cl := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC))
		if _, er = cl.UpdateNode(ctx, &tree.UpdateNodeRequest{From: uNode, To: uNode}); er != nil {
			log.Logger(ctx).Warn("Failed to update node", zap.Error(er))
		} else {
			log.Logger(ctx).Info("Successfully updated node")
		}
	}
	return oi, nil
}

func (m *DynamicJobsHandler) applyInputDescriptors(ctx context.Context, node *tree.Node, size int64) (context.Context, *tree.Node, map[string]interface{}, error) {
	n := node.Clone()
	n.Size = size
	n.Type = tree.NodeType_LEAF

	dd, err := m.getDescriptors(ctx, "input")
	if err != nil {
		log.Logger(ctx).Warn("Cannot load jobs middlewares", zap.Error(err))
	}
	var applied bool
	checkedMetadata := make(map[string]interface{}, 0)
	for _, d := range dd {
		var mm map[string]interface{}
		var updatedNode *tree.Node
		_, updatedNode, mm, applied, err = m.applyInputDescriptor(ctx, d, n)
		if applied {
			log.Logger(ctx).Debug("Applied input descriptor")
			n = updatedNode
			if mm != nil {
				for k, v := range mm {
					checkedMetadata[k] = v
				}
			}
		}
	}
	return ctx, n, checkedMetadata, nil
}

func (m *DynamicJobsHandler) applyInputDescriptor(ctx context.Context, d *jobs.MiddlewareDescriptor, node *tree.Node) (context.Context, *tree.Node, map[string]interface{}, bool, error) {

	pass := true
	for _, f := range d.GetFilters() {
		if nodeFilter := f.GetNodeSelector(); nodeFilter != nil {
			if _, _, passing := nodeFilter.Filter(ctx, &jobs.ActionMessage{Nodes: []*tree.Node{node}}); !passing {
				pass = false
				break
			}
		}
	}
	if !pass {
		log.Logger(ctx).Debug("Input not passing filters", node.Zap("input"))
		return ctx, nil, nil, false, nil
	}
	var err error
	var mm map[string]interface{}
	for _, a := range d.GetActions() {
		impl, ok := actions.GetActionsManager().ActionById(a.GetID())
		if !ok {
			log.Logger(ctx).Warn("Action not found in actions manager", zap.String("action", a.GetID()))
			return ctx, nil, nil, false, nil
		}
		if er := impl.Init(&jobs.Job{}, a); er != nil {
			log.Logger(ctx).Warn("Failed to initialize action", zap.Error(er))
			return ctx, nil, nil, false, nil
		}
		runner, ok := impl.(actions.IncomingMiddlewareAction)
		if !ok {
			log.Logger(ctx).Warn("Action is not an IncomingMiddlewareAction", zap.String("action", a.GetID()))
			return ctx, nil, nil, false, nil
		}
		var meta map[string]interface{}
		if ctx, node, meta, err = runner.HandleIncomingNode(ctx, node); err != nil {
			log.Logger(ctx).Warn("Failed to handle incoming node", zap.Error(err))
			return ctx, nil, nil, false, err
		}
		if meta != nil {
			if mm == nil {
				mm = make(map[string]interface{})
			}
			for k, v := range meta {
				mm[k] = v
			}
		}
	}
	return ctx, node, mm, true, nil

}

func (m *DynamicJobsHandler) getDescriptors(ctx context.Context, middlewareType string) (dd []*jobs.MiddlewareDescriptor, err error) {
	mdCache := cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, mdCacheConfig)
	if mdCache.Get(middlewareType, &dd) {
		return dd, nil
	}
	cl := jobs.NewTaskServiceClient(grpc.ResolveConn(ctx, common.ServiceTasksGRPC))
	resp, er := cl.GetRegisteredMiddlewares(ctx, &jobs.RegisteredMiddlewaresRequest{MiddlewareType: middlewareType})
	if er != nil {
		return nil, er
	}
	dd = resp.GetDescriptors()
	if err = mdCache.Set(middlewareType, dd); err != nil {
		return nil, err
	}
	return dd, nil
}
