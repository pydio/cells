package tasks

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
)

type ReconnectingClient struct {
	parentCtx context.Context
	stopChan  chan bool
	closed    bool
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
		taskClient := jobs.NewJobServiceClient(cgrpc.GetClientConnFromCtx(s.parentCtx, common.ServiceJobs /*, cgrpc.WithCallTimeout(1*time.Minute)*/))
		ct, ca := context.WithCancel(s.parentCtx)
		defer ca()
		streamer, e := taskClient.PutTaskStream(ct)
		if e != nil {
			log.Logger(s.parentCtx).Error("Streamer PutTaskStream", zap.Error(e))
			<-time.After(10 * time.Second)
			ca()
			s.chanToStream(ch)
			return
		}
		if len(requeue) > 0 {
			streamer.Send(&jobs.PutTaskRequest{Task: requeue[0]})
			streamer.Recv()
		}
		for {
			select {
			case val := <-ch:
				if t, ok := val.(*jobs.Task); ok {
					task := t.WithoutLogs()
					e := streamer.Send(&jobs.PutTaskRequest{Task: task})
					if e != nil {
						log.Logger(s.parentCtx).Debug("Cannot post task - break and reconnect streamer", zap.Error(e))
						streamer.CloseSend()
						ca()
						if _, rE := taskClient.PutTask(s.parentCtx, &jobs.PutTaskRequest{Task: task}); rE == nil {
							log.Logger(s.parentCtx).Debug("Posted with a direct request")
						}
						if !s.closed {
							<-time.After(1 * time.Second)
							s.chanToStream(ch)
						}
						return
					}
					_, e = streamer.Recv()
					if e != nil {
						streamer.CloseSend()
						ca()
						log.Logger(s.parentCtx).Debug("Error while posting task - reconnect streamer", zap.Error(e))
						if _, rE := taskClient.PutTask(s.parentCtx, &jobs.PutTaskRequest{Task: task}); rE == nil {
							log.Logger(s.parentCtx).Debug("Posted with a direct request")
						}
						if !s.closed {
							<-time.After(1 * time.Second)
							s.chanToStream(ch)
						}
						return
					}
				} else if val != nil {
					log.Logger(s.parentCtx).Error("Could not cast value to jobs.Task", zap.Any("val", val))
				}
			case <-s.stopChan:
				s.closed = true
				return
			}
		}
	}()

}
