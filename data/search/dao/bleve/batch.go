package bleve

import (
	"context"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/common/auth"

	"github.com/blevesearch/bleve"
	"github.com/sajari/docconv"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/utils/meta"
	"github.com/pydio/cells/common/views"
)

// Batch avoids overflowing bleve index by batching indexation events (index/delete)
type Batch struct {
	sync.Mutex
	inserts    map[string]*tree.IndexableNode
	deletes    map[string]struct{}
	nsProvider *meta.NamespacesProvider
	options    BatchOptions
	ctx        context.Context
	router     views.Handler
}

type BatchOptions struct {
	IndexContent bool
}

func NewBatch(options BatchOptions) *Batch {
	b := &Batch{
		options: options,
		inserts: make(map[string]*tree.IndexableNode),
		deletes: make(map[string]struct{}),
	}
	b.ctx = b.createBackgroundContext()
	return b
}

func (b *Batch) Index(i *tree.IndexableNode) {
	b.Lock()
	b.inserts[i.GetUuid()] = i
	delete(b.deletes, i.GetUuid())
	b.Unlock()
}

func (b *Batch) Delete(uuid string) {
	b.Lock()
	b.deletes[uuid] = struct{}{}
	delete(b.inserts, uuid)
	b.Unlock()
}

func (b *Batch) Size() int {
	b.Lock()
	l := len(b.inserts) + len(b.deletes)
	b.Unlock()
	return l
}

func (b *Batch) Flush(index bleve.Index) error {
	b.Lock()
	l := len(b.inserts) + len(b.deletes)
	if l == 0 {
		b.Unlock()
		return nil
	}
	log.Logger(b.ctx).Info("Flushing search batch", zap.Int("size", l))
	batch := index.NewBatch()
	excludes := b.NamespacesProvider().ExcludeIndexes()
	b.NamespacesProvider().InitStreamers(b.ctx)
	defer b.NamespacesProvider().CloseStreamers()
	for uuid, node := range b.inserts {
		if e := b.LoadIndexableNode(node, excludes); e == nil {
			batch.Index(uuid, node)
		}
		delete(b.inserts, uuid)
	}
	for uuid, _ := range b.deletes {
		batch.Delete(uuid)
		delete(b.deletes, uuid)
	}
	b.Unlock()
	return index.Batch(batch)
}

func (b *Batch) LoadIndexableNode(indexNode *tree.IndexableNode, excludes map[string]struct{}) error {
	if indexNode.ReloadCore {
		if resp, e := b.getRouter().ReadNode(b.ctx, &tree.ReadNodeRequest{Node: &indexNode.Node}); e != nil {
			return e
		} else {
			rNode := resp.Node
			if indexNode.MetaStore != nil {
				for k, v := range indexNode.MetaStore {
					rNode.MetaStore[k] = v
				}
			}
			indexNode.Node = *rNode
		}
	} else if indexNode.ReloadNs {
		if resp, e := b.NamespacesProvider().ReadNode(&indexNode.Node); e != nil {
			return e
		} else {
			indexNode.Node = *resp
		}
	}
	indexNode.Meta = indexNode.AllMetaDeserialized(excludes)
	indexNode.ModifTime = time.Unix(indexNode.MTime, 0)
	var basename string
	indexNode.GetMeta("name", &basename)
	indexNode.Basename = basename
	if indexNode.Type == 1 {
		indexNode.NodeType = "file"
		indexNode.Extension = strings.ToLower(strings.TrimLeft(filepath.Ext(basename), "."))
	} else {
		indexNode.NodeType = "folder"
	}
	indexNode.GetMeta("GeoLocation", &indexNode.GeoPoint)
	if b.options.IndexContent && indexNode.IsLeaf() {
		logger := log.Logger(b.ctx)
		reader, err := b.getRouter().GetObject(b.ctx, indexNode.Node.Clone(), &views.GetRequestData{Length: -1})
		if err == nil {
			convertResp, er := docconv.Convert(reader, docconv.MimeTypeByExtension(basename), true)
			if er == nil {
				// Todo : do something with convertResp.Meta?
				logger.Debug("[BLEVE] Indexing content body for file")
				indexNode.TextContent = convertResp.Body
			}
		} else {
			logger.Debug("[BLEVE] Index content: error while trying to read file for content indexation")
		}
	}
	indexNode.MetaStore = nil
	return nil
}

func (b *Batch) createBackgroundContext() context.Context {
	bgClaim := claim.Claims{
		Name:      common.PydioSystemUsername,
		Profile:   common.PydioProfileAdmin,
		GroupPath: "/",
	}
	md := map[string]string{
		common.PydioContextUserKey: common.PydioSystemUsername,
	}
	ctx := context.WithValue(context.Background(), claim.ContextKey, bgClaim)
	ctx = auth.ToMetadata(ctx, bgClaim)
	ctx = context.WithValue(ctx, common.PydioContextUserKey, bgClaim.Name)
	ctx = servicecontext.WithServiceName(ctx, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_SEARCH)
	ctx = servicecontext.WithServiceColor(ctx, servicecontext.ServiceColorGrpc)
	ctx = context2.WithAdditionalMetadata(ctx, md)
	return ctx
}

func (b *Batch) NamespacesProvider() *meta.NamespacesProvider {
	if b.nsProvider == nil {
		b.nsProvider = meta.NewNamespacesProvider()
	}
	return b.nsProvider
}

func (b *Batch) getRouter() views.Handler {
	if b.router == nil {
		b.router = views.NewUuidRouter(views.RouterOptions{AdminView: true, WatchRegistry: true})
	}
	return b.router
}
