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

// package cache provides an abstraction for various caches

package cache

import (
	"context"
	"time"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

type Cache interface {
	Get(key string, value interface{}) (ok bool)
	GetBytes(key string) (value []byte, ok bool)
	Set(key string, value interface{}) error
	SetWithExpiry(key string, value interface{}, duration time.Duration) error
	Delete(k string) error
	Reset() error
	Exists(key string) (ok bool)
	KeysByPrefix(prefix string) ([]string, error)
	Iterate(it func(key string, val interface{})) error
	Close(ctx context.Context) error
}

type URLOpener openurl.URLOpener[Cache]

// MustDiscard opens a discard-cache that can be used as fallback for openCache-related errors
func MustDiscard() Cache {
	return &discard{}
}

// Config holds cache configurations
type Config struct {
	// Cache identifier, should be always set
	Prefix string
	// Eviction is a golang duration expressed as string ("10s", "1m", etc...). Using -1 means no expiration
	Eviction string
	// CleanWindow may be used by caches to trigger expired keys cleaning
	CleanWindow string
	// DiscardFallback switches to a "no-op" cache if the cache opening fails
	DiscardFallback bool
}
