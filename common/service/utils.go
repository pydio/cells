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

	micro "github.com/micro/go-micro"
)

// 重试
//  第一个时间设置为重试  第二个时间设置为超时， 否则用默认的
func Retry(f func() error, seconds ...time.Duration) error {

	if err := f(); err == nil {
		return nil
	}

	tick := time.Tick(1 * time.Second)      // 默认 1 秒重试
	timeout := time.After(30 * time.Second) // 默认 30 秒超时
	if len(seconds) == 2 {
		tick = time.Tick(seconds[0])     // 第一个时间设置为重试
		timeout = time.After(seconds[1]) // 第二个时间设置为超时
	} else if len(seconds) == 1 {
		tick = time.Tick(seconds[0]) // 第一个时间设置为重试
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

// func AddMicroMeta(m micro.Service, k, v string) {
// 	meta := make(map[string]string)

// 	current := m.Options().Server.Options().Metadata

// 	for kk, vv := range current {
// 		meta[kk] = vv
// 	}

// 	meta[k] = v

// 	m.Init(micro.Metadata(meta))
// }

// 设置 go-micro 的 metadata
func AddMicroMeta(m micro.Service, k, v string) {
	current := m.Options().Server.Options().Metadata

	current[k] = v
}
