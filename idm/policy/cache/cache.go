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

// Package policycache owns the process-wide, tenant-isolated policy cache.
package policycache

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/ory/ladon"
	"golang.org/x/sync/singleflight"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
)

// The queue budget is shared by payloads and lookup metadata across all tenants.
// BigCache's shard indexes and active requests have additional Go heap overhead.
const (
	BudgetMiB       = 16
	groupBudgetMiB  = 14
	lookupBudgetMiB = BudgetMiB - groupBudgetMiB
	shards          = 64
	maxEntryBytes   = (groupBudgetMiB * 1024 * 1024 / shards) - 1024
	TTL             = 72 * time.Hour
	ChangeAttribute = "policy.cache.change"
)

type Source interface {
	FindPolicyGroupIDs(context.Context, *ladon.Request) ([]string, error)
	ListPolicyGroups(context.Context, service.Enquirer) ([]*idm.PolicyGroup, error)
}

type Cache struct {
	data       storage
	lookups    storage
	mu         sync.RWMutex
	generation uint64
	flights    singleflight.Group
}
type storage interface {
	Get(string) ([]byte, error)
	Set(string, []byte) error
	Delete(string) error
	Iterator() *bigcache.EntryInfoIterator
	Close() error
}
type lookup struct {
	Tenant   string
	Subject  string
	Resource string
	Action   string
	IDs      []string
}
type change struct {
	Tenant   string
	Group    *idm.PolicyGroup
	Previous *idm.PolicyGroup
}

var defaultOnce sync.Once
var defaultCache *Cache

// Default is one cache for the process, not one cache per handler or tenant.
// Opening failure leaves caching disabled; callers still use SQL.
func Default() *Cache {
	defaultOnce.Do(func() { defaultCache, _ = New() })
	return defaultCache
}
func New() (*Cache, error) {
	cfg := bigcache.DefaultConfig(TTL)
	cfg.Shards = shards
	cfg.HardMaxCacheSize = groupBudgetMiB
	cfg.MaxEntriesInWindow = 4096
	cfg.MaxEntrySize = 256
	cfg.CleanWindow = time.Minute
	cfg.Verbose = false
	data, err := bigcache.New(context.Background(), cfg)
	if err != nil {
		return nil, err
	}
	// Reserve metadata separately so mutation invalidation never reads group
	// payloads. Both fixed arenas together have the one process-wide budget.
	cfg.Shards = 8
	cfg.HardMaxCacheSize = lookupBudgetMiB
	lookups, err := bigcache.New(context.Background(), cfg)
	if err != nil {
		_ = data.Close()
		return nil, err
	}
	return &Cache{data: data, lookups: lookups}, nil
}
func (c *Cache) Close() error { return errors.Join(c.data.Close(), c.lookups.Close()) }

// IsCacheable leaves room for the fixed-size hashed key and BigCache framing.
// Both payload and lookup admission use the same shard-aware bound.
func IsCacheable(payload []byte) bool { return len(payload) <= maxEntryBytes }

func key(kind, tenant, value string) string {
	encoded, _ := json.Marshal([]string{tenant, value})
	sum := sha256.Sum256(encoded)
	return fmt.Sprintf("%s:%x", kind, sum)
}
func (c *Cache) load(ctx context.Context, k string, loader func(context.Context) ([]byte, error)) ([]byte, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if c == nil {
		return loader(ctx)
	}
	bc := c.data
	if strings.HasPrefix(k, "l:") {
		bc = c.lookups
	}
	c.mu.RLock()
	epoch := c.generation
	value, err := bc.Get(k)
	c.mu.RUnlock()
	if err == nil {
		return value, nil
	}
	// An actual backend failure bypasses caching entirely, without retrying it.
	if !errors.Is(err, bigcache.ErrEntryNotFound) {
		return loader(ctx)
	}
	result := c.flights.DoChan(fmt.Sprintf("%d:%s", epoch, k), func() (interface{}, error) {
		c.mu.RLock()
		value, err := bc.Get(k)
		current := c.generation
		c.mu.RUnlock()
		if err == nil && current == epoch {
			return value, nil
		}
		// Each caller can cancel its wait independently. A shared SQL load has
		// its own bounded lifetime, retaining tenant/request metadata only.
		workCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
		defer cancel()
		value, err = loader(workCtx)
		if err != nil {
			return nil, err
		}
		if IsCacheable(value) {
			c.mu.Lock()
			if c.generation == epoch {
				_ = bc.Set(k, value)
			}
			c.mu.Unlock()
		}
		return value, nil
	})
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case result := <-result:
		if result.Err != nil {
			return nil, result.Err
		}
		return result.Val.([]byte), nil
	}
}

func (c *Cache) Group(ctx context.Context, tenant, id string, src Source) (*idm.PolicyGroup, error) {
	raw, err := c.load(ctx, key("g", tenant, id), func(loadCtx context.Context) ([]byte, error) {
		q, err := anypb.New(&idm.PolicyGroupSingleQuery{Uuid: id})
		if err != nil {
			return nil, err
		}
		groups, err := src.ListPolicyGroups(loadCtx, &service.Query{SubQueries: []*anypb.Any{q}})
		if err != nil {
			return nil, err
		}
		if len(groups) == 0 {
			return json.Marshal((*idm.PolicyGroup)(nil))
		}
		return json.Marshal(groups[0])
	})
	if err != nil {
		return nil, err
	}
	var group *idm.PolicyGroup
	if err = json.Unmarshal(raw, &group); err != nil {
		return nil, err
	}
	return group, nil
}
func (c *Cache) Candidates(ctx context.Context, tenant string, src Source, r *ladon.Request) ([]*idm.Policy, error) {
	query := lookup{Tenant: tenant, Subject: r.Subject, Resource: r.Resource, Action: r.Action}
	signature, _ := json.Marshal(query)
	raw, err := c.load(ctx, key("l", tenant, string(signature)), func(loadCtx context.Context) ([]byte, error) {
		ids, err := src.FindPolicyGroupIDs(loadCtx, r)
		if err != nil {
			return nil, err
		}
		query.IDs = ids
		return json.Marshal(query)
	})
	if err != nil {
		return nil, err
	}
	var found lookup
	if err = json.Unmarshal(raw, &found); err != nil {
		return nil, err
	}
	var policies []*idm.Policy
	for _, id := range found.IDs {
		group, err := c.Group(ctx, tenant, id, src)
		if err != nil {
			return nil, err
		}
		if group != nil {
			policies = append(policies, group.Policies...)
		}
	}
	return policies, nil
}

// MayMatch deliberately overselects pattern templates, just like the SQL
// candidate selector.
func MayMatch(group *idm.PolicyGroup, r *ladon.Request) bool {
	match := func(values []string, needle string) bool {
		if needle == "" {
			return true
		}
		for _, v := range values {
			if v == needle || strings.Contains(v, "<") {
				return true
			}
		}
		return false
	}
	for _, p := range group.GetPolicies() {
		if match(p.GetSubjects(), r.Subject) && match(p.GetResources(), r.Resource) && match(p.GetActions(), r.Action) {
			return true
		}
	}
	return false
}

// Invalidate scans only bounded cached lookup metadata
// IDs catch removed/narrowed matches; selectors catch new/expanded matches,
// including previously empty lookups.
func (c *Cache) Invalidate(tenant string, group *idm.PolicyGroup) {
	if c == nil || group == nil {
		return
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.generation++
	_ = c.data.Delete(key("g", tenant, group.GetUuid()))
	it := c.lookups.Iterator()
	for it.SetNext() {
		item, err := it.Value()
		if err != nil || !strings.HasPrefix(item.Key(), "l:") {
			continue
		}
		var l lookup
		if json.Unmarshal(item.Value(), &l) != nil || l.Tenant != tenant {
			continue
		}
		affected := MayMatch(group, &ladon.Request{Subject: l.Subject, Resource: l.Resource, Action: l.Action})
		for _, id := range l.IDs {
			if id == group.GetUuid() {
				affected = true
				break
			}
		}
		if affected {
			_ = c.lookups.Delete(item.Key())
		}
	}
}

// selectorsFor excludes condition JSON and other group payload fields.
func selectorsFor(group *idm.PolicyGroup) *idm.PolicyGroup {
	if group == nil {
		return nil
	}
	selectors := &idm.PolicyGroup{Uuid: group.GetUuid(), ResourceGroup: group.GetResourceGroup()}
	for _, p := range group.GetPolicies() {
		selectors.Policies = append(selectors.Policies, &idm.Policy{ID: p.GetID(), Subjects: p.GetSubjects(), Resources: p.GetResources(), Actions: p.GetActions()})
	}
	return selectors
}

// EventAttributes carries identity and selectors using the existing protobuf
// Attributes field; no regeneration is required.
func EventAttributes(tenant string, group *idm.PolicyGroup, previous ...*idm.PolicyGroup) map[string]string {
	event := change{Tenant: tenant, Group: selectorsFor(group)}
	if len(previous) > 0 {
		event.Previous = selectorsFor(previous[0])
	}
	raw, _ := json.Marshal(event)
	return map[string]string{ChangeAttribute: string(raw)}
}

func DecodeChange(attributes map[string]string) (string, *idm.PolicyGroup, bool) {
	var event change
	raw, ok := attributes[ChangeAttribute]
	if !ok || json.Unmarshal([]byte(raw), &event) != nil || event.Tenant == "" || event.Group == nil || event.Group.Uuid == "" {
		return "", nil, false
	}
	return event.Tenant, event.Group, true
}

func PreviousChange(attributes map[string]string) *idm.PolicyGroup {
	var event change
	if json.Unmarshal([]byte(attributes[ChangeAttribute]), &event) != nil {
		return nil
	}
	return event.Previous
}
