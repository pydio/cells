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
	log2 "log"
	"os"

	microregistry "github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-web"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/discovery/nats"

	// All brokers
	httpbroker "github.com/pydio/cells/common/micro/broker/http"
	natsbroker "github.com/pydio/cells/common/micro/broker/nats"

	// All registries
	natsregistry "github.com/pydio/cells/common/micro/registry/nats"

	// All transports
	grpctransport "github.com/pydio/cells/common/micro/transport/grpc"
	"github.com/pydio/cells/common/service/metrics"
)

var (
	allServices     []registry.Service
	runningServices []*microregistry.Service

	profiling bool
	profile   *os.File

	IsFork bool
)

const startTagUnique = "unique"

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

Micro services need a registry mechanism to discover each other. You don't need to install any dependency.
Cells currently only supports NATS (nats.io) implementation. If a gnatsd service is already running, it will be detected.

### Cells working directories

By default, application data is stored under the standard OS application dir : 

 - Linux: ${USER_HOME}/.config/pydio/cells
 - Darwin: ${USER_HOME}/Library/Application Support/Pydio/cells
 - Windows: ${USER_HOME}/ApplicationData/Roaming/Pydio/cells

You can customize the various storage locations with the following ENV variables : 

 - CELLS_WORKING_DIR : replace the whole standard application dir
 - CELLS_DATA_DIR : replace the location for storing default datasources (default CELLS_WORKING_DIR/data)
 - CELLS_LOG_DIR : replace the location for storing logs (default CELLS_WORKING_DIR/logs)
 - CELLS_SERVICES_DIR : replace location for services-specific data (default CELLS_WORKING_DIR/services) 

`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		// Special case
		if cmd.Long == StartCmd.Long {
			common.LogCaptureStdOut = true
		}

		// These commands do not need to init the configuration
		switch cmd.Name() {
		case "version", "completion", "doc", "help", "bash", "zsh", os.Args[0]:
			return
		default:
			// Initialise the default registry
			handleRegistry()

			// Initialise the default broker
			handleBroker()

			// Initialise the default transport
			handleTransport()

			// Making sure we capture the signals
			handleSignals()
		}

	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	cobra.OnInitialize(
		initLogLevel,
		initConfig,
	)

	viper.SetEnvPrefix("pydio")
	viper.AutomaticEnv()

	flags := RootCmd.PersistentFlags()

	flags.String("config", "etcd", "Config")

	flags.String("registry", "nats", "Registry used to manage services (currently nats only)")
	flags.String("registry_address", ":4222", "Registry connection address")
	flags.String("registry_cluster_address", ":5222", "Registry cluster address")
	flags.String("registry_cluster_routes", "", "Registry cluster routes")

	flags.String("broker", "nats", "Pub/sub service for events between services (currently nats only)")
	flags.String("broker_address", ":4222", "Broker port")

	flags.String("transport", "grpc", "Transport protocol for RPC")
	flags.String("transport_address", ":4222", "Transport protocol port")

	flags.String("grpc_external", "", "External port exposed for gRPC (may be fixed if no SSL is configured or a reverse proxy is used)")

	flags.String("log", "info", "Sets the log level mode")
	flags.String("grpc_cert", "", "Certificates used for communication via grpc")
	flags.String("grpc_key", "", "Certificates used for communication via grpc")
	flags.BoolVar(&IsFork, "fork", false, "Used internally by application when forking processes")
	flags.Bool("enable_metrics", false, "Instrument code to expose internal metrics")
	flags.Bool("enable_pprof", false, "Enable pprof remote debugging")

	viper.BindPFlag("config", flags.Lookup("config"))

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
	viper.BindPFlag("grpc_external", flags.Lookup("grpc_external"))

	viper.BindPFlag("enable_metrics", flags.Lookup("enable_metrics"))
	viper.BindPFlag("enable_pprof", flags.Lookup("enable_pprof"))
	viper.BindPFlag("is_fork", flags.Lookup("fork"))
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {

	// Check PrivateIP and setup Advertise
	initAdvertiseIP()

	nats.Init()
	metrics.Init()

	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func initConfig() {
	// case "etcd":
	// 	config.Register(
	// 		config.New(etcd.NewSource(clientv3.Config{
	// 			Endpoints:   []string{"localhost:2379", "localhost:22379", "localhost:32379"},
	// 			DialTimeout: 5 * time.Second,
	// 		})))
	// }
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

func initAdvertiseIP() {
	ok, advertise, err := net.DetectHasPrivateIP()
	if err != nil {
		log2.Fatal(err.Error())
	}
	if !ok {
		net.DefaultAdvertiseAddress = advertise
		web.DefaultAddress = advertise + ":0"
		server.DefaultAddress = advertise + ":0"
		if advertise != "127.0.0.1" {
			fmt.Println("Warning: no private IP detected for binding broker. Will bind to " + net.DefaultAdvertiseAddress + ", which may give public access to the broker.")
		}
	}
}

func handleRegistry() {

	switch viper.Get("registry") {
	case "nats":
		natsregistry.Enable()
	default:
		log.Fatal("registry not supported - currently only nats is supported")
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
