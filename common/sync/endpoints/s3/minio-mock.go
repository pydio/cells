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
	"bytes"
	"context"
	"errors"
	"io"
	"time"

	minio "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/notification"
	"github.com/minio/minio-go/v7/pkg/tags"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/sync/model"
)

type MockableMinio interface {
	ListBuckets(ctx context.Context) ([]minio.BucketInfo, error)
	BucketExists(context.Context, string) (bool, error)
	GetBucketTagging(context.Context, string) (*tags.Tags, error)

	StatObject(ctx context.Context, bucket string, path string, opts minio.StatObjectOptions) (minio.ObjectInfo, error)
	GetObject(ctx context.Context, bucket string, path string, opts minio.GetObjectOptions) (object *minio.Object, err error)
	ListObjects(ctx context.Context, bucketName string, opts minio.ListObjectsOptions) <-chan minio.ObjectInfo

	RemoveObject(ctx context.Context, bucketName, objectName string, opts minio.RemoveObjectOptions) error

	PutObject(ctx context.Context, bucket string, path string, reader io.Reader, size int64, opts minio.PutObjectOptions) (ui minio.UploadInfo, err error)
	CopyObject(ctx context.Context, dst minio.CopyDestOptions, src minio.CopySrcOptions) (minio.UploadInfo, error)
	ListenBucketNotification(ctx context.Context, bucketName, prefix, suffix string, events []string) <-chan notification.Info
}

type MinioClientMock struct {
	objects    map[string]minio.ObjectInfo
	buckets    []minio.BucketInfo
	bucketTags map[string]*tags.Tags
}

func (c *MinioClientMock) ListBuckets(_ context.Context) (bb []minio.BucketInfo, e error) {
	return c.buckets, nil
}

func (c *MinioClientMock) BucketExists(context.Context, string) (bool, error) {
	return true, nil
}

func (c *MinioClientMock) StatObject(_ context.Context, bucket string, path string, opts minio.StatObjectOptions) (minio.ObjectInfo, error) {
	obj, ok := c.objects[path]
	if ok {
		return obj, nil
	} else {
		return minio.ObjectInfo{}, errors.New("Path " + path + " does not exists")
	}
}

func (c *MinioClientMock) RemoveObject(ctx context.Context, bucketName, objectName string, opts minio.RemoveObjectOptions) error {
	return nil
}

func (c *MinioClientMock) PutObject(_ context.Context, bucket string, path string, reader io.Reader, size int64, opts minio.PutObjectOptions) (ui minio.UploadInfo, err error) {
	buf := &bytes.Buffer{}
	nRead, err := io.Copy(buf, reader)
	if err != nil {
		return ui, err
	}
	ui.Size = nRead
	return
}

func (c *MinioClientMock) GetObject(_ context.Context, bucket string, path string, opts minio.GetObjectOptions) (object *minio.Object, err error) {
	object = &minio.Object{}
	return object, errors.New("Object is not mockable, cannot emulate GetObject")
}

func (c *MinioClientMock) ListObjects(ctx context.Context, bucketName string, opts minio.ListObjectsOptions) <-chan minio.ObjectInfo {
	out := make(chan minio.ObjectInfo, 1)
	go func() {
		defer close(out)
		for _, info := range c.objects {
			out <- info
		}
	}()
	return out
}

func (c *MinioClientMock) CopyObject(ctx context.Context, dst minio.CopyDestOptions, src minio.CopySrcOptions) (u minio.UploadInfo, e error) {
	return
}

func (c *MinioClientMock) ListenBucketNotification(ctx context.Context, bucketName, prefix, suffix string, events []string) <-chan notification.Info {
	out := make(chan notification.Info)
	return out
}

func (c *MinioClientMock) GetBucketTagging(_ context.Context, bucketName string) (tt *tags.Tags, e error) {
	if c.bucketTags == nil {
		return
	}
	if bTags, o := c.bucketTags[bucketName]; o {
		return bTags, nil
	}
	return
}

func NewS3Mock(bucketName ...string) *Client {
	mock := &MinioClientMock{
		buckets: []minio.BucketInfo{
			{Name: "cell1", CreationDate: time.Now()},
			{Name: "cell2", CreationDate: time.Now()},
			{Name: "cell3", CreationDate: time.Now()},
			{Name: "other", CreationDate: time.Now()},
		},
		bucketTags: make(map[string]*tags.Tags),
		objects:    make(map[string]minio.ObjectInfo),
	}
	mock.objects["file"] = minio.ObjectInfo{
		Key:  "file",
		ETag: "filemd5",
	}
	mock.objects["folder/"+common.PydioSyncHiddenFile] = minio.ObjectInfo{
		Key: "folder/" + common.PydioSyncHiddenFile,
	}
	mock.bucketTags["cell1"], _ = tags.NewTags(map[string]string{
		"TagName":      "TagValue",
		"OtherTagName": "OtherTagValue",
	}, false)
	bName := "bucket"
	if len(bucketName) > 0 {
		bName = bucketName[0]
	}
	client := &Client{
		globalContext: context.Background(),
		Mc:            mock,
		Bucket:        bName,
		RootPath:      "",
		options:       model.EndpointOptions{BrowseOnly: true},
	}
	return client
}
