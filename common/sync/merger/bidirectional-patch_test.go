package merger

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/memory"
)

func TestMergeWithConflicts(t *testing.T) {
	ctx := context.Background()
	Convey("Test basic ignores", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		left := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		right := newTreePatch(source, target, PatchOptions{MoveDetection: false})

		left.Enqueue(&patchOperation{opType: OpCreateFolder, node: &tree.Node{Path: "/newdir"}})
		left.Enqueue(&patchOperation{opType: OpCreateFolder, node: &tree.Node{Path: "/newdir/a"}})
		left.Enqueue(&patchOperation{opType: OpDelete, node: &tree.Node{Path: "/op-none/deleted"}})

		right.Enqueue(&patchOperation{opType: OpCreateFolder, node: &tree.Node{Path: "/newdir"}})
		right.Enqueue(&patchOperation{opType: OpCreateFolder, node: &tree.Node{Path: "/newdir/a"}})
		right.Enqueue(&patchOperation{opType: OpDelete, node: &tree.Node{Path: "/op-none/deleted"}})

		bi, e := ComputeBidirectionalPatch(ctx, left, right)
		So(e, ShouldBeNil)
		So(bi.Size(), ShouldEqual, 0)
	})

	Convey("Test diverging moves", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		old := time.Now()
		recent := old.Add(2 * time.Second)
		source.CreateNode(ctx, &tree.Node{Path: "/moved-folder-same"}, true)
		source.CreateNode(ctx, &tree.Node{Path: "/diverging-folder-A", MTime: recent.Unix()}, true)
		source.CreateNode(ctx, &tree.Node{Path: "/toto/diverging-file-A", MTime: old.Unix()}, true)
		target.CreateNode(ctx, &tree.Node{Path: "/moved-folder-same"}, true)
		target.CreateNode(ctx, &tree.Node{Path: "/diverging-folder-B", MTime: old.Unix()}, true)
		target.CreateNode(ctx, &tree.Node{Path: "/toto2/other-location/diverging-file-B", MTime: recent.Unix()}, true)

		left := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		right := newTreePatch(source, target, PatchOptions{MoveDetection: false})

		left.Enqueue(&patchOperation{opType: OpMoveFolder, node: &tree.Node{Path: "/source-folder"}, eventInfo: model.EventInfo{Path: "/moved-folder-same"}})
		right.Enqueue(&patchOperation{opType: OpMoveFolder, node: &tree.Node{Path: "/source-folder"}, eventInfo: model.EventInfo{Path: "/moved-folder-same"}})

		left.Enqueue(&patchOperation{opType: OpMoveFolder, node: &tree.Node{Path: "/diverging-folder"}, eventInfo: model.EventInfo{Path: "/diverging-folder-A"}})
		right.Enqueue(&patchOperation{opType: OpMoveFolder, node: &tree.Node{Path: "/diverging-folder"}, eventInfo: model.EventInfo{Path: "/diverging-folder-B"}})

		left.Enqueue(&patchOperation{opType: OpMoveFile, node: &tree.Node{Path: "/diverging-file"}, eventInfo: model.EventInfo{Path: "/toto/diverging-file-A"}})
		right.Enqueue(&patchOperation{opType: OpMoveFile, node: &tree.Node{Path: "/diverging-file"}, eventInfo: model.EventInfo{Path: "/toto2/other-location/diverging-file-B"}})

		bi, e := ComputeBidirectionalPatch(ctx, left, right)

		So(e, ShouldBeNil)
		So(bi.Size(), ShouldEqual, 2)

	})

}
