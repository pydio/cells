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

package nodes

import (
	"context"
	"io"
	"math"
	"net/http"
	"regexp"

	"github.com/h2non/filetype"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

const (
	mimeReadLimit = 8192
)

var defaultRx *regexp.Regexp

func init() {
	defaultRx = regexp.MustCompile(`(application|binary)/octet-stream`)
}

type MimeResult struct {
	mime string
	err  error
}

func (m *MimeResult) GetMime() string {
	return m.mime
}

func (m *MimeResult) GetError() error {
	return m.err
}

// TeeMimeReader dynamically looks up for mimetype while consuming the io.Reader
type TeeMimeReader struct {
	r      io.Reader
	cb     func(result *MimeResult)
	waiter chan *MimeResult
	limit  int

	data      []byte
	loadError error
	loaded    chan bool
	done      bool
}

// NewTeeMimeReader creates a TeeMimeReader from an existing reader and calls the callbackRoutine once
// the mimetype is guessed
func NewTeeMimeReader(reader io.Reader, callbackRoutine func(result *MimeResult)) *TeeMimeReader {
	mr := &TeeMimeReader{
		r:      reader,
		cb:     callbackRoutine,
		data:   make([]byte, 0, 8192),
		loaded: make(chan bool, 1),
		limit:  mimeReadLimit,
	}
	go func() {
		<-mr.loaded
		//fmt.Printf("Stored %d bytes in buffer - Error: %v\n", len(mr.data), mr.loadError)
		kind, _ := filetype.Match(mr.data)
		mime := kind.MIME.Value
		if mime == "" || defaultRx.MatchString(mime) {
			mime = http.DetectContentType(mr.data)
		}
		if callbackRoutine != nil {
			callbackRoutine(&MimeResult{mime: mime, err: mr.loadError})
		}
		if mr.waiter != nil {
			mr.waiter <- &MimeResult{mime: mime, err: mr.loadError}
			close(mr.waiter)
		}
	}()
	return mr
}

// SetLimit can override default mimeReadLimit (used mainly for testing)
func (m *TeeMimeReader) SetLimit(size int) {
	m.limit = size
}

// Wait returns a blocking chan until a *MimeResult is returned
func (m *TeeMimeReader) Wait() chan *MimeResult {
	m.waiter = make(chan *MimeResult, 1)
	return m.waiter
}

// Read implements io.Reader interface by calling underlying reader Read.
func (m *TeeMimeReader) Read(p []byte) (n int, err error) {
	n, err = m.r.Read(p)
	if n > 0 && !m.done {
		limit := int(math.Min(float64(n), float64(mimeReadLimit-len(m.data))))
		if len(m.data) < mimeReadLimit {
			//fmt.Println("Appending data", limit)
			m.data = append(m.data, p[:limit]...)
		}
		if len(m.data) == mimeReadLimit {
			m.done = true
			close(m.loaded)
		}
	}
	if err != nil && !m.done {
		if err != io.EOF {
			m.loadError = err
		}
		//fmt.Println("Close now", n, err)
		m.done = true
		close(m.loaded)
	}
	return
}

// WrapReaderForMime wraps a reader in a TeeMimeReader with a preset callback that stores detected mime in Metadata.
func WrapReaderForMime(ctx context.Context, clone *tree.Node, reader io.Reader) io.Reader {
	if IsUnitTestEnv {
		return reader
	}
	bgCtx := propagator.ForkedBackgroundWithMeta(ctx)
	return NewTeeMimeReader(reader, func(result *MimeResult) {
		mime := "application/octet-stream"
		if result.GetError() == nil && result.GetMime() != "" {
			mime = result.GetMime()
		}
		// Store in metadata service
		MustCoreMetaSet(bgCtx, clone.Uuid, common.MetaNamespaceMime, mime, clone.HasMetaKey(common.MetaNamespaceDatasourceInternal))
	})
}

// IsDefaultMime checks if cType is not empty and one of "application/octet-stream", "binary/octet-stream"
func IsDefaultMime(cType string) bool {
	return cType != "" && !defaultRx.MatchString(cType)
}
