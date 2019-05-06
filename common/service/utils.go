/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package service

import (
	"fmt"
	"time"
)

func Retry(f func() error, seconds ...time.Duration) error {

	if err := f(); err == nil {
		return nil
	}

	tick := time.Tick(1 * time.Second)
	timeout := time.After(30 * time.Second)
	if len(seconds) == 2 {
		tick = time.Tick(seconds[0])
		timeout = time.After(seconds[1])
	} else if len(seconds) == 1 {
		tick = time.Tick(seconds[0])
	}

	for {
		select {
		case <-tick:
			if err := f(); err == nil {
				return nil
			}
		case <-timeout:
			return fmt.Errorf("timeout")
		}
	}
}
