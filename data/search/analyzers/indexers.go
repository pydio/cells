package analyzers

import (
	"context"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/configx"
)

func init() {
	RegisterAnalyzer(IndexGeoPoint)
	RegisterAnalyzer(IndexContent)
	RegisterAnalyzer(IndexPages)
}

type MetaAnalyzer func(ctx context.Context, node *tree.IndexableNode, engineConfigs configx.Values) error

var analyzers []MetaAnalyzer

func RegisterAnalyzer(m MetaAnalyzer) {
	analyzers = append(analyzers, m)
}

func Parse(ctx context.Context, node *tree.IndexableNode, engineConfigs configx.Values) error {
	for _, analyzer := range analyzers {
		if err := analyzer(ctx, node, engineConfigs); err != nil {
			return err
		}
	}
	return nil
}
