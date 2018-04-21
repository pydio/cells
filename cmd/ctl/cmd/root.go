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

// Package cmd implements all commands for pydio control client
package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	// commonlog "github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/registry"
)

var (
	t1          time.Time
	registryArg string
)

// RootCmd represents the base command when called without any subcommands.
var RootCmd = &cobra.Command{
	Use:   "pydioctl",
	Short: "Pydio Cells Client application",
	Long: `
Pydio Cells client allows you to interact with the micro services directly. 
Most actions shall better be performed using the web frontend, but it can be handy to CRUD some specific data directly for automation or testing purposes.
`,

	PersistentPreRun: func(cmd *cobra.Command, args []string) {

		// Add a timestamp to log current command processing duration
		t1 = time.Now()

		// // Configure logging
		// logLevel := os.Getenv("PYDIO_LOGS_LEVEL")
		// if logLevel == "" {
		// 	logLevel = "info"
		// }
		// if logLevel == "production" {
		// 	commonlog.LogConfig = commonlog.LogConfigProduction
		// } else {
		// 	commonlog.LogConfig = commonlog.LogConfigConsole
		// 	switch logLevel {
		// 	case "info":
		// 		commonlog.LogLevel = zap.InfoLevel
		// 	case "debug":
		// 		commonlog.LogLevel = zap.DebugLevel
		// 	case "error":
		// 		commonlog.LogLevel = zap.ErrorLevel
		// 	}
		// }

		// Keep only the correct messaging service (nats or consul) depending on user input.
		// Note that the service listed in this current pydio registry is *NOT* started.
		var msgService registry.Service
		services, err := registry.Default.ListServices()
		if err != nil {
			cmd.Print("Could not retrieve list of services: " + err.Error())
			os.Exit(0)
		}
		for _, s := range services {
			if s.Name() != viper.Get("registry") {
				registry.Default.Deregister(s)
			} else {
				if msgService == nil {
					msgService = s
				} else { //insure that only the correct messaging service is declared in the current Pydio Registry
					cmd.Print("Cannot proceed, please unregister all messaging services that are not in use.")
					os.Exit(0)
				}
			}
		}

		// Initialise the chosen messaging system
		msgService.BeforeInit()
		registry.Init(registry.Name(msgService.Name()))
		msgService.AfterInit()

		// Configure data service name (see data.go)
		serviceName = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_TREE
		if len(source) > 0 {
			serviceName = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_INDEX_ + source
		}
	},
	PersistentPostRun: func(cmd *cobra.Command, args []string) {
		cmd.Printf("[Time taken : %s]\n", time.Since(t1))
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	viper.SetEnvPrefix("pydio")
	viper.AutomaticEnv()

	// RootCmd.PersistentFlags().StringVar(&registryArg, "registry", "nats", "Registry used to manage services")
	flags := RootCmd.PersistentFlags()
	flags.String("registry", "nats", "Registry used to manage services")
	// flags.String("log", "info", "Sets the log level mode")
	// flags.String("grpc_cert", "", "Certificates used for communication via grpc")
	// flags.String("grpc_key", "", "Certificates used for communication via grpc")

	viper.BindPFlag("registry", flags.Lookup("registry"))
}
