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
	"fmt"
	"strconv"
	"time"

	client "github.com/micro/go-micro/client"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/log"
)

type LogSyncer struct {
	serverServiceName string
	ctx               context.Context
	cli               client.Streamer
	logSyncerMessages chan map[string]string
}

func NewLogSyncer(ctx context.Context, serviceName string) *LogSyncer {
	syncer := &LogSyncer{
		serverServiceName: serviceName,
		ctx:               ctx,
		logSyncerMessages: make(chan map[string]string, 10),
	}

	go syncer.logSyncerEnd()
	go syncer.logSyncerWatch()

	return syncer
}

func (syncer *LogSyncer) logSyncerEnd() {
	<-syncer.ctx.Done()
	close(syncer.logSyncerMessages)
	syncer.cli.Close()
}

func (syncer *LogSyncer) logSyncerClientReconnect() {
	for {
		c := log.NewLogRecorderClient(syncer.serverServiceName, defaults.NewClient())
		cli, err := c.PutLog(syncer.ctx)
		if err != nil {
			<-time.After(1 * time.Second)
			fmt.Println("Failing")
			continue
		}
	}
}

func (syncer *LogSyncer) logSyncerWatch() {
	fmt.Println("HERE WE ARE")
	for {
		c := log.NewLogRecorderClient(syncer.serverServiceName, defaults.NewClient())
		cli, err := c.PutLog(syncer.ctx)
		if err != nil {
			<-time.After(1 * time.Second)
			fmt.Println("Failing")
			continue
		}

		fmt.Println("Reading messages")

		for m := range syncer.logSyncerMessages {
			fmt.Println("Reading Reading")
			err := cli.Send(&log.Log{Message: m})
			if err != nil {
				break
			}
		}

		fmt.Println("Returning")

		cli.Close()
		break
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
	// Add nano time for better sorting
	m["nano"] = strconv.Itoa(time.Now().Nanosecond())

	l.logSyncerMessages <- m
	return len(p), nil
}
