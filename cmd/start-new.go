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
	"bufio"
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/spf13/cobra"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
)

// StartCmd represents the start command
var StartNewCmd = &cobra.Command{
	Use:   "daemon",
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

  4. Development variables

  - CELLS_ENABLE_WIP_LANGUAGES: show partially translated languages in the UX language picker. 
  - CELLS_ENABLE_LIVEKIT: enable experimental support for video calls in the chat window, using a livekit-server.
  - CELLS_ENABLE_FORMS_DEVEL: display a basic UX form with all possible fields types in the UX (for React developers)
  - CELLS_DEFAULT_DS_STRUCT: if true, create default datasources using structured format instead of flat
  - CELLS_TRACE_FATAL: if true, tries to better display root cause of process crashes

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

		f := runtime.GetString("file")
		store, err := config.OpenStore(ctx, f)
		if err != nil {
			return err
		}

		processes := store.Val("processes")

		wg := &sync.WaitGroup{}
		for k := range processes.Slice() {
			process := processes.Val(strconv.Itoa(k))

			name := process.Val("name").String()

			connections := process.Val("connections")
			env := process.Val("env")
			servers := process.Val("servers")
			services := process.Val("services")

			childCmd := exec.Command("./cells", "start")

			childEnv := childCmd.Environ()
			childArgs := childCmd.Args

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
					childEnv = append(childEnv, fmt.Sprintf("%s=%s", k, strconv.Quote(string(vvv))))
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
						childArgs = append(childArgs, vvv.(string))
					}
				}
			}

			childEnv = append(childEnv, fmt.Sprintf("CELLS_TAGS=%s", strings.Join(tags, " ")))

			childCmd.Env = childEnv
			childCmd.Args = childArgs

			stdout, err := childCmd.StdoutPipe()
			if err != nil {
				return err
			}
			scannerOut := bufio.NewScanner(stdout)

			go func() {
				nameStr := fmt.Sprintf("%-15s ", "["+name+"]")
				for scannerOut.Scan() {
					text := strings.TrimRight(scannerOut.Text(), "\n")
					log.StdOut.WriteString(nameStr + text + "\n")
				}
			}()

			go func() {
				wg.Add(1)
				defer wg.Done()

				if err := childCmd.Start(); err != nil {
					fmt.Println(err)
					return
				}
				if err := childCmd.Wait(); err != nil {
					fmt.Println(err)
					return
				}

			}()

			<-time.After(1 * time.Second)
		}

		wg.Wait()

		return nil
	},
}

func init() {
	StartNewCmd.Flags().String("file", "file:///Users/ghecquet/go/src/github.com/pydio/cells/config.yaml?encode=yaml", "File to load (daemon)")

	// Flags for selecting / filtering services
	StartNewCmd.Flags().StringArrayP(runtime.KeyArgTags, "t", []string{}, "Select services to start by tags, possible values are 'broker', 'data', 'datasource', 'discovery', 'frontend', 'gateway', 'idm', 'scheduler'")
	StartNewCmd.Flags().StringArrayP(runtime.KeyArgExclude, "x", []string{}, "Select services to start by filtering out some specific ones by name")

	StartNewCmd.Flags().String(runtime.KeyBindHost, "127.0.0.1", "Address on which servers will bind. Binding port depends on the server type (grpc, http, etc).")
	StartNewCmd.Flags().String(runtime.KeyAdvertiseAddress, "", "Address that should be advertised to other members of the cluster (leave it empty for default advertise address)")
	StartNewCmd.Flags().String(runtime.KeyGrpcPort, runtime.DefaultGrpcPort, "Default gRPC server port (all gRPC services, except discovery ones)")
	StartNewCmd.Flags().String(runtime.KeyGrpcDiscoveryPort, runtime.DefaultDiscoveryPort, "Default discovery gRPC server port (registry, broker, config, and log services).")
	StartNewCmd.Flags().String(runtime.KeyGrpcExternal, "", "Fix the gRPC Gateway public port, not necessary unless a reverse-proxy does not support HTTP/2 protocol.")

	StartNewCmd.Flags().String(runtime.KeyHttpServer, "caddy", "HTTP Server Type")
	StartNewCmd.Flags().String(runtime.KeyHttpPort, runtime.DefaultHttpPort, "HTTP Server Port")
	StartNewCmd.Flags().Bool(runtime.KeyFork, false, "Used internally by application when forking processes")
	StartNewCmd.Flags().StringArray(runtime.KeyNodeCapacity, []string{}, "Node capacity declares externally supported features for this node")

	if os.Getenv(EnvDisplayHiddenFlags) == "" {
		_ = StartNewCmd.Flags().MarkHidden(runtime.KeyHttpServer)
		_ = StartNewCmd.Flags().MarkHidden(runtime.KeyHttpPort)
		_ = StartNewCmd.Flags().MarkHidden(runtime.KeyFork)
		_ = StartNewCmd.Flags().MarkHidden(runtime.KeyNodeCapacity)
		_ = StartNewCmd.Flags().MarkHidden(runtime.KeyGrpcExternal)
	}

	addCacheFlags(StartNewCmd.Flags())
	addRegistryFlags(StartNewCmd.Flags())
	addSiteOverrideFlags(StartNewCmd.Flags(), true)

	StartNewCmd.Flags().String(runtime.KeyLog, "info", "Output log level: debug, info, warn, error (production is equivalent to log_json+info)")
	StartNewCmd.Flags().Bool(runtime.KeyLogJson, false, "Output log formatted as JSON instead of text")
	StartNewCmd.Flags().Bool(runtime.KeyLogToFile, common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	StartNewCmd.Flags().Bool(runtime.KeyEnableMetrics, false, "Instrument code to expose internal metrics (to local JSON file, or service discovery if Metrics Basic Auth is set)")
	StartNewCmd.Flags().String(runtime.KeyMetricsBasicAuth, "", "Expose metrics to a service discovery endpoint /metrics/sd")
	StartNewCmd.Flags().Bool(runtime.KeyEnablePprof, false, "Enable pprof remote debugging")
	StartNewCmd.Flags().Int(runtime.KeyHealthCheckPort, 0, "Healthcheck port number")

	RootCmd.AddCommand(StartNewCmd)
}
