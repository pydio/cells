package tasks

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
)

type ReconnectingClient struct {
	parentCtx context.Context
	stopChan  chan bool
}

func NewTaskReconnectingClient(parentCtx context.Context) *ReconnectingClient {
	r := &ReconnectingClient{
		parentCtx: parentCtx,
		stopChan:  make(chan bool),
	}
	return r
}

func (s *ReconnectingClient) StartListening(tasksChan chan interface{}) {
	s.chanToStream(tasksChan)
}

func (s *ReconnectingClient) Stop() {
	s.stopChan <- true
}

func (s *ReconnectingClient) chanToStream(ch chan interface{}, requeue ...*jobs.Task) {

	go func() {
		log.Logger(s.parentCtx).Debug("Connecting with TaskStreamer Client")
		taskClient := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
		ctx, cancel := context.WithTimeout(s.parentCtx, 120*time.Second)
		defer cancel()

		streamer, e := taskClient.PutTaskStream(ctx)
		if e != nil {
			log.Logger(s.parentCtx).Error("Streamer PutTaskStream", zap.Error(e))
			<-time.After(10 * time.Second)
			s.chanToStream(ch)
			return
		}
		defer streamer.Close()
		if len(requeue) > 0 {
			streamer.Send(&jobs.PutTaskRequest{Task: requeue[0]})
			streamer.Recv()
		}
		for {
			select {
			case val := <-ch:
				if task, ok := val.(*jobs.Task); ok {
					e := streamer.Send(&jobs.PutTaskRequest{Task: task})
					if e != nil {
						log.Logger(s.parentCtx).Debug("Cannot post task - break and reconnect streamer", zap.Error(e))
						<-time.After(1 * time.Second)
						s.chanToStream(ch, task)
						return
					}
					_, e = streamer.Recv()
					if e != nil {
						log.Logger(s.parentCtx).Debug("Error while posting task - reconnect streamer", zap.Error(e))
						<-time.After(1 * time.Second)
						s.chanToStream(ch, task)
						return
					}
				} else {
					log.Logger(s.parentCtx).Error("Could not cast value to jobs.Task", zap.Any("val", val))
				}
			case <-s.stopChan:
				log.Logger(s.parentCtx).Debug("Stopping task client reconnection")
				return
			}
		}
	}()

}
