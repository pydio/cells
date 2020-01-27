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
	"strconv"
	"time"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/log"
)

type LogSyncer struct {
	serverServiceName string

	logSyncerMessages chan map[string]string
}

func NewLogSyncer(serviceName string) *LogSyncer {

	syncer := LogSyncer{serverServiceName: serviceName}

	syncer.logSyncerMessages = make(chan map[string]string, 1000)

	initLogSyncer(&syncer)

	return &syncer
}

func initLogSyncer(syncer *LogSyncer) {
	go logSyncerWatch(syncer)
}

func logSyncerWatch(syncer *LogSyncer) {
	for {
		c := log.NewLogRecorderClient(syncer.serverServiceName, defaults.NewClient())
		cli, err := c.PutLog(context.Background())
		if err != nil {
			<-time.After(1 * time.Second)
			continue
		}

		for m := range syncer.logSyncerMessages {
			err := cli.Send(&log.Log{Message: m})
			if err != nil {
				break
			}
		}
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
