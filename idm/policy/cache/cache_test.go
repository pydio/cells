/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package policycache

import (
	"bytes"
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/allegro/bigcache/v3"
	"github.com/ory/ladon"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
)

type source struct {
	lookups atomic.Int32
	loads   atomic.Int32
	group   *idm.PolicyGroup
	empty   bool
}

func (s *source) FindPolicyGroupIDs(context.Context, *ladon.Request) ([]string, error) {
	s.lookups.Add(1)
	if s.empty {
		return nil, nil
	}
	return []string{s.group.Uuid}, nil
}
func (s *source) ListPolicyGroups(context.Context, service.Enquirer) ([]*idm.PolicyGroup, error) {
	s.loads.Add(1)
	return []*idm.PolicyGroup{s.group}, nil
}
func fixture() *source {
	return &source{group: &idm.PolicyGroup{Uuid: "workspace", Policies: []*idm.Policy{{ID: "p", Subjects: []string{"alice"}, Resources: []string{"acl"}, Actions: []string{"read"}}}}}
}
func TestHotCandidates(t *testing.T) {
	Convey("tenant-isolated lookup and group hits avoid SQL and return independent objects", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		s := fixture()
		ctx := context.Background()
		r := &ladon.Request{Subject: "alice", Resource: "acl", Action: "read"}
		first, err := c.Candidates(ctx, "one", s, r)
		So(err, ShouldBeNil)
		first[0].Subjects[0] = "mutated"
		second, err := c.Candidates(ctx, "one", s, r)
		So(err, ShouldBeNil)
		So(second[0].Subjects, ShouldResemble, []string{"alice"})
		So(s.lookups.Load(), ShouldEqual, 1)
		So(s.loads.Load(), ShouldEqual, 1)
		_, err = c.Candidates(ctx, "two", s, r)
		So(err, ShouldBeNil)
		So(s.lookups.Load(), ShouldEqual, 2)
		So(s.loads.Load(), ShouldEqual, 2)
	})
}

type brokenStorage struct {
	storage
	gets, sets int
	readError  bool
}

type observedIteration struct {
	storage
	iterations int
}

func (s *observedIteration) Iterator() *bigcache.EntryInfoIterator {
	s.iterations++
	return s.storage.Iterator()
}

func TestInvalidationDoesNotReadGroupPayloads(t *testing.T) {
	Convey("invalidation scans lookup metadata, never cached group payloads", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		observed := &observedIteration{storage: c.data}
		c.data = observed
		c.Invalidate("one", fixture().group)
		So(observed.iterations, ShouldEqual, 0)
	})
}

func (b *brokenStorage) Get(k string) ([]byte, error) {
	b.gets++
	if b.readError {
		return nil, errors.New("unavailable")
	}
	return b.storage.Get(k)
}
func (b *brokenStorage) Set(string, []byte) error { b.sets++; return errors.New("unavailable") }

func TestCacheAdmissionAndFailure(t *testing.T) {
	Convey("oversized values bypass caching intact", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		payload := bytes.Repeat([]byte("x"), maxEntryBytes+1)
		So(IsCacheable(payload), ShouldBeFalse)
		calls := 0
		for i := 0; i < 2; i++ {
			raw, err := c.load(context.Background(), "large", func(context.Context) ([]byte, error) { calls++; return payload, nil })
			So(err, ShouldBeNil)
			So(raw, ShouldResemble, payload)
		}
		So(calls, ShouldEqual, 2)
	})
	Convey("cache write failure is not retried or returned as a SQL error", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		broken := &brokenStorage{storage: c.data}
		c.data = broken
		raw, err := c.load(context.Background(), "failed", func(context.Context) ([]byte, error) { return []byte("SQL result"), nil })
		So(err, ShouldBeNil)
		So(string(raw), ShouldEqual, "SQL result")
		So(broken.sets, ShouldEqual, 1)
	})
	Convey("cache read failure goes straight to SQL without a second cache attempt", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		broken := &brokenStorage{storage: c.data, readError: true}
		c.data = broken
		_, err = c.load(context.Background(), "failed", func(context.Context) ([]byte, error) { return []byte("SQL result"), nil })
		So(err, ShouldBeNil)
		So(broken.gets, ShouldEqual, 1)
		So(broken.sets, ShouldEqual, 0)
	})
}

func TestInvalidationDuringLoad(t *testing.T) {
	Convey("invalidated in-flight work cannot refill the cache", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		started, release, done := make(chan struct{}), make(chan struct{}), make(chan error, 1)
		go func() {
			_, err := c.load(context.Background(), "old", func(context.Context) ([]byte, error) { close(started); <-release; return []byte("old"), nil })
			done <- err
		}()
		<-started
		c.Invalidate("one", fixture().group)
		close(release)
		So(<-done, ShouldBeNil)
		_, err = c.data.Get("old")
		So(errors.Is(err, bigcache.ErrEntryNotFound), ShouldBeTrue)
	})
}

func TestSharedLoadSurvivesCallerCancellation(t *testing.T) {
	Convey("one caller canceling must not cancel a load shared with other requests", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()
		started, release := make(chan struct{}), make(chan struct{})
		caller, work := make(chan error, 1), make(chan error, 1)
		go func() {
			_, err := c.load(ctx, "shared", func(loadCtx context.Context) ([]byte, error) {
				close(started)
				<-release
				work <- loadCtx.Err()
				return []byte("loaded"), nil
			})
			caller <- err
		}()
		<-started
		cancel()
		So(<-caller, ShouldEqual, context.Canceled)
		close(release)
		So(<-work, ShouldBeNil)
	})
}

func TestPolicyCacheStorageBudget(t *testing.T) {
	Convey("all tenants share one bounded storage arena under churn", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		payload := bytes.Repeat([]byte("x"), 32*1024)
		for i := 0; i < 1024; i++ {
			So(c.data.Set(key("g", string(rune(i)), "group"), payload), ShouldBeNil)
		}
		for i := 0; i < 128; i++ {
			So(c.lookups.Set(key("l", string(rune(i)), "request"), payload), ShouldBeNil)
		}
		So(c.data.(*bigcache.BigCache).Capacity()+c.lookups.(*bigcache.BigCache).Capacity(), ShouldBeLessThanOrEqualTo, BudgetMiB*1024*1024)
	})
}
func TestTargetedInvalidation(t *testing.T) {
	Convey("unrelated conversations preserve REST lookup hits but matching changes evict", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		s := fixture()
		s.group.Policies[0].Resources = []string{"rest:<.*>"}
		ctx := context.Background()
		r := &ladon.Request{Subject: "alice", Resource: "rest:/v2/n/nodes", Action: "read"}
		_, err = c.Candidates(ctx, "one", s, r)
		So(err, ShouldBeNil)
		unrelated := fixture().group
		unrelated.Uuid = "new-conversation"
		c.Invalidate("one", unrelated)
		_, err = c.Candidates(ctx, "one", s, r)
		So(err, ShouldBeNil)
		So(s.lookups.Load(), ShouldEqual, 1)
		c.Invalidate("one", s.group)
		_, err = c.Candidates(ctx, "one", s, r)
		So(err, ShouldBeNil)
		So(s.lookups.Load(), ShouldEqual, 2)
		So(s.loads.Load(), ShouldEqual, 2)
	})
}
func TestConcurrentMisses(t *testing.T) {
	Convey("concurrent cold requests share SQL work", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		s := fixture()
		var wg sync.WaitGroup
		var failures atomic.Int32
		for i := 0; i < 20; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				_, err := c.Candidates(context.Background(), "one", s, &ladon.Request{Subject: "alice", Resource: "acl", Action: "read"})
				if err != nil {
					failures.Add(1)
				}
			}()
		}
		wg.Wait()
		So(failures.Load(), ShouldEqual, 0)
		So(s.lookups.Load(), ShouldEqual, 1)
		So(s.loads.Load(), ShouldEqual, 1)
	})
}

func TestCreationInvalidatesEmptyLookup(t *testing.T) {
	Convey("a newly matching group invalidates an earlier empty lookup", t, func() {
		c, err := New()
		So(err, ShouldBeNil)
		defer c.Close()
		s := fixture()
		s.empty = true
		ctx := context.Background()
		request := &ladon.Request{Subject: "alice", Resource: "acl", Action: "read"}
		policies, err := c.Candidates(ctx, "one", s, request)
		So(err, ShouldBeNil)
		So(policies, ShouldBeEmpty)
		s.empty = false
		c.Invalidate("one", s.group)
		policies, err = c.Candidates(ctx, "one", s, request)
		So(err, ShouldBeNil)
		So(policies, ShouldHaveLength, 1)
		So(s.lookups.Load(), ShouldEqual, 2)
	})
}

func TestChangeEventSelectors(t *testing.T) {
	Convey("events carry old and new selectors without retaining condition payloads", t, func() {
		before := fixture().group
		before.Policies[0].Conditions = map[string]*idm.PolicyCondition{"owner": {Type: "StringMatchCondition", JsonOptions: `{"matches":"secret"}`}}
		after := fixture().group
		after.Policies[0].Subjects = []string{"bob"}
		attrs := EventAttributes("tenant", after, before)
		tenant, current, ok := DecodeChange(attrs)
		So(ok, ShouldBeTrue)
		So(tenant, ShouldEqual, "tenant")
		So(current.Policies[0].Subjects, ShouldResemble, []string{"bob"})
		previous := PreviousChange(attrs)
		So(previous.Policies[0].Subjects, ShouldResemble, []string{"alice"})
		So(previous.Policies[0].Conditions, ShouldBeEmpty)
		So(attrs[ChangeAttribute], ShouldNotContainSubstring, "secret")
	})
}
