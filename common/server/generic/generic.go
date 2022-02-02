package generic

import (
	"context"

	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Server struct {
	id   string
	name string
	meta map[string]string

	cancel   context.CancelFunc
	handlers []func() error
}

type Handler interface {
	Start() error
	Stop() error
}

func New(ctx context.Context) server.Server {
	ctx, cancel := context.WithCancel(ctx)
	return server.NewServer(ctx, &Server{
		id:   "generic",
		name: "generic-" + uuid.New(),
		meta: server.InitPeerMeta(),

		cancel: cancel,
	})
}

func (s *Server) RegisterHandler(h Handler) {
	s.Handle(h.Start)
}

func (s *Server) Handle(h func() error) {
	s.handlers = append(s.handlers, h)
}

func (s *Server) Serve() error {
	go func() {
		defer s.cancel()

		for _, handler := range s.handlers {
			go handler()
		}
	}()

	return nil
}

func (s *Server) Stop() error {
	return nil
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Type() server.ServerType {
	return server.ServerType_GENERIC
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) Address() []string {
	return []string{}
}

func (s *Server) Endpoints() []string {
	return []string{}
}

func (s *Server) As(i interface{}) bool {
	p, ok := i.(**Server)
	if !ok {
		return false
	}

	*p = s
	return true
}
