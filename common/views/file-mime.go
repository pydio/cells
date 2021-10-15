package views

import (
	"context"
	"io"
	"math"

	"github.com/h2non/filetype"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	context2 "github.com/pydio/cells/common/utils/context"
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
	if mimeMetaClient == nil {
		mimeMetaClient = tree.NewNodeReceiverClient(registry.GetClient(common.ServiceMeta))
	}
	bgCtx := context2.NewBackgroundWithMetaCopy(ctx)
	return NewTeeMimeReader(reader, func(result *MimeResult) {
		if result.GetError() == nil && result.GetMime() != "" {
			// Store in metadata service
			clone.MetaStore = make(map[string]string, 1)
			clone.SetMeta(common.MetaNamespaceMime, result.GetMime())
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
