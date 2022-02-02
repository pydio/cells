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
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"io"
	"math"

	"github.com/pydio/cells/v4/common/client/grpc"

	"github.com/h2non/filetype"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

const mimeReadLimit = 8192

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

func (m *TeeMimeReader) SetLimit(size int) {
	m.limit = size
}

func (m *TeeMimeReader) Wait() chan *MimeResult {
	m.waiter = make(chan *MimeResult, 1)
	return m.waiter
}

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

var mimeMetaClient tree.NodeReceiverClient

func WrapReaderForMime(ctx context.Context, clone *tree.Node, reader io.Reader) io.Reader {
	if IsUnitTestEnv {
		return reader
	}
	if mimeMetaClient == nil {
		mimeMetaClient = tree.NewNodeReceiverClient(grpc.GetClientConnFromCtx(ctx, common.ServiceGrpcNamespace_+common.ServiceMeta))
	}
	bgCtx := metadata.NewBackgroundWithMetaCopy(ctx)
	bgCtx = clientcontext.WithClientConn(bgCtx, clientcontext.GetClientConn(ctx))
	bgCtx = servicecontext.WithRegistry(bgCtx, servicecontext.GetRegistry(ctx))
	return NewTeeMimeReader(reader, func(result *MimeResult) {
		if result.GetError() == nil && result.GetMime() != "" {
			// Store in metadata service
			clone.MetaStore = make(map[string]string, 1)
			clone.MustSetMeta(common.MetaNamespaceMime, result.GetMime())
			if _, e := mimeMetaClient.CreateNode(bgCtx, &tree.CreateNodeRequest{
				Node:           clone,
				UpdateIfExists: true,
			}); e == nil {
				log.Logger(ctx).Info("Stored mime type for node", clone.ZapUuid(), clone.ZapPath(), zap.String("mime", result.GetMime()))
			} else {
				log.Logger(ctx).Error("Could not update mime for node", zap.Error(e), clone.ZapUuid(), clone.ZapPath(), zap.String("mime", result.GetMime()))
			}
		}
	})
}
