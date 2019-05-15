/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"bytes"
	"context"
	"errors"
	"io"
	"log"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/minio-go"
)

type MinioClientMock struct {
	objects map[string]minio.ObjectInfo
}

func (c *MinioClientMock) StatObject(bucket string, path string, opts minio.StatObjectOptions) (minio.ObjectInfo, error) {
	obj, ok := c.objects[path]
	if ok {
		return obj, nil
	} else {
		return minio.ObjectInfo{}, errors.New("Path " + path + " does not exists")
	}
}

func (c *MinioClientMock) RemoveObject(bucket string, path string) error {
	return nil
}

func (c *MinioClientMock) PutObject(bucket string, path string, reader io.Reader, size int64, opts minio.PutObjectOptions) (n int64, err error) {
	buf := &bytes.Buffer{}
	nRead, err := io.Copy(buf, reader)
	if err != nil {
		return 0, err
	}
	return nRead, nil
}

func (c *MinioClientMock) GetObject(bucket string, path string, opts minio.GetObjectOptions) (object *minio.Object, err error) {
	object = &minio.Object{}
	return object, errors.New("Object is not mockable, cannot emulate GetObject")
}

func (c *MinioClientMock) ListObjectsV2(bucketName, objectPrefix string, recursive bool, doneCh <-chan struct{}) <-chan minio.ObjectInfo {
	out := make(chan minio.ObjectInfo, 1)
	go func() {
		defer close(out)
		for _, info := range c.objects {
			out <- info
		}
	}()
	return out
}

func (c *MinioClientMock) CopyObject(dest minio.DestinationInfo, source minio.SourceInfo) error {
	return nil
}

func (c *MinioClientMock) ListenBucketNotification(bucketName, prefix, suffix string, events []string, doneCh <-chan struct{}) <-chan minio.NotificationInfo {
	out := make(chan minio.NotificationInfo)
	return out
}

func NewS3Mock() *Client {
	mock := &MinioClientMock{
		objects: make(map[string]minio.ObjectInfo),
	}
	mock.objects["file"] = minio.ObjectInfo{
		Key:  "file",
		ETag: "filemd5",
	}
	mock.objects["folder/"+common.PYDIO_SYNC_HIDDEN_FILE_META] = minio.ObjectInfo{
		Key: "folder/" + common.PYDIO_SYNC_HIDDEN_FILE_META,
	}
	client := &Client{
		Mc:       mock,
		Bucket:   "bucket",
		RootPath: "",
	}
	return client
}

func TestStat(t *testing.T) {
	Convey("Test Stat file", t, func() {
		c := NewS3Mock()
		fileInfo, err := c.Stat("file")
		fakeFileInfo := &S3FileInfo{
			Object: minio.ObjectInfo{
				Key:  "file",
				ETag: "filemd5",
			},
			isDir: false,
		}
		So(err, ShouldBeNil)
		So(fileInfo, ShouldNotBeNil)
		So(fileInfo, ShouldResemble, fakeFileInfo)

	})

	Convey("Test Stat folder", t, func() {
		c := NewS3Mock()
		fileInfo, err := c.Stat("folder")
		fakeFolderInfo := &S3FileInfo{
			Object: minio.ObjectInfo{
				Key: "folder/" + common.PYDIO_SYNC_HIDDEN_FILE_META,
			},
			isDir: true,
		}
		So(err, ShouldBeNil)
		So(fileInfo, ShouldNotBeNil)
		So(fileInfo, ShouldResemble, fakeFolderInfo)

	})

	Convey("Test Stat unknown file", t, func() {
		c := NewS3Mock()
		fileInfo, err := c.Stat("file2")
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
		So(node.Etag, ShouldEqual, "filemd5")

	})

}

func TestWalkS3(t *testing.T) {

	Convey("Test walking the tree", t, func() {

		c := NewS3Mock()
		objects := make(map[string]*tree.Node)
		walk := func(path string, node *tree.Node, err error) {
			log.Println("Walk " + path)
			objects[path] = node
		}
		wg := sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Walk(walk, "/")
		}()
		wg.Wait()

		log.Println(objects)
		// Will include the root
		So(objects, ShouldHaveLength, 3)
		So(objects["folder"].Uuid, ShouldNotBeEmpty)
		So(objects["folder"].Etag, ShouldBeEmpty)
		So(objects["folder"].Type, ShouldEqual, tree.NodeType_COLLECTION)

		So(objects["file"].Uuid, ShouldBeEmpty)
		So(objects["file"].Etag, ShouldNotBeEmpty)
		So(objects["file"].Type, ShouldEqual, tree.NodeType_LEAF)
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
		w, _, _, err := c.GetWriterOn("/file", 0)
		So(err, ShouldBeNil)
		defer w.Close()
		So(w, ShouldNotBeNil)

	})

}

func TestGetReaderOnS3(t *testing.T) {

	Convey("Test Get Reader on node", t, func() {

		c := NewS3Mock()
		o, e := c.GetReaderOn("/file")
		So(o, ShouldNotBeNil)
		// We know that there will be an error as Object is not mocked, yet
		So(e, ShouldNotBeNil)

	})

}
