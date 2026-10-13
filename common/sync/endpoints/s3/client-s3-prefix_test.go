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
	"sort"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

// prefixStorage is the objects mock with a listing filtered by prefix and sorted by key, like
// a real S3 server (the mock lists the whole bucket), and optional StatObject / PutObject errors.
type prefixStorage struct {
	*mock.Client
	listErr  error
	statErrs map[string]error
	putErr   error
}

func (p *prefixStorage) PutObject(ctx context.Context, bucket, key string, r io.Reader, size int64, opts models.PutMeta) (models.ObjectInfo, error) {
	if p.putErr != nil {
		_, _ = io.CopyN(io.Discard, r, size) // the body was sent, the server answered an error
		return models.ObjectInfo{}, p.putErr
	}
	return p.Client.PutObject(ctx, bucket, key, r, size, opts)
}

func (p *prefixStorage) StatObject(ctx context.Context, bucket, key string, opts models.ReadMeta) (models.ObjectInfo, error) {
	if e, ok := p.statErrs[key]; ok {
		return models.ObjectInfo{}, e
	}
	return p.Client.StatObject(ctx, bucket, key, opts)
}

func (p *prefixStorage) ListObjects(ctx context.Context, bucket, prefix, marker, delimiter string, max ...int) (models.ListBucketResult, error) {
	if p.listErr != nil {
		return models.ListBucketResult{}, p.listErr
	}
	res, e := p.Client.ListObjects(ctx, bucket, prefix, marker, delimiter)
	if e != nil {
		return res, e
	}
	var cc []models.ObjectInfo
	for _, o := range res.Contents {
		if strings.HasPrefix(o.Key, prefix) {
			cc = append(cc, o)
		}
	}
	sort.Slice(cc, func(i, j int) bool { return cc[i].Key < cc[j].Key })
	res.Contents = cc
	return res, nil
}

// CopyObjectMultipartThreshold avoids the multipart copy, not implemented by the mock
func (p *prefixStorage) CopyObjectMultipartThreshold() int64 {
	return 1 << 30
}

func newPrefixClient(rootPath string, keys ...string) (*Client, *prefixStorage) {
	st := &prefixStorage{Client: mock.New("bucket")}
	for _, k := range keys {
		_, _ = st.PutObject(context.Background(), "bucket", k, bytes.NewBufferString(k), int64(len(k)), models.PutMeta{})
	}
	return NewObjectClient(context.Background(), st, "localhost", "bucket", rootPath, model.EndpointOptions{}), st
}

func (p *prefixStorage) keys() []string {
	var kk []string
	for k := range p.Buckets["bucket"] {
		kk = append(kk, k)
	}
	sort.Strings(kk)
	return kk
}

func TestDeleteMoveByPathNotByPrefix(t *testing.T) {
	siblings := []string{"x-2020/a", "x.bak", "xy/.pydio", "xy/b"} // sorted

	Convey("DeleteNode on a file does not delete objects sharing its name as a prefix", t, func() {
		c, st := newPrefixClient("", append([]string{"x"}, siblings...)...)
		So(c.DeleteNode(context.Background(), "x"), ShouldBeNil)
		So(st.keys(), ShouldResemble, siblings)
	})

	Convey("DeleteNode on a folder deletes its content only", t, func() {
		c, st := newPrefixClient("", append([]string{"x/.pydio", "x/a", "x/sub/b"}, siblings...)...)
		So(c.DeleteNode(context.Background(), "/x"), ShouldBeNil)
		So(st.keys(), ShouldResemble, siblings)
	})

	Convey("DeleteNode on a folder given with a trailing slash deletes its content and its marker", t, func() {
		c, st := newPrefixClient("", append([]string{"x/", "x/.pydio", "x/a", "x/sub/b"}, siblings...)...)
		So(c.DeleteNode(context.Background(), "x/"), ShouldBeNil)
		So(st.keys(), ShouldResemble, siblings)
	})

	Convey("MoveNode on a folder given with trailing slashes moves its content only", t, func() {
		c, st := newPrefixClient("", "foo/.pydio", "foo/a", "foobar")
		So(c.MoveNode(context.Background(), "foo/", "baz/"), ShouldBeNil)
		So(st.keys(), ShouldResemble, []string{"baz/.pydio", "baz/a", "foobar"})
	})

	Convey("DeleteNode below a root path does not touch siblings of the root path", t, func() {
		c, st := newPrefixClient("root", "root/x", "root/x.bak", "rootbis/x")
		So(c.DeleteNode(context.Background(), "x"), ShouldBeNil)
		So(st.keys(), ShouldResemble, []string{"root/x.bak", "rootbis/x"})
	})

	Convey("MoveNode on a file does not move objects sharing its name as a prefix", t, func() {
		c, st := newPrefixClient("", "foo", "foobar", "foo-old/a")
		So(c.MoveNode(context.Background(), "foo", "baz"), ShouldBeNil)
		So(st.keys(), ShouldResemble, []string{"baz", "foo-old/a", "foobar"})
	})

	Convey("MoveNode on a folder moves its content only", t, func() {
		c, st := newPrefixClient("", "foo/.pydio", "foo/a", "foobar")
		So(c.MoveNode(context.Background(), "foo", "baz"), ShouldBeNil)
		So(st.keys(), ShouldResemble, []string{"baz/.pydio", "baz/a", "foobar"})
	})

	Convey("DeleteNode and MoveNode return listing errors", t, func() {
		c, st := newPrefixClient("", "x")
		st.listErr = errors.New("listing failed")
		So(c.DeleteNode(context.Background(), "x"), ShouldNotBeNil)
		So(c.MoveNode(context.Background(), "x", "y"), ShouldNotBeNil)
		So(st.keys(), ShouldResemble, []string{"x"})
	})
}
