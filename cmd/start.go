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
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	yaml "gopkg.in/yaml.v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/install"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"

	_ "embed"
)

var (
	//go:embed start-bootstrap.yaml
	bootstrapYAML string

	//go:embed start-storages.yaml
	storagesYAML string

	allSettingsYAML string
	bootstrap       *manager.Bootstrap
	configChecks    []func(ctx context.Context) error
	bootstrapHooks  []*bootstrapHook
)

var (
	niBindUrl          string
	niExtUrl           string
	niNoTls            bool
	niModeCli          bool
	niCertFile         string
	niKeyFile          string
	niLeEmailContact   string
	niLeAcceptEula     bool
	niLeUseStagingCA   bool
	niYamlFile         string
	niJsonFile         string
	niExitAfterInstall bool
)

type bootstrapHook struct {
	Name     string
	Callback func(ctx context.Context, bs *manager.Bootstrap) error
}

func RegisterConfigChecker(f func(ctx context.Context) error) {
	configChecks = append(configChecks, f)
}

func RegisterBootstrapHook(hookName string, cb func(ctx context.Context, bs *manager.Bootstrap) error) {
	bootstrapHooks = append(bootstrapHooks, &bootstrapHook{Name: hookName, Callback: cb})
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

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		bindViperFlags(cmd.Flags(), map[string]string{
			runtime.KeyFork:              runtime.KeyForkLegacy,
			runtime.KeyInstallYamlLegacy: runtime.KeyInstallYaml,
			runtime.KeyInstallJsonLegacy: runtime.KeyInstallJson,
			runtime.KeyInstallCliLegacy:  runtime.KeyInstallCli,
		})

		b, err := yaml.Marshal(runtime.GetRuntime().AllSettings())
		if err != nil {
			return err
		}
		allSettingsYAML = string(b)

		// Manually bind to viper instead of flags.StringVar, flags.BoolVar, etc
		niModeCli = runtime.GetBool(runtime.KeyInstallCli)
		niYamlFile = runtime.GetString(runtime.KeyInstallYaml)
		niJsonFile = runtime.GetString(runtime.KeyInstallJson)
		niExitAfterInstall = runtime.GetBool(runtime.KeyInstallExitAfter)

		niBindUrl = runtime.GetString(runtime.KeySiteBind)
		niExtUrl = runtime.GetString(runtime.KeySiteExternal)
		niNoTls = runtime.GetBool(runtime.KeySiteNoTLS)
		niCertFile = runtime.GetString(runtime.KeySiteTlsCertFile)
		niKeyFile = runtime.GetString(runtime.KeySiteTlsKeyFile)
		niLeEmailContact = runtime.GetString(runtime.KeySiteLetsEncryptEmail)
		niLeAcceptEula = runtime.GetBool(runtime.KeySiteLetsEncryptAgree)
		niLeUseStagingCA = runtime.GetBool(runtime.KeySiteLetsEncryptStaging)

		runtime.SetArgs(args)
		initLogLevel()
		handleSignals(args)

		cmd.Println("")
		cmd.Println("\033[1mWelcome to " + common.PackageLabel + " installation\033[0m ")
		cmd.Println(common.PackageLabel + " (v" + common.Version().String() + ") will be configured to run on this machine.")
		cmd.Println("Make sure to prepare access and credentials to a MySQL 5.6+ (or MariaDB equivalent) server.")
		cmd.Println("Pick your installation mode when you are ready.")
		cmd.Println("")

		installConf := &install.InstallConfig{}
		var proxyConf *install.ProxyConfig

		ctx, er := initManagerContext(cmd.Context())
		if er != nil {
			return er
		}

		// Checking if we need to install something
		if niYamlFile != "" || niJsonFile != "" {

			var data interface{}
			if err := json.Unmarshal([]byte(config.SampleConfig), &data); err == nil {
				if err := config.Set(ctx, data); err == nil {
					config.Save(ctx, common.PydioSystemUsername, "Initialize with sample config")
				}
			}

			installConf, err = nonInteractiveInstall(ctx)
			fatalIfError(cmd, err)

			// we only non-interactively configured the proxy, launching browser install
			// make sure default bind is set here
			proxyConf = installConf.GetProxyConfig()
			if len(proxyConf.Binds) == 0 {
				fatalIfError(cmd, fmt.Errorf("no bind was found in default site, non interactive install probably has a wrong format"))
			}

			if niExitAfterInstall {
				<-time.After(time.Second)
				cmd.Println("")
				cmd.Println(promptui.IconGood + "\033[1m Installation Finished\033[0m")
				cmd.Println("")
				os.Exit(0)
			}

		} else {
			// We don't have anything to install, we are going to populate the InstallConf with the config we have to prepare the environment
			installConf.DbManualDSN = config.Get(ctx, "defaults/database/dsn").String()
			if !strings.Contains(installConf.DbManualDSN, "?") {
				installConf.DbManualDSN += "?" // URL maybe appended with &key=value string
			}
		}

		bootstrap, err = manager.NewBootstrap(ctx)
		if err != nil {
			return err
		}

		runtime.GetRuntime().Set(runtime.KeyBootstrapYAML, bootstrap)

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		ctx, cancel := context.WithCancel(cmd.Context())
		defer cancel()

		//configFile := filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultConfigFileName)
		//if runtime.ConfigIsLocalFile() && !filex.Exists(configFile) {
		//	return nil
		//	//return triggerInstall(
		//	//	"We cannot find a configuration file ... "+configFile,
		//	//	"Do you want to create one now",
		//	//	cmd, args)
		//}

		/* Init config
		var er error
		var isNew bool
		ctx, isNew, er = initConfig(ctx, true)
		if er != nil {
			return er
		}
		// TODO - RECHECK BLANK INSTALL
		if isNew && runtime.ConfigIsLocalFile() {
			return nil
			//return triggerInstall(
			//	"Oops, the configuration is not right ... "+configFile,
			//	"Do you want to reset the initial configuration", cmd, args)
		}

		// TODO - RECHECK USE OTHER FUNCS
		for _, cc := range configChecks {
			if e := cc(ctx); e != nil {
				return e
			}
		}*/

		bootstrap, err := manager.NewBootstrap(ctx)
		if err != nil {
			return err
		}

		// A tracer may be configured, create a start trace
		var span trace.Span
		ctx, span = otel.GetTracerProvider().Tracer("cells-command").Start(ctx, "start", trace.WithSpanKind(trace.SpanKindInternal))

		ctx = runtime.AsCoreContext(ctx)

		// Optionally fully override the template based on arguments
		if file := runtime.GetString(runtime.KeyBootstrapFile); file != "" {
			b, err := os.ReadFile(file)
			if err != nil {
				return err
			}

			if err := bootstrap.RegisterTemplate(ctx, strings.TrimPrefix(filepath.Ext(file), "."), string(b)); err != nil {
				return err
			}
		} else {
			tmpl := template.New("bootstrap").Delims("{{{{", "}}}}")
			if _, err := tmpl.Parse(bootstrapYAML); err != nil {
				return err
			}

			var b strings.Builder
			if err := tmpl.Execute(&b, nil); err != nil {
				return err
			}

			if err := bootstrap.RegisterTemplate(ctx, "yaml", b.String()); err != nil {
				return err
			}
		}

		for _, bh := range bootstrapHooks {
			if bh.Name == "loaded" {
				if er := bh.Callback(ctx, bootstrap); er != nil {
					return er
				}
			}
		}

		if er := bootstrap.RegisterTemplate(ctx, "yaml", string(allSettingsYAML)); er != nil {
			return er
		}
		bootstrap.MustReset(ctx, nil)

		runtime.GetRuntime().Set(runtime.KeyBootstrapYAML, bootstrap)

		broker.Register(broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx)))

		ctx = context.WithValue(ctx, "managertype", "standard")

		m, err := manager.NewManager(ctx, runtime.NsMain, log.Logger(runtime.WithServiceName(ctx, "pydio.server.manager")))
		if err != nil {
			span.End()
			return err
		}

		// Retrieve the config store from the new context manager
		var configStore config.Store
		propagator.Get(m.Context(), config.ContextKey, &configStore)

		if configStore == nil {
			return errors.New("no config store found")
		}

		// Reading template
		tmpl := template.New("storages").Delims("{{", "}}")
		yml, err := tmpl.Parse(storagesYAML)
		fatalIfError(cmd, err)

		var b strings.Builder
		if err := yml.Execute(&b, map[string]any{
			"storages": configStore.Val("databases").Map(),
		}); err != nil {
			return err
		}

		if err := bootstrap.RegisterTemplate(ctx, "yaml", b.String()); err != nil {
			return err
		}

		span.End()

		bootstrap.MustReset(ctx, nil)

		m.Bootstrap(bootstrap.String())

		if err := m.ServeAll(); err != nil {
			return err
		}

		// Do the initial migration
		cli := service.NewMigrateServiceClient(grpc.ResolveConn(ctx, common.ServiceInstallGRPC))
		if _, err := cli.Migrate(m.Context(), &service.MigrateRequest{Version: common.Version().String()}); err != nil {
			log.Logger(m.Context()).Warn("Ignoring migration failure", zap.Error(err))
		}

		<-ctx.Done()

		m.StopAll()

		return nil
	},
}

func init() {
	// Flags for selecting / filtering services
	StartCmd.Flags().String(runtime.KeyBootstrapFile, "", "Name for the file")
	StartCmd.Flags().String(runtime.KeyBootstrapTpl, "", "Template to use to generate bootstrap YAML")
	StartCmd.Flags().String(runtime.KeyBootstrapRoot, "#", "Lookup path inside bootstrap for this process")

	StartCmd.Flags().String(runtime.KeyName, "default", "Name for the node")
	StartCmd.Flags().StringArrayP(runtime.KeyArgTags, "t", []string{}, "Select services to start by tags, possible values are 'broker', 'data', 'datasource', 'discovery', 'frontend', 'gateway', 'idm', 'scheduler'")
	StartCmd.Flags().StringArrayP(runtime.KeyArgExclude, "x", []string{}, "Select services to start by filtering out some specific ones by name")

	StartCmd.Flags().String(runtime.KeyBindHost, "127.0.0.1", "Address on which servers will bind. Binding port depends on the server type (grpc, http, etc).")
	StartCmd.Flags().String(runtime.KeyAdvertiseAddress, "", "Address that should be advertised to other members of the cluster (leave it empty for default advertise address)")
	StartCmd.Flags().String(runtime.KeyGrpcPort, runtime.DefaultGrpcPort, "Default gRPC server port (all gRPC services, except discovery ones)")
	StartCmd.Flags().String(runtime.KeyGrpcDiscoveryPort, runtime.DefaultDiscoveryPort, "Default discovery gRPC server port (registry, broker, config, and log services).")
	StartCmd.Flags().String(runtime.KeyGrpcExternal, "", "Fix the gRPC Gateway public port, not necessary unless a reverse-proxy does not support HTTP/2 protocol.")

	StartCmd.Flags().String(runtime.KeyHttpServer, "http", "HTTP Server Type")
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

	addRegistryFlags(StartCmd.Flags())
	addSiteOverrideFlags(StartCmd.Flags(), true)

	StartCmd.Flags().String(runtime.KeyLog, "info", "Output log level: debug, info, warn, error (production is equivalent to log_json+info)")
	StartCmd.Flags().Bool(runtime.KeyLogJson, false, "Output log formatted as JSON instead of text")
	StartCmd.Flags().Bool(runtime.KeyLogToFile, common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	StartCmd.Flags().Bool(runtime.KeyLogSQL, false, "Print sql requests in logs")

	// Deprecate in favor of config-based metrics setup
	StartCmd.Flags().Bool(runtime.KeyEnableMetrics, false, "[Deprecated] Instrument code to expose internal metrics (to local JSON file, or service discovery if Metrics Basic Auth is set)")
	StartCmd.Flags().Bool(runtime.KeyEnablePprof, false, "[Deprecated] Enable pprof remote debugging")
	_ = StartCmd.Flags().MarkDeprecated(runtime.KeyEnableMetrics, "This flag is deprecated, but the env variable is still working. Switch to config-based metrics declaration instead")
	_ = StartCmd.Flags().MarkDeprecated(runtime.KeyEnablePprof, "This flag is deprecated, but the env variable is still working. Switch to config-based profiling declaration instead")

	//StartCmd.Flags().Int(runtime.KeyHealthCheckPort, 0, "Healthcheck port number")
	StartCmd.Flags().StringSlice(runtime.KeyBootstrapSet, []string{}, "Set value")
	StartCmd.Flags().String(runtime.KeyBootstrapSetsFile, "", "File containing one key=value per line as would be passed by multiple --set flags")

	flags := StartCmd.Flags()

	flags.Bool(runtime.KeyInstallCliLegacy, false, "Do not prompt for install mode, use CLI mode by default")
	flags.String(runtime.KeyInstallYamlLegacy, "", "Points toward a configuration in YAML format")
	flags.String(runtime.KeyInstallJsonLegacy, "", "Points toward a configuration in JSON format")
	flags.Bool(runtime.KeyInstallExitAfter, false, "Simply exits main process after the installation is done")

	RootCmd.AddCommand(StartCmd)
}
