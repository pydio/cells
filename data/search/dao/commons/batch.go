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

package commons

import (
	"compress/gzip"
	"context"
	"errors"
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
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
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

func NewBatch(ctx context.Context, idx indexer.Indexer, nsProvider *meta.NsProvider, options BatchOptions) indexer.Batch {
	wrapper := &Batch{
		options:    options,
		inserts:    make(map[string]*tree.IndexableNode),
		deletes:    make(map[string]struct{}),
		nsProvider: nsProvider,
	}

	wrapper.ctx = wrapper.createBackgroundContext(ctx)

	batch, _ := idx.NewBatch(ctx)

	return indexer.NewBatch(ctx,
		indexer.WithFlushCondition(func() bool {
			return len(wrapper.inserts)+len(wrapper.deletes) > BatchSize
		}),
		indexer.WithInsertCallback(func(msg any) error {
			i, ok := msg.(*tree.IndexableNode)
			if !ok {
				return errors.New("wrong message in batch insert")
			}

			wrapper.Lock()
			wrapper.inserts[i.GetUuid()] = i
			delete(wrapper.deletes, i.GetUuid())
			wrapper.Unlock()
			return nil
		}),
		indexer.WithDeleteCallback(func(msg any) error {
			uuid, ok := msg.(string)
			if !ok {
				return errors.New("wrong message in batch delete")
			}

			wrapper.Lock()
			wrapper.deletes[uuid] = struct{}{}
			delete(wrapper.inserts, uuid)
			wrapper.Unlock()
			return nil
		}),
		indexer.WithFlushCallback(func() error {
			wrapper.Lock()
			l := len(wrapper.inserts) + len(wrapper.deletes)
			if l == 0 {
				wrapper.Unlock()
				return nil
			}
			log.Logger(wrapper.ctx).Info("Flushing search batch", zap.Int("size", l))
			excludes := wrapper.nsProvider.ExcludeIndexes()
			var nodes []*tree.IndexableNode
			wrapper.nsProvider.InitStreamers(wrapper.ctx)
			for uuid, node := range wrapper.inserts {
				if e := wrapper.LoadIndexableNode(node, excludes); e == nil {
					nodes = append(nodes, node)
				}
				delete(wrapper.inserts, uuid)
			}
			wrapper.nsProvider.CloseStreamers()
			for _, n := range nodes {
				if er := batch.Insert(n); er != nil {
					fmt.Println("Search batch - InsertOne error", er.Error())
				}
			}
			for uuid := range wrapper.deletes {
				if er := batch.Delete(uuid); er != nil {
					fmt.Println("Search batch - DeleteOne error", er.Error())
				}
				delete(wrapper.deletes, uuid)
			}
			wrapper.Unlock()
			return nil
		}),
	)
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
	if b.options.config != nil && b.options.config.Val("indexContent").Bool() && indexNode.IsLeaf() {
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
	return propagator.ForkContext(ctx, parent)
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
