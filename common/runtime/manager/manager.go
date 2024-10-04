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
	"bytes"
	"context"
	"fmt"
	"net"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/bep/debounce"
	"github.com/manifoldco/promptui"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/revisions"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/middleware"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/telemetry"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
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

type Manager interface {
	Context() context.Context
	Registry() registry.Registry
	ServeAll(...server.ServeOption) error
	StopAll()
	SetServeOptions(...server.ServeOption)
	WatchServicesConfigs()
	WatchBroker(ctx context.Context, br broker.Broker) error

	RegisterStorage(scheme string, options ...controller.Option[storage.Storage])
	RegisterConfig(scheme string, config ...controller.Option[*openurl.Pool[config.Store]])
	RegisterQueue(scheme string, opts ...controller.Option[broker.AsyncQueuePool])
	RegisterCache(scheme string, opts ...controller.Option[*openurl.Pool[cache.Cache]])

	GetRootID() string
	GetStorage(ctx context.Context, name string, out any) error
	GetQueue(ctx context.Context, name string, resolutionData map[string]interface{}, openerID string, openerFunc broker.OpenWrapper) (broker.AsyncQueue, error)
	GetQueuePool(name string) (broker.AsyncQueuePool, error)
	GetCache(ctx context.Context, name string, resolutionData map[string]interface{}) (cache.Cache, error)
}

type manager struct {
	ctx       context.Context
	bootstrap *Bootstrap
	base      string

	ns     string
	srcUrl string

	// registries
	// - internal
	internalRegistry registry.Registry
	// - state of the world
	sotwRegistry registry.Registry

	root       registry.Item
	rootIsFork bool

	serveOptions []server.ServeOption

	servers  map[string]server.Server
	services map[string]service.Service

	// controllers
	storage controller.Controller[storage.Storage]
	config  controller.Controller[*openurl.Pool[config.Store]]
	queues  controller.Controller[broker.AsyncQueuePool]
	caches  controller.Controller[*openurl.Pool[cache.Cache]]

	logger log.ZapLogger
}

type managerKey struct{}

var ContextKey = managerKey{}

func NewManager(ctx context.Context, namespace string, logger log.ZapLogger) (Manager, error) {

	m := &manager{
		ctx: ctx,
		ns:  namespace,

		logger: logger,
		root:   util.CreateNode(),

		storage: controller.NewController[storage.Storage](),
		config:  controller.NewController[*openurl.Pool[config.Store]](),
		queues:  controller.NewController[broker.AsyncQueuePool](),
		caches:  controller.NewController[*openurl.Pool[cache.Cache]](),
	}

	ctx = propagator.With(ctx, ContextKey, m)
	runtime.Init(ctx, "system")

	// Load bootstrap and compute base depending on process
	bootstrap, err := NewBootstrap(m.ctx, runtime.GetString(runtime.KeyBootstrapTpl))
	if err != nil {
		return nil, err
	}

	base := runtime.GetString(runtime.KeyBootstrapRoot)
	if name := runtime.Name(); name != "" && name != "default" {
		base += strings.Join(strings.Split("_"+name, "_"), "/processes/")
	}

	if err := m.initNamespace(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	if reg, err := m.initInternalRegistry(); err != nil {
		return nil, err
	} else {
		m.internalRegistry = reg

		go m.WatchTransientStatus()

		ctx = propagator.With(ctx, registry.ContextKey, reg)
	}

	if store, err := m.initKeyring(ctx); err != nil {
		return nil, err
	} else {
		ctx = propagator.With(ctx, crypto.KeyringContextKey, store)
	}

	// TODO : this would imply using eg.Wait() somewhere, is normal ?
	var eg errgroup.Group
	eg.Go(func() error {
		return m.initProcesses(ctx, bootstrap, base)
	})

	// Initialising listeners
	if err := m.initListeners(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	// Initialising default connections
	if err := m.initConnections(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	if store, vault, revisions, err := m.initConfig(ctx); err != nil {
		return nil, err
	} else {
		ctx = propagator.With(ctx, config.ContextKey, store)
		ctx = propagator.With(ctx, config.VaultKey, vault)
		ctx = propagator.With(ctx, config.RevisionsKey, revisions)

		if err := bootstrap.reload(store); err != nil {
			return nil, err
		}
	}

	if reg, err := m.initSOTWRegistry(ctx); err != nil {
		return nil, err
	} else {
		m.sotwRegistry = reg
		ctx = propagator.With(ctx, registry.ContextSOTWKey, reg)
	}

	// Initialising servers
	if err := m.initServers(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	// Initialising storages
	if err := m.initStorages(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	// Initialising queues
	if err := m.initQueues(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	// Initialising caches
	if err := m.initCaches(ctx, bootstrap, base); err != nil {
		return nil, err
	}

	// runtime.Init(ctx, "discovery")
	runtime.Init(ctx, m.ns)

	m.ctx = ctx

	return m, nil
}

func (m *manager) Context() context.Context {
	return m.ctx
}

func (m *manager) Registry() registry.Registry {
	return m.internalRegistry
}

func (m *manager) RegisterStorage(scheme string, opts ...controller.Option[storage.Storage]) {
	m.storage.Register(scheme, opts...)
}

func (m *manager) RegisterConfig(scheme string, opts ...controller.Option[*openurl.Pool[config.Store]]) {
	m.config.Register(scheme, opts...)
}

func (m *manager) RegisterQueue(scheme string, opts ...controller.Option[broker.AsyncQueuePool]) {
	m.queues.Register(scheme, opts...)
}

func (m *manager) RegisterCache(scheme string, opts ...controller.Option[*openurl.Pool[cache.Cache]]) {
	m.caches.Register(scheme, opts...)
}

func (m *manager) GetRootID() string {
	return m.root.ID()
}

func (m *manager) GetStorage(ctx context.Context, name string, out any) error {
	item, err := m.internalRegistry.Get(name, registry.WithType(pb.ItemType_STORAGE))
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

func (m *manager) GetQueue(ctx context.Context, name string, resolutionData map[string]interface{}, openerID string, openerFunc broker.OpenWrapper) (broker.AsyncQueue, error) {
	qp, er := m.GetQueuePool(name)
	if er != nil {
		return nil, er
	}
	resolutionData[broker.OpenerIDKey] = openerID
	resolutionData[broker.OpenerFuncKey] = openerFunc
	return qp.Get(ctx, resolutionData)
}

func (m *manager) GetQueuePool(name string) (broker.AsyncQueuePool, error) {
	item, err := m.internalRegistry.Get("queue-"+name, registry.WithType(pb.ItemType_GENERIC))
	if err != nil {
		return nil, errors.Wrap(err, "cannot get queue-"+name+" from sotwRegistry")
	}
	var pool broker.AsyncQueuePool
	if ok := item.As(&pool); !ok {
		return nil, errors.New("wrong sotwRegistry item format for queue-" + name)
	}
	return pool, nil
}

func (m *manager) GetCache(ctx context.Context, name string, resolutionData map[string]interface{}) (cache.Cache, error) {
	item, err := m.internalRegistry.Get("cache-"+name, registry.WithType(pb.ItemType_GENERIC))
	if err != nil {
		return nil, errors.Wrap(err, "cannot get cache-"+name+" from sotwRegistry")
	}
	var pool *openurl.Pool[cache.Cache]
	if ok := item.As(&pool); !ok {
		return nil, errors.New("wrong sotwRegistry item format for cache-" + name)
	}
	return pool.Get(ctx, resolutionData)
}

func (m *manager) initNamespace(ctx context.Context, bootstrap *Bootstrap, base string) error {
	m.ns = bootstrap.Val(base, "runtime").String()

	return nil
}

func (m *manager) initKeyring(ctx context.Context) (config.Store, error) {
	// Keyring store
	keyringStore, err := config.OpenStore(ctx, runtime.KeyringURL())
	if err != nil {
		return nil, fmt.Errorf("could not init keyring store %v", err)
	}

	// Keyring start and creation of the master password
	kr := crypto.NewConfigKeyring(keyringStore, crypto.WithAutoCreate(true, func(s string) {
		fmt.Println(promptui.IconWarn + " [Keyring] " + s)
	}))

	password, err := kr.Get(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey)
	if err != nil {
		return nil, fmt.Errorf("could not get master password %v", err)
	}

	runtime.SetVaultMasterKey(password)

	return keyringStore, nil
}

func (m *manager) initConfig(ctx context.Context) (config.Store, config.Store, revisions.Store, error) {

	mainStore, err := config.OpenStore(ctx, runtime.ConfigURL())
	if err != nil {
		return nil, nil, nil, err
	}

	// Init RevisionsStore if config is config.RevisionsProvider
	var versionsStore revisions.Store
	if revProvider, ok := mainStore.(config.RevisionsProvider); ok {
		var rOpt []config.RevisionsStoreOption
		//if debounceVersions {
		//	rOpt = append(rOpt, config.WithDebounce(2*time.Second))
		//}
		mainStore, versionsStore = revProvider.AsRevisionsStore(rOpt...)
	}

	// Wrap config with vaultConfig if set
	vaultStore, err := config.OpenStore(ctx, runtime.VaultURL())
	if err != nil {
		return nil, nil, nil, err
	}

	mainStore = config.NewVault(vaultStore, mainStore)

	// Additional Proxy
	mainStore = config.Proxy(mainStore)

	// TODO - should be a migration
	//if !runtime.IsFork() {
	//	if config.Get(ctx, "version").String() == "" && config.Get(ctx, "defaults/database").String() == "" {
	//		var data interface{}
	//		if err := json.Unmarshal([]byte(config.SampleConfig), &data); err == nil {
	//			if err := config.Get(ctx).Set(data); err == nil {
	//				_ = config.Save(ctx, common.PydioSystemUsername, "Initialize with sample config")
	//			}
	//		}
	//	}
	//
	//	// Need to do something for the versions
	//	if save, err := migrations.UpgradeConfigsIfRequired(config.Get(ctx), common.Version()); err == nil && save {
	//		if err := config.Save(ctx, common.PydioSystemUsername, "Configs upgrades applied"); err != nil {
	//			return nil, nil, nil, fmt.Errorf("could not save config migrations %v", err)
	//		}
	//	}
	//}

	// TODO - Move this config inside defaults, not in services/pydio.grpc.log
	// We want to read this from config (not boostrap) as it will be hot-reloaded if config is changed
	cfgPath := []string{"services", common.ServiceGrpcNamespace_ + common.ServiceLog}
	config.GetAndWatch(mainStore, cfgPath, func(values configx.Values) {
		conf := telemetry.Config{
			Loggers: []log.LoggerConfig{{
				Encoding: "console",
				Level:    "debug",
				Outputs:  []string{"stdout:///"},
			}},
		}
		if values.Scan(&conf) == nil {
			if e := conf.Reload(ctx); e != nil {
				fmt.Println("Error reloading", e)
			}
		}
	})

	return mainStore, vaultStore, versionsStore, nil
}

func (m *manager) initInternalRegistry() (registry.Registry, error) {

	reg, err := registry.OpenRegistry(m.ctx, "mem:///?cache="+m.ns)
	if err != nil {
		return nil, err
	}

	reg = registry.NewTransientWrapper(reg, registry.WithType(pb.ItemType_SERVICE))
	// reg = registry.NewMetaWrapper(reg, server.InitPeerMeta, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_NODE))
	reg = registry.NewMetaWrapper(reg, func(meta map[string]string) {
		if _, ok := meta[runtime.NodeRootID]; !ok {
			meta[runtime.NodeRootID] = m.root.ID()
		}
	}, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE), registry.WithType(pb.ItemType_NODE))

	reg = registry.NewFuncWrapper(reg,
		// Adding to cluster sotwRegistry
		registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
			if m.sotwRegistry != nil {
				m.sotwRegistry.Register(*item, *opts...)
			}
		}),
	)

	reg.Register(m.root)

	// runtime.Register("discovery", func(ctx context.Context) {
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
	)

	return reg, nil
}

func (m *manager) initSOTWRegistry(ctx context.Context) (registry.Registry, error) {
	registryURL := runtime.RegistryURL()

	reg, err := registry.OpenRegistry(ctx, registryURL)
	if err != nil {
		return nil, err
	}

	// Making sure the listeners are being copied, todo improve that
	items, err := m.internalRegistry.List()
	if err != nil {
		return nil, err
	}

	for _, item := range items {
		if err := reg.Register(item); err != nil {
			return nil, err
		}
	}

	m.internalRegistry = registry.NewFuncWrapper(m.internalRegistry,
		// Adding to cluster sotwRegistry
		registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
			if reg != nil {
				reg.Register(*item, *opts...)
			}
		}),
	)

	// Switching to the main sotwRegistry for outside the manager
	return reg, nil
}

func (m *manager) initProcesses(ctx context.Context, bootstrap *Bootstrap, base string) error {
	cmds := make(map[string]*fork.Process)

	var baseWatch []string
	if base != "#" {
		baseWatch = append(baseWatch, strings.Split(strings.TrimLeft(base, "#/"), "/")...)
	}

	//fmt.Println("Base Watch ON", baseWatch, "/processes/*")
	w, err := bootstrap.Watch(configx.WithPath(append(baseWatch, "processes", "*")...), configx.WithChangesOnly())
	if err != nil {
		return err
	}

	for {
		diff, err := w.Next()
		if err != nil {
			return err
		}
		baseRead := append(baseWatch, "processes")
		create := diff.(configx.Values).Val(append([]string{"create"}, baseRead...)...)
		update := diff.(configx.Values).Val(append([]string{"update"}, baseRead...)...)
		deletes := diff.(configx.Values).Val(append([]string{"delete"}, baseRead...)...)

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

		processes := bootstrap.Val(base + "/processes")
		fmt.Println("Base Watch Triggered", base, baseWatch, len(processesToStart), len(processes.Map()))

		for _, v := range processesToStart {
			for name := range processes.Map() {
				process := bootstrap.Val(base+"/processes", name)
				if name != v {
					continue
				}

				connections := process.Val("connections")
				env := process.Val("env")
				servers := process.Val("servers")
				tags := process.Val("tags")
				debug := process.Val("debug")

				childBinary := os.Args[0]
				var childArgs []string
				var childEnv []string

				if debug.Bool() {
					childBinary = "dlv"
					childArgs = append(childArgs, "--listen=:2345", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "--", os.Args[0])
				}

				childArgs = append(childArgs, "start", "--name", name)
				if sets := runtime.GetString(runtime.KeyBootstrapSetsFile); sets != "" {
					childArgs = append(childArgs, "--sets", sets)
				}

				// Adding connections to the environment
				for k := range connections.Map() {
					uri := connections.Val(k, "uri").String()
					u, err := url.Parse(uri)
					if err != nil {
						log.Logger(ctx).Warn("connection url not right")
						continue
					}

					pools := connections.Val(k, "pools").Map()
					if len(pools) > 0 {
						var poolSlice []string
						for k, v := range pools {
							poolSlice = append(poolSlice, fmt.Sprintf("%s=%s", k, v))
						}
						q := u.Query()
						q.Add("pools", strings.Join(poolSlice, "&"))
						u.RawQuery = q.Encode()
					}

					childEnv = append(childEnv, fmt.Sprintf("CELLS_%s=%s", strings.ToUpper(k), u.String()))
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
				tagsList := []string{}
				for k, v := range tags.Map() {
					tagsList = append(tagsList, k)

					if vv, ok := v.([]interface{}); ok {
						for _, vvv := range vv {
							childArgs = append(childArgs, "^"+vvv.(string)+"$")
						}
					}
				}

				childEnv = append(childEnv, fmt.Sprintf("CELLS_TAGS=%s", strings.Join(tagsList, " ")))
				childEnv = append(childEnv, "CELLS_BOOTSTRAP_ROOT="+base)

				cmds[name] = fork.NewProcess(m.ctx, []string{}, fork.WithBinary(childBinary), fork.WithName(name), fork.WithArgs(childArgs), fork.WithEnv(childEnv))
				go cmds[name].StartAndWait(5)
			}
		}
	}
}

func (m *manager) initListeners(ctx context.Context, store *Bootstrap, base string) error {
	listeners := store.Val(base + "/listeners")
	for k, v := range listeners.Map() {
		vv, ok := v.(map[any]any)
		if !ok {
			continue
		}

		var lis net.Listener
		var addr string

		switch vv["type"] {
		case "bufconn":
			addr = "bufconn"
			lis = bufconn.Listen(vv["bufsize"].(int))
		default:
			bind, ok := vv["bind"].(string)
			if !ok {
				return errors.New("missing bind")
			}

			port, ok := vv["port"].(int)
			if !ok {
				return errors.New("missing port")
			}

			addr = net.JoinHostPort(bind, fmt.Sprintf("%d", port))

			if l, err := net.Listen("tcp", addr); err != nil {
				return err
			} else {
				lis = l

				addr = lis.Addr().String()
			}
		}

		if lis != nil {
			registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = string(registry.StatusReady)

				meta[registry.MetaDescriptionKey] = addr
			}).Register(registry.NewRichItem(k, k, pb.ItemType_ADDRESS, lis), registry.WithEdgeTo(m.root.ID(), "listener", nil))
		}
	}

	return nil
}

func (m *manager) initServers(ctx context.Context, store *Bootstrap, base string) error {

	servers := store.Val(base + "/servers")
	for _, v := range servers.Map() {
		vv, ok := v.(map[any]any)
		if !ok {
			continue
		}

		var uri string
		if t, ok := vv["type"]; ok {
			if tt, ok := t.(string); ok {
				uri = tt + "://"
			}
		}

		srv, err := server.OpenServer(ctx, uri)
		if err != nil {
			return err
		}

		if srv != nil {
			regOpts := []registry.RegisterOption{}

			if l, ok := vv["listener"]; ok {
				if ll, ok := l.(string); ok {
					regOpts = append(regOpts, registry.WithEdgeTo(ll, "listener", nil))
				}
			}

			registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = string(registry.StatusStopped)

				if s, ok := vv["services"]; ok {
					b, _ := json.Marshal(s)
					meta["services"] = string(b)
				}
			}).Register(srv, regOpts...)
		}
	}

	runtime.Register(m.ns, func(ctx context.Context) {
		serverItems, err := m.internalRegistry.List(registry.WithType(pb.ItemType_SERVER))
		if err != nil {
			return
		}

		services, err := m.internalRegistry.List(registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			return
		}

		for _, ss := range services {
			// Find storage and link it
			var namedStores []string
			if err := store.Val(base, "services", ss.Name(), "servers").Scan(&namedStores); err != nil {
				return
			}

			for _, name := range namedStores {
				for _, item := range serverItems {
					if name == item.Name() {
						_, _ = m.internalRegistry.RegisterEdge(ss.ID(), item.ID(), "service", nil)
					}
				}
			}
		}
	})

	return nil
}

func (m *manager) initConnections(ctx context.Context, store *Bootstrap, base string) error {
	connections := store.Val(base + "/connections")
	for k, v := range connections.Map() {
		vv, ok := v.(map[any]any)
		if !ok {
			continue
		}

		switch vv["type"] {
		default:
			var dialOptions []grpc.DialOption
			// Checking if we need to retrieve a listener
			if listenerName, ok := vv["listener"]; ok {
				var lis net.Listener
				listener, err := m.internalRegistry.Get(listenerName.(string), registry.WithType(pb.ItemType_ADDRESS))
				if err != nil {
					return err
				}

				if listener.As(&lis) {
					// If it is a bufconn, adding a context dialer
					switch vlis := lis.(type) {
					case *bufconn.Listener:
						dialOptions = append(dialOptions,
							grpc.WithContextDialer(func(ctx context.Context, address string) (net.Conn, error) {
								return vlis.Dial()
							}),
							grpc.WithTransportCredentials(insecure.NewCredentials()),
						)
					}
				}
			} else {
				dialOptions = append(dialOptions, grpc.WithTransportCredentials(insecure.NewCredentials()))
			}

			dialOptions = append(dialOptions,
				grpc.WithChainUnaryInterceptor(middleware.GrpcUnaryClientInterceptors()...),
				grpc.WithChainStreamInterceptor(middleware.GrpcStreamClientInterceptors()...),
			)

			dialOptions = append(dialOptions, middleware.GrpcClientStatsHandler(nil)...)

			conn, err := grpc.NewClient(vv["uri"].(string), dialOptions...)
			if err != nil {
				return err
			}

			if conn != nil {
				registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
					meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
					meta[registry.MetaStatusKey] = string(registry.StatusTransient)

					if s, ok := vv["services"]; ok {
						b, _ := json.Marshal(s)
						meta["services"] = string(b)
					}
				}).Register(registry.NewRichItem(k, k, pb.ItemType_GENERIC, conn), registry.WithEdgeTo(m.root.ID(), "connection", nil))
			}
		}
	}

	return nil
}

func (m *manager) initStorages(ctx context.Context, store *Bootstrap, base string) error {
	storages := store.Val(base + "/storages")
	for k := range storages.Map() {
		uri := storages.Val(k, "uri").String()
		conn, err := m.storage.Open(ctx, uri)
		if err != nil {
			fmt.Println("initStorages - cannot open storage with uri "+uri, err)
			continue
		}

		if conn != nil {
			registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = string(registry.StatusTransient)
			}).Register(registry.NewRichItem(k, k, pb.ItemType_STORAGE, conn), registry.WithEdgeTo(m.root.ID(), "storage", nil))
		}
	}

	runtime.Register(m.ns, func(ctx context.Context) {
		storageItems, err := m.internalRegistry.List(registry.WithType(pb.ItemType_STORAGE))
		if err != nil {
			return
		}

		services, err := m.internalRegistry.List(registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			return
		}

		for _, ss := range services {
			// Find storage and link it
			var namedStores map[string][]map[string]string
			if err := store.Val(base, "services", ss.Name(), "storages").Scan(&namedStores); err != nil {
				return
			}

			for name, stores := range namedStores {
				for _, st := range stores {
					for _, item := range storageItems {
						if st["type"] == item.Name() {
							st["name"] = name
							_, _ = m.internalRegistry.RegisterEdge(ss.ID(), item.ID(), "storage", st)
						}
					}
				}
			}
		}
	})

	return nil
}

func (m *manager) initQueues(ctx context.Context, store *Bootstrap, base string) error {
	queues := store.Val(base + "/queues")
	for k := range queues.Map() {
		uri := queues.Val(k, "uri").String()
		pool, err := m.queues.Open(ctx, uri)
		if err != nil {
			fmt.Println("initQueues - cannot open pool with URI"+uri, err)
			continue
		}
		regKey := "queue-" + k
		er := registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		}).Register(registry.NewRichItem(regKey, regKey, pb.ItemType_GENERIC, pool), registry.WithEdgeTo(m.root.ID(), "queue", nil))
		if er != nil {
			fmt.Println("initQueues - cannot register queue pool with URI"+uri, er)
		} else {
			//fmt.Println("initQueues - Registered " + regKey + " with pool from uri " + uri)
		}
	}
	return nil
}

func (m *manager) initCaches(ctx context.Context, store *Bootstrap, base string) error {
	caches := store.Val(base + "/caches")
	for k := range caches.Map() {
		uri := caches.Val(k, "uri").String()
		pool, err := m.caches.Open(ctx, uri)
		if err != nil {
			fmt.Println("initCaches - cannot open cache pool with URI"+uri, err)
			continue
		}
		regKey := "cache-" + k
		er := registry.NewMetaWrapper(m.Registry(), func(meta map[string]string) {
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		}).Register(registry.NewRichItem(regKey, regKey, pb.ItemType_GENERIC, pool), registry.WithEdgeTo(m.root.ID(), "cache", nil))
		if er != nil {
			fmt.Println("initCaches - cannot register pool with URI"+uri, er)
		} else {
			//fmt.Println("initCaches - Registered " + regKey + " with pool from uri " + uri)
		}
	}
	return nil
}

func (m *manager) ServeAll(oo ...server.ServeOption) error {

	if err := registry.NewMetaWrapper(m.Registry(), func(meta map[string]string) {
		meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
		meta[registry.MetaStatusKey] = string(registry.StatusTransient)
	}).Register(m.root); err != nil {
		return err
	}

	//go m.bootstrap.WatchConfAndReset(m.ctx, runtime.GetRuntime().GetString(runtime.KeyConfig), func(err error) {
	//	fmt.Println("[bootstrap-watcher]" + err.Error())
	//})

	m.servers = map[string]server.Server{}
	m.services = map[string]service.Service{}

	// Locking the namespace so that a start doesn't occur at the same time elsewhere
	if locker := m.internalRegistry.NewLocker("start-node-" + m.ns); locker != nil {
		locker.Lock()

		w, err := m.internalRegistry.Watch(registry.WithID(m.root.ID()), registry.WithType(pb.ItemType_NODE), registry.WithFilter(func(item registry.Item) bool {
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

	// Starting servers attached to this node that are currently stopped
	eg := &errgroup.Group{}
	servers := m.serversWithStatus(registry.StatusStopped)

	for _, srv := range servers {
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
			log.Logger(m.ctx).Error("Server couldn't start ", zap.Error(err))
			opt.ErrorCallback(err)
		}
	}

	if opt.BlockUntilServe {
		waitAndServe()
		return nil
	} else {
		go waitAndServe()
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
	_ = m.internalRegistry.Deregister(m.root, registry.WithRegisterFailFast())
}

func (m *manager) startServer(srv server.Server, oo ...server.ServeOption) error {
	opts := append(oo)

	opts = append(opts, server.WithContext(m.Context()))

	// Associating listener
	listeners := m.Registry().ListAdjacentItems(
		registry.WithAdjacentSourceItems([]registry.Item{srv}),
		registry.WithAdjacentEdgeOptions(registry.WithName("listener")),
		registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_ADDRESS)),
	)

	if len(listeners) > 1 {
		return errors.New("Should have only one listener")
	} else if len(listeners) == 1 {
		var lis net.Listener
		if listeners[0].As(&lis) {
			opts = append(opts, server.WithListener(lis))
		}
	}

	serviceFilterTemplate := template.New("serviceFilter")

	var targetOpts []registry.Option
	// Retrieving server services information to see which services we need to start
	if b, ok := srv.Metadata()["services"]; ok {
		var sm []map[string]string
		if err := json.Unmarshal([]byte(b), &sm); err != nil {
			return err
		}

		for _, smm := range sm {
			if filter, ok := smm["filter"]; ok {
				targetOpts = append(targetOpts, registry.WithFilter(func(item registry.Item) bool {
					tmpl, err := serviceFilterTemplate.Funcs(map[string]any{
						"sliceToRegexpFmt": func(s []string) string {
							return "^(" + strings.Join(s, "|") + ")$"
						},
					}).Parse(filter)
					if err != nil {
						return false
					}
					var buf bytes.Buffer
					if err := tmpl.Execute(&buf, item); err != nil {
						return false
					}

					ors := strings.Split(buf.String(), " or ")
					for _, or := range ors {
						f := strings.SplitN(or, " ", 3)
						var fn func(any, any) (bool, error)
						switch f[1] {
						case "=":
							fn = func(a any, b any) (bool, error) {
								aa, ok := a.(string)
								if !ok {
									return false, errors.New("wrong format")
								}

								bb, ok := b.(string)
								if !ok {
									return false, errors.New("wrong format")
								}
								return aa == bb, nil
							}
						case "in":
							fn = func(a any, b any) (bool, error) {
								aa, ok := a.([]string)
								if !ok {
									return false, errors.New("wrong format")
								}

								bb, ok := b.(string)
								if !ok {
									return false, errors.New("wrong format")
								}

								for _, aaa := range aa {
									if bb == aaa {
										return true, nil
									}
								}

								return false, nil
							}
						case "~=":
							fn = func(a any, b any) (bool, error) {
								aa, ok := a.(string)
								if !ok {
									return false, errors.New("wrong format")
								}

								bb, ok := b.([]byte)
								if !ok {
									return false, errors.New("wrong format")
								}

								return regexp.Match(aa, bb)
							}
						case "!~=":
							fn = func(a any, b any) (bool, error) {
								aa, ok := a.(string)
								if !ok {
									return false, errors.New("wrong format")
								}

								bb, ok := b.([]byte)
								if !ok {
									return false, errors.New("wrong format")
								}

								m, err := regexp.Match(aa, bb)
								if err != nil {
									return false, err
								}

								return !m, nil
							}
						}

						if fn != nil {
							match, err := fn(f[2], []byte(f[0]))
							if err != nil {
								return false
							}

							if match {
								return true
							}
						}
					}

					return false
				}))
			}
		}
	}

	// Associating services
	services := m.Registry().ListAdjacentItems(
		registry.WithAdjacentSourceItems([]registry.Item{m.root}),
		registry.WithAdjacentEdgeOptions(registry.WithName("Node")),
		registry.WithAdjacentTargetOptions(
			append(targetOpts, registry.WithType(pb.ItemType_SERVICE))...,
		),
	)

	for _, svcv := range services {
		var svc service.Service

		if !svcv.As(&svc) {
			continue
		}

		if !runtime.IsRequired(svc.Name()) {
			continue
		}

		opts = append(opts, m.serviceServeOptions(svc)...)

		svc.Options().Server = srv
	}

	registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
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
		server.WithBeforeServe(func(...registry.RegisterOption) error {
			return svc.Start(registry.WithContextR(m.ctx))
		}),
		server.WithAfterServe(func(...registry.RegisterOption) error {
			return svc.OnServe(registry.WithContextR(m.ctx))
		}),
	}
}

func (m *manager) serversWithStatus(status registry.Status) (ss []server.Server) {
	items := m.internalRegistry.ListAdjacentItems(
		registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVER)),
		registry.WithAdjacentSourceItems([]registry.Item{m.root}),
	)

	for _, item := range items {
		var srv server.Server

		if !item.As(&srv) {
			continue
		}

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
	/*
		res, err := config.Watch(configx.WithPath("services"), configx.WithChangesOnly())
		if err != nil {
			return
		}
		for {
			v, _ := res.Next()
			mm := v.(configx.Values).Val("update", "services").Map()

			for k, _ := range mm {
				ss, err := m.internalRegistry.List(sotwRegistry.WithName(k), sotwRegistry.WithType(pb.ItemType_SERVICE))
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
		}*/
}

func (m *manager) WatchBroker(ctx context.Context, br broker.Broker) error {
	_, er := br.Subscribe(ctx, common.TopicRegistryCommand, func(_ context.Context, message broker.Message) error {
		hh, _ := message.RawData()
		cmd := hh["command"]
		itemName := hh["itemName"]
		s, err := m.internalRegistry.Get(itemName, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE))
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
	ll, _ := m.internalRegistry.List(registry.WithType(pb.ItemType_SERVICE), registry.WithName(name))
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
			if status, ok := item.Metadata()[registry.MetaStatusKey]; !ok || status != string(registry.StatusTransient) {
				return false
			}

			return true
		}),
	}

	w, err := m.internalRegistry.Watch(options...)
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
			items := m.internalRegistry.ListAdjacentItems(
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

				go m.internalRegistry.Register(ms.(registry.Item))
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
	w, _ := m.internalRegistry.Watch(options...)
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
