/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package cachetest

import (
	"context"
	"net/url"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/cache/bigcache"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

func TestShort(t *testing.T) {
	Convey("Test Short", t, func() {
		u, _ := url.Parse("pm:///?evictionTime=20m&cleanWindow=10m")
		c, err := (&gocache.URLOpener{}).Open(context.TODO(), u)
		So(err, ShouldBeNil)
		e := performTest(c)
		So(e, ShouldBeNil)
	})
	Convey("Test Sharded", t, func() {
		u, _ := url.Parse("bigcache://id")
		c, err := (&bigcache.URLOpener{}).Open(context.TODO(), u)
		So(err, ShouldBeNil)
		e := performTest(c)
		So(e, ShouldBeNil)
	})
}

func performTest(c cache.Cache) error {

	// Get/Set
	value := []byte("value")
	So(c.Set("key", value), ShouldBeNil)
	var v []byte
	o := c.Get("key", &v)
	So(o, ShouldBeTrue)
	So(string(v), ShouldEqual, "value")

	vv, o2 := c.GetBytes("key")
	So(o2, ShouldBeTrue)
	So(string(vv), ShouldEqual, "value")

	// Iterate
	var keys []string
	e := c.Iterate(func(key string, val interface{}) {
		keys = append(keys, key)
	})
	So(e, ShouldBeEmpty)
	So(keys, ShouldHaveLength, 1)

	// By Prefix
	So(c.Set("otherkey", value), ShouldBeNil)
	keys, e = c.KeysByPrefix("k")
	So(e, ShouldBeEmpty)
	So(keys, ShouldHaveLength, 1)

	// Delete Key
	So(c.Delete("key"), ShouldBeNil)
	keys, e = c.KeysByPrefix("k")
	So(e, ShouldBeEmpty)
	So(keys, ShouldHaveLength, 0)

	supE := c.SetWithExpiry("expKey", []byte("data"), 2*time.Second)
	if supE == nil {
		// Test expiry
		var v []byte
		o := c.Get("expKey", &v)
		So(o, ShouldBeTrue)
		<-time.After(3 * time.Second)
		o2 := c.Get("expKey", &v)
		So(o2, ShouldBeFalse)
	}

	// Reste
	So(c.Reset(), ShouldBeNil)
	var count int
	_ = c.Iterate(func(key string, val interface{}) {
		count++
	})
	So(count, ShouldEqual, 0)

	return nil
}
