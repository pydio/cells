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
	"maps"
	"net"
	"net/url"
	"os"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/bep/debounce"
	"github.com/manifoldco/promptui"
	"github.com/pkg/errors"
	"github.com/spf13/cast"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"
	yaml "gopkg.in/yaml.v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/revisions"
	"github.com/pydio/cells/v5/common/crypto/keyring"
	"github.com/pydio/cells/v5/common/middleware"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/controller"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/fork"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/common/utils/watch"

	_ "embed"
)

const (
	CommandStart   = "start"
	CommandStop    = "stop"
	CommandRestart = "restart"
)

var (
	//go:embed start-storages2.yaml
	storages2YAML string
)

type Manager interface {
	Context() context.Context
	Registry() registry.Registry
	ServeAll(...server.ServeOption) error
	StopAll()
	SetServeOptions(...server.ServeOption)
	WatchServicesConfigs()
	WatchBroker(ctx context.Context, br broker.Broker) error

	Bootstrap(string) error
	// RegisterBootstrapTemplate(typ string, data string) error
	RegisterStorage(scheme string, options ...controller.Option[storage.Storage])
	RegisterConfig(scheme string, config ...controller.Option[*openurl.Pool[config.Store]])
	RegisterQueue(scheme string, opts ...controller.Option[broker.AsyncQueuePool])
	RegisterCache(scheme string, opts ...controller.Option[*openurl.Pool[cache.Cache]])

	GetRootID() string
	GetStorage(ctx context.Context, name string, out any) error
	GetQueue(ctx context.Context, name string, resolutionData map[string]interface{}, openerID string, openerFunc broker.OpenWrapper) (broker.AsyncQueue, func() (bool, error), error)
	GetQueuePool(name string) (broker.AsyncQueuePool, error)
	GetCache(ctx context.Context, name string, resolutionData map[string]interface{}) (cache.Cache, error)
}

type manager struct {
	ctx  context.Context
	base string

	bootstrap *Bootstrap

	ns     string
	srcUrl string

	// registries
	// - internal
	internalRegistry registry.Registry

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

func NewManager(ctx context.Context, namespace string, logger log.ZapLogger, r ...runtime.Runtime) (Manager, error) {

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

	m.ctx = propagator.With(m.ctx, ContextKey, m)

	bootstrap, err := NewBootstrap(m.ctx)
	if err != nil {
		return nil, err
	}

	m.bootstrap = bootstrap

	localRuntime := runtime.GetRuntime()
	if len(r) > 0 {
		localRuntime = r[0]
	}

	runtime.Init(m.ctx, "system")

	base := localRuntime.GetString(runtime.KeyBootstrapRoot)
	if name := runtime.Name(); name != "" && name != "default" {
		base += strings.Join(strings.Split("_"+name, "_"), "/processes/")
	}

	if reg, err := m.initInternalRegistry(m.ctx, m.bootstrap, m.base); err != nil {
		return nil, err
	} else {
		m.internalRegistry = reg

		go m.WatchTransientStatus()
		// go m.WatchServers()

		m.ctx = propagator.With(m.ctx, registry.ContextKey, reg)
	}

	if kr, err := m.initKeyring(m.ctx); err != nil {
		return nil, err
	} else {
		m.ctx = propagator.With(m.ctx, keyring.KeyringContextKey, kr)
	}

	var parentStore *openurl.Pool[config.Store]
	propagator.Get(m.ctx, config.ContextKey, &parentStore)

	if parentStore == nil {

		if store, vault, revisions, err := m.initConfig(m.ctx); err != nil {
			return nil, err
		} else {
			m.ctx = propagator.With(m.ctx, config.ContextKey, store)
			m.ctx = propagator.With(m.ctx, config.VaultKey, vault)
			m.ctx = propagator.With(m.ctx, config.RevisionsKey, revisions)
		}
	}

	return m, nil
}

func (m *manager) Bootstrap(bootstrapYAML string) error {
	bootstrap, err := NewBootstrap(m.ctx)
	if err != nil {
		return err
	}

	m.bootstrap = bootstrap

	str, err := tplEval(m.ctx, bootstrapYAML, "bootstrap", nil, runtime.GetRuntime())
	if err != nil {
		return err
	} else {
		if err := m.bootstrap.RegisterTemplate(m.ctx, "yaml", str); err != nil {
			return err
		}
	}

	if err := m.initNamespace(m.ctx, m.bootstrap, m.base); err != nil {
		return err
	}

	// TODO : this would imply using eg.Wait() somewhere, is normal ?
	var eg errgroup.Group
	eg.Go(func() error {
		return m.initProcesses(m.ctx, m.bootstrap, m.base)
	})

	// Initialising listeners
	if err := m.initListeners(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	// Initialising default connections
	if err := m.initConnections(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	// Connecting to the control plane if necessary
	/*reg, err := registry.OpenRegistry(m.ctx, runtime.RegistryURL())
	if err == nil {
		// Registering everything
		items, err := m.internalRegistry.List()
		if err != nil {
			return err
		}
		for _, item := range items {
			reg.Register(item)
		}

		m.internalRegistry = registry.NewFuncWrapper(m.internalRegistry,
			registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
				if err := reg.Register(*item, *opts...); err != nil {
					fmt.Println("I have an error ", err)
				}
			}),
		)
	}*/

	m.ctx = propagator.With(m.ctx, registry.ContextKey, m.internalRegistry)

	//if store, vault, revisions, err := m.initConfig(m.ctx); err != nil {
	//	return err
	//} else {
	//	m.ctx = propagator.With(m.ctx, config.ContextKey, store)
	//	m.ctx = propagator.With(m.ctx, config.VaultKey, vault)
	//	m.ctx = propagator.With(m.ctx, config.RevisionsKey, revisions)

	var store *openurl.Pool[config.Store]
	propagator.Get(m.ctx, config.ContextKey, &store)

	m.initTelemetry(m.ctx, m.bootstrap, store)
	//}

	// Initialising servers
	if err := m.initServers(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	if err := m.initServices(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	// Initialising storages
	if err := m.initStorages(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	// Initialising queues
	if err := m.initQueues(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	// Initialising caches
	if err := m.initCaches(m.ctx, m.bootstrap.Val(), m.base); err != nil {
		return err
	}

	runtime.Init(m.ctx, m.ns)

	runtime.Init(m.ctx, runtime.NsConnReady)

	return nil
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

	var pool storage.Storage
	if done := item.As(&pool); !done {
		return errors.New("wrong item format")
	}

	st, err := pool.Get(ctx)
	if err != nil {
		return err
	}

	reflect.ValueOf(out).Elem().Set(reflect.ValueOf(st))

	return nil
}

func (m *manager) GetQueue(ctx context.Context, name string, resolutionData map[string]interface{}, openerID string, openerFunc broker.OpenWrapper) (broker.AsyncQueue, func() (bool, error), error) {
	qp, er := m.GetQueuePool(name)
	if er != nil {
		return nil, nil, er
	}
	resolutionData[broker.OpenerIDKey] = openerID
	resolutionData[broker.OpenerFuncKey] = openerFunc
	q, er := qp.Get(ctx, resolutionData)
	if er != nil {
		return nil, nil, er
	}
	remover := func() (bool, error) {
		return qp.Del(ctx, resolutionData)
	}
	return q, remover, nil
}

func (m *manager) GetQueuePool(name string) (broker.AsyncQueuePool, error) {
	item, err := m.internalRegistry.Get("queue-"+name, registry.WithType(pb.ItemType_GENERIC))
	if err != nil {
		return nil, errors.Wrap(err, "cannot get queue-"+name+" from registry")
	}
	var pool broker.AsyncQueuePool
	if ok := item.As(&pool); !ok {
		return nil, errors.New("wrong registry item format for queue-" + name)
	}
	return pool, nil
}

func (m *manager) GetCache(ctx context.Context, name string, resolutionData map[string]interface{}) (cache.Cache, error) {
	item, err := m.internalRegistry.Get("cache-"+name, registry.WithType(pb.ItemType_GENERIC))
	if err != nil {
		return nil, errors.Wrap(err, "cannot get cache-"+name+" from registry")
	}
	var pool *openurl.Pool[cache.Cache]
	if ok := item.As(&pool); !ok {
		return nil, errors.New("wrong registry item format for cache-" + name)
	}
	return pool.Get(ctx, resolutionData)
}

func (m *manager) initNamespace(ctx context.Context, bootstrap config.Store, base string) error {
	m.ns = bootstrap.Val(base, "runtime").Default(m.ns).String()

	return nil
}

func (m *manager) initKeyring(ctx context.Context) (keyring.Keyring, error) {
	keyringURL := runtime.KeyringURL()
	if keyringURL == "" {
		return nil, nil
	}

	// Keyring store
	keyringStore, err := config.OpenStore(ctx, keyringURL)
	if err != nil {
		return nil, fmt.Errorf("could not init keyring store %v", err)
	}

	// Keyring start and creation of the master password
	kr := keyring.NewConfigKeyring(keyringStore, keyring.WithAutoCreate(true, func(s string) {
		fmt.Println(promptui.IconWarn + " [Keyring] " + s)
	}))

	password, err := kr.Get(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey)
	if err != nil {
		return nil, fmt.Errorf("could not get master password %v", err)
	}

	runtime.SetVaultMasterKey(password)

	return kr, nil
}

func (m *manager) initConfig(ctx context.Context) (*openurl.Pool[config.Store], *openurl.Pool[config.Store], *openurl.Pool[revisions.Store], error) {

	vaultStorePool, err := openurl.OpenPool(ctx, []string{runtime.VaultURL()}, func(ctx context.Context, url string) (config.Store, error) {
		vaultStore, err := config.OpenStore(ctx, url)
		if err != nil {
			return nil, err
		}

		return vaultStore, nil
	})
	if err != nil {
		return nil, nil, nil, errors.Wrap(err, "cannot open vault store pool")
	}

	mainStorePool, err := openurl.OpenPool(ctx, []string{runtime.ConfigURL()}, func(ctx context.Context, url string) (config.Store, error) {
		mainStore, err := config.OpenStore(ctx, url)
		if err != nil {
			return nil, err
		}

		// Adding vault store
		vaultStore, err := vaultStorePool.Get(ctx)
		if err != nil {
			return nil, err
		}

		mainStore = config.NewVault(vaultStore, mainStore)

		// Additional Proxy
		mainStore = config.Proxy(mainStore)

		return mainStore, nil
	})
	if err != nil {
		return nil, nil, nil, errors.Wrap(err, "cannot open config store pool")
	}

	versionsStorePool, err := openurl.OpenPool(ctx, []string{runtime.ConfigURL()}, func(ctx context.Context, url string) (revisions.Store, error) {
		mainStore, err := mainStorePool.Get(ctx)
		if err != nil {
			return nil, err
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

		return versionsStore, nil
	})

	return mainStorePool, vaultStorePool, versionsStorePool, nil
}

func (m *manager) initTelemetry(ctx context.Context, bootstrap config.Store, storePool *openurl.Pool[config.Store]) {
	// Default is taken from bootstrap
	conf := &telemetry.Config{
		Loggers: []log.LoggerConfig{{
			Encoding: "console",
			Level:    "info",
			Outputs:  []string{"stdout:///"},
		}},
	}

	// Then read from bootstrap
	_ = bootstrap.Val("#/telemetry").Scan(&conf)

	store, err := storePool.Get(ctx)
	if err != nil {
		return
	}

	var configLoaded bool
	// And finally from config, it will be hot-reloaded if config is changed
	config.GetAndWatch(ctx, store, []string{"defaults", "telemetry"}, func(values configx.Values) {
		if values.Context(ctx).Scan(conf) == nil {
			if e := conf.Reload(ctx); e != nil {
				fmt.Println("Error loading telemetry setup", e)
			}
			configLoaded = true
		}
	})
	if !configLoaded {
		if e := conf.Reload(ctx); e != nil {
			fmt.Println("Error loading telemetry setup", e)
		}
	}
}

func (m *manager) initInternalRegistry(ctx context.Context, bootstrap config.Store, base string) (registry.Registry, error) {

	reg, err := registry.OpenRegistry(ctx, "mem:///?cache="+m.ns)
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

	b, err := json.Marshal(bootstrap.Val().Get())
	if err != nil {
		return nil, err
	}

	if err := registry.NewMetaWrapper(reg, func(meta map[string]string) {
		meta["bootstrap"] = string(b)
	}).Register(m.root); err != nil {
		return nil, err
	}

	// runtime.Register("discovery", func(ctx context.Context) {
	reg = registry.NewFuncWrapper(reg,
		registry.OnRegister(func(item *registry.Item, opts *[]registry.RegisterOption) {
			var node registry.Node
			var srv server.Server
			var svc service.Service
			if (*item).As(&node) && node.ID() != m.root.ID() {
				*opts = append(*opts, registry.WithEdgeTo(m.root.ID(), "Node", nil))
			} else if (*item).As(&srv) {
				*opts = append(*opts, registry.WithEdgeTo(m.root.ID(), "Node", nil))
			} else if (*item).As(&svc) {
				*opts = append(*opts, registry.WithEdgeTo(m.root.ID(), "Node", nil))
			}
		}),
	)

	var parentRegistry registry.Registry
	if propagator.Get(ctx, registry.ContextKey, &parentRegistry) && parentRegistry != nil {
		return registry.NewCombinedRegistry(reg, parentRegistry), nil
	}

	return reg, nil
}

func (m *manager) initProcesses(ctx context.Context, bootstrap config.Store, base string) error {
	cmds := make(map[string]*fork.Process)

	var baseWatch []string
	if base != "#" {
		baseWatch = append(baseWatch, strings.Split(strings.TrimLeft(base, "#/"), "/")...)
	}

	w, err := bootstrap.Watch(watch.WithPath(append(baseWatch, "processes", "*")...), watch.WithChangesOnly())
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

		for _, name := range processesToStart {
			process := processes.Val(name)

			childBinary := os.Args[0]
			var childArgs []string
			var childEnv []string

			connections := process.Val("connections")
			// TODO
			//binary := process.Val("binary")
			//args := process.Val("args")
			env := process.Val("env")
			servers := process.Val("servers")
			tags := process.Val("tags")
			debug := process.Val("debug")

			if debug.Bool() {
				childBinary = "dlv"
				childArgs = append(childArgs, "--listen=:2345", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "--", os.Args[0])
			}

			childArgs = append(childArgs, "start", "--name", name)
			if sets := runtime.GetString(runtime.KeyBootstrapSetsFile); sets != "" {
				childArgs = append(childArgs, "--sets", sets)
			}

			for _, set := range runtime.GetStringSlice(runtime.KeyBootstrapSet) {
				kv := strings.SplitN(set, "=", 2)
				if len(kv) != 2 {
					continue
				}

				if strings.HasPrefix(kv[0], "processes/"+name+"/") {
					arg := []string{strings.TrimPrefix(kv[0], base), kv[1]}
					childArgs = append(childArgs, "--"+runtime.KeyBootstrapSet, strings.Join(arg, "="))
				}
			}

			if runtime.GetString(runtime.KeyBootstrapFile) != "" {
				childEnv = append(childEnv, "CELLS_BOOTSTRAP_FILE="+runtime.GetString(runtime.KeyBootstrapFile))
			}

			if runtime.GetString(runtime.KeyBootstrapTpl) != "" {
				b, err := yaml.Marshal(bootstrap.Val(base).Map())
				if err != nil {
					continue
				}

				childEnv = append(childEnv, fmt.Sprintf("CELLS_BOOTSTRAP_YAML=%s", string(b)))
			} else {
				childEnv = append(childEnv, "CELLS_BOOTSTRAP_ROOT="+base)
			}

			// Adding connections to the environment
			for k := range connections.Map() {
				uri := connections.Val(k, "uri").String()
				u, err := url.Parse(uri)
				if err != nil {
					log.Logger(ctx).Warn("connection url not right: " + uri)
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
			// childEnv = append(childEnv, "CELLS_BOOTSTRAP_ROOT="+base)

			cmds[name] = fork.NewProcess(m.ctx, []string{}, fork.WithBinary(childBinary), fork.WithName(name), fork.WithArgs(childArgs), fork.WithEnv(childEnv))
			go cmds[name].StartAndWait(5)
		}
	}
}

func (m *manager) initListeners(ctx context.Context, store configx.Values, base string) error {
	listeners := store.Val(base + "/listeners")
	for k, v := range listeners.Map() {
		vv, err := cast.ToStringMapE(v)
		if err != nil {
			return err
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
				meta["host"] = runtime.GetString(runtime.KeyAdvertiseAddress)
			}).Register(registry.NewRichItem(uuid.New(), k, pb.ItemType_ADDRESS, lis), registry.WithEdgeTo(m.root.ID(), "listener", nil))
		}
	}

	return nil
}

func (m *manager) initServers(ctx context.Context, store configx.Values, base string) error {

	servers := store.Val(base + "/servers")
	for _, v := range servers.Map() {
		vv, err := cast.ToStringMapE(v)
		if err != nil {
			return err
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

			if err := registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = string(registry.StatusStopped)

				if l, ok := vv["listener"]; ok {
					ls, ok := l.(string)
					if ok {
						meta["listener"] = ls
					}
				}

				// Adding the services filters as meta of the item for later resolution
				if s, ok := vv["services"]; ok {
					b, _ := json.Marshal(s)
					meta["services"] = string(b)
				}

				if m, ok := vv["meta"]; ok {
					if mm, ok := m.(map[any]any); ok {
						for k, vvv := range mm {
							meta[k.(string)] = vvv.(string)
						}
					}
				}
			}).Register(srv, regOpts...); err != nil {
				return err
			}
		}
	}

	return nil
}

func (m *manager) initServices(ctx context.Context, store configx.Values, base string) error {

	runtime.Register(m.ns, func(ctx context.Context) {
		svcs, err := m.internalRegistry.List(registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			return
		}

		for _, svc := range svcs {
			var s service.Service
			if svc.As(&s) {
				storagesMap := store.Val(base+"/services", svc.Name(), "storages").Map()
				if len(storagesMap) > 0 {
					storagesMapStr, err := json.Marshal(storagesMap)
					if err != nil {
						continue
					}
					meta := maps.Clone(s.Options().Metadata)

					meta["resolutionData"] = string(storagesMapStr)
					s.Options().Metadata = meta
					if err := m.Registry().Register(svc); err != nil {
						continue
					}
				}
			}
		}
	})

	return nil
}

func (m *manager) initConnections(ctx context.Context, store configx.Values, base string) error {
	connections := store.Val(base + "/connections")
	for k, v := range connections.Map() {
		vv, err := cast.ToStringMapE(v)
		if err != nil {
			return err
		}

		pool, err := openurl.OpenPool(ctx, []string{vv["uri"].(string)}, func(ctx context.Context, url string) (grpc.ClientConnInterface, error) {
			switch vv["type"] {
			default:
				var dialOptions []grpc.DialOption
				// Checking if we need to retrieve a listener
				if listenerName, ok := vv["listener"]; ok {
					listeners, err := m.internalRegistry.List(registry.WithName(listenerName.(string)), registry.WithType(pb.ItemType_ADDRESS))
					if err != nil {
						return nil, err
					}

					if len(listeners) != 1 {
						return nil, errors.New("should only have one listener")
					}

					var lis net.Listener
					if listeners[0].As(&lis) {
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
					return nil, err
				}

				return conn, nil
			}
		})

		if err != nil {
			return err
		}

		if err := registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusReady)

			// Adding the services filters as meta of the item for later resolution
			if s, ok := vv["services"]; ok {
				b, _ := json.Marshal(s)
				meta["services"] = string(b)
			}
		}).Register(registry.NewRichItem(k, k, pb.ItemType_GENERIC, pool), registry.WithEdgeTo(m.root.ID(), "connection", nil)); err != nil {
			return err
		}
	}

	return nil
}

func (m *manager) initStorages(ctx context.Context, store configx.Values, base string) error {
	//runtime.Register(m.ns, func(ctx context.Context) {
	storages := store.Val(base + "/storages")
	storagesMap := storages.Map()

	for k := range storagesMap {
		uri := storages.Val(k, "uri").String()
		pool, err := m.storage.Open(ctx, uri)
		if err != nil {
			fmt.Println("initStorages - cannot open pool with URI"+uri, err)
			continue
		}
		regKey := k
		er := registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
			meta["driver"] = storages.Val(k, "driver").String()
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		}).Register(registry.NewRichItem(regKey, regKey, pb.ItemType_STORAGE, pool), registry.WithEdgeTo(m.root.ID(), "storage", nil))
		if er != nil {
			fmt.Println("initStorages - cannot register pool with URI"+uri, er)
		}
	}

	/*
		storageItems, err := m.internalRegistry.List(registry.WithType(pb.ItemType_STORAGE))
		if err != nil {
			return err
		}

			services, err := m.internalRegistry.List(registry.WithType(pb.ItemType_SERVICE))
			if err != nil {
				return err
			}

			for _, ss := range services {
				var svc service.Service
				if !ss.As(&svc) {
					continue
				}

				// Find storage and link it
				// TODO - Named stores should come from the config then ?
				var namedStores map[string][]map[string]string
				if err := store.Val(base, "services", ss.Name(), "storages").Scan(&namedStores); err != nil {
					return err
				}

				if len(namedStores) == 0 {
					continue
				}

				for name, stores := range namedStores {
					for _, st := range stores {
						for _, storageItem := range storageItems {
							if st["type"] == storageItem.Name() {
								st["name"] = name

								if _, err := m.internalRegistry.RegisterEdge(ss.ID(), storageItem.ID(), "storage", st); err != nil {
									fmt.Println("ERror while registering ", storageItem.ID(), ss.Name())
								}
							}
						}
					}
				}
			}
	*/

	return nil
}

func (m *manager) initQueues(ctx context.Context, store configx.Values, base string) error {
	// runtime.Register(m.ns, func(ctx context.Context) {
	queues := store.Val(base + "/queues")
	for k := range queues.Map() {
		if k != common.QueueTypeDebouncer && k != common.QueueTypePersistent {
			log.Logger(ctx).Error("WARNING - Cache key should be one of ['" + common.QueueTypeDebouncer + "', '" + common.QueueTypePersistent + "']. Key " + k + " will be useless")
			continue
		}
		uri := queues.Val(k, "uri").String()
		pool, err := m.queues.Open(ctx, uri)
		if err != nil {
			log.Logger(ctx).Error("initQueues - cannot open pool with URI"+uri, zap.Error(err))
			continue
		}
		regKey := "queue-" + k
		er := registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		}).Register(registry.NewRichItem(regKey, regKey, pb.ItemType_GENERIC, pool), registry.WithEdgeTo(m.root.ID(), "queue", nil))
		if er != nil {
			log.Logger(ctx).Error("initQueues - cannot register queue pool with URI"+uri, zap.Error(er))
		} else {
			log.Logger(ctx).Info("Registered Queue " + regKey + " with pool from uri " + uri)
		}
	}
	//})

	// TODO - we should watch the multi context manager to see if a new context has been added
	runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, name string) error {
		var configStore config.Store
		propagator.Get(ctx, config.ContextKey, &configStore)

		if configStore == nil {
			return nil
		}

		go func() {
			queues := configStore.Val("queues")
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
		}()

		return nil
	})

	return nil
}

func (m *manager) initCaches(ctx context.Context, store configx.Values, base string) error {
	// runtime.Register(m.ns, func(ctx context.Context) {
	caches := store.Val(base + "/caches")
	for k := range caches.Map() {
		if k != common.CacheTypeShared && k != common.CacheTypeLocal {
			log.Logger(ctx).Error("WARNING - Cache key should be one of ['" + common.CacheTypeLocal + "', '" + common.CacheTypeShared + "']. Key " + k + " will be useless")
			continue
		}
		uri := caches.Val(k, "uri").String()
		pool, err := m.caches.Open(ctx, uri)
		if err != nil {
			log.Logger(ctx).Error("initCaches - cannot open cache pool with URI"+uri, zap.Error(err))
			continue
		}
		regKey := "cache-" + k
		er := registry.NewMetaWrapper(m.Registry(), func(meta map[string]string) {
			meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
			meta[registry.MetaStatusKey] = string(registry.StatusTransient)
		}).Register(registry.NewRichItem(regKey, regKey, pb.ItemType_GENERIC, pool), registry.WithEdgeTo(m.root.ID(), "cache", nil))
		if er != nil {
			log.Logger(ctx).Error("initCaches - cannot register pool with URI"+uri, zap.Error(er))
		} else {
			log.Logger(ctx).Info("Registered Cache " + regKey + " with pool from uri " + uri)
		}
	}
	// })

	// TODO - we should watch the multi context manager to see if a new context has been added
	runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, name string) error {
		var configStore config.Store
		propagator.Get(ctx, config.ContextKey, &configStore)

		if configStore == nil {
			return nil
		}

		go func() {
			caches := configStore.Val("caches")
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
		}()

		return nil
	})

	return nil
}

func (m *manager) ServeAll(oo ...server.ServeOption) error {

	if err := registry.NewMetaWrapper(m.Registry(), func(meta map[string]string) {
		meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
		meta[registry.MetaStatusKey] = string(registry.StatusTransient)
	}).Register(m.root); err != nil {
		return err
	}

	go m.WatchServices()

	<-time.After(200 * time.Millisecond)

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
	servers := serversWithStatus(m.internalRegistry, m.root, registry.StatusStopped)

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
	for _, srv := range serversWithStatus(m.internalRegistry, m.root, registry.StatusReady) {
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

	var regOpts []registry.RegisterOption

	opts := append(oo)
	opts = append(opts, server.WithContext(m.Context()))

	// Associating listener
	listeners := m.Registry().ListAdjacentItems(
		registry.WithAdjacentSourceItems([]registry.Item{m.root}),
		registry.WithAdjacentEdgeOptions(registry.WithName("listener")),
		registry.WithAdjacentTargetOptions(
			registry.WithName(srv.Metadata()["listener"]),
			registry.WithType(pb.ItemType_ADDRESS),
		),
	)

	if len(listeners) > 1 {
		return errors.New("Should have only one listener")
	} else if len(listeners) == 1 {
		var lis net.Listener
		if listeners[0].As(&lis) {
			opts = append(opts, server.WithListener(lis))
			regOpts = append(regOpts, registry.WithEdgeTo(listeners[0].ID(), "listener", nil))
		}
	}

	// Generate the filters the server will use to determine which service to start
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
		services := m.Registry().ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{m.root}),
			registry.WithAdjacentEdgeOptions(registry.WithName("Node")),
			registry.WithAdjacentTargetOptions(
				append(targetOpts, registry.WithType(pb.ItemType_SERVICE))...,
			),
		)

		for _, svcItem := range services {
			var svc service.Service

			if !svcItem.As(&svc) {
				continue
			}

			opts = append(opts, m.serviceServeOptions(svc)...)

			svc.Options().Server = srv
		}
	}

	if err := registry.NewMetaWrapper(m.internalRegistry, func(meta map[string]string) {
		meta[registry.MetaStatusKey] = string(registry.StatusTransient)
	}).Register(srv, regOpts...); err != nil {
		return err
	}

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
		/*server.WithAfterServe(func(...registry.RegisterOption) error {
			return runtime.MultiContextManager().Iterate(svc.Options().RuntimeContext(), func(ctx context.Context, name string) error {
				ctx = propagator.With(ctx, service.ContextKey, svc)
				if err := service.UpdateServiceVersion(ctx, svc.Options()); err != nil {
					fmt.Println("I have an error here ", err)
				}

				return nil
			})
		}),*/
		server.WithAfterServe(func(...registry.RegisterOption) error {
			return svc.OnServe(registry.WithContextR(m.ctx))
		}),
	}
}

func serversWithStatus(reg registry.Registry, root registry.Item, status registry.Status) (ss []server.Server) {
	items := reg.ListAdjacentItems(
		registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVER)),
		registry.WithAdjacentSourceItems([]registry.Item{root}),
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
				if itemStatus != string(registry.StatusReady) && itemStatus != string(registry.StatusStopped) && itemStatus != string(registry.StatusWaiting) && itemStatus != string(registry.StatusError) {
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

func (m *manager) WatchBootstrap() {
	r, err := m.bootstrap.Watch(watch.WithPath("*"), watch.WithChangesOnly())
	if err != nil {
		return
	}

	for {
		res, err := r.Next()
		if err != nil {
			continue
		}

		val, ok := res.(configx.Values)
		if !ok {
			continue
		}

		// Initialising listeners
		m.initListeners(m.ctx, val.Val("update"), m.base)

		m.initConnections(m.ctx, val.Val("update"), m.base)

		m.initServers(m.ctx, val.Val("update"), m.base)

		m.initStorages(m.ctx, val.Val("update"), m.base)

		m.initCaches(m.ctx, val.Val("update"), m.base)

		m.initQueues(m.ctx, val.Val("update"), m.base)
	}
}

func (m *manager) WatchServers() {
	w, err := m.internalRegistry.Watch(registry.WithType(pb.ItemType_SERVER), registry.WithAction(pb.ActionType_CREATE))
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

			var srv server.Server
			if i.As(&srv) {
				if err := m.startServer(srv); err != nil {
					continue
				}
			}
		}
	}
}

func (m *manager) WatchServices() {

	w, err := m.internalRegistry.Watch(registry.WithType(pb.ItemType_SERVICE))
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

			var svc service.Service
			if i.As(&svc) {
				if err := runtime.MultiContextManager().Iterate(m.Context(), func(ctx context.Context, name string) error {

					var mcm Manager
					propagator.Get(ctx, ContextKey, &mcm)

					ctx = propagator.With(ctx, service.ContextKey, svc)
					ctx = context.WithValue(ctx, "managertype", "multicontext")

					var store config.Store
					propagator.Get(ctx, config.ContextKey, &store)

					storageItems, err := mcm.Registry().List(registry.WithType(pb.ItemType_STORAGE))
					if err != nil {
						return err
					}

					if len(storageItems) > 0 && len(svc.Options().StorageOptions.SupportedDrivers) > 0 {

						var resolutionData map[string][]map[string]string
						if svc.Options().Metadata["resolutionData"] != "" {
							if err := json.Unmarshal([]byte(svc.Options().Metadata["resolutionData"]), &resolutionData); err != nil {
								return err
							}
						}

						for key, supportedDrivers := range svc.Options().StorageOptions.SupportedDrivers {

							for _, supportedDriver := range supportedDrivers {

								handlerV := reflect.ValueOf(supportedDriver.Handler)
								handlerT := reflect.TypeOf(supportedDriver.Handler)
								if handlerV.Kind() != reflect.Func {
									return errors.New("storage handler is not a function")
								}

								startsAt := 0
								// Check if first expected parameter is a context, if so, use the input context
								if handlerT.In(0).Implements(reflect.TypeOf((*context.Context)(nil)).Elem()) {
									startsAt = 1
								}

								for i := startsAt; i < handlerT.NumIn(); i++ {
									for _, storageItem := range storageItems {
										var st storage.Storage
										if !storageItem.As(&st) {
											continue
										}

										out, err := st.Get(ctx)
										if err != nil {
											log.Logger(ctx).Error("failed to get storage", zap.Error(err))
											continue
										}

										if reflect.TypeOf(out) == handlerT.In(i) || (handlerT.In(i).Kind() == reflect.Interface && reflect.TypeOf(out).Implements(handlerT.In(i))) {
											var meta map[string]string
											for _, meta = range resolutionData[key] {
												if meta["type"] == storageItem.Metadata()["driver"] {
													break
												}
											}

											// We need to register the edge between these two
											_, err := mcm.Registry().RegisterEdge(svc.ID(), storageItem.ID(), "storage_"+key, meta)
											if err != nil {
												return err
											}
										}

									}
								}
							}
						}
					}

					go func(c context.Context, s service.Service) {
						if s.Options().MigrateIterator.Lister != nil {
							var errs []error
							for _, key := range s.Options().MigrateIterator.Lister(ctx) {
								c = propagator.With(c, s.Options().MigrateIterator.ContextKey, key)
								errs = append(errs, service.UpdateServiceVersion(c, s.Options()))
							}
							if outE := multierr.Combine(errs...); outE != nil {
								log.Logger(ctx).Error("One specific upgrade was not performed successfully, but process is continued", zap.Error(outE))
							}

						} else {
							if err := service.UpdateServiceVersion(c, s.Options()); err != nil {
								return
							}
						}

						if w := s.Options().MigrateWatcher.Watcher; w != nil {
							rw, err := w(c)
							if err != nil {
								return
							}

							for {
								_, err := rw.Next()
								if err != nil {
									continue
								}

								for _, key := range store.Val("services/pydio.grpc.data.index/sources").StringArray() {
									c = propagator.With(c, s.Options().MigrateIterator.ContextKey, key)
									if err := service.UpdateServiceVersion(c, s.Options()); err != nil {
										continue
									}
								}
							}
						}

					}(ctx, svc)

					return nil
				}); err != nil {
					panic(err)
				}
			}
		}
	}
}
