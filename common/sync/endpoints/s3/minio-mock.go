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

	"github.com/pydio/cells/common/sync/model"

	"github.com/pydio/cells/common"

	"github.com/pydio/minio-go"
)

type MockableMinio interface {
	StatObject(bucket string, path string, opts minio.StatObjectOptions) (minio.ObjectInfo, error)
	RemoveObject(bucket string, path string) error
	PutObject(bucket string, path string, reader io.Reader, size int64, opts minio.PutObjectOptions) (n int64, err error)
	GetObject(bucket string, path string, opts minio.GetObjectOptions) (object *minio.Object, err error)
	ListObjectsV2(bucketName, objectPrefix string, recursive bool, doneCh <-chan struct{}) <-chan minio.ObjectInfo
	CopyObject(dest minio.DestinationInfo, source minio.SourceInfo) error
	ListenBucketNotification(bucketName, prefix, suffix string, events []string, doneCh <-chan struct{}) <-chan minio.NotificationInfo
	ListBuckets() ([]minio.BucketInfo, error)
	ListBucketsWithContext(ctx context.Context) ([]minio.BucketInfo, error)
	BucketExists(string) (bool, error)
	GetBucketTagging(string) ([]minio.Tag, error)
}

type MinioClientMock struct {
	objects    map[string]minio.ObjectInfo
	buckets    []minio.BucketInfo
	bucketTags map[string][]minio.Tag
}

func (c *MinioClientMock) ListBuckets() (bb []minio.BucketInfo, e error) {
	return c.buckets, nil
}

func (c *MinioClientMock) ListBucketsWithContext(ctx context.Context) (bb []minio.BucketInfo, e error) {
	return c.buckets, nil
}

func (c *MinioClientMock) BucketExists(string) (bool, error) {
	return true, nil
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

func (c *MinioClientMock) GetBucketTagging(bucketName string) ([]minio.Tag, error) {
	if c.bucketTags == nil {
		return []minio.Tag{}, nil
	}
	if tt, o := c.bucketTags[bucketName]; o {
		return tt, nil
	}
	return []minio.Tag{}, nil
}

func NewS3Mock(bucketName ...string) *Client {
	mock := &MinioClientMock{
		buckets: []minio.BucketInfo{
			{Name: "cell1", CreationDate: time.Now()},
			{Name: "cell2", CreationDate: time.Now()},
			{Name: "cell3", CreationDate: time.Now()},
			{Name: "other", CreationDate: time.Now()},
		},
		bucketTags: make(map[string][]minio.Tag),
		objects:    make(map[string]minio.ObjectInfo),
	}
	mock.objects["file"] = minio.ObjectInfo{
		Key:  "file",
		ETag: "filemd5",
	}
	mock.objects["folder/"+common.PydioSyncHiddenFile] = minio.ObjectInfo{
		Key: "folder/" + common.PydioSyncHiddenFile,
	}
	mock.bucketTags["cell1"] = append(mock.bucketTags["cell1"], minio.Tag{
		Key:   "TagName",
		Value: "TagValue",
	})
	mock.bucketTags["cell1"] = append(mock.bucketTags["cell1"], minio.Tag{
		Key:   "OtherTagName",
		Value: "OtherTagValue",
	})
	bName := "bucket"
	if len(bucketName) > 0 {
		bName = bucketName[0]
	}
	client := &Client{
		Mc:       mock,
		Bucket:   bName,
		RootPath: "",
		options:  model.EndpointOptions{BrowseOnly: true},
	}
	return client
}
