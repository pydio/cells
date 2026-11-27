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
	"errors"
	"testing"
)

func TestWaitWriteResult(t *testing.T) {
	failed := errors.New("upload failed")

	t.Run("an error sent before writeDone is closed is always returned", func(t *testing.T) {
		for i := 0; i < 500; i++ {
			done, errs := make(chan bool, 1), make(chan error, 1)
			go func() {
				defer func() { close(done); close(errs) }()
				errs <- failed
			}()
			if e := WaitWriteResult(context.Background(), done, errs); e != failed {
				t.Fatalf("iteration %d: got %v, want %v", i, e, failed)
			}
		}
	})

	t.Run("channels closed without error is a success", func(t *testing.T) {
		done, errs := make(chan bool, 1), make(chan error, 1)
		close(errs)
		close(done)
		if e := WaitWriteResult(context.Background(), done, errs); e != nil {
			t.Fatal(e)
		}
	})

	t.Run("writeErr closed before writeDone waits for writeDone", func(t *testing.T) {
		done, errs := make(chan bool, 1), make(chan error, 1)
		close(errs)
		go func() { done <- true }()
		if e := WaitWriteResult(context.Background(), done, errs); e != nil {
			t.Fatal(e)
		}
	})

	t.Run("no channels: the write was completed by Close", func(t *testing.T) {
		if e := WaitWriteResult(context.Background(), nil, nil); e != nil {
			t.Fatal(e)
		}
	})

	t.Run("cancelling the context stops waiting", func(t *testing.T) {
		ctx, cancel := context.WithCancel(context.Background())
		cancel()
		if e := WaitWriteResult(ctx, make(chan bool), make(chan error)); !errors.Is(e, context.Canceled) {
			t.Fatalf("got %v, want context.Canceled", e)
		}
	})
}
