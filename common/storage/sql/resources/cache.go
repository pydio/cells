/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package resources

import (
	"context"

	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
)

var (
	cacheConfig = cache.Config{
		Prefix:      "resources",
		Eviction:    "30s",
		CleanWindow: "2m",
	}
)

type cacheImpl struct {
	DAO
}

func withCache(dao DAO) DAO {
	c := &cacheImpl{
		DAO: dao,
	}
	return c
}

func (c *cacheImpl) getCache(ctx context.Context) cache.Cache {
	return cache_helper.MustResolveCache(ctx, "short", cacheConfig)
}

func (c *cacheImpl) AddPolicies(ctx context.Context, update bool, resourceId string, rules []*service.ResourcePolicy) ([]*service.ResourcePolicy, error) {
	_ = c.getCache(ctx).Delete(resourceId)
	return c.DAO.AddPolicies(ctx, update, resourceId, rules)
}

func (c *cacheImpl) DeletePoliciesForResource(ctx context.Context, resourceId string) error {
	_ = c.getCache(ctx).Delete(resourceId)
	return c.DAO.DeletePoliciesForResource(ctx, resourceId)
}

func (c *cacheImpl) DeletePoliciesForResourceAndAction(ctx context.Context, resourceId string, action service.ResourcePolicyAction) error {
	_ = c.getCache(ctx).Delete(resourceId)
	return c.DAO.DeletePoliciesForResourceAndAction(ctx, resourceId, action)
}

func (c *cacheImpl) GetPoliciesForResource(ctx context.Context, resourceId string) ([]*service.ResourcePolicy, error) {
	var rules []*service.ResourcePolicy
	if c.getCache(ctx).Get(resourceId, &rules) {
		return rules, nil
	}
	res, er := c.DAO.GetPoliciesForResource(ctx, resourceId)
	if er == nil && len(res) > 0 {
		_ = c.getCache(ctx).Set(resourceId, res)
	}
	return res, er
}

func (c *cacheImpl) DeletePoliciesBySubject(ctx context.Context, subject string) error {

	//Delete cache items that would contain this subject
	_ = c.getCache(ctx).Iterate(func(key string, val interface{}) {
		if rules, ok := val.([]*service.ResourcePolicy); ok {
			for _, pol := range rules {
				if pol.Subject == subject {
					_ = c.getCache(ctx).Delete(key)
					break
				}
			}
		}
	})

	return c.DAO.DeletePoliciesBySubject(ctx, subject)
}
