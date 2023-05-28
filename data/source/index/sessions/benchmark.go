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

package sessions

import (
	"context"
	"fmt"
	"google.golang.org/protobuf/proto"
	"os"
	"time"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/data/source/index"
)

var benchOutput = "index-%d"
var benchBatcher SessionBatcher
var benchMeasures []map[string]time.Duration

type BenchBatcher struct {
	batcher SessionBatcher
}

func GetBenchSessionBatcher(b SessionBatcher) SessionBatcher {
	if benchBatcher == nil {
		benchBatcher = &BenchBatcher{
			batcher: b,
		}
	}
	return benchBatcher
}

func (bb *BenchBatcher) Notify(topic string, msg proto.Message) {
	if topic == "pydio:benchmark" {
		// TODO v4
		// benchMeasures = append(benchMeasures, msg.(map[string]time.Duration))
	} else {
		bb.batcher.Notify(topic, msg)
	}
}

func (bb *BenchBatcher) Flush(ctx context.Context, dao index.DAO) {
	log.Logger(ctx).Info("Flushing batch...")
	if len(benchMeasures) > 0 {
		file, err := os.OpenFile(fmt.Sprintf(benchOutput, time.Now().Unix()), os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.ModePerm)
		if err == nil {
			for i := range benchMeasures {
				m := benchMeasures[i]
				d := m["duration"]
				file.WriteString(fmt.Sprintf("%15d\n", d))
			}
		} else {
			log.Logger(ctx).Error("Failed to save benchmark results.")
		}
		file.Close()
		benchMeasures = []map[string]time.Duration{}
	}
	bb.batcher.Flush(ctx, dao)
}
