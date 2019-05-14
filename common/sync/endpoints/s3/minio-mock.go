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
	"io"

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
}
