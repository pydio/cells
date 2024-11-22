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

package s3

import (
	"context"
	"path"
	"testing"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMultiBucketClient_Walk(t *testing.T) {
	Convey("test simple walk", t, func() {
		ocMock := mock.New()
		ctx := context.Background()
		cl, e := NewMultiBucketClient(ctx, ocMock, "az", "^cell", model.EndpointOptions{BrowseOnly: true})
		So(e, ShouldBeNil)
		mainMock := NewS3Mock()
		cl.mainClient = mainMock
		cl.bucketClients = map[string]*Client{
			"cell1": NewS3Mock("cell1"),
			"cell2": NewS3Mock("cell2"),
			"cell3": NewS3Mock("cell3"),
		}

		var data []tree.N
		cl.Walk(ctx, func(path string, node tree.N, err error) error {
			data = append(data, node)
			return nil
		}, "", false)
		So(data, ShouldHaveLength, 3)

		// Try LoadNode on first bucket
		b, e := cl.LoadNode(context.Background(), data[0].GetPath())
		So(e, ShouldBeNil)
		So(b.GetPath(), ShouldEqual, data[0].GetPath())
		So(b.GetType(), ShouldEqual, tree.NodeType_COLLECTION)
		//t.Log("FIRST BUCKET", b)

		var fullData []tree.N
		cl.Walk(ctx, func(path string, node tree.N, err error) error {
			fullData = append(fullData, node)
			return nil
		}, "", true)
		So(data, ShouldNotBeEmpty)
		t.Log("Number of buckets and objects", len(fullData))
		var first tree.N
		for _, d := range fullData {
			//t.Log(d.Path, "\t\t", d.Type)
			if d.IsLeaf() && first == nil && path.Base(d.GetPath()) != common.PydioSyncHiddenFile {
				first = d
			}
		}
		if first != nil {
			loaded, e := cl.LoadNode(context.Background(), first.GetPath(), true)
			So(e, ShouldBeNil)
			So(loaded.GetPath(), ShouldEqual, first.GetPath())
		}

	})
}

func TestBucketMetadata(t *testing.T) {
	Convey("Test buckets tags", t, func() {
		options := model.EndpointOptions{
			BrowseOnly: true,
			Properties: map[string]string{"bucketsTags": "Tag*"},
		}
		ocMock := mock.New()
		ocMock.FakeTags = map[string]map[string]string{
			"cell1": map[string]string{
				"TagName":      "TagValue",
				"OtherTagName": "OtherTagValue",
			},
		}
		ctx := context.Background()
		cl, e := NewMultiBucketClient(ctx, ocMock, "az", "^cell", options)
		So(e, ShouldBeNil)
		mainMock := NewS3Mock()
		cl.mainClient = mainMock
		cl.bucketClients = map[string]*Client{
			"cell1": NewS3Mock("cell1"),
			"cell2": NewS3Mock("cell2"),
			"cell3": NewS3Mock("cell3"),
		}

		var data []tree.N
		cl.Walk(ctx, func(path string, node tree.N, err error) error {
			if !node.IsLeaf() {
				data = append(data, node)
			}
			return nil
		}, "", false)
		So(data, ShouldHaveLength, 3)
		for _, d := range data {
			if d.GetPath() == "cell1" {
				dp := proto.Clone(d).(tree.N)
				So(dp.GetMetaStore(), ShouldNotBeNil)
				So(dp.GetStringMeta(s3BucketTagPrefix+"TagName"), ShouldEqual, "TagValue")
				So(dp.GetStringMeta(s3BucketTagPrefix+"OtherTagName"), ShouldBeEmpty)
			}
		}
	})
}
