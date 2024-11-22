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

package snapshot

import (
	"context"
	"fmt"
	"os"
	"path"
	"sort"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

func basicDiff(l, r model.PathSyncSource) error {
	left, right := make(map[string]tree.N), make(map[string]tree.N)
	var leftPaths, rightPaths []string
	ctx := context.Background()
	l.Walk(ctx, func(path string, node tree.N, err error) error {
		left[path] = node
		leftPaths = append(leftPaths, path)
		return nil
	}, "/", true)
	r.Walk(ctx, func(path string, node tree.N, err error) error {
		right[path] = node
		rightPaths = append(rightPaths, path)
		return nil
	}, "/", true)
	if len(right) != len(left) {
		return fmt.Errorf("lengths differ")
	}
	sort.Strings(leftPaths)
	for i, p := range leftPaths {
		node := left[p]
		mirror := right[p]
		if mirror.GetPath() != node.GetPath() || mirror.GetType() != node.GetType() {
			return fmt.Errorf("nodes differ for %s", node.GetPath())
		}
		if leftPaths[i] != rightPaths[i] {
			return fmt.Errorf("paths differ for %s", leftPaths[i])
		}
	}
	return nil
}

func TestSnapshot(t *testing.T) {

	source := memory.NewMemDB()
	ctx := context.Background()
	nn := []tree.N{
		&tree.Node{Path: "a", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "a/a1", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "a/a1/a11", Type: tree.NodeType_LEAF},
		&tree.Node{Path: "a/a1/a12", Type: tree.NodeType_LEAF},
		&tree.Node{Path: "b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf", Type: tree.NodeType_LEAF},
		&tree.Node{Path: "c", Type: tree.NodeType_COLLECTION},
		&tree.Node{Path: "d", Type: tree.NodeType_COLLECTION},
	}
	for _, n := range nn {
		_ = source.CreateNode(ctx, n, false)
	}
	var sorted []string
	for i := 0; i < 1000; i++ {
		sorted = append(sorted, fmt.Sprintf("d/sub-%d", i))
	}
	sort.Strings(sorted)
	for _, p := range sorted {
		_ = source.CreateNode(ctx, &tree.Node{Path: p, Type: tree.NodeType_LEAF}, false)
		//source.Nodes = append(source.Nodes, &tree.Node{Path: p, Type: tree.NodeType_LEAF})
	}

	Convey("CaptureSnapshotFlat", t, func() {
		taken := time.Now()
		testId := uuid.New()
		folderPath := path.Join(os.TempDir(), "test-snap-tree-"+testId)
		_ = os.MkdirAll(folderPath, 0755)
		snapshot, e := NewBoltSnapshot(folderPath, "snapshot")
		So(e, ShouldBeNil)
		defer func() {
			snapshot.Close(true)
		}()
		e = snapshot.Capture(ctx, source)
		So(e, ShouldBeNil)
		fmt.Println("Flat Capture took", time.Now().Sub(taken))
		taken = time.Now()

		n, e := snapshot.LoadNode(ctx, "a/a1/a12")
		So(e, ShouldBeNil)
		So(n.GetPath(), ShouldEqual, "a/a1/a12")
		fmt.Println("Flat Load took", time.Now().Sub(taken))
		taken = time.Now()

		n, e = snapshot.LoadNode(ctx, "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		So(e, ShouldBeNil)
		So(n.GetPath(), ShouldEqual, "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		fmt.Println("Tree Load took", time.Now().Sub(taken))
		taken = time.Now()

		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)
		fmt.Println("Flat Walk took", time.Now().Sub(taken))
		taken = time.Now()

		So(source.CreateNode(ctx, &tree.Node{Path: "c/new", Type: tree.NodeType_LEAF}, true), ShouldBeNil)
		So(snapshot.CreateNode(ctx, &tree.Node{Path: "c/new", Type: tree.NodeType_LEAF}, true), ShouldBeNil)
		e = std.Retry(context.Background(), func() error {
			return basicDiff(source, snapshot)
		}, 200*time.Millisecond, 5*time.Second)
		So(e, ShouldBeNil)

		So(source.DeleteNode(ctx, "a/a1"), ShouldBeNil)
		So(snapshot.DeleteNode(ctx, "a/a1"), ShouldBeNil)
		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)
		t, e0 := snapshot.LoadNode(ctx, "a/a1")
		So(t, ShouldBeNil)
		So(e0, ShouldNotBeNil)
		So(errors.Is(e0, errors.StatusNotFound), ShouldBeTrue)

		So(snapshot.MoveNode(ctx, "b", "b-renamed"), ShouldBeNil)
		test, e := snapshot.LoadNode(ctx, "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		So(e, ShouldNotBeNil)
		So(test, ShouldBeNil)
		test2, e2 := snapshot.LoadNode(ctx, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		So(e2, ShouldBeNil)
		So(test2, ShouldNotBeNil)
		So(test2.GetPath(), ShouldEqual, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")

		So(source.MoveNode(ctx, "b", "b-renamed"), ShouldBeNil)
		So(source.DeleteNode(ctx, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf"), ShouldBeNil)
		So(snapshot.DeleteNode(ctx, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf"), ShouldBeNil)
		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)

		So(snapshot.MoveNode(ctx, "d/sub-10", "d/sub-toto"), ShouldBeNil)
		_, er := snapshot.LoadNode(ctx, "d/sub-10")
		So(er, ShouldNotBeNil)
		_, er = snapshot.LoadNode(ctx, "d/sub-toto")
		So(er, ShouldBeNil)

		So(snapshot.CreateNode(ctx, &tree.Node{Path: "noparent/file"}, true), ShouldBeNil)
		er = std.Retry(context.Background(), func() error {
			_, er1 := snapshot.LoadNode(ctx, "noparent")
			return er1
		}, 200*time.Millisecond, 5*time.Second)
		So(er, ShouldBeNil)
	})

}
