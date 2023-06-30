package goque

import (
	"context"
	"fmt"
	"go.uber.org/zap"
	"net/url"
	"path/filepath"
	"sync"
	"time"

	"github.com/beeker1121/goque"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/log"
	config2 "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/queue"
)

func init() {
	queue.DefaultURLMux().Register("file", &gq{})
	queues = map[string]*serviceQueue{}
	ql = &sync.Mutex{}
}

type serviceQueue struct {
	q  *goque.PrefixQueue
	rc int
}

var (
	queues map[string]*serviceQueue
	ql     *sync.Mutex
)

type gq struct {
	ctx        context.Context
	qu         *goque.PrefixQueue
	streamName string
}

func (g *gq) Push(ctx context.Context, msg proto.Message) error {
	_, er := g.qu.Enqueue([]byte(g.streamName), queue.EncodeProtoWithContext(ctx, msg))
	return er
}

func (g *gq) Consume(callback queue.Consumer) error {
	go func() {
		for {
			select {
			case <-g.ctx.Done():
				log.Logger(g.ctx).Debug("[goque] Closing consumer on context done" + g.streamName)
				return
			default:
			}
			it, er := g.qu.Dequeue([]byte(g.streamName))
			if er != nil {
				if er == goque.ErrDBClosed {
					log.Logger(g.ctx).Debug("[goque] Closing consumer on DB closed" + g.streamName)
					return
				}
				if er != goque.ErrEmpty && er != goque.ErrOutOfBounds {
					log.Logger(g.ctx).Error("[goque] Received error while consuming messages"+g.streamName, zap.Error(er))
				}
				<-time.After(500 * time.Millisecond)
				continue
			}
			if msg, er := queue.DecodeToBrokerMessage(it.Value); er == nil {
				callback(msg)
			} else {
				log.Logger(g.ctx).Error("[goque] Cannot decode message in "+g.streamName, zap.Error(er))
			}
		}
	}()
	return nil
}

func (g *gq) OpenURL(ctx context.Context, u *url.URL) (queue.Queue, error) {
	srv := u.Query().Get("serviceName")
	if srv == "" {
		return nil, fmt.Errorf("please provide a service name")
	}
	streamName := u.Query().Get("name")
	if streamName == "" {
		return nil, fmt.Errorf("please provide a stream name")
	}
	ql.Lock()
	if q, ok := queues[srv]; ok {
		q.rc++
		ql.Unlock()
		return &gq{qu: q.q, streamName: streamName, ctx: ctx}, nil
	}

	srvDir := config2.MustServiceDataDir(srv)
	q, err := goque.OpenPrefixQueue(filepath.Join(srvDir, "fifo"))
	if err != nil {
		return nil, err
	}
	sq := &serviceQueue{q: q, rc: 0}
	queues[srv] = sq
	ql.Unlock()
	go func() {
		<-ctx.Done()
		sq.rc--
		fmt.Println("RELEASE ", srv)
		if sq.rc == 0 {
			fmt.Println("CLOSE QUUEU FOR ", srv)
			_ = q.Close()
		}
	}()
	return &gq{
		ctx:        ctx,
		qu:         q,
		streamName: streamName,
	}, nil
}
