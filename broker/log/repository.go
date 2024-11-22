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

package log

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v5/common/proto/log"
	"github.com/pydio/cells/v5/common/storage/indexer"
	log2 "github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
)

type IndexRepository struct {
	indexer.Indexer
}

func (s *IndexRepository) Init(ctx context.Context, conf configx.Values) error {
	return s.Indexer.Init(ctx, conf)
}

func NewIndexRepository(idx indexer.Indexer) MessageRepository {
	return &IndexRepository{
		Indexer: idx,
	}
}

// PutLog  adds a new LogMessage in the syslog index.
func (s *IndexRepository) PutLog(ctx context.Context, line *log.Log) error {
	return s.Indexer.InsertOne(ctx, line)
}

func (s *IndexRepository) NewBatch(ctx context.Context, options ...indexer.BatchOption) (indexer.Batch, error) {
	return s.Indexer.NewBatch(ctx, options...)
}

// ListLogs performs a query in the bleve index, based on the passed query string.
// It returns results as a stream of log.ListLogResponse for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func (s *IndexRepository) ListLogs(ctx context.Context, str string, page int32, size int32) (chan log.ListLogResponse, error) {
	ch, er := s.Indexer.FindMany(ctx, str, page*size, size, "", false, nil)
	if er != nil {
		return nil, er
	}
	wrapped := make(chan log.ListLogResponse)
	go func() {
		defer close(wrapped)
		for res := range ch {
			wrapped <- log.ListLogResponse{LogMessage: res.(*log.LogMessage)}
		}
	}()
	return wrapped, nil
}

// DeleteLogs truncate logs based on a search query
func (s *IndexRepository) DeleteLogs(ctx context.Context, query string) (int64, error) {
	c, er := s.Indexer.DeleteMany(ctx, query)
	if er == nil {
		return int64(c), nil
	} else {
		return 0, er
	}
}

// AggregatedLogs performs a faceted query in the syslog repository. UNIMPLEMENTED.
func (s *IndexRepository) AggregatedLogs(_ context.Context, _ string, _ string, _ int32) (chan log.TimeRangeResponse, error) {
	return nil, fmt.Errorf("unimplemented method")
}

func (s *IndexRepository) Resync(ctx context.Context, logger log2.ZapLogger) error {
	return s.Indexer.Resync(ctx, func(s string) {
		logTaskInfo(logger, s, "info")
	})
}

func (s *IndexRepository) Truncate(ctx context.Context, max int64, logger log2.ZapLogger) error {
	return s.Indexer.Truncate(ctx, max, func(s string) {
		logTaskInfo(logger, s, "info")
	})
}

func (s *IndexRepository) Close(ctx context.Context) error {
	return s.Indexer.Close(ctx)
}

func (s *IndexRepository) Stats(ctx context.Context) map[string]interface{} {
	return s.Indexer.Stats(ctx)
}

func logTaskInfo(l log2.ZapLogger, msg string, level string) {
	if l == nil {
		fmt.Println("[pydio.grpc.log] " + msg)
	} else if level == "info" {
		l.Info(msg)
	} else if level == "error" {
		l.Error(msg)
	} else {
		l.Debug(msg)
	}
}
