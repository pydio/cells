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
	"os"
	"os/signal"
	"regexp"
	"strings"
	"syscall"
	"time"

	microregistry "github.com/micro/go-micro/registry"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"

	"github.com/pydio/cells/common/registry"

	// All brokers
	httpbroker "github.com/pydio/cells/common/micro/broker/http"
	natsbroker "github.com/pydio/cells/common/micro/broker/nats"

	// All registries
	consulregistry "github.com/pydio/cells/common/micro/registry/consul"
	natsregistry "github.com/pydio/cells/common/micro/registry/nats"

	// All transports
	grpctransport "github.com/pydio/cells/common/micro/transport/grpc"
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
	Use:   os.Args[0],
	Short: "Secure File Sharing for business",
	Long: `Thank you for using Pydio Cells.
Comprehensive sync & share solution for your collaborators. Open-source software deployed on-premise or in a private cloud.

### Installation

For the very first run, use '` + os.Args[0] + ` install' to load browser-based or command-line based installation wizard. Services
will start at the end of the installation.

### Run

Run '` + os.Args[0] + ` start' to load all services.

### Logs level

By default, logs are outputted in console format at the Info level. You can set the --log flag or set the PYDIO_LOGS_LEVEL environment
variable to one of the following values:
 - debug, info, error : logs are written in console format with the according level
 - production : logs are written in json format, for usage with a log aggregator tool.

### Services Discovery

Micro services need a registry mechanism to discover each other. By default, Pydio Cells ships with Nats.io and Consul.io implementations.
You don't need to install any dependency. By default, Cells uses the NATS implementation. You can switch to consul by using
the flag --registry=consul.

`,
	PreRun: func(cmd *cobra.Command, args []string) {},
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		// Special case
		if cmd.Long == StartCmd.Long {
			common.LogCaptureStdOut = true
		}

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		// Making sure we capture the signals
		handleSignals()

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
	flags.BoolVar(&config.RemoteSource, "cluster", false, "Whether this node is master of the cluster or not")

	flags.String("registry", "nats", "Registry used to manage services")
	flags.String("registry_address", ":4222", "Registry used to manage services")
	flags.String("registry_cluster_address", ":5222", "Registry used to manage services")
	flags.String("registry_cluster_routes", "", "Registry used to manage services")

	flags.String("broker", "nats", "Registry used to manage services")
	flags.String("broker_address", ":4222", "Registry used to manage services")

	flags.String("transport", "grpc", "Registry used to manage services")
	flags.String("transport_address", ":4222", "Registry used to manage services")

	flags.String("log", "info", "Sets the log level mode")
	flags.String("grpc_cert", "", "Certificates used for communication via grpc")
	flags.String("grpc_key", "", "Certificates used for communication via grpc")
	flags.BoolVar(&IsFork, "fork", false, "Used internally by application when forking processes")

	viper.BindPFlag("registry", flags.Lookup("registry"))
	viper.BindPFlag("registry_address", flags.Lookup("registry_address"))
	viper.BindPFlag("registry_cluster_address", flags.Lookup("registry_cluster_address"))
	viper.BindPFlag("registry_cluster_routes", flags.Lookup("registry_cluster_routes"))

	viper.BindPFlag("broker", flags.Lookup("broker"))
	viper.BindPFlag("broker_address", flags.Lookup("broker_address"))

	viper.BindPFlag("transport", flags.Lookup("transport"))
	viper.BindPFlag("transport_address", flags.Lookup("transport_address"))

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

	// Making sure the log level is passed everywhere (fork processes for example)
	os.Setenv("PYDIO_LOGS_LEVEL", logLevel)

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

	log.Init()
}

func initServices() {
	registry.Default.BeforeInit()

	registry.Init()

	registry.Default.AfterInit()
}

func handleRegistry() {
	switch viper.Get("registry") {
	case "nats":
		natsregistry.Enable()
	case "consul":
		consulregistry.Enable()
	default:
		log.Fatal("registry not supported")
	}
}

func handleBroker() {
	switch viper.Get("broker") {
	case "nats":
		natsbroker.Enable()
	case "http":
		httpbroker.Enable()
	default:
		log.Fatal("broker not supported")
	}
}

func handleTransport() {
	switch viper.Get("transport") {
	case "grpc":
		grpctransport.Enable()
	default:
		log.Fatal("transport not supported")
	}
}

func handleSignals() {
	c := make(chan os.Signal, 1)

	// signal.Notify(c, syscall.SIGINT, syscall.SIGUSR1, syscall.SIGHUP)
	signal.Notify(c, syscall.SIGINT, syscall.SIGHUP, syscall.SIGTERM)

	go func() {
		for sig := range c {
			switch sig {
			case syscall.SIGINT:
				// Stop all services
				for _, service := range allServices {
					service.Stop()
				}
				<-time.After(2 * time.Second)
				os.Exit(0)
			// case syscall.SIGUSR1:
			// 	pprof.Lookup("goroutine").WriteTo(os.Stdout, 1)
			//
			// 	if !profiling {
			// 		f, err := ioutil.TempFile("/tmp", "pydio-cpu-profile-")
			// 		if err != nil {
			// 			log.Fatal(err)
			// 		}
			//
			// 		pprof.StartCPUProfile(f)
			// 		profile = f
			// 		profiling = true
			//
			// 		fheap, err := ioutil.TempFile("/tmp", "pydio-cpu-heap-")
			// 		if err != nil {
			// 			log.Fatal(err)
			// 		}
			// 		pprof.WriteHeapProfile(fheap)
			// 	} else {
			// 		pprof.StopCPUProfile()
			// 		if err := profile.Close(); err != nil {
			// 			log.Fatal(err)
			// 		}
			// 		profiling = false
			// 	}

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
