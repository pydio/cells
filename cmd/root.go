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

// Package cmd implements commands for running pydio services
package cmd

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/signal"
	"regexp"
	"runtime/pprof"
	"strings"
	"syscall"
	"time"

	microregistry "github.com/micro/go-micro/registry"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/registry"
)

var (
	allServices     []registry.Service
	runningServices []*microregistry.Service

	profiling bool
	profile   *os.File

	IsFork bool
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "pydio",
	Short: "Secure File Sharing for business",
	Long: `Thank you for using Pydio Cells !
Comprehensive sync & share solution for your collaborators. Open-source software deployed on-premise or in a private cloud.

INSTALL
=======
For the very first run, use './pydio install' to load browser-based or command-line based installation wizard. Services
will start at the end of the installation.

RUN
===
Run './pydio start' to load all services.

LOGS LEVEL
==========
By default, logs are outputed in console format at the Info level. You can set the PYDIO_LOGS_LEVEL environment variable
to one of the following values:
 - debug, info, error : logs are written in console format with the according level
 - production : logs are written in json format, for usage with a log aggregator tool.

SERVICES DISCOVERY
==================
Micro services need a registry mechanism to discover each other. By default, Pydio ships with Nats.io and Consul.io implementations.
You don't need to install any dependency. By default, Pydio uses the NATS implementation. You can switch to consul by using
the flag --registry=consul.

`,
	PreRun: func(cmd *cobra.Command, args []string) {},
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		// Special case
		if cmd == StartCmd {
			common.LogCaptureStdOut = true
		}
		// Making sure we capture the signals
		handleSignals()

		// Filtering out the not-in-use messaging system (typically filtering out consul by default)
		for _, v := range common.ServicesDiscovery {
			if v != viper.Get("registry").(string) {
				FilterStartExclude = append(FilterStartExclude, v)
			}
		}

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

		initServices()

		if s, err := registry.Default.ListServices(); err != nil {
			cmd.Print("Could not retrieve list of services")
			os.Exit(0)
		} else {
			allServices = s
		}
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	cobra.OnInitialize(
		initLogLevel,
	)

	viper.SetEnvPrefix("pydio")
	viper.AutomaticEnv()

	flags := RootCmd.PersistentFlags()
	flags.String("registry", "nats", "Registry used to manage services")
	flags.String("log", "info", "Sets the log level mode")
	flags.String("grpc_cert", "", "Certificates used for communication via grpc")
	flags.String("grpc_key", "", "Certificates used for communication via grpc")
	flags.BoolVar(&IsFork, "fork", false, "Used internally by application when forking processes")

	viper.BindPFlag("registry", flags.Lookup("registry"))
	viper.BindPFlag("logs_level", flags.Lookup("log"))
	viper.BindPFlag("grpc_cert", flags.Lookup("grpc_cert"))
	viper.BindPFlag("grpc_key", flags.Lookup("grpc_key"))
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func initLogLevel() {
	// Init log level
	logLevel := viper.GetString("logs_level")

	if logLevel == "production" {
		common.LogConfig = common.LogConfigProduction
	} else {
		common.LogConfig = common.LogConfigConsole
		switch logLevel {
		case "info":
			common.LogLevel = zap.InfoLevel
		case "debug":
			common.LogLevel = zap.DebugLevel
		case "error":
			common.LogLevel = zap.ErrorLevel
		}
	}
}

func initServices() {
	registry.Default.BeforeInit()

	registry.Init(
		registry.Name(viper.GetString("registry")),
	)

	registry.Default.AfterInit()
}

func handleSignals() {
	c := make(chan os.Signal, 1)

	signal.Notify(c, syscall.SIGINT, syscall.SIGUSR1, syscall.SIGHUP)

	go func() {
		for sig := range c {
			switch sig {
			case syscall.SIGINT:
				// Stop all services
				for _, service := range allServices {
					service.Stop()
				}
				<-time.After(500 * time.Millisecond)
				os.Exit(0)
			case syscall.SIGUSR1:
				pprof.Lookup("goroutine").WriteTo(os.Stdout, 1)

				if !profiling {
					f, err := ioutil.TempFile("/tmp", "pydio-cpu-profile-")
					if err != nil {
						log.Fatal(err)
					}

					pprof.StartCPUProfile(f)
					profile = f
					profiling = true

					fheap, err := ioutil.TempFile("/tmp", "pydio-cpu-heap-")
					if err != nil {
						log.Fatal(err)
					}
					pprof.WriteHeapProfile(fheap)
				} else {
					pprof.StopCPUProfile()
					if err := profile.Close(); err != nil {
						log.Fatal(err)
					}
					profiling = false
				}

			case syscall.SIGHUP:
				// Stop all services
				for _, service := range allServices {
					if service.Name() == "nats" {
						continue
					}
					service.Stop()
				}

				initServices()

				// Stop all services
				for _, service := range allServices {
					if service.Name() == "nats" {
						continue
					}
					service.Start()
				}
			}
		}
	}()
}
