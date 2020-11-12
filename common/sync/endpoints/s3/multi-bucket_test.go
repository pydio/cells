package s3

import (
	"context"
	"path"
	"testing"

	"github.com/pydio/cells/common"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
	. "github.com/smartystreets/goconvey/convey"
)

func TestMultiBucketClient_Walk(t *testing.T) {
	Convey("test simple walk", t, func() {
		cl, e := NewMultiBucketClient(context.Background(), "s3.amazonaws.com", "***************", "***************", true, model.EndpointOptions{BrowseOnly: true}, "^cell")
		So(e, ShouldBeNil)
		mainMock := NewS3Mock()
		cl.mainClient = mainMock
		cl.bucketClients = map[string]*Client{
			"cell1": NewS3Mock("cell1"),
			"cell2": NewS3Mock("cell2"),
			"cell3": NewS3Mock("cell3"),
		}

		var data []*tree.Node
		cl.Walk(func(path string, node *tree.Node, err error) {
			data = append(data, node)
		}, "", false)
		So(data, ShouldHaveLength, 3)

		// Try LoadNode on first bucket
		b, e := cl.LoadNode(context.Background(), data[0].Path)
		So(e, ShouldBeNil)
		So(b.Path, ShouldEqual, data[0].Path)
		So(b.Type, ShouldEqual, tree.NodeType_COLLECTION)
		//t.Log("FIRST BUCKET", b)

		var fullData []*tree.Node
		cl.Walk(func(path string, node *tree.Node, err error) {
			fullData = append(fullData, node)
		}, "", true)
		So(data, ShouldNotBeEmpty)
		t.Log("Number of buckets and objects", len(fullData))
		var first *tree.Node
		for _, d := range fullData {
			//t.Log(d.Path, "\t\t", d.Type)
			if d.IsLeaf() && first == nil && path.Base(d.Path) != common.PydioSyncHiddenFile {
				first = d
			}
		}
		if first != nil {
			loaded, e := cl.LoadNode(context.Background(), first.Path, true)
			So(e, ShouldBeNil)
			So(loaded.Path, ShouldEqual, first.Path)
		}

	})
}

func TestBucketMetadata(t *testing.T) {
	Convey("Test buckets tags", t, func() {
		options := model.EndpointOptions{
			BrowseOnly: true,
			Properties: map[string]string{"bucketsTags": "Tag*"},
		}
		cl, e := NewMultiBucketClient(context.Background(), "s3.amazonaws.com", "***************", "***************", true, options, "^cell")
		So(e, ShouldBeNil)
		mainMock := NewS3Mock()
		cl.mainClient = mainMock
		cl.bucketClients = map[string]*Client{
			"cell1": NewS3Mock("cell1"),
			"cell2": NewS3Mock("cell2"),
			"cell3": NewS3Mock("cell3"),
		}

		var data []*tree.Node
		cl.Walk(func(path string, node *tree.Node, err error) {
			if !node.IsLeaf() {
				data = append(data, node)
			}
		}, "", false)
		So(data, ShouldHaveLength, 3)
		So(data[0].MetaStore, ShouldNotBeNil)
		So(data[0].GetStringMeta(s3BucketTagPrefix+"TagName"), ShouldEqual, "TagValue")
		So(data[0].GetStringMeta(s3BucketTagPrefix+"OtherTagName"), ShouldBeEmpty)

	})
}
