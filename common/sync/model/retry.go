/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package model

import (
	"context"
	"fmt"
	"time"
)

// Retry tries to apply an operation as many times as required
func Retry(f func() error, seconds ...time.Duration) error {

	if e := f(); e == nil {
		return nil
	}
	tickerTime := 1 * time.Second
	timeout := time.After(30 * time.Second)
	if len(seconds) == 2 {
		tickerTime = seconds[0]
		timeout = time.After(seconds[1])
	} else if len(seconds) == 1 {
		tickerTime = seconds[0]
	}
	ticker := time.NewTicker(tickerTime)
	defer ticker.Stop()

	var lastErr error
	for {
		select {
		case <-ticker.C:
			if lastErr = f(); lastErr == nil {
				return nil
			}
		case <-timeout:
			if lastErr != nil {
				return lastErr
			} else {
				return fmt.Errorf("timeout")
			}
		}
	}
}

// RetryWithCtx does like Retry with an additional cancellable context
func RetryWithCtx(ctx context.Context, f func(retry int) error, seconds ...time.Duration) error {

	i := 0
	if e := f(i); e == nil {
		return nil
	}
	timeout := time.After(30 * time.Second)
	tickerTime := 1 * time.Second
	if len(seconds) == 2 {
		tickerTime = seconds[0]
		timeout = time.After(seconds[1])
	} else if len(seconds) == 1 {
		tickerTime = seconds[0]
	}
	ticker := time.NewTicker(tickerTime)
	defer ticker.Stop()

	var lastErr error
	for {
		select {
		case <-ticker.C:
			if lastErr = f(i); lastErr == nil {
				return nil
			}
			i++
		case <-timeout:
			if lastErr != nil {
				return lastErr
			} else {
				return fmt.Errorf("timeout")
			}
		case <-ctx.Done():
			if lastErr != nil {
				return lastErr
			} else {
				return ctx.Err()
			}
		}
	}
}
