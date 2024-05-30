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
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/filex"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "embed"
)

var (
	configChecks []func(ctx context.Context) error
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

		ctx = propagator.With(ctx, crypto.KeyringContextKey, keyring)
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
		ctx = propagator.With(ctx, registry.ContextKey, reg)
		ctx = propagator.With(ctx, config.ContextKey, config.Main())

		clientgrpc.WarnMissingConnInContext = true
		conn, err := grpc.NewClient("xds://"+runtime.Cluster()+".cells.com/cells", clientgrpc.DialOptionsForRegistry(reg)...)
		if err != nil {
			return err
		}

		ctx = runtime.WithClientConn(ctx, conn)
		// ctx = nodescontext.WithSourcesPool(ctx, nodes.NewPool(ctx, reg))
		runtime.InitGlobalConnConsumers(ctx, "main")

		// Init broker
		broker.Register(broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx)))

		m, err := manager.NewManager(ctx, "main", log.Logger(runtime.WithServiceName(ctx, "pydio.server.manager")))
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

		return nil
	},
}

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

	StartCmd.Flags().String(runtime.KeyHttpServer, "http", "HTTP Server Type")
	StartCmd.Flags().String(runtime.KeyHttpProxyURL, "caddy://", "Default Proxy Type")
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

	// Deprecate in favor of config-based metrics setup
	StartCmd.Flags().Bool(runtime.KeyEnableMetrics, false, "[Deprecated] Instrument code to expose internal metrics (to local JSON file, or service discovery if Metrics Basic Auth is set)")
	StartCmd.Flags().Bool(runtime.KeyEnablePprof, false, "[Deprecated] Enable pprof remote debugging")
	_ = StartCmd.Flags().MarkDeprecated(runtime.KeyEnableMetrics, "This flag is deprecated, but the env variable is still working. Switch to config-based metrics declaration instead")
	_ = StartCmd.Flags().MarkDeprecated(runtime.KeyEnablePprof, "This flag is deprecated, but the env variable is still working. Switch to config-based profiling declaration instead")

	//StartCmd.Flags().Int(runtime.KeyHealthCheckPort, 0, "Healthcheck port number")
	StartCmd.Flags().StringSlice(runtime.KeySet, []string{}, "Set value")

	RootCmd.AddCommand(StartCmd)
}
