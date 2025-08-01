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

package service

import (
	"context"
	"net/url"
	"sync"
	"sync/atomic"
	"time"

	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/log"
	log2 "github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type opener struct{}

func (o *opener) OpenSync(ctx context.Context, u *url.URL) (log2.WriteSyncerCloser, error) {
	if log2.ReadyLogSyncerContext == nil {
		return nil, errors.New("logSyncerContext not ready yet")
	}
	serviceName := u.Query().Get("service")
	if serviceName == "" {
		return nil, errors.New("logger service:// must provide a ?service query parameter")
	}
	sCtx := propagator.ForkContext(log2.ReadyLogSyncerContext, ctx)
	return NewLogSyncer(sCtx, serviceName), nil
}

func init() {
	log2.DefaultURLMux().RegisterSync("service", &opener{})
	sBufLoc = &sync.Mutex{}
}

type buffered struct {
	serviceName string
	*log.Log
}

var (
	servicesBuf []*buffered
	sBufLoc     *sync.Mutex
)

type LogSyncer struct {
	serviceName string
	ctx         context.Context
	cli         log.LogRecorder_PutLogClient

	logSyncerMessages chan *log.Log
	buf               []*log.Log
	reconnecting      int32
	closed            bool
}

func NewLogSyncer(ctx context.Context, serviceName string) *LogSyncer {
	syncer := &LogSyncer{
		serviceName:       serviceName,
		ctx:               ctx,
		logSyncerMessages: make(chan *log.Log, 100),
	}
	var cleared []*buffered
	for _, pending := range servicesBuf {
		if pending.serviceName == serviceName {
			syncer.buf = append(syncer.buf, pending.Log)
		} else {
			cleared = append(cleared, pending)
		}
	}
	sBufLoc.Lock()
	servicesBuf = cleared
	sBufLoc.Unlock()

	go syncer.logSyncerWatch()
	go syncer.logSyncerClientReconnect()

	return syncer
}

func (syncer *LogSyncer) logSyncerClientReconnect() {
	if syncer.closed {
		return
	}

	atomic.StoreInt32(&syncer.reconnecting, 1)

	conn := grpc.ResolveConn(syncer.ctx, syncer.serviceName)
	if conn == nil {
		return
	}

	c := log.NewLogRecorderClient(grpc.ResolveConn(syncer.ctx, syncer.serviceName))

	cli, err := c.PutLog(syncer.ctx)
	if err != nil {
		<-time.After(1 * time.Second)
		syncer.logSyncerClientReconnect()
		return
	}

	// Emptying buffer
	for i, m := range syncer.buf {
		err := cli.Send(m)
		if err != nil {
			syncer.buf = syncer.buf[i:]
			syncer.logSyncerClientReconnect()
			return
		}
	}

	syncer.buf = nil
	syncer.cli = cli

	atomic.StoreInt32(&syncer.reconnecting, 0)
}

func (syncer *LogSyncer) logSyncerWatch() {
	for m := range syncer.logSyncerMessages {
		if syncer.cli == nil {
			syncer.buf = append(syncer.buf, m)
			continue
		}

		err := syncer.cli.Send(m)
		if err != nil {
			// syncer.cli.Close()
			syncer.cli = nil

			syncer.buf = append(syncer.buf, m)

			// Check if we need to send a reconnect message
			if atomic.LoadInt32(&syncer.reconnecting) == 0 {
				go syncer.logSyncerClientReconnect()
			}
		}
	}
}

func (syncer *LogSyncer) Sync() error {
	return nil
}

func (syncer *LogSyncer) Close() error {
	if syncer.closed {
		return nil
	}
	syncer.closed = true
	close(syncer.logSyncerMessages)
	return nil
}

// Write implements the io.Writer interface to be used as a Syncer by zap logging.
// We must copy the []byte as a underlying buffer can mess up things if logs are called very quickly.
func (syncer *LogSyncer) Write(p []byte) (n int, err error) {
	clone := make([]byte, len(p))
	written := copy(clone, p)
	l := &log.Log{
		Nano:    int32(time.Now().Nanosecond()),
		Message: clone,
	}
	if syncer.closed {
		servicesBuf = append(servicesBuf, &buffered{serviceName: syncer.serviceName, Log: l})
		return written, nil
	}
	select {
	case syncer.logSyncerMessages <- l:
	default:
	}
	return written, nil
}
