package service

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"

	proto "github.com/pydio/cells/common/service/proto"
)

// StatusHandler provides functionality for getting the status of a service
type StatusHandler struct {
	address string
}

// SetAddress for a service
func (sh *StatusHandler) SetAddress(a string) {
	sh.address = a
}

// Status of the service - If we reach this point, it means that this micro service is correctly up and running
func (sh *StatusHandler) Status(ctx context.Context, in *empty.Empty, out *proto.StatusResponse) error {
	out.OK = true
	out.Address = sh.address

	return nil
}

// StopHandler provides functionality for stopping a service
type StopHandler struct {
	s Service
}

// SetService handler
func (s *StopHandler) SetService(srv Service) {
	s.s = srv
}

// ProcessEvent handler
func (s *StopHandler) ProcessEvent(ctx context.Context, in *proto.StopEvent) error {
	if s.s.Name() == in.ServiceName {
		s.s.Stop()
	}
	return nil
}
