package bleveimpl

import (
	"context"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/search/query"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
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
	memIndex        bleve.Index
	freeStringCache map[string]query.Query
)

func getQuery(freeString string) (query.Query, error) {
	if freeStringCache == nil {
		freeStringCache = make(map[string]query.Query)
	}
	if q, ok := freeStringCache[freeString]; ok {
		return q, nil
	}
	q := query.NewQueryStringQuery(freeString)
	if qu, e := q.Parse(); e == nil {
		freeStringCache[freeString] = qu
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

	// Node type to keyword
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
