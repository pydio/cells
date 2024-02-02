/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package cmd

import (
	"context"
	_ "embed"
	"github.com/pydio/cells/v4/common"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/server"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/filex"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"os"
	"path/filepath"
)

var (
	//go:embed config.yaml
	defaultTemplate string
	configChecks    []func(ctx context.Context) error
)

func RegisterConfigChecker(f func(ctx context.Context) error) {
	configChecks = append(configChecks, f)
}

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:     "start",
	Aliases: []string{"daemon"},
	Short:   "Start one or more services",
	Long: `
DESCRIPTION

  Start one or more services on this machine. 
  $ ` + os.Args[0] + ` start [flags] args...

  No arguments will start all services available (see 'ps' command).  
   - Select specific services with regular expressions in the additional arguments. 
   - The -t/--tags flag may limit to only a certain category of services (see usage below)
   - The -x/--exclude flag may exclude one or more services
  All these may be used in conjunction (-t, -x, regexp arguments).

REQUIREMENTS
  
  Ulimit: set a number of allowed open files greater or equal to 2048.
  For production use, a minimum of 8192 is recommended (see ulimit -n).

  Setcap: if you intend to bind the server to standard http ports (80, 443), 
  you must grant necessary permissions on cells binary with this command:
  $ sudo setcap 'cap_net_bind_service=+ep' <path to your binary>    

EXAMPLES

  1. Start all Cells services
  $ ` + os.Args[0] + ` start

  2. Start all services whose name starts with pydio.grpc
  $ ` + os.Args[0] + ` start pydio.grpc

  3. Start only services for scheduler
  $ ` + os.Args[0] + ` start --tag=scheduler

  4. Start whole plateform except the roles service
  $ ` + os.Args[0] + ` start --exclude=pydio.grpc.idm.role

ENVIRONMENT

  1. Flag mapping

  All the command flags documented below are mapped to their associated ENV var, using upper case and CELLS_ prefix.
  For example :
  $ ` + os.Args[0] + ` start --grpc_port 54545
  is equivalent to 
  $ export CELLS_GRPC_PORT=54545; ` + os.Args[0] + ` start

  2. Working Directories 

  - CELLS_WORKING_DIR: replace the whole standard application dir
  - CELLS_DATA_DIR: replace the location for storing default datasources (default CELLS_WORKING_DIR/data)
  - CELLS_LOG_DIR: replace the location for storing logs (default CELLS_WORKING_DIR/logs)
  - CELLS_SERVICES_DIR: replace location for services-specific data (default CELLS_WORKING_DIR/services)

  3. Timeouts, limits, proxies

  - CELLS_SQL_DEFAULT_CONN, CELLS_SQL_LONG_CONN: timeouts used for SQL queries. Use a golang duration (10s, 1m, etc). Defaults are respectively 30 seconds and 10 minutes.
  - CELLS_CACHES_HARD_LIMIT: maximum memory limit used by internal caches (in MB, default is 8). This is a per/cache limit, not global.
  - CELLS_UPDATE_HTTP_PROXY: if your server uses a client proxy to access outside world, this can be set to query update server.
  - HTTP_PROXY, HTTPS_PROXY, NO_PROXY: golang-specific environment variables to configure a client proxy for all external http calls.

  4. Other environment variables (development or advanced fine-tuning)

` + runtime.DocRegisteredEnvVariables("CELLS_SQL_DEFAULT_CONN", "CELLS_SQL_LONG_CONN", "CELLS_CACHES_HARD_LIMIT", "CELLS_UPDATE_HTTP_PROXY") + `

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{
			runtime.KeyFork: runtime.KeyForkLegacy,
		})

		runtime.SetArgs(args)
		initLogLevel()
		handleSignals(args)

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		ctx, cancel := context.WithCancel(cmd.Context())
		defer cancel()

		configFile := filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultConfigFileName)
		if runtime.ConfigIsLocalFile() && !filex.Exists(configFile) {
			return nil
			//return triggerInstall(
			//	"We cannot find a configuration file ... "+configFile,
			//	"Do you want to create one now",
			//	cmd, args)
		}

		// Init config
		isNew, keyring, er := initConfig(ctx, true)
		if er != nil {
			return er
		}
		if isNew && runtime.ConfigIsLocalFile() {
			return nil
			//return triggerInstall(
			//	"Oops, the configuration is not right ... "+configFile,
			//	"Do you want to reset the initial configuration", cmd, args)
		}

		ctx = servicecontext.WithKeyring(ctx, keyring)
		for _, cc := range configChecks {
			if e := cc(ctx); e != nil {
				return e
			}
		}

		// Init registry
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}
		ctx = servercontext.WithRegistry(ctx, reg)
		ctx = servercontext.WithConfig(ctx, config.Main())

		clientgrpc.WarnMissingConnInContext = true
		conn, err := grpc.Dial("xds://"+runtime.Cluster()+".cells.com/cells", clientgrpc.DialOptionsForRegistry(reg)...)
		if err != nil {
			return err
		}

		ctx = clientcontext.WithClientConn(ctx, conn)
		// ctx = nodescontext.WithSourcesPool(ctx, nodes.NewPool(ctx, reg))

		m, err := manager.NewManager(ctx, reg, "", "main", log.Logger(servicecontext.WithServiceName(ctx, "pydio.server.manager")))
		if err != nil {
			return err
		}

		m.SetServeOptions(
			server.WithGrpcBindAddress(runtime.GrpcBindAddress()),
			server.WithHttpBindAddress(runtime.HttpBindAddress()),
		)
		m.ServeAll(
			server.WithGrpcBindAddress(runtime.GrpcBindAddress()),
			server.WithHttpBindAddress(runtime.HttpBindAddress()),
		)

		<-ctx.Done()

		//if len(runtime.GetStringSlice(runtime.KeyArgTags)) == 0 {
		//	cmds := make(map[string]*fork.Process)
		//
		//	store, err := config.OpenStore(ctx, "mem://?encode=yaml")
		//	if err != nil {
		//		return err
		//	}
		//
		//	go func() {
		//		w, err := store.Watch(configx.WithPath("processes", "*"), configx.WithChangesOnly())
		//		if err != nil {
		//			return
		//		}
		//
		//		for {
		//			diff, err := w.Next()
		//			if err != nil {
		//				return
		//			}
		//
		//			create := diff.(configx.Values).Val("create", "processes")
		//			update := diff.(configx.Values).Val("update", "processes")
		//			delete := diff.(configx.Values).Val("delete", "processes")
		//
		//			var processesToStart, processesToStop []string
		//
		//			for name := range create.Map() {
		//				processesToStart = append(processesToStart, name)
		//			}
		//			for name := range update.Map() {
		//				processesToStop = append(processesToStop, name)
		//				processesToStart = append(processesToStart, name)
		//			}
		//			for name := range delete.Map() {
		//				processesToStop = append(processesToStop, name)
		//			}
		//
		//			for _, name := range processesToStop {
		//				if cmd, ok := cmds[name]; ok {
		//					cmd.Stop()
		//				}
		//			}
		//
		//			processes := store.Val("processes")
		//
		//			for _, v := range processesToStart {
		//				for name := range processes.Map() {
		//					process := store.Val("processes", name)
		//
		//					if name == v {
		//						connections := process.Val("connections")
		//						env := process.Val("env")
		//						servers := process.Val("servers")
		//						services := process.Val("services")
		//
		//						childBinary := os.Args[0]
		//						childArgs := []string{}
		//						childEnv := []string{}
		//
		//						if process.Val("debug").Bool() {
		//							childBinary = "dlv"
		//							childArgs = append(childArgs, "--listen=:2345", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "--", os.Args[0])
		//						}
		//
		//						childArgs = append(childArgs, "start", "--name", name)
		//
		//						// Adding connections to the environment
		//						for k := range connections.Map() {
		//							childEnv = append(childEnv, fmt.Sprintf("CELLS_%s=%s", strings.ToUpper(k), connections.Val(k, "uri")))
		//						}
		//
		//						for k, v := range env.Map() {
		//							switch vv := v.(type) {
		//							case string:
		//								childEnv = append(childEnv, fmt.Sprintf("%s=%s", k, vv))
		//							default:
		//								vvv, _ := json.Marshal(vv)
		//								childEnv = append(childEnv, fmt.Sprintf("%s=%s", k, string(vvv)))
		//							}
		//						}
		//
		//						// Adding servers to the environment
		//						for k := range servers.Map() {
		//							server := servers.Val(k)
		//
		//							// TODO - should be one bind address per server
		//							if bindAddr := server.Val("bind").String(); bindAddr != "" {
		//								childEnv = append(childEnv, fmt.Sprintf("CELLS_BIND_ADDRESS=%s", bindAddr))
		//							}
		//
		//							// TODO - should be one advertise address per server
		//							if advertiseAddr := server.Val("advertise").String(); advertiseAddr != "" {
		//								childEnv = append(childEnv, fmt.Sprintf("CELLS_ADVERTISE_ADDRESS=%s", advertiseAddr))
		//							}
		//
		//							// Adding servers port
		//							if port := server.Val("port").String(); port != "" {
		//								childEnv = append(childEnv, fmt.Sprintf("CELLS_%s_PORT=%s", strings.ToUpper(k), port))
		//							}
		//
		//							// Adding server type
		//							if typ := server.Val("type").String(); typ != "" {
		//								childEnv = append(childEnv, fmt.Sprintf("CELLS_%s=%s", strings.ToUpper(k), typ))
		//							}
		//						}
		//
		//						// Adding services to the environment
		//						tags := []string{}
		//						for k, v := range services.Map() {
		//							tags = append(tags, k)
		//
		//							if vv, ok := v.([]interface{}); ok {
		//								for _, vvv := range vv {
		//									childArgs = append(childArgs, "^"+vvv.(string)+"$")
		//								}
		//							}
		//						}
		//
		//						childEnv = append(childEnv, fmt.Sprintf("CELLS_TAGS=%s", strings.Join(tags, " ")))
		//
		//						cmds[name] = fork.NewProcess(ctx, []string{}, fork.WithBinary(childBinary), fork.WithName(name), fork.WithArgs(childArgs), fork.WithEnv(childEnv))
		//						go cmds[name].StartAndWait(5)
		//					}
		//				}
		//			}
		//		}
		//	}()
		//
		//	reset := func(conf config.Store) error {
		//
		//		tmpl := defaultTemplate
		//
		//		// Then generate the new template based on the config
		//		if file := runtime.GetString("file"); file != "" {
		//			f, err := os.Open(file)
		//			if err != nil {
		//				return err
		//			}
		//			b, err := io.ReadAll(f)
		//			if err != nil {
		//				return err
		//			}
		//			tmpl = string(b)
		//		}
		//
		//		t, err := template.New("context").Parse(tmpl)
		//		if err != nil {
		//			return err
		//		}
		//
		//		var b strings.Builder
		//
		//		r := runtime.GetRuntime()
		//		if err := t.Execute(&b, struct {
		//			ConfigURL     string
		//			RegistryURL   string
		//			BrokerURL     string
		//			CacheURL      string
		//			BindHost      string
		//			AdvertiseHost string
		//			DiscoveryPort string
		//			FrontendPort  string
		//			Config        config.Store
		//		}{
		//			runtime.ConfigURL(),
		//			runtime.RegistryURL(),
		//			runtime.BrokerURL(),
		//			runtime.CacheURL(""),
		//			r.GetString(runtime.KeyBindHost),
		//			r.GetString(runtime.KeyBindHost),
		//			r.GetString(runtime.KeyGrpcDiscoveryPort),
		//			r.GetString(runtime.KeyHttpPort),
		//			conf,
		//		}); err != nil {
		//			return err
		//		}
		//
		//		store.Set([]byte(b.String()))
		//
		//		return nil
		//	}
		//
		//	if err := reset(nil); err != nil {
		//		return err
		//	}
		//
		//	go func() {
		//		r := runtime.GetRuntime()
		//		conf, err := config.OpenStore(ctx, "grpc://"+r.GetString(runtime.KeyBindHost)+":"+r.GetString(runtime.KeyGrpcDiscoveryPort))
		//		if err != nil {
		//			fmt.Println("Error is ", err)
		//		}
		//
		//		reset(conf)
		//
		//		res, err := conf.Watch()
		//		if err != nil {
		//			fmt.Println("Error is there ", err)
		//			return
		//		}
		//
		//		fmt.Println("And watching")
		//
		//		for {
		//			_, err := res.Next()
		//			if err != nil {
		//				return
		//			}
		//
		//			fmt.Println("Received update here !! ")
		//
		//			reset(conf)
		//		}
		//	}()
		//
		//	select {
		//	case <-cmd.Context().Done():
		//	}
		//} else {
		//
		//	managerLogger := log.Logger(servicecontext.WithServiceName(ctx, "pydio.server.manager"))
		//
		//	if needs, gU := runtime.NeedsGrpcDiscoveryConn(); needs {
		//		u, err := url.Parse(gU)
		//		if err != nil {
		//			return err
		//		}
		//		addr := u.String()
		//		switch u.Scheme {
		//		case "grpc":
		//			addr = u.Host
		//		}
		//		discoveryConn, err := grpc.Dial(addr,
		//			grpc.WithTransportCredentials(insecure.NewCredentials()),
		//			grpc.WithUnaryInterceptor(func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		//				// method = "pydio.grpc.registry" + method
		//				return invoker(ctx, method, req, reply, cc, opts...)
		//			}),
		//		)
		//		if err != nil {
		//			return err
		//		}
		//		ctx = clientcontext.WithClientConn(ctx, discoveryConn)
		//	}
		//
		//	configFile := filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultConfigFileName)
		//	if runtime.ConfigIsLocalFile() && !filex.Exists(configFile) {
		//		return triggerInstall(
		//			"We cannot find a configuration file ... "+configFile,
		//			"Do you want to create one now",
		//			cmd, args)
		//	}
		//
		//	// Init config
		//	isNew, keyring, er := initConfig(ctx, true)
		//	if er != nil {
		//		return er
		//	}
		//	if isNew && runtime.ConfigIsLocalFile() {
		//		return triggerInstall(
		//			"Oops, the configuration is not right ... "+configFile,
		//			"Do you want to reset the initial configuration", cmd, args)
		//	}
		//
		//	ctx = servicecontext.WithKeyring(ctx, keyring)
		//	for _, cc := range configChecks {
		//		if e := cc(ctx); e != nil {
		//			return e
		//		}
		//	}
		//
		//	// Init registry
		//	reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		//	if err != nil {
		//		return err
		//	}
		//	ctx = servercontext.WithRegistry(ctx, reg)
		//	ctx = servercontext.WithConfig(ctx, config.Main())
		//
		//	// Init broker
		//
		//	broker.Register(broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx)))
		//
		//	if !runtime.IsFork() {
		//		data := []runtime.InfoGroup{binaryInfo()}
		//		data = append(data, runtime.Describe()...)
		//		data = append(data, buildInfo())
		//		for _, group := range data {
		//			cmd.Println(group.Name + ":")
		//			for _, pair := range group.Pairs {
		//				cmd.Println("  " + pair.Key + ":\t" + pair.Value)
		//			}
		//			cmd.Println("")
		//		}
		//	}
		//
		//	// Starting discovery server containing registry, broker, config and log
		//	var discovery manager.Manager
		//	// TODO - should be done in some other way
		//	//if !runtime.IsGrpcScheme(runtime.RegistryURL()) || runtime.LogLevel() == "debug" {
		//	//if discovery, err = startDiscoveryServer(ctx, reg, managerLogger); err != nil {
		//	//	return err
		//	//}
		//	//}
		//
		//	/* Create a main client connection
		//	clientgrpc.WarnMissingConnInContext = true
		//	conn, err := grpc.Dial("xds://"+runtime.Cluster()+".cells.com/cells", clientgrpc.DialOptionsForRegistry(reg)...)
		//	if err != nil {
		//		return err
		//	}
		//	ctx = clientcontext.WithClientConn(ctx, conn)
		//	ctx = nodescontext.WithSourcesPool(ctx, nodes.NewPool(ctx, reg))*/
		//
		//	m := manager.NewManager(ctx, reg, "mem:///?cache=plugins&byname=true", "main", managerLogger)
		//	if err := m.Init(ctx); err != nil {
		//		return err
		//	}
		//
		//	// Logging Stuff
		//	runtime.InitGlobalConnConsumers(ctx, "main")
		//	go initLogLevelListener(ctx)
		//
		//	go m.WatchServicesConfigs()
		//	go m.WatchBroker(ctx, broker.Default())
		//
		//	//tracer, err := tracing.OpenTracing(ctx, "jaeger:///")
		//	//if err != nil {
		//	//	return err
		//	//}
		//	//
		//	//otel.SetTracerProvider(tracer)
		//
		//	if replaced := config.EnvOverrideDefaultBind(); replaced {
		//		// Bind sites are replaced by flags/env values - warn that it will take precedence
		//		if ss, e := config.LoadSites(true); e == nil && len(ss) > 0 && !runtime.IsFork() {
		//			fmt.Println("*****************************************************************")
		//			fmt.Println("*  Dynamic bind flag detected, overriding any configured sites  *")
		//			fmt.Println("*****************************************************************")
		//		}
		//	}
		//
		//	if os.Args[1] == "daemon" {
		//		msg := "| Starting daemon, use '" + os.Args[0] + " ctl' to control services |"
		//		line := strings.Repeat("-", len(msg))
		//		cmd.Println(line)
		//		cmd.Println(msg)
		//		cmd.Println(line)
		//		m.SetServeOptions(
		//			server.WithGrpcBindAddress(runtime.GrpcBindAddress()),
		//			server.WithHttpBindAddress(runtime.HttpBindAddress()),
		//		)
		//	} else {
		//		select {
		//		case <-ctx.Done():
		//			return nil
		//		default:
		//		}
		//		m.ServeAll(
		//			server.WithGrpcBindAddress(runtime.GrpcBindAddress()),
		//			server.WithHttpBindAddress(runtime.HttpBindAddress()),
		//			server.WithErrorCallback(func(err error) {
		//				managerLogger.Error(promptui.IconBad + "There was an error while starting:" + err.Error())
		//			}),
		//		)
		//	}
		//
		//	select {
		//	case <-ctx.Done():
		//	case <-reg.Done():
		//	}
		//
		//	reg.Close()
		//	m.StopAll()
		//	if discovery != nil {
		//		managerLogger.Info("Stopping discovery services now")
		//		discovery.StopAll()
		//	}
		//}

		return nil
	},
}

//func startDiscoveryServer(ctx context.Context, reg registry.Registry, logger log.ZapLogger) (manager.Manager, error) {
//
//	m := manager.NewManager(ctx, reg, "mem:///", "discovery", logger)
//	if err := m.Init(ctx); err != nil {
//		return nil, err
//	}
//
//	var errReceived bool
//	errorCallback := func(err error) {
//		errReceived = true
//		if !strings.Contains(err.Error(), "context canceled") {
//			fmt.Println("************************************************************")
//			fmt.Println(promptui.IconBad + " Error while starting discovery server:")
//			fmt.Println(promptui.IconBad + " " + err.Error())
//			fmt.Println(promptui.IconBad + " FATAL : shutting down now!")
//			fmt.Println("************************************************************")
//			cancel()
//		}
//	}
//
//	m.ServeAll(
//		server.WithErrorCallback(errorCallback),
//		server.WithGrpcBindAddress(runtime.GrpcDiscoveryBindAddress()),
//		server.WithBlockUntilServe(),
//	)
//
//	if errReceived {
//		return nil, errors.New("no discovery server")
//	}
//
//	logger.Info("Discovery services started, carry on to other services")
//
//	return m, nil
//}

func init() {
	// Flags for selecting / filtering services
	StartCmd.Flags().String("file", "", "Name for the file")

	StartCmd.Flags().String(runtime.KeyName, "default", "Name for the node")
	StartCmd.Flags().StringArrayP(runtime.KeyArgTags, "t", []string{}, "Select services to start by tags, possible values are 'broker', 'data', 'datasource', 'discovery', 'frontend', 'gateway', 'idm', 'scheduler'")
	StartCmd.Flags().StringArrayP(runtime.KeyArgExclude, "x", []string{}, "Select services to start by filtering out some specific ones by name")

	StartCmd.Flags().String(runtime.KeyBindHost, "127.0.0.1", "Address on which servers will bind. Binding port depends on the server type (grpc, http, etc).")
	StartCmd.Flags().String(runtime.KeyAdvertiseAddress, "", "Address that should be advertised to other members of the cluster (leave it empty for default advertise address)")
	StartCmd.Flags().String(runtime.KeyGrpcPort, runtime.DefaultGrpcPort, "Default gRPC server port (all gRPC services, except discovery ones)")
	StartCmd.Flags().String(runtime.KeyGrpcDiscoveryPort, runtime.DefaultDiscoveryPort, "Default discovery gRPC server port (registry, broker, config, and log services).")
	StartCmd.Flags().String(runtime.KeyGrpcExternal, "", "Fix the gRPC Gateway public port, not necessary unless a reverse-proxy does not support HTTP/2 protocol.")

	StartCmd.Flags().String(runtime.KeyHttpServer, "caddy", "HTTP Server Type")
	StartCmd.Flags().String(runtime.KeyHttpPort, runtime.DefaultHttpPort, "HTTP Server Port")
	StartCmd.Flags().Bool(runtime.KeyFork, false, "Used internally by application when forking processes")
	StartCmd.Flags().StringArray(runtime.KeyNodeCapacity, []string{}, "Node capacity declares externally supported features for this node")

	if os.Getenv(EnvDisplayHiddenFlags) == "" {
		_ = StartCmd.Flags().MarkHidden(runtime.KeyHttpServer)
		_ = StartCmd.Flags().MarkHidden(runtime.KeyHttpPort)
		_ = StartCmd.Flags().MarkHidden(runtime.KeyFork)
		_ = StartCmd.Flags().MarkHidden(runtime.KeyNodeCapacity)
		_ = StartCmd.Flags().MarkHidden(runtime.KeyGrpcExternal)
	}

	addCacheFlags(StartCmd.Flags())
	addRegistryFlags(StartCmd.Flags())
	addSiteOverrideFlags(StartCmd.Flags(), true)

	StartCmd.Flags().String(runtime.KeyLog, "info", "Output log level: debug, info, warn, error (production is equivalent to log_json+info)")
	StartCmd.Flags().Bool(runtime.KeyLogJson, false, "Output log formatted as JSON instead of text")
	StartCmd.Flags().Bool(runtime.KeyLogToFile, common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	StartCmd.Flags().Bool(runtime.KeyEnableMetrics, false, "Instrument code to expose internal metrics (to local JSON file, or service discovery if Metrics Basic Auth is set)")
	StartCmd.Flags().String(runtime.KeyMetricsBasicAuth, "", "Expose metrics to a service discovery endpoint /metrics/sd")
	StartCmd.Flags().Bool(runtime.KeyEnablePprof, false, "Enable pprof remote debugging")
	StartCmd.Flags().Int(runtime.KeyHealthCheckPort, 0, "Healthcheck port number")

	RootCmd.AddCommand(StartCmd)
}
