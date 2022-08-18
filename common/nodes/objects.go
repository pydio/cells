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

package nodes

import (
	"context"
	"fmt"
	"io"

	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/nodes/objects/mock"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type StorageClientProvider func(cfg configx.Values) (StorageClient, error)

type StorageClient interface {
	ListBuckets(ctx context.Context) ([]models.BucketInfo, error)
	MakeBucket(ctx context.Context, bucketName string, location string) (err error)
	RemoveBucket(ctx context.Context, bucketName string) error
	BucketTags(ctx context.Context, bucketName string) (map[string]string, error)
	BucketNotifications(ctx context.Context, bucketName string, prefix string, events []string) (<-chan interface{}, error)

	ListObjects(ctx context.Context, bucket, prefix, marker, delimiter string, max ...int) (result models.ListBucketResult, err error)
	GetObject(ctx context.Context, bucketName, objectName string, opts models.ReadMeta) (io.ReadCloser, models.ObjectInfo, error)
	StatObject(ctx context.Context, bucketName, objectName string, opts models.ReadMeta) (models.ObjectInfo, error)
	PutObject(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, opts models.PutMeta) (models.ObjectInfo, error)
	RemoveObject(ctx context.Context, bucketName, objectName string) error
	CopyObject(ctx context.Context, sourceBucket, sourceObject, destBucket, destObject string, srcMeta, metadata map[string]string, progress io.Reader) (models.ObjectInfo, error)
	CopyObjectMultipart(ctx context.Context, srcObject models.ObjectInfo, srcBucket, srcPath, destBucket, destPath string, meta map[string]string, progress io.Reader) error
	CopyObjectMultipartThreshold() int64

	NewMultipartUpload(ctx context.Context, bucket, object string, opts models.PutMeta) (uploadID string, err error)
	ListMultipartUploads(ctx context.Context, bucket, prefix, keyMarker, uploadIDMarker, delimiter string, maxUploads int) (result models.ListMultipartUploadsResult, err error)
	ListObjectParts(ctx context.Context, bucketName, objectName, uploadID string, partNumberMarker, maxParts int) (models.ListObjectPartsResult, error)
	CompleteMultipartUpload(ctx context.Context, bucket, object, uploadID string, parts []models.MultipartObjectPart) (string, error)
	PutObjectPart(ctx context.Context, bucket, object, uploadID string, partID int, data io.Reader, size int64, md5Base64, sha256Hex string) (models.MultipartObjectPart, error)
	AbortMultipartUpload(ctx context.Context, bucket, object, uploadID string) error
}

var (
	storageClientsRegistry   map[string]StorageClientProvider
	useMockStorageClientType bool
)

func init() {
	storageClientsRegistry = make(map[string]StorageClientProvider)
	// Register default
	RegisterStorageClient("mock", func(cfg configx.Values) (StorageClient, error) {
		return mock.New(), nil
	})
}

func RegisterStorageClient(name string, provider StorageClientProvider) {
	storageClientsRegistry[name] = provider
}

func NewStorageClient(cfg configx.Values) (StorageClient, error) {
	name := cfg.Val("type").Default("mock").String()
	if useMockStorageClientType {
		name = "mock"
	}
	if provider, ok := storageClientsRegistry[name]; ok {
		return provider(cfg)
	} else {
		return nil, fmt.Errorf("unknown storage client type " + name + ", did you forget to register provider?")
	}
}

func UseMockStorageClientType() {
	useMockStorageClientType = true
}
