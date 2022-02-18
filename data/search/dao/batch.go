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

package dao

import (
	"compress/gzip"
	"context"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service/context"
)

// Batch avoids overflowing bleve index by batching indexation events (index/delete)
type Batch struct {
	sync.Mutex
	inserts    map[string]*tree.IndexableNode
	deletes    map[string]struct{}
	nsProvider *meta.NsProvider
	options    BatchOptions
	ctx        context.Context
	uuidRouter nodes.Handler
	stdRouter  nodes.Handler
}

type BatchOptions struct {
	IndexContent bool
}

func NewBatch(ctx context.Context, nsProvider *meta.NsProvider, options BatchOptions) *Batch {
	b := &Batch{
		options:    options,
		inserts:    make(map[string]*tree.IndexableNode),
		deletes:    make(map[string]struct{}),
		nsProvider: nsProvider,
	}
	b.ctx = b.createBackgroundContext(ctx)
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

func (b *Batch) Flush(indexer dao.IndexDAO) error {
	b.Lock()
	l := len(b.inserts) + len(b.deletes)
	if l == 0 {
		b.Unlock()
		return nil
	}
	log.Logger(b.ctx).Info("Flushing search batch", zap.Int("size", l))
	//batch := index.NewBatch()
	excludes := b.nsProvider.ExcludeIndexes()
	b.nsProvider.InitStreamers(b.ctx)
	defer b.nsProvider.CloseStreamers()
	for uuid, node := range b.inserts {
		if e := b.LoadIndexableNode(node, excludes); e == nil {
			//batch.Index(uuid, node)
			if er := indexer.InsertOne(nil, node); er != nil {
				fmt.Println("Search batch - InsertOne error", er.Error())
			}
		}
		delete(b.inserts, uuid)
	}
	for uuid := range b.deletes {
		if er := indexer.DeleteOne(nil, uuid); er != nil {
			fmt.Println("Search batch - DeleteOne error", er.Error())
		}
		delete(b.deletes, uuid)
	}
	b.Unlock()
	return indexer.Flush(b.ctx)
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
		if resp, e := b.nsProvider.ReadNode(&indexNode.Node); e != nil {
			return e
		} else {
			indexNode.Node = *resp
		}
	}
	indexNode.Meta = indexNode.AllMetaDeserialized(excludes)
	indexNode.ModifTime = time.Unix(indexNode.MTime, 0)
	var basename string
	indexNode.GetMeta(common.MetaNamespaceNodeName, &basename)
	indexNode.Basename = basename
	if indexNode.Type == 1 {
		indexNode.NodeType = "file"
		indexNode.Extension = strings.ToLower(strings.TrimLeft(filepath.Ext(basename), "."))
	} else {
		indexNode.NodeType = "folder"
	}
	indexNode.GetMeta(common.MetaNamespaceGeoLocation, &indexNode.GeoPoint)
	if indexNode.GeoPoint != nil {
		lat, ok1 := indexNode.GeoPoint["lat"].(float64)
		lon, ok2 := indexNode.GeoPoint["lon"].(float64)
		if ok1 && ok2 {
			indexNode.GeoJson = &tree.GeoJson{Type: "Point", Coordinates: []float64{lon, lat}}
		}
	}
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

func (b *Batch) createBackgroundContext(parent context.Context) context.Context {
	ctx := auth.ContextFromClaims(context.Background(), claim.Claims{
		Name:      common.PydioSystemUsername,
		Profile:   common.PydioProfileAdmin,
		GroupPath: "/",
	})
	ctx = servicecontext.WithServiceName(ctx, common.ServiceGrpcNamespace_+common.ServiceSearch)
	ctx = servicecontext.WithRegistry(ctx, servicecontext.GetRegistry(parent))
	ctx = servercontext.WithRegistry(ctx, servercontext.GetRegistry(parent))
	ctx = clientcontext.WithClientConn(ctx, clientcontext.GetClientConn(parent))
	ctx = nodescontext.WithSourcesPool(ctx, nodescontext.GetSourcesPool(parent))
	return ctx
}

func (b *Batch) getUuidRouter() nodes.Handler {
	if b.uuidRouter == nil {
		b.uuidRouter = compose.NewClient(compose.UuidComposer(nodes.AsAdmin(), nodes.WithContext(b.ctx), nodes.WithRegistryWatch(servicecontext.GetRegistry(b.ctx)))...)
	}
	return b.uuidRouter
}

func (b *Batch) getStdRouter() nodes.Handler {
	if b.stdRouter == nil {
		b.stdRouter = compose.NewClient(compose.PathComposer(nodes.AsAdmin(), nodes.WithContext(b.ctx), nodes.WithRegistryWatch(servicecontext.GetRegistry(b.ctx)))...)
	}
	return b.stdRouter
}
