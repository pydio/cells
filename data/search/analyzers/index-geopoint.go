package analyzers

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/configx"
)

func IndexGeoPoint(_ context.Context, node *tree.IndexableNode, _ configx.Values) error {
	_ = node.GetMeta(common.MetaNamespaceGeoLocation, &node.GeoPoint)
	if node.GeoPoint != nil {
		lat, ok1 := node.GeoPoint["lat"].(float64)
		lon, ok2 := node.GeoPoint["lon"].(float64)
		if ok1 && ok2 {
			node.GeoJson = &tree.GeoJson{Type: "Point", Coordinates: []float64{lon, lat}}
		}
	}
	return nil
}
