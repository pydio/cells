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

package brokerlog

import (
	"bufio"
	"errors"
	"io"
	"runtime"
	"time"
)

const bufferSize = 4096

var ErrTimeout = errors.New("natslog: read timeout")

type timeoutReader struct {
	b         *bufio.Reader
	t         time.Time
	ch        <-chan error
	closeFunc func() error
}

func newTimeoutReader(r io.ReadCloser) *timeoutReader {
	return &timeoutReader{
		b:         bufio.NewReaderSize(r, bufferSize),
		closeFunc: func() error { return r.Close() },
	}
}

// SetDeadline sets the deadline for all future Read calls.
func (r *timeoutReader) SetDeadline(t time.Time) {
	r.t = t
}

func (r *timeoutReader) Read(b []byte) (n int, err error) {
	if r.ch == nil {
		if r.t.IsZero() || r.b.Buffered() > 0 {
			return r.b.Read(b)
		}
		ch := make(chan error, 1)
		r.ch = ch
		go func() {
			_, err := r.b.Peek(1)
			ch <- err
		}()
		runtime.Gosched()
	}
	if r.t.IsZero() {
		err = <-r.ch // Block
	} else {
		select {
		case err = <-r.ch: // Poll
		default:
			select {
			case err = <-r.ch: // Timeout
			case <-time.After(time.Until(r.t)):
				return 0, ErrTimeout
			}
		}
	}
	r.ch = nil
	if r.b.Buffered() > 0 {
		n, _ = r.b.Read(b)
	}
	return
}

func (r *timeoutReader) Close() error {
	return r.closeFunc()
}
