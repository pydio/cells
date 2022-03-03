package fork

import (
	"context"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/fork"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Server struct {
	id   string
	name string
	meta map[string]string

	ctx     context.Context
	process *fork.Process

	s *ForkServer
}

func NewServer(ctx context.Context) server.Server {
	return server.NewServer(ctx, &Server{
		id:   "fork-" + uuid.New(),
		name: "fork",
		meta: server.InitPeerMeta(),
		ctx:  ctx,
		s:    &ForkServer{},
	})
}

func (s *Server) Serve() error {

	var opts []fork.Option
	if config.Get("services", s.s.name, "debugFork").Bool() {
		opts = append(opts, fork.WithDebug())
	}
	if len(config.DefaultBindOverrideToFlags()) > 0 {
		opts = append(opts, fork.WithCustomFlags(config.DefaultBindOverrideToFlags()...))
	}
	opts = append(opts, fork.WithRetries(3))
	s.process = fork.NewProcess(s.ctx, s.s.name, opts...)

	var e error
	go func() {
		e = s.process.StartAndWait()
	}()
	return e
}

func (s *Server) Stop() error {
	if s.process != nil {
		s.process.Stop()
	}
	return nil
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Type() server.ServerType {
	return server.ServerType_FORK
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
	v, ok := i.(**ForkServer)
	if !ok {
		return false
	}

	*v = s.s

	return true
}

type ForkServer struct {
	name string
}

func (f *ForkServer) RegisterForkParam(name string) {
	f.name = name
}
