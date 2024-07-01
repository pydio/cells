/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package manager

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bep/debounce"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/fork"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "embed"
)

const (
	CommandStart   = "start"
	CommandStop    = "stop"
	CommandRestart = "restart"
)

var (
	node = util.CreateNode()
)

type Manager interface {
	Context() context.Context
	Registry() registry.Registry
	ServeAll(...server.ServeOption) error
	StopAll()
	SetServeOptions(...server.ServeOption)
	WatchServicesConfigs()
	WatchBroker(ctx context.Context, br broker.Broker) error
	GetConfig(ctx context.Context) config.Store

	RegisterStorage(scheme string, options ...controller.Option[storage.Storage])
	RegisterConfig(scheme string, config ...controller.Option[*openurl.Pool[config.Store]])
	GetStorage(ctx context.Context, name string, out any) error
}

type manager struct {
	ctx    context.Context
	ns     string
	srcUrl string

	localRegistry   registry.Registry
	clusterRegistry registry.Registry

	root       registry.Item
	rootIsFork bool

	serveOptions []server.ServeOption

	servers  map[string]server.Server
	services map[string]service.Service

	// controllers
	storage controller.Controller[storage.Storage]
	config  controller.Controller[*openurl.Pool[config.Store]]

	// TODO - adapt this
	configResolver *openurl.Pool[config.Store]

	logger log.ZapLogger
}

type managerKey struct{}

var ContextKey = managerKey{}

func NewManager(ctx context.Context, namespace string, logger log.ZapLogger) (Manager, error) {

	m := &manager{
		ctx: ctx,
		ns:  namespace,

		logger: logger,
		root:   node,

		storage: controller.NewController[storage.Storage](),
		config:  controller.NewController[*openurl.Pool[config.Store]](),
	}

	ctx = propagator.With(ctx, ContextKey, m)
	runtime.Init(ctx, "system")

	reg, err := registry.OpenRegistry(ctx, "mem:///?cache="+namespace)
	if err != nil {
		return nil, err
	}

	m.localRegistry = reg

	cr, err := m.config.Open(ctx, runtime.ConfigURL())
	if err != nil {
		return nil, err
	}

	m.configResolver = cr

	if clusterRegistryURL := runtime.RegistryURL(); clusterRegistryURL != "" {
		clusterRegistry, err := registry.OpenRegistry(ctx, clusterRegistryURL)
		if err == nil {
			m.clusterRegistry = clusterRegistry
			//return nil, err
		}
	}

	reg = registry.NewTransientWrapper(reg, registry.WithType(pb.ItemType_SERVICE))
	reg = registry.NewMetaWrapper(reg, server.InitPeerMeta, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_NODE))
	reg = registry.NewMetaWrapper(reg, func(meta map[string]string) {
		if _, ok := meta[runtime.NodeRootID]; !ok {
			meta[runtime.NodeRootID] = m.root.ID()
		}
	}, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE), registry.WithType(pb.ItemType_NODE))

	reg = registry.NewFuncWrapper(reg,
		// Adding to cluster registry
		registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
			if m.clusterRegistry != nil {
				m.clusterRegistry.Register(*item, *opts...)
			}
		}),
	)

	reg.Register(m.root)

	// Initialising default connections
	if err := m.initConnections(); err != nil {
		return nil, err
	}

	reg = registry.NewFuncWrapper(reg,
		registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
			var node registry.Node
			var server server.Server
			var service service.Service
			if (*item).As(&node) && node.ID() != m.root.ID() {
				*opts = append(*opts, registry.WithEdgeTo(m.root.ID(), "Node", nil))
			} else if (*item).As(&server) {
				*opts = append(*opts, registry.WithEdgeTo(m.root.ID(), "Node", nil))
			} else if (*item).As(&service) {
				*opts = append(*opts, registry.WithEdgeTo(m.root.ID(), "Node", nil))
			}
		}),

		// Adding to cluster registry
		registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
			if m.clusterRegistry != nil {
				m.clusterRegistry.Register(*item, *opts...)
			}
		}),
	)

	m.localRegistry = reg

	// Detect a parent root
	var current registry.Item
	if ii, er := reg.List(registry.WithType(pb.ItemType_NODE), registry.WithMeta(runtime.NodeMetaHostName, runtime.GetHostname())); er == nil && len(ii) > 0 {
		for _, root := range ii {
			rPID := root.Metadata()[runtime.NodeMetaPID]
			if rPID == strconv.Itoa(os.Getpid()) {
				current = root
			}
		}
	}
	if current != nil {
		m.root = current
	}

	ctx = propagator.With(ctx, registry.ContextKey, reg)
	runtime.Init(ctx, "discovery")
	runtime.Init(ctx, m.ns)

	m.ctx = ctx

	go m.WatchTransientStatus()

	return m, nil
}

func (m *manager) Context() context.Context {
	return m.ctx
}

func (m *manager) Registry() registry.Registry {
	return m.localRegistry
}

func (m *manager) GetConfig(ctx context.Context) (out config.Store) {
	out, err := m.configResolver.Get(ctx)
	if err != nil {
		// TODO
	}
	return out
}

func (m *manager) RegisterStorage(scheme string, opts ...controller.Option[storage.Storage]) {
	m.storage.Register(scheme, opts...)
}

func (m *manager) RegisterConfig(scheme string, opts ...controller.Option[*openurl.Pool[config.Store]]) {
	m.config.Register(scheme, opts...)
}

func (m *manager) GetStorage(ctx context.Context, name string, out any) error {
	item, err := m.localRegistry.Get(name, registry.WithType(pb.ItemType_STORAGE))
	if err != nil {
		return err
	}

	var pool controller.Resolver[storage.Storage]
	if done := item.As(&pool); !done {
		return errors.New("wrong item format")
	}

	st, err := pool.Get(ctx)
	if err != nil {
		return err
	}

	out = st
	//if done := item.As(&store); !done {
	//	return errors.New("wrong item format")
	//}
	//
	////if done, _ := store.Get(ctx, out); !done {
	////	return errors.New("wrong out format")
	////}

	return nil
}

func (m *manager) initConnections() error {
	store, err := loadBootstrap(m.ctx)
	if err != nil {
		return err
	}

	storages := store.Val("storages")
	for k := range storages.Map() {
		uri := storages.Val(k, "uri").String()
		conn, err := m.storage.Open(m.ctx, uri)
		if err != nil {
			fmt.Println("initConnections - cannot open storage with uri "+uri, err)
			continue
		}
		fmt.Println("initConnections - opened storage with uri " + uri)

		if conn != nil {
			registry.NewMetaWrapper(m.localRegistry, func(meta map[string]string) {
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = string(registry.StatusTransient)
			}).Register(registry.NewRichItem(k, k, conn), registry.WithEdgeTo(m.root.ID(), "storage", nil))
		}
	}

	runtime.Register(m.ns, func(ctx context.Context) {
		storageItems, err := m.localRegistry.List(registry.WithType(pb.ItemType_STORAGE))
		if err != nil {
			return
		}

		services, err := m.localRegistry.List(registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			return
		}

		for _, ss := range services {
			// Find storage and link it
			var namedStores map[string][]map[string]string
			if err := store.Val("services", ss.Name(), "storages").Scan(&namedStores); err != nil {
				return
			}

			for name, stores := range namedStores {
				for _, st := range stores {
					for _, item := range storageItems {
						if st["type"] == item.Name() {
							st["name"] = name
							_, _ = m.localRegistry.RegisterEdge(ss.ID(), item.ID(), "storage", st)
						}
					}
				}
			}
		}
	})

	return nil
}

func (m *manager) ServeAll(oo ...server.ServeOption) error {

	bootstrap, err := loadBootstrap(m.ctx)
	if err != nil {
		return err
	}

	if len(runtime.GetStringSlice(runtime.KeyArgTags)) == 0 {
		cmds := make(map[string]*fork.Process)
		go func() {
			w, err := bootstrap.Watch(configx.WithPath("processes", "*"), configx.WithChangesOnly())
			if err != nil {
				return
			}

			for {
				diff, err := w.Next()
				if err != nil {
					return
				}

				create := diff.(configx.Values).Val("create", "processes")
				update := diff.(configx.Values).Val("update", "processes")
				deletes := diff.(configx.Values).Val("delete", "processes")

				var processesToStart, processesToStop []string

				for name := range create.Map() {
					processesToStart = append(processesToStart, name)
				}
				for name := range update.Map() {
					processesToStop = append(processesToStop, name)
					processesToStart = append(processesToStart, name)
				}
				for name := range deletes.Map() {
					processesToStop = append(processesToStop, name)
				}

				for _, name := range processesToStop {
					if cmd, ok := cmds[name]; ok {
						cmd.Stop()
					}
				}

				processes := bootstrap.Val("processes")

				for _, v := range processesToStart {
					for name := range processes.Map() {
						process := bootstrap.Val("processes", name)

						if name == v {
							connections := process.Val("connections")
							env := process.Val("env")
							servers := process.Val("servers")
							services := process.Val("services")

							childBinary := os.Args[0]
							childArgs := []string{}
							childEnv := []string{}

							if process.Val("debug").Bool() {
								childBinary = "dlv"
								childArgs = append(childArgs, "--listen=:2345", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "--", os.Args[0])
							}

							childArgs = append(childArgs, "start", "--name", name)

							// Adding connections to the environment
							for k := range connections.Map() {
								childEnv = append(childEnv, fmt.Sprintf("CELLS_%s=%s", strings.ToUpper(k), connections.Val(k, "uri")))
							}

							for k, v := range env.Map() {
								switch vv := v.(type) {
								case string:
									childEnv = append(childEnv, fmt.Sprintf("%s=%s", k, vv))
								default:
									vvv, _ := json.Marshal(vv)
									childEnv = append(childEnv, fmt.Sprintf("%s=%s", k, string(vvv)))
								}
							}

							// Adding servers to the environment
							for k := range servers.Map() {
								server := servers.Val(k)

								// TODO - should be one bind address per server
								if bindAddr := server.Val("bind").String(); bindAddr != "" {
									childEnv = append(childEnv, fmt.Sprintf("CELLS_BIND_ADDRESS=%s", bindAddr))
								}

								// TODO - should be one advertise address per server
								if advertiseAddr := server.Val("advertise").String(); advertiseAddr != "" {
									childEnv = append(childEnv, fmt.Sprintf("CELLS_ADVERTISE_ADDRESS=%s", advertiseAddr))
								}

								// Adding servers port
								if port := server.Val("port").String(); port != "" {
									childEnv = append(childEnv, fmt.Sprintf("CELLS_%s_PORT=%s", strings.ToUpper(k), port))
								}

								// Adding server type
								if typ := server.Val("type").String(); typ != "" {
									childEnv = append(childEnv, fmt.Sprintf("CELLS_%s=%s", strings.ToUpper(k), typ))
								}
							}

							// Adding services to the environment
							tags := []string{}
							for k, v := range services.Map() {
								tags = append(tags, k)

								if vv, ok := v.([]interface{}); ok {
									for _, vvv := range vv {
										childArgs = append(childArgs, "^"+vvv.(string)+"$")
									}
								}
							}

							childEnv = append(childEnv, fmt.Sprintf("CELLS_TAGS=%s", strings.Join(tags, " ")))

							cmds[name] = fork.NewProcess(m.ctx, []string{}, fork.WithBinary(childBinary), fork.WithName(name), fork.WithArgs(childArgs), fork.WithEnv(childEnv))
							go cmds[name].StartAndWait(5)
						}
					}
				}
			}
		}()

		go bootstrap.WatchConfAndReset(m.ctx, "grpc://"+runtime.GetRuntime().GetString(runtime.KeyBindHost)+":"+runtime.GetRuntime().GetString(runtime.KeyGrpcDiscoveryPort), func(err error) {
			fmt.Println("[bootstrap-watcher]" + err.Error())
		})

	} else {

		_ = registry.NewMetaWrapper(m.localRegistry, func(meta map[string]string) {
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		}).Register(m.root)

		//go func() {
		//	w, err := bootstrap.Watch(configx.WithPath("processes", runtime.GetString(runtime.KeyName), "*"))
		//	if err != nil {
		//		return
		//	}
		//
		//	for {
		//		diff, err := w.Next()
		//		if err != nil {
		//			return
		//		}
		//
		//		connections := diff.(configx.Values).Val("processes", runtime.GetString(runtime.KeyName), "connections")
		//
		//		// Adding connections to the environment
		//		for k := range connections.Map() {
		//			conn, err := m.storage.Open(m.ctx, connections.Val(k, "uri").String())
		//			if err != nil {
		//				continue
		//			}
		//
		//			if conn != nil {
		//				registry.NewMetaWrapper(m.localRegistry, func(meta map[string]string) {
		//					meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
		//					meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		//				}).Register(registry.NewRichItem("test", "Test", conn), registry.WithEdgeTo(m.root.ID(), "storage", map[string]string{
		//					"tenant": "",
		//				}))
		//			}
		//		}
		//	}
		//}()

		go bootstrap.WatchConfAndReset(m.ctx, runtime.GetRuntime().GetString(runtime.KeyConfig), func(err error) {
			fmt.Println("[bootstrap-watcher]" + err.Error())
		})

		m.servers = map[string]server.Server{}
		m.services = map[string]service.Service{}
		byScheme := map[string]server.Server{}

		servers, err := m.localRegistry.List(registry.WithType(pb.ItemType_SERVER))
		if err != nil {
			return err
		}

		for _, ss := range servers {
			var s server.Server
			if !ss.As(&s) {
				continue
			}
			m.servers[s.ID()] = s
		}

		services, err := m.localRegistry.List(registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			return err
		}

		for _, ss := range services {
			var s service.Service
			if !ss.As(&s) {
				continue
			}
			opts := s.Options()
			mustFork := opts.Fork && !runtime.IsFork()

			// Replace service context with target registry
			opts.SetRegistry(m.localRegistry)

			if !runtime.IsRequired(s.Name(), opts.Tags...) && !opts.ForceRegister {
				continue
			}

			if mustFork && !opts.AutoStart {
				continue
			}

			// Find server and start it
			scheme := s.ServerScheme()
			if sr, o := byScheme[scheme]; o {
				opts.Server = sr
			} else if srv, er := server.OpenServer(m.ctx, scheme); er == nil {
				byScheme[scheme] = srv
				opts.Server = srv
			} else {
				return er
			}

			if mustFork {
				continue // Do not register here
			}

			m.services[s.ID()] = s
		}

		for _, sr := range byScheme {
			m.servers[sr.ID()] = sr // Keep a ref to the actual object
		}

		if locker := m.localRegistry.NewLocker("start-node-" + m.ns); locker != nil {
			locker.Lock()

			w, err := m.localRegistry.Watch(registry.WithID(m.root.ID()), registry.WithType(pb.ItemType_NODE), registry.WithFilter(func(item registry.Item) bool {
				status, ok := item.Metadata()[registry.MetaStatusKey]
				if ok && (status == string(registry.StatusReady) || status == string(registry.StatusError)) {
					return true
				}

				return false
			}))
			if err != nil {
				locker.Unlock()
				return err
			}
			go func() {
				defer w.Stop()
				defer locker.Unlock()

				for {
					res, err := w.Next()
					if err != nil {
						return
					}

					if len(res.Items()) == 0 {
						continue
					}

					break
				}
			}()
		}

		m.serveOptions = oo
		opt := &server.ServeOptions{}
		for _, o := range oo {
			o(opt)
		}
		eg := &errgroup.Group{}
		ss := m.serversWithStatus(registry.StatusStopped)
		for _, srv := range ss {
			func(srv server.Server) {
				eg.Go(func() error {
					if err := m.startServer(srv, oo...); err != nil {
						return errors.Wrap(err, " from "+srv.ID()+srv.Name())
					}

					return nil
				})
			}(srv)
		}

		waitAndServe := func() {
			if err := eg.Wait(); err != nil && opt.ErrorCallback != nil {
				opt.ErrorCallback(err)
			}
		}
		if opt.BlockUntilServe {
			waitAndServe()
			return nil
		} else {
			go waitAndServe()
		}
	}

	return nil
}

func (m *manager) SetServeOptions(oo ...server.ServeOption) {
	m.serveOptions = oo
}

func (m *manager) StopAll() {
	eg := &errgroup.Group{}
	for _, srv := range m.serversWithStatus(registry.StatusReady) {
		func(sr server.Server) {
			eg.Go(func() error {
				if err := m.stopServer(sr, registry.WithDeregisterFull()); err != nil {
					return err
				}

				return nil
			})
		}(srv)
	}
	if er := eg.Wait(); er != nil {
		if !(strings.Contains(er.Error(), "error reading from server: EOF") && runtime.IsFork()) &&
			!strings.Contains(er.Error(), "context canceled") {
			m.logger.Error("error while stopping servers: "+er.Error(), zap.Error(er))
		}
	}
	_ = m.localRegistry.Deregister(m.root, registry.WithRegisterFailFast())
}

func (m *manager) startServer(srv server.Server, oo ...server.ServeOption) error {
	opts := append(oo)

	var uniques []service.Service
	detectedCount := 1
	for _, svc := range m.services {
		if svc.Options().Server == srv {
			if svc.Options().Unique {
				uniques = append(uniques, svc)
				if running, count := m.regRunningService(svc.Name()); running {
					detectedCount = count
					// There is already a running service here. Do not start now, watch registry and postpone start
					m.logger.Warn("There is already a running instance of " + svc.Name() + ". Do not start now, watch registry and postpone start")
					registry.NewMetaWrapper(m.localRegistry, func(meta map[string]string) {
						meta[registry.MetaStatusKey] = string(registry.StatusWaiting)
					}).Register(svc)

					continue
				}
			}
			opts = append(opts, m.serviceServeOptions(svc)...)
		}
	}
	if len(uniques) > 0 {
		go m.WatchServerUniques(srv, uniques, detectedCount)
	}

	registry.NewMetaWrapper(m.localRegistry, func(meta map[string]string) {
		meta[registry.MetaStatusKey] = string(registry.StatusTransient)
	}).Register(srv)

	return srv.Serve(opts...)
}

func (m *manager) stopServer(srv server.Server, oo ...registry.RegisterOption) error {
	// Stop all running services on this server
	eg := &errgroup.Group{}
	for _, svc := range m.servicesRunningOn(srv) {
		func(sv service.Service) {
			eg.Go(func() error {
				return m.stopService(sv, oo...)
			})
		}(svc)
	}
	if er := eg.Wait(); er != nil {
		return er
	}

	// Stop server now
	return srv.Stop(oo...)
}

func (m *manager) startService(svc service.Service) error {
	// Look up for corresponding server
	srv := svc.Options().Server
	serveOptions := append(m.serveOptions, m.serviceServeOptions(svc)...)

	if srv.Is(registry.StatusStopped) {

		m.logger.Info("Server is not running, starting " + srv.ID() + " now")
		return srv.Serve(serveOptions...)

	} else if srv.NeedsRestart() {

		m.logger.Info("Server needs a restart to append a new service")
		for _, sv := range m.servicesRunningOn(srv) {
			serveOptions = append(serveOptions, m.serviceServeOptions(sv)...)
		}
		if er := m.stopServer(srv); er != nil {
			return er
		}
		return srv.Serve(serveOptions...)

	} else {

		m.logger.Info("Starting service")
		if er := svc.Start(); er != nil {
			return er
		}
		if er := svc.OnServe(); er != nil {
			return er
		}

	}

	return nil
}

func (m *manager) stopService(svc service.Service, oo ...registry.RegisterOption) error {
	return svc.Stop(oo...)
}

func (m *manager) serviceServeOptions(svc service.Service) []server.ServeOption {
	return []server.ServeOption{
		server.WithBeforeServe(svc.Start),
		server.WithAfterServe(svc.OnServe),
	}
}

func (m *manager) serversWithStatus(status registry.Status) (ss []server.Server) {
	for _, srv := range m.servers {
		if srv.Is(status) {
			ss = append(ss, srv)
		}
	}
	return
}

func (m *manager) servicesRunningOn(server server.Server) (ss []service.Service) {
	for _, svc := range m.services {
		if svc.Server() == server && svc.Is(registry.StatusReady) {
			ss = append(ss, svc)
		}
	}
	return
}

func (m *manager) WatchServicesConfigs() {
	res, err := config.Watch(configx.WithPath("services"), configx.WithChangesOnly())
	if err != nil {
		return
	}
	for {
		v, _ := res.Next()
		mm := v.(configx.Values).Val("update", "services").Map()

		for k, _ := range mm {
			ss, err := m.localRegistry.List(registry.WithName(k), registry.WithType(pb.ItemType_SERVICE))
			if err != nil || len(ss) == 0 {
				continue
			}
			var svc service.Service
			if ss[0].As(&svc) && svc.Options().AutoRestart {
				if er := m.stopService(svc); er == nil {
					if sErr := m.startService(svc); sErr != nil {
						log.Logger(m.ctx).Error("Cannot start service"+svc.Name(), zap.Error(sErr))
					}
				} else {
					log.Logger(m.ctx).Error("Cannot stop service"+svc.Name(), zap.Error(er))
				}
			}
		}
	}
}

func (m *manager) WatchBroker(ctx context.Context, br broker.Broker) error {
	_, er := br.Subscribe(ctx, common.TopicRegistryCommand, func(_ context.Context, message broker.Message) error {
		hh, _ := message.RawData()
		cmd := hh["command"]
		itemName := hh["itemName"]
		s, err := m.localRegistry.Get(itemName, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			if err == os.ErrNotExist || strings.Contains(err.Error(), "file does not exist") {
				return nil
			}
			return err
		}

		var svc service.Service
		var srv server.Server
		var rsrc registry.Service
		var rsrv registry.Server
		if s.As(&svc) || s.As(&srv) {
			// In-memory object found
		} else if s.As(&rsrc) {
			if mem, ok := m.services[s.ID()]; ok {
				svc = mem
			}
		} else if s.As(&rsrv) {
			if mem, ok := m.servers[s.ID()]; ok {
				srv = mem
			}
		}
		if svc == nil && srv == nil {
			return nil
		}
		if svc != nil {
			// Service Commands
			switch cmd {
			case CommandStart:
				return m.startService(svc)
			case CommandStop:
				return m.stopService(svc)
			case CommandRestart:
				if er := m.stopService(svc); er != nil {
					return er
				}
				return m.startService(svc)
			default:
				return fmt.Errorf("unsupported command %s", cmd)
			}
		} else if srv != nil {
			// Server Commands
			switch cmd {
			case CommandStart:
				return m.startServer(srv, m.serveOptions...)
			case CommandStop:
				return m.stopServer(srv)
			case CommandRestart:
				if er := m.stopServer(srv); er != nil {
					return er
				}
				return m.startServer(srv, m.serveOptions...)
			default:
				return fmt.Errorf("unsupported command %s", cmd)
			}
		}
		return nil
	})
	if er != nil {
		m.logger.Error("Manager cannot watch broker: " + er.Error())
	}
	return er
}

func (m *manager) regRunningService(name string) (bool, int) {
	ll, _ := m.localRegistry.List(registry.WithType(pb.ItemType_SERVICE), registry.WithName(name))
	for _, l := range ll {
		if l.Metadata()[registry.MetaStatusKey] != string(registry.StatusStopped) && l.Metadata()[registry.MetaStatusKey] != string(registry.StatusWaiting) {
			return true, len(ll)
		}
	}
	return false, 0
}

func (m *manager) WatchTransientStatus() {
	options := []registry.Option{
		registry.WithType(pb.ItemType_NODE),
		registry.WithType(pb.ItemType_SERVER),
		registry.WithAction(pb.ActionType_CREATE),
		registry.WithAction(pb.ActionType_UPDATE),
		registry.WithContext(m.ctx),
		registry.WithFilter(func(item registry.Item) bool {
			var node registry.Node
			if item.As(&node) {
				if item.ID() != m.root.ID() {
					return false
				}
			}

			var server registry.Server
			if item.As(&server) {
				meta := item.Metadata()
				if rootID, ok := meta[runtime.NodeRootID]; !ok || rootID != m.root.ID() {
					return false
				}
			}

			if status, ok := item.Metadata()[registry.MetaStatusKey]; !ok || status != string(registry.StatusTransient) {
				return false
			}

			return true
		}),
	}

	w, err := m.localRegistry.Watch(options...)
	if err != nil {
		return
	}
	defer w.Stop()

	for {
		res, er := w.Next()
		if er != nil {
			break
		}

		for _, i := range res.Items() {
			statusToSet := string(registry.StatusReady)
			items := m.localRegistry.ListAdjacentItems(
				registry.WithAdjacentSourceItems([]registry.Item{i}),
				registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
			)
			for _, item := range items {
				itemStatus := item.Metadata()[registry.MetaStatusKey]
				if itemStatus != string(registry.StatusReady) && itemStatus != string(registry.StatusWaiting) && itemStatus != string(registry.StatusError) {
					statusToSet = string(registry.StatusTransient)
					break
				}
				if itemStatus == string(registry.StatusError) && statusToSet == string(registry.StatusReady) {
					statusToSet = string(registry.StatusError)
				}
			}

			if ms, ok := i.(registry.MetaSetter); ok {
				meta := i.Metadata()
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = statusToSet
				ms.SetMetadata(meta)

				go m.localRegistry.Register(ms.(registry.Item))
			}
		}
	}
}

func (m *manager) WatchServerUniques(srv server.Server, ss []service.Service, count int) {
	db := debounce.New(time.Duration(count*3) * time.Second)
	options := []registry.Option{
		registry.WithType(pb.ItemType_SERVICE),
		registry.WithAction(pb.ActionType_DELETE),
		registry.WithAction(pb.ActionType_UPDATE),
		registry.WithContext(m.ctx),
	}
	// Watch specific names
	for _, s := range ss {
		options = append(options, registry.WithName(s.Name()))
	}
	// Exclude local IDs
	options = append(options, registry.WithFilter(func(item registry.Item) bool {
		for _, s := range ss {
			if s.ID() == item.ID() {
				m.logger.Debug("FILTERING event on " + item.Name() + " as it is locally managed")
				return false
			}
		}
		return true
	}))
	w, _ := m.localRegistry.Watch(options...)
	defer w.Stop()

	for {
		res, er := w.Next()
		if er != nil {
			break
		}

		if res.Action() == pb.ActionType_UPDATE {
			var hasStopped bool
			for _, i := range res.Items() {
				if s, ok := i.Metadata()[registry.MetaStatusKey]; ok && s == string(registry.StatusStopped) {
					hasStopped = true
				}
			}
			if !hasStopped {
				continue
			}
		}

		var iNames []string
		for _, i := range res.Items() {
			iNames = append(iNames, i.Name())
		}

		m.logger.Info("Delete event received for " + strings.Join(iNames, "|") + ", debounce server Restart" + strconv.Itoa(count))
		db(func() {
			if srv.NeedsRestart() {
				w.Stop()
				m.logger.Info(" -- Restarting server now", zap.Int8("type", int8(srv.Type())), zap.String("name", srv.Name()))
				if er := m.stopServer(srv); er != nil {
					m.logger.Error("Error while stopping server"+er.Error(), zap.Error(er))
				}
				if er := m.startServer(srv, m.serveOptions...); er != nil {
					m.logger.Error("Error while starting server "+er.Error(), zap.Error(er))
				}
			} else {
				for _, s := range ss {
					for _, i := range res.Items() {
						if s.Name() == i.Name() {
							m.logger.Info(" -- Restarting service now", zap.String("name", s.Name()))
							s.Stop()

							s.Start()
						}
					}
				}
			}
		})
	}
}

func (m *manager) MustGetConfig(ctx context.Context) (out config.Store) {
	out, _ = m.configResolver.Get(ctx)

	return
}
