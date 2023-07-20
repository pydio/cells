package bleveimpl

import (
	"github.com/pydio/cells/v4/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"

	"context"
	"testing"
)

func TestEvalFreeString(t *testing.T) {
	Convey("Test free string", t, func() {
		ctx := context.Background()
		node := &tree.Node{
			Uuid: "uuid",
			MetaStore: map[string]string{
				"key1":         "\"value1\"",
				"x-cells-hash": "\"toto\"",
			},
		}
		node2 := &tree.Node{
			Uuid: "uuid2",
			MetaStore: map[string]string{
				"key1": "\"value1\"",
			},
		}
		So(EvalFreeString(ctx, "+Meta.key1:value1", node), ShouldBeTrue)
		So(EvalFreeString(ctx, "+Meta.key1:value2", node), ShouldBeFalse)
		So(EvalFreeString(ctx, "-Meta.x-cells-hash:*", node), ShouldBeFalse)
		So(EvalFreeString(ctx, "-Meta.x-cells-hash:*", node2), ShouldBeTrue)
	})
}
