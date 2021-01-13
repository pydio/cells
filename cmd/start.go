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
	"context"
	"fmt"
	"os"
	"os/user"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/metrics"
	"github.com/pydio/cells/discovery/nats"
)

var (
	wg sync.WaitGroup

	FilterStartTags    []string
	FilterStartExclude []string
)

type serviceContext struct {
	ctx    context.Context
	cancel context.CancelFunc
}

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:   "start",
	Short: "Start one or more services",
	Long: `Start one or more services on this machine

### Syntax

$ ` + os.Args[0] + ` start [flags] args...

Additional arguments are regexp that can match any of the service names available (see 'list' command).
The -t/--tags flag may limit to only a certain category of services, use lowercase like broker, idm, data, etc...
The -x/--exclude flag may exclude one or more services
Both flags may be used in conjunction with the regexp arguments.

### Examples

Start only services starting with grpc
$ ` + os.Args[0] + ` start pydio.grpc

Start only services for scheduler
$ ` + os.Args[0] + ` start --tag=scheduler

Start whole plateform except the roles service
$ ` + os.Args[0] + ` start --exclude=pydio.grpc.idm.roles

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		if !IsFork {
			if err := checkFdlimit(); err != nil {
				return err
			}
		}

		replaceKeys := map[string]string{
			"log":  "logs_level",
			"fork": "is_fork",
		}
		cmd.Flags().VisitAll(func(flag *pflag.Flag) {
			key := flag.Name
			if replace, ok := replaceKeys[flag.Name]; ok {
				key = replace
			}
			flag.Usage += " [" + strings.ToUpper("$"+EnvPrefixNew+"_"+key) + "]"
			viper.BindPFlag(key, flag)
		})

		nats.Init()

		metrics.Init()

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		// Making sure we capture the signals
		handleSignals()

		plugins.Init(cmd.Context())

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

		initServices()

		return nil
	},

	Run: func(cmd *cobra.Command, args []string) {

		// Pre-check that pydio.json is properly configured
		if a, _ := config.GetDatabase("default"); a == "" {
			var crtUser string
			if u, er := user.Current(); er == nil {
				crtUser = "(currently running as '" + u.Username + "')"
			}
			cmd.Println("****************************************************************************************")
			cmd.Println("# ")
			cmd.Println("# " + promptui.IconBad + " Oops, cannot find a valid configuration for the database!")
			cmd.Println("# ")
			cmd.Println("# A - Before first start, make sure to first run the basic configuration steps:")
			cmd.Println("#     $> " + os.Args[0] + " configure")
			cmd.Println("# ")
			cmd.Println("# B - If you have already installed, maybe the configuration file is not accessible.")
			cmd.Println("#     Working Directory is " + config.ApplicationWorkingDir())
			cmd.Println("#     If you did not set the CELLS_WORKING_DIR environment variable, make sure you are ")
			cmd.Println("#     launching the process as the correct OS user " + crtUser + ".")
			cmd.Println("# ")
			cmd.Println("****************************************************************************************")
			cmd.Println("")
			pr := promptui.Prompt{IsConfirm: true, Label: "Do you want to run '" + os.Args[0] + " configure' now"}
			if _, e := pr.Run(); e != nil {
				cmd.Println("Exiting now...")
			} else {
				ConfigureCmd.Run(cmd, args)
			}
			return
		}

		// Start services that have not been deregistered via flags and filtering.
	loopstart:
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
			case <-cmd.Context().Done():
				break loopstart
			default:
				continue
			}
		}

		// When the process is stopped the context is stopped
		<-cmd.Context().Done()

		// Checking that the processes are done
		ticker := time.Tick(1 * time.Second)
		// In any case, we stop after 10 seconds even if a service is still registered somehow
		timeout := time.After(10 * time.Second)

	loop:
		for {
			select {
			case <-ticker:
				process := registry.Default.GetCurrentProcess()
				childrenProcesses := registry.Default.GetCurrentChildrenProcesses()
				if (process == nil || len(process.Services) == 0) && len(childrenProcesses) == 0 {
					break loop
				}
				continue
			case <-timeout:
				break loop
			}
		}
	},
}

func init() {
	StartCmd.Flags().String("registry", "nats", "Registry used to manage services (currently nats only)")
	StartCmd.Flags().String("registry_address", ":4222", "Registry connection address")
	StartCmd.Flags().String("registry_cluster_address", "", "Registry cluster address")
	StartCmd.Flags().String("registry_cluster_routes", "", "Registry cluster routes")

	StartCmd.Flags().String("broker", "nats", "Pub/sub service for events between services (currently nats only)")
	StartCmd.Flags().String("broker_address", ":4222", "Broker port")

	StartCmd.Flags().String("transport", "grpc", "Transport protocol for RPC")
	StartCmd.Flags().String("transport_address", ":4222", "Transport protocol port")
	StartCmd.Flags().String("grpc_external", "", "External port exposed for gRPC (may be fixed if no SSL is configured or a reverse proxy is used)")

	StartCmd.Flags().String("log", "info", "Sets the log level mode")
	StartCmd.Flags().String("grpc_cert", "", "Certificates used for communication via grpc")
	StartCmd.Flags().String("grpc_key", "", "Certificates used for communication via grpc")
	StartCmd.Flags().BoolVar(&IsFork, "fork", false, "Used internally by application when forking processes")
	StartCmd.Flags().Bool("enable_metrics", false, "Instrument code to expose internal metrics")
	StartCmd.Flags().Bool("enable_pprof", false, "Enable pprof remote debugging")

	StartCmd.Flags().StringArrayVarP(&FilterStartTags, "tags", "t", []string{}, "Filter by tags")
	StartCmd.Flags().StringArrayVarP(&FilterStartExclude, "exclude", "x", []string{}, "Filter")
	StartCmd.Flags().Int("healthcheck", 0, "Healthcheck port number")
	StartCmd.Flags().Int("nats_monitor_port", 0, "Expose nats monitoring endpoints on a given port")

	RootCmd.AddCommand(StartCmd)
}
