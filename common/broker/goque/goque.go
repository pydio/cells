/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package goque

import (
	"context"
	"net/url"
	"path/filepath"
	"sync"
	"time"

	"github.com/beeker1121/goque"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/controller"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

func init() {
	queues = map[string]*serviceQueue{}
	ql = &sync.Mutex{}

	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}
		mgr.RegisterQueue("fifo", controller.WithCustomOpener(func(ctx context.Context, url string) (broker.AsyncQueuePool, error) {
			return broker.NewWrappedPool(url, broker.MakeWrappedOpener(&gq{}))
		}))
	})

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
	ctx     context.Context
	qu      *goque.Queue
	pQu     *goque.PrefixQueue
	prefix  string
	dataDir string
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

func (g *gq) Consume(callback func(context.Context, ...broker.Message)) error {
	var erCount int
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
				erCount++
				if errors.Is(er, goque.ErrDBClosed) {
					log.Logger(g.ctx).Warn("[goque] Closing consumer on closed DB " + g.prefix)
					return
				}
				if !errors.Is(er, goque.ErrEmpty) && !errors.Is(er, goque.ErrOutOfBounds) {
					log.Logger(g.ctx).Error("[goque] Received error while consuming messages"+g.prefix, zap.Error(er))
				} else if errors.Is(er, goque.ErrOutOfBounds) && erCount%500 == 0 {
					log.Logger(g.ctx).Error("[goque] Received many errors while consuming messages (prefix:"+g.prefix+"), data may be corrupted, you may have to restart and clear the fifo corresponding folder: "+g.dataDir, zap.Error(er))
				}
				<-time.After(500 * time.Millisecond)
				continue
			}
			if msg, er := broker.DecodeToBrokerMessage(it.Value); er == nil {
				callback(g.ctx, msg)
			} else {
				log.Logger(g.ctx).Error("[goque] Cannot decode message in "+g.prefix, zap.Error(er))
			}
		}
	}()
	return nil
}

func (g *gq) Close(ctx context.Context) error {
	if g.qu != nil {
		return g.qu.Close()
	} else if g.pQu != nil {
		return g.pQu.Close()
	}
	return nil
}

func (g *gq) OpenURL(ctx context.Context, u *url.URL) (broker.AsyncQueue, error) {
	//srv := u.Query().Get("serviceName")
	//if srv == "" {
	//	return nil, fmt.Errorf("please provide a service name")
	//}
	streamName := u.Query().Get("name")
	if streamName == "" {
		return nil, errors.New("please provide a stream name")
	}
	queueName := "fifo-" + streamName
	prefix := u.Query().Get("prefix")
	if prefix == "<no value>" {
		prefix = ""
	}

	// Compute a cached identifier : use full URL, but remove prefix
	IDU := *u
	qq := IDU.Query()
	qq.Del("prefix")
	IDU.RawQuery = qq.Encode()
	id := IDU.String()

	ql.Lock()
	if q, ok := queues[id]; ok {
		q.rc++
		ql.Unlock()
		return &gq{
			ctx:    ctx,
			qu:     q.q,
			pQu:    q.pq,
			prefix: prefix,
		}, nil
	}

	dataDir := filepath.Join(u.Path, queueName)

	var sq *serviceQueue
	var pq *goque.PrefixQueue
	var q *goque.Queue
	var err error
	if prefix != "" {
		pq, err = goque.OpenPrefixQueue(dataDir)
	} else {
		q, err = goque.OpenQueue(dataDir)
	}
	if err != nil {
		log.Logger(ctx).Error("Could not open GOQUE", zap.String("dataDir", dataDir), zap.Bool("isPrefix", prefix != ""), zap.Error(err))
		ql.Unlock()
		return nil, err
	}
	sq = &serviceQueue{q: q, pq: pq, rc: 0}
	queues[id] = sq
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
		ctx:     ctx,
		qu:      q,
		pQu:     pq,
		prefix:  prefix,
		dataDir: dataDir,
	}, nil
}
