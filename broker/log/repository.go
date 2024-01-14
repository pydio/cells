package log

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/dao"
	log2 "github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/log"
)

type IndexService struct {
	dao.IndexDAO
}

func NewIndexService() (MessageRepository, error) {
	is := &IndexService{}
	return is, nil
}

// PutLog  adds a new LogMessage in the syslog index.
func (s *IndexService) PutLog(ctx context.Context, line *log.Log) error {
	dao := dao.IndexDAO{DAO(ctx)
	return s.dao.InsertOne(nil, line)
}

// ListLogs performs a query in the bleve index, based on the passed query string.
// It returns results as a stream of log.ListLogResponse for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func (s *IndexService) ListLogs(ctx context.Context, str string, page, size int32) (chan log.ListLogResponse, error) {
	ch, er := s.dao.FindMany(context.Background(), str, page*size, size, nil)
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
func (s *IndexService) DeleteLogs(query string) (int64, error) {
	c, er := s.dao.DeleteMany(nil, query)
	if er == nil {
		return int64(c), nil
	} else {
		return 0, er
	}
}

// AggregatedLogs performs a faceted query in the syslog repository. UNIMPLEMENTED.
func (s *IndexService) AggregatedLogs(_ string, _ string, _ int32) (chan log.TimeRangeResponse, error) {
	return nil, fmt.Errorf("unimplemented method")
}

func (s *IndexService) Resync(ctx context.Context, logger log2.ZapLogger) error {
	return s.dao.Resync(ctx, func(s string) {
		logTaskInfo(logger, s, "info")
	})
}

func (s *IndexService) Truncate(ctx context.Context, max int64, logger log2.ZapLogger) error {
	return s.dao.Truncate(ctx, max, func(s string) {
		logTaskInfo(logger, s, "info")
	})
}

func (s *IndexService) Close(ctx context.Context) error {
	return s.dao.Close(ctx)
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
