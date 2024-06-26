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

	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/cache"
)

type cacheImpl struct {
	DAO
	c cache.Cache
}

func withCache(dao DAO) DAO {
	ka, er := cache.OpenCache(context.TODO(), runtime.ShortCacheURL("evictionTime", "30s", "cleanWindow", "2m"))
	if er != nil {
		ka = cache.MustDiscard()
	}
	c := &cacheImpl{
		DAO: dao,
		c:   ka,
	}
	return c
}

func (c *cacheImpl) AddPolicy(ctx context.Context, resourceId string, policy *service.ResourcePolicy) error {
	_ = c.c.Delete(resourceId)
	return c.DAO.AddPolicy(ctx, resourceId, policy)
}

func (c *cacheImpl) AddPolicies(ctx context.Context, update bool, resourceId string, policies []*service.ResourcePolicy) error {
	_ = c.c.Delete(resourceId)
	return c.DAO.AddPolicies(ctx, update, resourceId, policies)
}

func (c *cacheImpl) DeletePoliciesForResource(ctx context.Context, resourceId string) error {
	_ = c.c.Delete(resourceId)
	return c.DAO.DeletePoliciesForResource(ctx, resourceId)
}

func (c *cacheImpl) DeletePoliciesForResourceAndAction(ctx context.Context, resourceId string, action service.ResourcePolicyAction) error {
	_ = c.c.Delete(resourceId)
	return c.DAO.DeletePoliciesForResourceAndAction(ctx, resourceId, action)
}

func (c *cacheImpl) GetPoliciesForResource(ctx context.Context, resourceId string) ([]*service.ResourcePolicy, error) {
	var rules []*service.ResourcePolicy
	if c.c.Get(resourceId, &rules) {
		return rules, nil
	}
	res, er := c.DAO.GetPoliciesForResource(ctx, resourceId)
	if er == nil && len(res) > 0 {
		_ = c.c.Set(resourceId, res)
	}
	return res, er
}

func (c *cacheImpl) DeletePoliciesBySubject(ctx context.Context, subject string) error {

	//Delete cache items that would contain this subject
	_ = c.c.Iterate(func(key string, val interface{}) {
		if rules, ok := val.([]*service.ResourcePolicy); ok {
			for _, pol := range rules {
				if pol.Subject == subject {
					_ = c.c.Delete(key)
					break
				}
			}
		}
	})

	return c.DAO.DeletePoliciesBySubject(ctx, subject)
}
