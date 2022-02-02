package fork

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/fork"
	"strings"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/server"
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

func buildForkStartParams(serviceName string) []string {

	r := fmt.Sprintf("grpc://%s", viper.GetString("grpc.address"))
	b := fmt.Sprintf("grpc://%s", viper.GetString("grpc.address"))
	if !strings.HasPrefix(viper.GetString("broker"), "mem://") {
		b = viper.GetString("broker")
	}

	params := []string{
		"start",
		"--fork",
		"--grpc.address", ":0",
		"--http.address", ":0",
		"--registry", r,
		"--broker", b,
	}

	if viper.IsSet("config") {
		params = append(params, "--config", viper.GetString("config"))
	}

	if viper.GetBool("enable_metrics") {
		params = append(params, "--enable_metrics")
	}
	if viper.GetBool("enable_pprof") {
		params = append(params, "--enable_pprof")
	}
	// Use regexp to specify that we want to start that specific service
	params = append(params, "^"+serviceName+"$")
	return params
}
