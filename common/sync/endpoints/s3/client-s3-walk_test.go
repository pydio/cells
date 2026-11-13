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
	"fmt"
	"sort"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

func TestWalkReportsErrors(t *testing.T) {
	Convey("A node that cannot be stat'ed is reported to the walk callback with its error", t, func() {
		c, st := newPrefixClient("", "a", "b", "c")
		st.statErrs = map[string]error{"b": errors.New("503 slow down")}
		var walked []string
		var errs []error
		e := c.Walk(context.Background(), func(p string, n tree.N, err error) error {
			if err != nil {
				errs = append(errs, err)
				return err
			}
			walked = append(walked, p)
			return nil
		}, "", true)
		So(errs, ShouldHaveLength, 1)
		So(e, ShouldNotBeNil)
		So(walked, ShouldNotContain, "b")
	})

	Convey("An error returned by the walk callback stops the walk and is returned", t, func() {
		var keys []string
		for i := 0; i < 120; i++ { // more than one stat batch (50)
			keys = append(keys, fmt.Sprintf("f%03d", i))
		}
		c, _ := newPrefixClient("", keys...)
		stop := errors.New("stop")
		calls := 0
		e := c.Walk(context.Background(), func(p string, n tree.N, err error) error {
			calls++
			return stop
		}, "", true)
		So(e, ShouldEqual, stop)
		So(calls, ShouldEqual, 1)
	})

	Convey("Multi-bucket walk returns errors of buckets walks and callbacks", t, func() {
		ctx := context.Background()
		newMulti := func() (*MultiBucketClient, *prefixStorage) {
			m, e := NewMultiBucketClient(ctx, mock.New(), "az", "^cell", model.EndpointOptions{BrowseOnly: true})
			So(e, ShouldBeNil)
			st := &prefixStorage{Client: mock.New("cell1")}
			_, _ = st.PutObject(ctx, "cell1", "a", bytes.NewBufferString("a"), 1, models.PutMeta{})
			m.mainClient = NewS3Mock()
			m.bucketClients = map[string]*Client{
				"cell1": NewObjectClient(ctx, st, "az", "cell1", "", model.EndpointOptions{BrowseOnly: true}),
				"cell2": NewS3Mock("cell2"),
				"cell3": NewS3Mock("cell3"),
			}
			return m, st
		}

		m, st := newMulti()
		st.statErrs = map[string]error{"a": errors.New("503 slow down")}
		var e error
		So(func() {
			e = m.Walk(ctx, func(p string, n tree.N, err error) error { return err }, "", true)
		}, ShouldNotPanic)
		So(e, ShouldNotBeNil)

		m, _ = newMulti()
		stop := errors.New("stop")
		calls := 0
		e = m.Walk(ctx, func(p string, n tree.N, err error) error {
			calls++
			return stop
		}, "", false)
		So(e, ShouldEqual, stop)
		So(calls, ShouldEqual, 1)
	})
}

func TestMultiBucketWalkInsideBucket(t *testing.T) {
	ctx := context.Background()
	m, e := NewMultiBucketClient(ctx, mock.New(), "az", "^cell", model.EndpointOptions{BrowseOnly: true})
	if e != nil {
		t.Fatal(e)
	}
	st := &prefixStorage{Client: mock.New("cell1")}
	for _, k := range []string{"dir/a", "dir/sub/b", "other"} {
		_, _ = st.PutObject(ctx, "cell1", k, bytes.NewBufferString(k), int64(len(k)), models.PutMeta{})
	}
	m.mainClient = NewS3Mock()
	m.bucketClients = map[string]*Client{"cell1": NewObjectClient(ctx, st, "az", "cell1", "", model.EndpointOptions{BrowseOnly: true})}

	var paths []string
	func() {
		defer func() {
			if r := recover(); r != nil {
				t.Fatalf("Walk panicked: %v", r)
			}
		}()
		e = m.Walk(ctx, func(p string, n tree.N, err error) error {
			if err != nil {
				return err
			}
			if !n.IsLeaf() {
				return nil
			}
			if p != n.GetPath() {
				t.Errorf("walked path %s differs from node path %s", p, n.GetPath())
			}
			paths = append(paths, p)
			return nil
		}, "cell1/dir", true)
	}()
	if e != nil {
		t.Fatal(e)
	}
	sort.Strings(paths)
	if strings.Join(paths, ",") != "cell1/dir/a,cell1/dir/sub/b" {
		t.Fatalf("expected the files of cell1/dir with the bucket prefix, got %v", paths)
	}
}
