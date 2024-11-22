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
	"log"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
)

func TestStat(t *testing.T) {
	Convey("Test Stat file", t, func() {
		c := NewS3Mock()
		fileInfo, err := c.Stat(context.Background(), "file")
		So(err, ShouldBeNil)
		So(fileInfo, ShouldNotBeNil)
		So(fileInfo.IsDir(), ShouldBeFalse)
		sy := fileInfo.Sys().(models.ObjectInfo)
		So(sy.ETag, ShouldEqual, "filemd5")
	})

	Convey("Test Stat folder", t, func() {
		c := NewS3Mock()
		fileInfo, err := c.Stat(context.Background(), "folder")
		So(err, ShouldBeNil)
		So(fileInfo, ShouldNotBeNil)
		So(fileInfo.IsDir(), ShouldBeTrue)

	})

	Convey("Test Stat unknown file", t, func() {
		c := NewS3Mock()
		fileInfo, err := c.Stat(context.Background(), "file2")
		So(err, ShouldNotBeNil)
		So(fileInfo, ShouldBeNil)
	})
}

func TestLoadNodeS3(t *testing.T) {

	Convey("Load existing node", t, func() {

		c := NewS3Mock()
		node, err := c.LoadNode(context.Background(), "file", true)
		So(err, ShouldBeNil)
		So(node, ShouldNotBeNil)
		So(node.GetEtag(), ShouldEqual, "filemd5")

	})

}

func TestWalkS3(t *testing.T) {

	Convey("Test walking the tree", t, func() {

		c := NewS3Mock()
		objects := make(map[string]tree.N)
		walk := func(path string, node tree.N, err error) error {
			log.Println("Walk " + path)
			objects[path] = node
			return nil
		}
		wg := sync.WaitGroup{}
		wg.Add(1)
		var we error
		go func() {
			defer wg.Done()
			we = c.Walk(context.Background(), walk, "/", true)
		}()
		wg.Wait()

		log.Println(objects)
		So(we, ShouldBeNil)
		// Will include the root
		So(objects, ShouldHaveLength, 3)
		So(objects["folder"].GetUuid(), ShouldNotBeEmpty)
		So(objects["folder"].GetEtag(), ShouldBeEmpty)
		So(objects["folder"].GetType(), ShouldEqual, tree.NodeType_COLLECTION)

		So(objects["file"].GetUuid(), ShouldBeEmpty)
		So(objects["file"].GetEtag(), ShouldNotBeEmpty)
		So(objects["file"].GetType(), ShouldEqual, tree.NodeType_LEAF)
	})
}

func TestDeleteNodeS3(t *testing.T) {

	Convey("Test Delete Node", t, func() {

		c := NewS3Mock()
		err := c.DeleteNode(context.Background(), "file")
		So(err, ShouldBeNil)

	})

}

func TestMoveNodeS3(t *testing.T) {

	Convey("Test Move Node", t, func() {

		c := NewS3Mock()
		err := c.MoveNode(context.Background(), "/file", "/file1")
		So(err, ShouldBeNil)

	})

}

func TestGetWriterOnS3(t *testing.T) {

	Convey("Test Get Writer on node", t, func() {

		c := NewS3Mock()
		w, _, _, err := c.GetWriterOn(context.Background(), "/file", 0)
		So(err, ShouldBeNil)
		defer w.Close()
		So(w, ShouldNotBeNil)

	})

}

func TestGetReaderOnS3(t *testing.T) {

	Convey("Test Get Reader on node", t, func() {

		c := NewS3Mock()
		o, e := c.GetReaderOn(context.Background(), "/file")
		So(o, ShouldNotBeNil)
		So(e, ShouldBeNil)

	})

}
