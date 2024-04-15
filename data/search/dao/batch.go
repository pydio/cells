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
	"io"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	runtimecontext "github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/configx"
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
	config configx.Values
	//IndexContent bool
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

func (b *Batch) Flush(indexer indexer.Indexer) error {
	b.Lock()
	l := len(b.inserts) + len(b.deletes)
	if l == 0 {
		b.Unlock()
		return nil
	}
	log.Logger(b.ctx).Info("Flushing search batch", zap.Int("size", l))
	excludes := b.nsProvider.ExcludeIndexes()
	var nodes []*tree.IndexableNode
	b.nsProvider.InitStreamers(b.ctx)
	for uuid, node := range b.inserts {
		if e := b.LoadIndexableNode(node, excludes); e == nil {
			nodes = append(nodes, node)
		}
		delete(b.inserts, uuid)
	}
	b.nsProvider.CloseStreamers()
	for _, n := range nodes {
		if er := indexer.InsertOne(n); er != nil {
			fmt.Println("Search batch - InsertOne error", er.Error())
		}
	}
	for uuid := range b.deletes {
		if er := indexer.DeleteOne(uuid); er != nil {
			fmt.Println("Search batch - DeleteOne error", er.Error())
		}
		delete(b.deletes, uuid)
	}
	b.Unlock()
	return indexer.Flush()
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

	// Index Contents?
	if b.options.config.Val("indexContent").Bool() && indexNode.IsLeaf() {
		cRef := b.options.config.Val("contentRef").Default("pydio:ContentRef").String()
		exts := strings.Split(strings.TrimSpace(b.options.config.Val("plainTextExtensions").String()), ",")
		legacyContentRef := "ContentRef"
		ref := indexNode.GetStringMeta(legacyContentRef)
		if pr := indexNode.GetStringMeta(cRef); pr != "" {
			ref = pr
		}
		if ref != "" {
			delete(indexNode.Meta, legacyContentRef)
			delete(indexNode.Meta, cRef)
			if reader, e := b.getStdRouter().GetObject(b.ctx, &tree.Node{Path: ref}, &models.GetRequestData{Length: -1}); e == nil {
				if strings.HasSuffix(ref, ".gz") {
					// Content is gzip-compressed
					if gR, e := gzip.NewReader(reader); e == nil {
						if contents, e := io.ReadAll(gR); e == nil {
							indexNode.TextContent = string(contents)
						}
						_ = gR.Close()
					}
				} else if contents, e := io.ReadAll(reader); e == nil {
					indexNode.TextContent = string(contents)
				}
				_ = reader.Close()
			}
		} else if slices.ContainsFunc(exts, func(s string) bool {
			return strings.ToLower(strings.TrimSpace(s)) == indexNode.Extension
		}) {
			if reader, e := b.getStdRouter().GetObject(b.ctx, &tree.Node{Path: indexNode.GetPath()}, &models.GetRequestData{Length: -1}); e == nil {
				if contents, er := io.ReadAll(reader); er == nil {
					indexNode.TextContent = string(contents)
				}
				_ = reader.Close()
			}
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
	return runtimecontext.ForkContext(ctx, parent)
}

func (b *Batch) getUuidRouter() nodes.Handler {
	if b.uuidRouter == nil {
		b.uuidRouter = compose.UuidClient(b.ctx, nodes.AsAdmin())
	}
	return b.uuidRouter
}

func (b *Batch) getStdRouter() nodes.Handler {
	if b.stdRouter == nil {
		b.stdRouter = compose.PathClientAdmin(b.ctx)
	}
	return b.stdRouter
}
