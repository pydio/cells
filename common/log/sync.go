/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package log

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/common/service/defaults"
)

type LogSyncer struct {
	serverServiceName string

	logSyncerMutex    *sync.Mutex
	logSyncerClient   log.LogRecorder_PutLogClient
	logSyncerMessages chan map[string]string
	logSyncerErrors   chan error
}

func NewLogSyncer(serviceName string) *LogSyncer {

	syncer := LogSyncer{serverServiceName: serviceName}

	syncer.logSyncerMutex = &sync.Mutex{}
	syncer.logSyncerMessages = make(chan map[string]string)
	syncer.logSyncerErrors = make(chan error)

	initLogSyncer(&syncer)

	return &syncer
}

func initLogSyncer(syncer *LogSyncer) {
	go logSyncerWatch(syncer)
	go logSyncerSync(syncer)
}

func logSyncerWatch(syncer *LogSyncer) {
	syncer.logSyncerMutex.Lock()

	for {
		//<-time.After(2 * time.Second)
		c := log.NewLogRecorderClient(syncer.serverServiceName, defaults.NewClient())
		cli, err := c.PutLog(context.Background(), client.WithRequestTimeout(1*time.Hour))

		if err != nil {
			continue
		}

		syncer.logSyncerClient = cli
		syncer.logSyncerMutex.Unlock()

		for err := range syncer.logSyncerErrors {
			if err == nil {
				continue
			}
			if cli != nil {
				cli.Close()
			}
			break
		}

		syncer.logSyncerMutex.Lock()
	}
}

func logSyncerSync(syncer *LogSyncer) {

	for m := range syncer.logSyncerMessages {
		syncer.logSyncerMutex.Lock()
		syncer.logSyncerErrors <- syncer.logSyncerClient.Send(&log.Log{
			Message: m,
		})
		syncer.logSyncerMutex.Unlock()
	}
}

func (l *LogSyncer) Write(p []byte) (n int, err error) {

	var d map[string]interface{}
	err = json.Unmarshal(p, &d)

	m := make(map[string]string)
	for key, value := range d {
		switch value := value.(type) {
		case string:
			m[key] = value
		}
	}

	go func() {
		l.logSyncerMessages <- m
	}()
	return len(p), nil
}
