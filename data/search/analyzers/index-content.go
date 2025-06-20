package analyzers

import (
	"compress/gzip"
	"context"
	"io"
	"slices"
	"strings"

	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/configx"
)

var (
	router nodes.Handler
)

func getStdRouter() nodes.Handler {
	if router == nil {
		router = compose.PathClientAdmin()
	}
	return router
}

func IndexContent(ctx context.Context, indexNode *tree.IndexableNode, engineConfigs configx.Values) error {

	if engineConfigs == nil || !engineConfigs.Val("indexContent").Bool() || !indexNode.IsLeaf() {
		return nil
	}

	cRef := engineConfigs.Val("contentRef").Default("pydio:ContentRef").String()
	exts := strings.Split(strings.TrimSpace(engineConfigs.Val("plainTextExtensions").String()), ",")
	legacyContentRef := "ContentRef"
	ref := indexNode.GetStringMeta(legacyContentRef)
	if pr := indexNode.GetStringMeta(cRef); pr != "" {
		ref = pr
	}
	if ref != "" {
		delete(indexNode.Meta, legacyContentRef)
		delete(indexNode.Meta, cRef)
		if reader, e := getStdRouter().GetObject(ctx, &tree.Node{Path: ref}, &models.GetRequestData{Length: -1}); e == nil {
			if strings.HasSuffix(ref, ".gz") {
				// Content is gzip-compressed
				if gR, er := gzip.NewReader(reader); er == nil {
					if contents, err := io.ReadAll(gR); err == nil {
						indexNode.TextContent = string(contents)
					}
					_ = gR.Close()
				}
			} else if contents, er := io.ReadAll(reader); er == nil {
				indexNode.TextContent = string(contents)
			}
			_ = reader.Close()
		}
		return nil
	}

	if slices.ContainsFunc(exts, func(s string) bool {
		return strings.ToLower(strings.TrimSpace(s)) == indexNode.Extension
	}) {
		if reader, e := getStdRouter().GetObject(ctx, &tree.Node{Path: indexNode.GetPath()}, &models.GetRequestData{Length: -1}); e == nil {
			if contents, er := io.ReadAll(reader); er == nil {
				indexNode.TextContent = string(contents)
			}
			_ = reader.Close()
		}
	}

	return nil
}
