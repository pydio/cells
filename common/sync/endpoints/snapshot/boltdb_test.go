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

	"github.com/pydio/cells/common/sync/endpoints/memory"

	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

func basicDiff(l, r model.PathSyncSource) error {
	left, right := make(map[string]*tree.Node), make(map[string]*tree.Node)
	var leftPaths, rightPaths []string
	l.Walk(func(path string, node *tree.Node, err error) {
		left[path] = node
		leftPaths = append(leftPaths, path)
	}, "/", true)
	r.Walk(func(path string, node *tree.Node, err error) {
		right[path] = node
		rightPaths = append(rightPaths, path)
	}, "/", true)
	if len(right) != len(left) {
		return fmt.Errorf("lengths differ")
	}
	sort.Strings(leftPaths)
	for i, p := range leftPaths {
		node := left[p]
		mirror := right[p]
		if mirror.Path != node.Path || mirror.Type != node.Type {
			return fmt.Errorf("nodes differ for %s", node.Path)
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
	source.Nodes = []*tree.Node{
		{Path: "a", Type: tree.NodeType_COLLECTION},
		{Path: "a/a1", Type: tree.NodeType_COLLECTION},
		{Path: "a/a1/a11", Type: tree.NodeType_LEAF},
		{Path: "a/a1/a12", Type: tree.NodeType_LEAF},
		{Path: "b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b/b/b/b/b/b", Type: tree.NodeType_COLLECTION},
		{Path: "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf", Type: tree.NodeType_LEAF},
		{Path: "c", Type: tree.NodeType_COLLECTION},
		{Path: "d", Type: tree.NodeType_COLLECTION},
	}
	var sorted []string
	for i := 0; i < 1000; i++ {
		sorted = append(sorted, fmt.Sprintf("d/sub-%d", i))
	}
	sort.Strings(sorted)
	for _, p := range sorted {
		source.Nodes = append(source.Nodes, &tree.Node{Path: p, Type: tree.NodeType_LEAF})
	}

	Convey("CaptureSnapshotFlat", t, func() {
		taken := time.Now()
		testId := uuid.New()
		folderPath := path.Join(os.TempDir(), "test-snap-tree-"+testId)
		os.MkdirAll(folderPath, 0755)
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
		So(n.Path, ShouldEqual, "a/a1/a12")
		fmt.Println("Flat Load took", time.Now().Sub(taken))
		taken = time.Now()

		n, e = snapshot.LoadNode(ctx, "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		So(e, ShouldBeNil)
		So(n.Path, ShouldEqual, "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		fmt.Println("Tree Load took", time.Now().Sub(taken))
		taken = time.Now()

		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)
		fmt.Println("Flat Walk took", time.Now().Sub(taken))
		taken = time.Now()

		source.CreateNode(ctx, &tree.Node{Path: "c/new", Type: tree.NodeType_LEAF}, true)
		snapshot.CreateNode(ctx, &tree.Node{Path: "c/new", Type: tree.NodeType_LEAF}, true)
		<-time.After(500 * time.Millisecond)
		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)

		source.DeleteNode(ctx, "a/a1")
		snapshot.DeleteNode(ctx, "a/a1")
		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)
		t, e0 := snapshot.LoadNode(ctx, "a/a1")
		So(t, ShouldBeNil)
		So(e0, ShouldNotBeNil)
		So(errors.Parse(e0.Error()).Code, ShouldEqual, 404)

		snapshot.MoveNode(ctx, "b", "b-renamed")
		test, e := snapshot.LoadNode(ctx, "b/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		So(e, ShouldNotBeNil)
		So(test, ShouldBeNil)
		test2, e2 := snapshot.LoadNode(ctx, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		So(e2, ShouldBeNil)
		So(test2, ShouldNotBeNil)
		So(test2.Path, ShouldEqual, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")

		source.MoveNode(ctx, "b", "b-renamed")
		source.DeleteNode(ctx, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		snapshot.DeleteNode(ctx, "b-renamed/b/b/b/b/b/b/b/b/b/b/b/b/b/leaf")
		e = basicDiff(source, snapshot)
		So(e, ShouldBeNil)

		snapshot.MoveNode(ctx, "d/sub-10", "d/sub-toto")
		_, er := snapshot.LoadNode(ctx, "d/sub-10")
		So(er, ShouldNotBeNil)
		_, er = snapshot.LoadNode(ctx, "d/sub-toto")
		So(er, ShouldBeNil)

		snapshot.CreateNode(ctx, &tree.Node{Path: "noparent/file"}, true)
		<-time.After(500 * time.Millisecond)
		_, er = snapshot.LoadNode(ctx, "noparent")
		So(er, ShouldBeNil)
	})

}
