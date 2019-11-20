// +build ignore

package s3

import (
	"context"
	"testing"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
	. "github.com/smartystreets/goconvey/convey"
)

// TestMultiBucketClient_Walk is used to do some testing locally. Will not be run in IT
func TestMultiBucketClient_Walk(t *testing.T) {
	Convey("test simple walk", t, func() {
		cl, e := NewMultiBucketClient(context.Background(), "s3.amazonaws.com", "****", "****", true, model.EndpointOptions{BrowseOnly: true}, "^cellsdo")
		So(e, ShouldBeNil)
		var data []*tree.Node
		cl.Walk(func(path string, node *tree.Node, err error) {
			data = append(data, node)
		}, "", false)
		So(data, ShouldNotBeEmpty)
		t.Log("Number of buckets", len(data))

		// Try LoadNode on first bucket
		b, e := cl.LoadNode(context.Background(), data[0].Path)
		So(e, ShouldBeNil)
		So(b.Path, ShouldEqual, data[0].Path)
		So(b.Type, ShouldEqual, tree.NodeType_COLLECTION)
		t.Log("FIRST BUCKET", b)

		var fullData []*tree.Node
		cl.Walk(func(path string, node *tree.Node, err error) {
			fullData = append(fullData, node)
		}, "", true)
		So(data, ShouldNotBeEmpty)
		t.Log("Number of buckets and objects", len(fullData))
		var first *tree.Node
		for _, d := range fullData {
			t.Log(d.Path, "\t\t", d.Type)
			if d.IsLeaf() && first == nil {
				first = d
			}
		}
		if first != nil {
			loaded, e := cl.LoadNode(context.Background(), first.Path, true)
			So(e, ShouldBeNil)
			So(loaded.Path, ShouldEqual, first.Path)
			t.Log("FIRST FILE", loaded)
		}

	})
}
