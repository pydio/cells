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
	"errors"
	"testing"

	minio "github.com/minio/minio-go/v7"

	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/sync/model"
)

// minioStorage answers StatObject with the error a real minio client returns for a missing key
type minioStorage struct {
	*prefixStorage
	statErr error
}

func (m *minioStorage) StatObject(ctx context.Context, bucket, key string, opts models.ReadMeta) (models.ObjectInfo, error) {
	return models.ObjectInfo{}, m.statErr
}

func TestLoadNodeNotFound(t *testing.T) {
	ctx := context.Background()
	c, _ := newPrefixClient("", "a")
	if _, e := c.LoadNode(ctx, "missing"); !model.IsNotFound(e) {
		t.Fatalf("a missing node should be reported as not found, got %v", e)
	}

	_, st := newPrefixClient("")
	for _, tc := range []struct {
		err      error
		notFound bool
	}{
		{minio.ErrorResponse{Code: "NoSuchKey", StatusCode: 404, Message: "The specified key does not exist."}, true},
		{minio.ErrorResponse{Code: "AccessDenied", StatusCode: 403, Message: "Access Denied."}, false},
		{errors.New("connection refused"), false},
	} {
		c := NewObjectClient(ctx, &minioStorage{prefixStorage: st, statErr: tc.err}, "localhost", "bucket", "", model.EndpointOptions{})
		_, e := c.LoadNode(ctx, "missing")
		if e == nil || model.IsNotFound(e) != tc.notFound {
			t.Errorf("StatObject error %v: LoadNode returned %v, not found expected: %v", tc.err, e, tc.notFound)
		}
	}
}
