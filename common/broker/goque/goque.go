package goque

import (
	"context"
	"fmt"
	"net/url"
	"path/filepath"
	"sync"
	"time"

	"github.com/beeker1121/goque"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	config2 "github.com/pydio/cells/v4/common/runtime"
)

func init() {
	broker.DefaultURLMux().Register("file", &gq{})
	queues = map[string]*serviceQueue{}
	ql = &sync.Mutex{}
}

type serviceQueue struct {
	q  *goque.Queue
	pq *goque.PrefixQueue
	rc int
}

var (
	queues map[string]*serviceQueue
	ql     *sync.Mutex
)

type gq struct {
	ctx    context.Context
	qu     *goque.Queue
	pQu    *goque.PrefixQueue
	prefix string
}

func (g *gq) Push(ctx context.Context, msg proto.Message) error {
	var er error
	if g.prefix != "" {
		_, er = g.pQu.Enqueue([]byte(g.prefix), broker.EncodeProtoWithContext(ctx, msg))
	} else {
		_, er = g.qu.Enqueue(broker.EncodeProtoWithContext(ctx, msg))
	}
	return er
}

func (g *gq) PushRaw(_ context.Context, message broker.Message) error {
	var er error
	if g.prefix != "" {
		_, er = g.pQu.Enqueue([]byte(g.prefix), broker.EncodeBrokerMessage(message))
	} else {
		_, er = g.qu.Enqueue(broker.EncodeBrokerMessage(message))
	}
	return er
}

func (g *gq) Consume(callback func(...broker.Message)) error {
	go func() {
		for {
			select {
			case <-g.ctx.Done():
				log.Logger(g.ctx).Debug("[goque] Closing consumer on context done" + g.prefix)
				return
			default:
			}
			var it *goque.Item
			var er error
			if g.prefix != "" {
				it, er = g.pQu.Dequeue([]byte(g.prefix))
			} else {
				it, er = g.qu.Dequeue()
			}
			if er != nil {
				if er == goque.ErrDBClosed {
					log.Logger(g.ctx).Debug("[goque] Closing consumer on DB closed" + g.prefix)
					return
				}
				if er != goque.ErrEmpty && er != goque.ErrOutOfBounds {
					log.Logger(g.ctx).Error("[goque] Received error while consuming messages"+g.prefix, zap.Error(er))
				}
				<-time.After(500 * time.Millisecond)
				continue
			}
			if msg, er := broker.DecodeToBrokerMessage(it.Value); er == nil {
				callback(msg)
			} else {
				log.Logger(g.ctx).Error("[goque] Cannot decode message in "+g.prefix, zap.Error(er))
			}
		}
	}()
	return nil
}

func (g *gq) OpenURL(ctx context.Context, u *url.URL) (broker.AsyncQueue, error) {
	srv := u.Query().Get("serviceName")
	if srv == "" {
		return nil, fmt.Errorf("please provide a service name")
	}
	streamName := u.Query().Get("name")
	if streamName == "" {
		return nil, fmt.Errorf("please provide a stream name")
	}
	queueName := "fifo-" + streamName
	prefix := u.Query().Get("prefix")

	ql.Lock()
	if q, ok := queues[queueName]; ok {
		q.rc++
		ql.Unlock()
		return &gq{
			ctx:    ctx,
			qu:     q.q,
			pQu:    q.pq,
			prefix: prefix,
		}, nil
	}

	srvDir := config2.MustServiceDataDir(srv)
	dataDir := filepath.Join(srvDir, queueName)
	var sq *serviceQueue
	var pq *goque.PrefixQueue
	var q *goque.Queue
	var err error
	if prefix != "" {
		pq, err = goque.OpenPrefixQueue(dataDir)
	} else {
		q, err = goque.OpenQueue(filepath.Join(srvDir, queueName))
	}
	sq = &serviceQueue{q: q, pq: pq, rc: 0}
	if err != nil {
		return nil, err
	}
	queues[queueName] = sq
	ql.Unlock()
	go func() {
		<-ctx.Done()
		sq.rc--
		if sq.rc == 0 {
			if pq != nil {
				_ = pq.Close()
			} else {
				_ = q.Close()
			}
		}
	}()
	return &gq{
		ctx:    ctx,
		qu:     q,
		pQu:    pq,
		prefix: prefix,
	}, nil
}
