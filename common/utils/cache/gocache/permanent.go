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

package gocache

import (
	"context"
	"net/url"

	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

// MustOpenNonExpirableMemory opens a permanent cache using gocache and can accept a WatcherOpener to reset cache
// on specific event
func MustOpenNonExpirableMemory(watchForReset ...WatcherOpener) *openurl.Pool[cache.Cache] {
	opener := func(ctx context.Context, rawUrl string) (cache.Cache, error) {
		u, _ := url.Parse("pm://?evictionTime=-1")
		return (&URLOpener{}).Open(ctx, u)
	}
	if len(watchForReset) > 0 {
		opener = autoResetOpener(opener, watchForReset[0])
	}
	p, _ := openurl.OpenPool[cache.Cache](nil, []string{"pm://" + openurl.GetMemPoolShardExpr()}, opener)
	return p
}

// autoResetOpener creates an Opener wrapped with a channel that triggers created cache.Reset()
func autoResetOpener(baseOpener openurl.Opener[cache.Cache], watcherOpener WatcherOpener) openurl.Opener[cache.Cache] {
	return func(ctx context.Context, urlstr string) (cache.Cache, error) {
		ca, er := baseOpener(ctx, urlstr)
		if er != nil {
			return nil, er
		}
		if watcher, err := watcherOpener(ctx, urlstr); err == nil {
			go func() {
				for {
					if _, err = watcher.Next(); err != nil {
						return
					}
					log.Logger(ctx).Info("Resetting cache on watch event")
					_ = ca.Reset()
				}
			}()
			// Wrap in watchCache to stop watcher on close
			ca = &watcherCache{Cache: ca, w: watcher}
		}
		return ca, nil
	}
}

type WatcherOpener openurl.Opener[Watcher]

type Watcher interface {
	Next() (interface{}, error)
	Stop()
}

type watcherCache struct {
	cache.Cache
	w Watcher
}

func (wc *watcherCache) Close(ctx context.Context) error {
	wc.w.Stop()
	return wc.Cache.Close(ctx)
}
