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

package bleveimpl

import (
	"context"
	"sync"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/search/query"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func EvalFreeString(ctx context.Context, query string, node *tree.Node) bool {

	if qu, e := getQuery(query); e == nil {
		b := getMemIndex()
		iNode := tree.NewMemIndexableNode(node)
		if e := b.Index(node.Uuid, iNode); e == nil {
			log.Logger(ctx).Debug("Indexed node, now performing request", zap.Any("node", iNode), zap.Any("q", qu))
			defer b.Delete(node.Uuid)
		} else {
			log.Logger(ctx).Error("Cannot index node", zap.Any("node", iNode), zap.Error(e))
			return false
		}
		req := bleve.NewSearchRequest(qu)
		req.Size = 1
		if r, e := b.Search(req); e == nil {
			log.Logger(ctx).Debug("In-memory bleve filter received result", zap.Any("r.Total", r.Total))
			return r.Total > 0
		} else {
			log.Logger(ctx).Error("Cannot search on in-memory bleve index - Discarding event node", zap.Error(e))
			return false
		}
	} else {
		log.Logger(ctx).Error("Cannot parse FreeString query (bleve-style) - Discarding event node", zap.Error(e))
		return false
	}

}

var (
	memIndex bleve.Index
	fsCache  map[string]query.Query
	fsLock   sync.Mutex
)

func getQuery(freeString string) (query.Query, error) {
	fsLock.Lock()
	defer fsLock.Unlock()

	if fsCache == nil {
		fsCache = make(map[string]query.Query)
	}
	if q, ok := fsCache[freeString]; ok {
		return q, nil
	}
	q := query.NewQueryStringQuery(freeString)
	if qu, e := q.Parse(); e == nil {
		fsCache[freeString] = qu
		return qu, nil
	} else {
		return nil, e
	}
}

func getMemIndex() bleve.Index {
	if memIndex != nil {
		return memIndex
	}
	mapping := bleve.NewIndexMapping()
	nodeMapping := bleve.NewDocumentMapping()
	mapping.AddDocumentMapping("node", nodeMapping)

	// Path to keyword
	pathFieldMapping := bleve.NewTextFieldMapping()
	pathFieldMapping.Analyzer = "keyword"
	nodeMapping.AddFieldMappingsAt("Path", pathFieldMapping)

	// N type to keyword
	nodeType := bleve.NewTextFieldMapping()
	nodeType.Analyzer = "keyword"
	nodeMapping.AddFieldMappingsAt("NodeType", nodeType)

	// Extension to keyword
	extType := bleve.NewTextFieldMapping()
	extType.Analyzer = "keyword"
	nodeMapping.AddFieldMappingsAt("Extension", extType)

	// Modification Time as Date
	modifTime := bleve.NewDateTimeFieldMapping()
	nodeMapping.AddFieldMappingsAt("ModifTime", modifTime)

	// GeoPoint
	geoPosition := bleve.NewGeoPointFieldMapping()
	nodeMapping.AddFieldMappingsAt("GeoPoint", geoPosition)

	// Text Content
	textContent := bleve.NewTextFieldMapping()
	textContent.Analyzer = "en" // See detect_lang in the blevesearch/blevex package?
	textContent.Store = false
	textContent.IncludeInAll = false
	nodeMapping.AddFieldMappingsAt("TextContent", textContent)

	memIndex, _ = bleve.NewMemOnly(mapping)
	return memIndex
}
