package service

import (
	"errors"

	"github.com/micro/go-micro/registry"
	pb "github.com/pydio/cells/common/proto/registry"
)

type serviceWatcher struct {
	stream pb.Registry_WatchClient
	closed chan bool
}

func (s *serviceWatcher) Next() (*registry.Result, error) {
	// check if closed
	select {
	case <-s.closed:
		return nil, errors.New("watcher stopped")
	default:
	}

	r, err := s.stream.Recv()
	if err != nil {
		return nil, err
	}

	return &registry.Result{
		Action:  r.Action,
		Service: ToService(r.Service),
	}, nil
}

func (s *serviceWatcher) Stop() {
	select {
	case <-s.closed:
		return
	default:
		close(s.closed)
		s.stream.Close()
	}
}

func newWatcher(stream pb.Registry_WatchClient) registry.Watcher {
	return &serviceWatcher{
		stream: stream,
		closed: make(chan bool),
	}
}
