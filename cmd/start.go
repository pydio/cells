/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/pydio/cells/common"

	microregistry "github.com/micro/go-micro/registry"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/metrics"
	"github.com/pydio/cells/x/filex"
)

var (
	FilterStartTags    []string
	FilterStartExclude []string
)

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:   "start",
	Short: "Start one or more services",
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
  $ ` + os.Args[0] + ` start --grpc_external 54545
  is equivalent to 
  $ export CELLS_GRPC_EXTERNAL=54545; ` + os.Args[0] + ` start

  [Note]: the only exception is the --log flag, that is mapped to CELLS_LOGS_LEVEL instead.

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

  4. Development variables

  - CELLS_ENABLE_WIP_LANGUAGES: show partially translated languages in the UX language picker. 
  - CELLS_ENABLE_LIVEKIT: enable experimental support for video calls in the chat window, using a livekit-server.
  - CELLS_ENABLE_FORMS_DEVEL: display a basic UX form with all possible fields types in the UX (for React developers)

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		if !IsFork {
			if err := checkFdlimit(); err != nil {
				return err
			}
		}

		bindViperFlags(cmd.Flags(), map[string]string{
			"log":  "logs_level",
			"fork": "is_fork",
		})

		if !config.RuntimeIsRemote() {
			if !filex.Exists(filepath.Join(config.PydioConfigDir, config.PydioConfigFile)) {
				return triggerInstall(
					"We cannot find a configuration file ... "+config.ApplicationWorkingDir()+"/pydio.json",
					"Do you want to create one now",
					cmd, args)
			}

			if initConfig() {
				return triggerInstall(
					"Oops, the configuration is not right ... "+config.ApplicationWorkingDir()+"/pydio.json",
					"Do you want to reset the initial configuration", cmd, args)
			}
		}

		initStartingToolsOnce.Do(func() {
			initLogLevel()

			metrics.Init()

			// Initialise the default registry
			handleRegistry()

			// Initialise the default broker
			handleBroker()

			// Initialise the default transport
			handleTransport()

			// Making sure we capture the signals
			handleSignals()
		})

		if config.RuntimeIsRemote() {
			// For a remote server, we are waiting for the registry to be set to initiate config
			initConfig()
		}

		// Pre-check that pydio.json is properly configured
		if v := config.Get("version").String(); v == "" {
			return triggerInstall(
				"Oops, the configuration is not right ... "+config.ApplicationWorkingDir()+"/pydio.json",
				"Do you want to reset the initial configuration", cmd, args)
		}

		plugins.Init(cmd.Context(), "main")

		// Filtering out services by exclusion
		registry.Default.Filter(func(s registry.Service) bool {
			for _, exclude := range FilterStartExclude {
				re := regexp.MustCompile(exclude)

				if strings.HasPrefix(s.Name(), exclude) || re.MatchString(s.Name()) {
					return true
				}
			}

			return false
		})

		// Filtering services by tags
		registry.Default.Filter(func(s registry.Service) bool {
			// Unique exclude must be done here
			for _, exclude := range FilterStartExclude {
				if exclude == startTagUnique && s.MustBeUnique() {
					return true
				}
			}
			for _, t := range FilterStartTags {
				if t == startTagUnique && s.MustBeUnique() {
					registry.ProcessStartTags = append(registry.ProcessStartTags, "t:"+t)
					return false
				} else {
					for _, st := range s.Tags() {
						if t == st {
							registry.ProcessStartTags = append(registry.ProcessStartTags, "t:"+t)
							return false
						}
					}
				}
			}

			return len(FilterStartTags) > 0
		})

		// Filtering services by args
		registry.Default.Filter(func(s registry.Service) bool {
			for _, arg := range args {
				reArg := regexp.MustCompile(arg)
				if reArg.MatchString(s.Name()) {
					registry.ProcessStartTags = append(registry.ProcessStartTags, "s:"+s.Name())
					return false
				}
				if s.MatchesRegexp(arg) {
					registry.ProcessStartTags = append(registry.ProcessStartTags, "s:"+s.Name())
					return false
				}
			}
			return len(args) > 0
		})

		// Filtering services that have a regexp when there is no argument to the command
		registry.Default.Filter(func(s registry.Service) bool {
			if len(args) == 0 && s.Regexp() != nil {
				return true
			}
			return false
		})

		// Re-gather exclude flag (it is applied in root.go PersistentPreRun) for startTag
		for _, x := range FilterStartExclude {
			registry.ProcessStartTags = append(registry.ProcessStartTags, "x:"+x)
		}

		// Re-building allServices list
		if s, err := registry.Default.ListServices(); err != nil {
			return fmt.Errorf("Could not retrieve list of services")
		} else {
			allServices = s
		}

		if replaced := config.EnvOverrideDefaultBind(); replaced {
			// Bind sites are replaced by flags/env values - warn that it will take precedence
			if ss, e := config.LoadSites(true); e == nil && len(ss) > 0 && !IsFork {
				fmt.Println("*****************************************************************")
				fmt.Println("*  Dynamic bind flag detected, overriding any configured sites  *")
				fmt.Println("*****************************************************************")
			}
		}

		initServices()

		return nil
	},

	RunE: func(cmd *cobra.Command, args []string) error {
		// Start services that have not been deregistered via flags and filtering.
		for _, service := range allServices {
			if !IsFork && service.RequiresFork() {
				if !service.AutoStart() {
					continue
				}
				go service.ForkStart(cmd.Context())
			} else {
				go service.Start(cmd.Context())
			}

			select {
			case <-microregistry.DefaultRegistry.Options().Context.Done():
				return nil
			case <-cmd.Context().Done():
				return nil
			default:
				continue
			}
		}

		for {
			select {
			case <-microregistry.DefaultRegistry.Options().Context.Done():
				return nil
			case <-cmd.Context().Done():
				return nil
			}
		}
	},

	PostRunE: func(cmd *cobra.Command, args []string) error {
		reg := registry.GetCurrentProcess()
		if reg == nil {
			return nil
		}

	loop:
		for {
			select {
			case <-time.After(30 * time.Second):
				break loop
			default:
				if reg != nil && len(reg.Services) > 0 {
					time.Sleep(1 * time.Second)
					continue
				}

				break loop
			}
		}

		return nil
	},
}

func init() {
	// Flags for selecting / filtering services
	StartCmd.Flags().StringArrayVarP(&FilterStartTags, "tags", "t", []string{}, "Select services to start by tags, possible values are 'broker', 'data', 'datasource', 'discovery', 'frontend', 'gateway', 'idm', 'scheduler'")
	StartCmd.Flags().StringArrayVarP(&FilterStartExclude, "exclude", "x", []string{}, "Select services to start by filtering out some specific ones by name")

	// Registry / Broker Flags
	addNatsFlags(StartCmd.Flags())
	addNatsStreamingFlags(StartCmd.Flags())
	addRegistryFlags(StartCmd.Flags())

	// Grpc Gateway Flags
	StartCmd.Flags().String("grpc_external", "", "External port exposed for gRPC (may be fixed if no SSL is configured or a reverse proxy is used)")
	StartCmd.Flags().String("grpc_cert", "", "Certificates used for communication via grpc")
	StartCmd.Flags().String("grpc_key", "", "Certificates used for communication via grpc")

	// Other internal flags
	StartCmd.Flags().String("log", "info", "Sets the log level: 'info', 'debug', 'warn', 'error' (for backward-compatibility, 'production' is equivalent to log_json+info)")
	StartCmd.Flags().Bool("log_json", false, "Sets the log output format to JSON instead of text")
	StartCmd.Flags().Bool("log_to_file", common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	StartCmd.Flags().BoolVar(&IsFork, "fork", false, "Used internally by application when forking processes")
	StartCmd.Flags().Bool("enable_metrics", false, "Instrument code to expose internal metrics")
	StartCmd.Flags().Bool("enable_pprof", false, "Enable pprof remote debugging")
	StartCmd.Flags().Int("healthcheck", 0, "Healthcheck port number")

	// Additional Flags
	StartCmd.Flags().String("bind", "", "Internal IP|DOMAIN:PORT on which the main proxy will bind. Self-signed SSL will be used by default")
	StartCmd.Flags().String("external", "", "External full URL (http[s]://IP|DOMAIN[:PORT]) exposed to the outside")
	StartCmd.Flags().Bool("no_tls", false, "Configure the main gateway to rather use plain HTTP")
	StartCmd.Flags().String("tls_cert_file", "", "TLS cert file path")
	StartCmd.Flags().String("tls_key_file", "", "TLS key file path")
	StartCmd.Flags().String("le_email", "", "Contact e-mail for Let's Encrypt provided certificate")
	StartCmd.Flags().Bool("le_agree", false, "Accept Let's Encrypt EULA")
	StartCmd.Flags().Bool("le_staging", false, "Rather use staging CA entry point")
	StartCmd.Flags().MarkHidden("le_staging")

	StartCmd.Flags().MarkHidden("fork")
	StartCmd.Flags().MarkHidden("broker")
	StartCmd.Flags().MarkHidden("registry")

	RootCmd.AddCommand(StartCmd)
}
