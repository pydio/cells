package analyzers

import (
	"context"
	"slices"
	"strings"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/configx"
)

var excludedBlocks = []string{
	"header",
	"childrenList",
	"nodeRef",
	"nodeBlock",
}

func IndexPages(ctx context.Context, node *tree.IndexableNode, engineConfigs configx.Values) error {
	// Lookup for pages content
	// TODO should be role/global based
	metaName := config.Get(ctx, config.FrontendPluginPath("editor.bnote", "BNOTE_PAGES_META")...).String()
	if metaName == "" {
		return nil
	}
	var metaContent []interface{}
	if node.GetMeta(metaName, &metaContent) == nil && len(metaContent) > 0 {
		var texts []string
		emitText(ctx, metaContent, &texts)
		if len(texts) > 0 {
			//log.Logger(ctx).Info("IndexPages", zap.Any("Found text blocks", texts)) // Do not let in code or just number of blocks
			node.TextContent = strings.Join(texts, "\n")
		}
	}
	return nil
}

func emitText(ctx context.Context, ct any, texts *[]string) {
	switch blocks := ct.(type) {
	case []interface{}:
		for _, block := range blocks {
			emitText(ctx, block, texts)
		}
	case map[string]interface{}:
		if blocks["type"] != nil && slices.Contains(excludedBlocks, blocks["type"].(string)) {
			break
		}
		if blocks["text"] != nil {
			if t, ok1 := blocks["text"].(string); ok1 {
				if final := strings.TrimSpace(t); final != "" {
					*texts = append(*texts, final)
				}
			}
		}
		for _, block := range blocks {
			emitText(ctx, block, texts)
		}
	}
}
