package log

import (
	"context"
	"fmt"

	log2 "github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/indexer"
)

type IndexRepository struct {
	name string
}

func NewIndexRepository(name string) MessageRepository {
	return &IndexRepository{
		name: name,
	}
}

// PutLog  adds a new LogMessage in the syslog index.
func (s *IndexRepository) PutLog(ctx context.Context, line *log.Log) error {
	idx, err := manager.Resolve[indexer.Indexer](ctx, manager.WithName("logs"))
	if err != nil {
		return err
	}
	return idx.InsertOne(ctx, line)
}

// ListLogs performs a query in the bleve index, based on the passed query string.
// It returns results as a stream of log.ListLogResponse for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func (s *IndexRepository) ListLogs(ctx context.Context, str string, page int32, size int32) (chan log.ListLogResponse, error) {
	idx, err := manager.Resolve[indexer.Indexer](ctx, manager.WithName(s.name))
	if err != nil {
		return nil, err
	}
	ch, er := idx.FindMany(ctx, str, page*size, size, "", false, nil)
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
	idx, err := manager.Resolve[indexer.Indexer](ctx, manager.WithName("logs"))
	if err != nil {
		return 0, err
	}

	c, er := idx.DeleteMany(ctx, query)
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
	idx, err := manager.Resolve[indexer.Indexer](ctx, manager.WithName(s.name))
	if err != nil {
		return err
	}

	return idx.Resync(ctx, func(s string) {
		logTaskInfo(logger, s, "info")
	})
}

func (s *IndexRepository) Truncate(ctx context.Context, max int64, logger log2.ZapLogger) error {
	idx, err := manager.Resolve[indexer.Indexer](ctx, manager.WithName(s.name))
	if err != nil {
		return err
	}

	return idx.Truncate(ctx, max, func(s string) {
		logTaskInfo(logger, s, "info")
	})
}

func (s *IndexRepository) Close(ctx context.Context) error {
	idx, err := manager.Resolve[indexer.Indexer](ctx, manager.WithName(s.name))
	if err != nil {
		return err
	}

	return idx.Close(ctx)
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
