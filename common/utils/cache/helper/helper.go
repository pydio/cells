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

package cache_helper

import (
	"context"
	"net/url"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var resolver CacheRegistryResolver

// CacheRegistry defines a subset of the Manager interface
type CacheRegistry interface {
	RegisterCache(scheme string, opts ...controller.Option[*openurl.Pool[cache.Cache]])
	GetCache(ctx context.Context, name string, resolutionData map[string]interface{}) (cache.Cache, error)
}

type CacheRegistryResolver func(ctx context.Context) (CacheRegistry, error)

// SetCacheRegistryResolver registers a resolver for finding CacheRegistry
func SetCacheRegistryResolver(r CacheRegistryResolver) {
	resolver = r
}

func SetStaticResolver(url string, opener cache.URLOpener) {
	st := &staticResolver{
		url:    url,
		opener: opener,
		caches: make(map[string]cache.Cache),
	}
	resolver = func(ctx context.Context) (CacheRegistry, error) {
		return st, nil
	}
}

// RegisterCachePool is a helper for cache pool registration
func RegisterCachePool(scheme string, opener cache.URLOpener) {
	runtime.Register("system", func(ctx context.Context) {
		reg, err := resolver(ctx)
		if err != nil {
			panic(err)
		}
		reg.RegisterCache(scheme, controller.WithCustomOpener(func(ctx context.Context, uu string) (*openurl.Pool[cache.Cache], error) {
			return openurl.OpenPool[cache.Cache](ctx, []string{uu}, func(ctx context.Context, raw string) (cache.Cache, error) {
				u, e := url.Parse(raw)
				if e != nil {
					return nil, e
				}
				return opener.Open(ctx, u)
			})
		}))
	})

}

// ResolveCache looks up for manager in context and finds the corresponding cache
func ResolveCache(ctx context.Context, name string, config cache.Config) (cache.Cache, error) {
	reg, err := resolver(ctx)
	if err != nil {
		if config.DiscardFallback {
			log.Logger(ctx).Warn("Resolving cache "+name+" fails, use a Discard Fallback", zap.Error(err))
			return cache.MustDiscard(), nil
		}
		return nil, err
	}
	ctx = context.WithoutCancel(ctx)
	c, er := reg.GetCache(ctx, name, map[string]interface{}{
		"evictionTime": config.Eviction,
		"cleanWindow":  config.CleanWindow,
		"prefix":       config.Prefix,
	})
	if (c == nil || er != nil) && config.DiscardFallback {
		log.Logger(ctx).Warn("Resolving cache "+name+" fails, use a Discard Fallback", zap.Error(er))
		return cache.MustDiscard(), nil
	}
	return c, er
}

// MustResolveCache forces the Config.DiscardFallback to true and returns ResolveCache without error
// If the cache opening fails, it returns a DiscardCache
func MustResolveCache(ctx context.Context, name string, config cache.Config) cache.Cache {
	config.DiscardFallback = true
	ca, _ := ResolveCache(ctx, name, config)
	return ca
}

type staticResolver struct {
	caches map[string]cache.Cache
	opener cache.URLOpener
	url    string
}

func (c *staticResolver) RegisterCache(scheme string, opts ...controller.Option[*openurl.Pool[cache.Cache]]) {
}

func (c *staticResolver) GetCache(ctx context.Context, name string, resolutionData map[string]interface{}) (cache.Cache, error) {
	var prefix string
	if p, ok := resolutionData["prefix"]; ok {
		prefix = p.(string)
	}
	ur := c.url
	if strings.Contains(c.url, "?") {
		ur += "&prefix=" + prefix
	} else {
		ur += "?prefix=" + prefix
	}
	u, _ := url.Parse(ur)
	if ca, ok := c.caches[u.String()]; ok {
		return ca, nil
	} else {
		ca, _ = c.opener.Open(ctx, u)
		c.caches[u.String()] = ca
		return ca, nil
	}
}
