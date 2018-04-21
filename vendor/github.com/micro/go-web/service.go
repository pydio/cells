package web

import (
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/micro/cli"
	"github.com/micro/go-log"
	"github.com/micro/go-micro/registry"
)

type service struct {
	opts Options

	mux *http.ServeMux
	srv *registry.Service

	sync.Mutex
	running bool
	exit    chan chan error
}

func newService(opts ...Option) Service {
	options := newOptions(opts...)
	s := &service{
		opts: options,
		mux:  http.NewServeMux(),
	}
	s.srv = s.genSrv()
	return s
}

func (s *service) genSrv() *registry.Service {
	// parse address for host, port
	var advt, host string
	var port int

	// check the advertise address first
	// if it exists then use it, otherwise
	// use the address
	if len(s.opts.Advertise) > 0 {
		advt = s.opts.Advertise
	} else {
		advt = s.opts.Address
	}

	parts := strings.Split(advt, ":")
	if len(parts) > 1 {
		host = strings.Join(parts[:len(parts)-1], ":")
		port, _ = strconv.Atoi(parts[len(parts)-1])
	} else {
		host = parts[0]
	}

	addr, err := extractAddress(host)
	if err != nil {
		return nil
	}

	return &registry.Service{
		Name:    s.opts.Name,
		Version: s.opts.Version,
		Nodes: []*registry.Node{&registry.Node{
			Id:       s.opts.Id,
			Address:  addr,
			Port:     port,
			Metadata: s.opts.Metadata,
		}},
	}
}

func (s *service) run(exit chan bool) {
	if s.opts.RegisterInterval <= time.Duration(0) {
		return
	}

	t := time.NewTicker(s.opts.RegisterInterval)

	for {
		select {
		case <-t.C:
			s.register()
		case <-exit:
			t.Stop()
			return
		}
	}
}

func (s *service) register() error {
	if s.srv == nil {
		return nil
	}
	return registry.Register(s.srv, registry.RegisterTTL(s.opts.RegisterTTL))
}

func (s *service) deregister() error {
	if s.srv == nil {
		return nil
	}
	return registry.Deregister(s.srv)
}

func (s *service) start() error {
	s.Lock()
	defer s.Unlock()

	if s.running {
		return nil
	}

	l, err := net.Listen("tcp", s.opts.Address)
	if err != nil {
		return err
	}

	s.opts.Address = l.Addr().String()
	srv := s.genSrv()
	srv.Endpoints = s.srv.Endpoints
	s.srv = srv

	var h http.Handler

	if s.opts.Handler != nil {
		h = s.opts.Handler
	} else {
		h = s.mux
	}

	for _, fn := range s.opts.BeforeStart {
		if err := fn(); err != nil {
			return err
		}
	}

	var httpSrv *http.Server
	if s.opts.Server != nil {
		httpSrv = s.opts.Server
	} else {
		httpSrv = &http.Server{}
	}

	httpSrv.Handler = h

	go httpSrv.Serve(l)

	for _, fn := range s.opts.AfterStart {
		if err := fn(); err != nil {
			return err
		}
	}

	s.exit = make(chan chan error, 1)
	s.running = true

	go func() {
		ch := <-s.exit
		ch <- l.Close()
	}()

	log.Logf("Listening on %v\n", l.Addr().String())
	return nil
}

func (s *service) stop() error {
	s.Lock()
	defer s.Unlock()

	if !s.running {
		return nil
	}

	for _, fn := range s.opts.BeforeStop {
		if err := fn(); err != nil {
			return err
		}
	}

	ch := make(chan error, 1)
	s.exit <- ch
	s.running = false

	log.Log("Stopping")

	for _, fn := range s.opts.AfterStop {
		if err := fn(); err != nil {
			if chErr := <-ch; chErr != nil {
				return chErr
			}
			return err
		}
	}

	return <-ch
}

func (s *service) Handle(pattern string, handler http.Handler) {
	var seen bool
	for _, ep := range s.srv.Endpoints {
		if ep.Name == pattern {
			seen = true
			break
		}
	}
	if !seen {
		s.srv.Endpoints = append(s.srv.Endpoints, &registry.Endpoint{
			Name: pattern,
		})
	}

	s.mux.Handle(pattern, handler)
}

func (s *service) HandleFunc(pattern string, handler func(http.ResponseWriter, *http.Request)) {
	var seen bool
	for _, ep := range s.srv.Endpoints {
		if ep.Name == pattern {
			seen = true
			break
		}
	}
	if !seen {
		s.srv.Endpoints = append(s.srv.Endpoints, &registry.Endpoint{
			Name: pattern,
		})
	}

	s.mux.HandleFunc(pattern, handler)
}

func (s *service) Init(opts ...Option) error {
	for _, o := range opts {
		o(&s.opts)
	}

	app := s.opts.Cmd.App()

	app.Flags = append(app.Flags,
		cli.IntFlag{
			Name:   "register_ttl",
			EnvVar: "MICRO_REGISTER_TTL",
			Usage:  "Register TTL in seconds",
		},
		cli.IntFlag{
			Name:   "register_interval",
			EnvVar: "MICRO_REGISTER_INTERVAL",
			Usage:  "Register interval in seconds",
		},
	)

	before := app.Before

	app.Before = func(ctx *cli.Context) error {
		if ttl := ctx.Int("register_ttl"); ttl > 0 {
			s.opts.RegisterTTL = time.Duration(ttl) * time.Second
		}

		if interval := ctx.Int("register_interval"); interval > 0 {
			s.opts.RegisterInterval = time.Duration(interval) * time.Second
		}

		if name := ctx.String("server_name"); len(name) > 0 {
			s.opts.Name = name
		}

		if ver := ctx.String("server_version"); len(ver) > 0 {
			s.opts.Version = ver
		}

		if id := ctx.String("server_id"); len(id) > 0 {
			s.opts.Id = id
		}

		if addr := ctx.String("server_address"); len(addr) > 0 {
			s.opts.Address = addr
		}

		if adv := ctx.String("server_advertise"); len(adv) > 0 {
			s.opts.Advertise = adv
		}

		return before(ctx)
	}

	err := s.opts.Cmd.Init()
	if err != nil {
		return err
	}

	srv := s.genSrv()
	srv.Endpoints = s.srv.Endpoints
	s.srv = srv

	return nil
}

func (s *service) Run() error {
	if err := s.start(); err != nil {
		return err
	}

	if err := s.register(); err != nil {
		return err
	}

	// start reg loop
	ex := make(chan bool)
	go s.run(ex)

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGTERM, syscall.SIGINT, syscall.SIGKILL)

	select {
	// wait on kill signal
	case sig := <-ch:
		log.Logf("Received signal %s\n", sig)
	// wait on context cancel
	case <-s.opts.Context.Done():
		log.Logf("Received context shutdown")
	}

	// exit reg loop
	close(ex)

	if err := s.deregister(); err != nil {
		return err
	}

	return s.stop()
}

// Options returns the options for the given service
func (s *service) Options() Options {
	return s.opts
}
