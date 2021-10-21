package bleve

import (
	"compress/gzip"
	"context"
	"io/ioutil"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/blevesearch/bleve"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/meta"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/common/views/models"
)

// Batch avoids overflowing bleve index by batching indexation events (index/delete)
type Batch struct {
	sync.Mutex
	inserts    map[string]*tree.IndexableNode
	deletes    map[string]struct{}
	nsProvider *meta.NamespacesProvider
	options    BatchOptions
	ctx        context.Context
	uuidRouter views.Handler
	stdRouter  views.Handler
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
	for uuid := range b.deletes {
		batch.Delete(uuid)
		delete(b.deletes, uuid)
	}
	b.Unlock()
	return index.Batch(batch)
}

func (b *Batch) LoadIndexableNode(indexNode *tree.IndexableNode, excludes map[string]struct{}) error {
	if indexNode.ReloadCore {
		if resp, e := b.getUuidRouter().ReadNode(b.ctx, &tree.ReadNodeRequest{Node: &indexNode.Node}); e != nil {
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
	ref := indexNode.GetStringMeta("ContentRef")
	if b.options.IndexContent && indexNode.IsLeaf() && ref != "" {
		delete(indexNode.Meta, "ContentRef")
		if reader, e := b.getStdRouter().GetObject(b.ctx, &tree.Node{Path: ref}, &models.GetRequestData{Length: -1}); e == nil {
			if strings.HasSuffix(ref, ".gz") {
				// Content is gzip-compressed
				if gR, e := gzip.NewReader(reader); e == nil {
					if contents, e := ioutil.ReadAll(gR); e == nil {
						indexNode.TextContent = string(contents)
					}
					gR.Close()
				}
			} else if contents, e := ioutil.ReadAll(reader); e == nil {
				indexNode.TextContent = string(contents)
			}
			reader.Close()
		}
	}
	indexNode.MetaStore = nil
	return nil
}

func (b *Batch) createBackgroundContext() context.Context {
	ctx := auth.ContextFromClaims(context.Background(), claim.Claims{
		Name:      common.PydioSystemUsername,
		Profile:   common.PydioProfileAdmin,
		GroupPath: "/",
	})
	ctx = servicecontext.WithServiceName(ctx, common.ServiceGrpcNamespace_+common.ServiceSearch)
	return ctx
}

func (b *Batch) NamespacesProvider() *meta.NamespacesProvider {
	if b.nsProvider == nil {
		b.nsProvider = meta.NewNamespacesProvider()
	}
	return b.nsProvider
}

func (b *Batch) getUuidRouter() views.Handler {
	if b.uuidRouter == nil {
		b.uuidRouter = views.NewUuidRouter(views.RouterOptions{AdminView: true, WatchRegistry: true})
	}
	return b.uuidRouter
}

func (b *Batch) getStdRouter() views.Handler {
	if b.stdRouter == nil {
		b.stdRouter = views.NewStandardRouter(views.RouterOptions{AdminView: true, WatchRegistry: true})
	}
	return b.stdRouter
}
