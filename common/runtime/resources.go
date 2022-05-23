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

package runtime

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
)

var (
	dmLock sync.RWMutex
	dm     map[string]func(context.Context, string) error
)

func init() {
	dm = make(map[string]func(context.Context, string) error)
}

// RegisterDependencyMatcher adds a key-based dependency matcher to internal registry.
func RegisterDependencyMatcher(key string, f func(context.Context, string) error) {
	dmLock.Lock()
	dm[key] = f
	dmLock.Unlock()
}

// MatchDependencies checks a list of known keys for specific runtime parameters. It is typically used
// to detect current-process aspects
func MatchDependencies(ctx context.Context, rr map[string]string) error {
	for k, v := range rr {
		switch k {
		case NodeMetaHostName:
			if v != GetHostname() {
				return fmt.Errorf("hostname does not match " + v)
			}
		case NodeMetaPID:
			if v != strconv.Itoa(os.Getpid()) {
				return fmt.Errorf("PID does not match " + v)
			}
		case "capacity":
			for _, ca := range strings.Split(v, "|") {
				if !HasCapacity(ca) {
					return fmt.Errorf("Capacity " + ca + " not supported by current process")
				}
			}
		default:
			dmLock.RLock()
			matcher, ok := dm[k]
			dmLock.RUnlock()
			if !ok {
				continue
			}
			if err := matcher(ctx, v); err != nil {
				return err
			}
		}
	}
	return nil
}
