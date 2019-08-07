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

// Package cmd implements all commands for Cells Control client.
package cmd

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"

	// All registries
	natsregistry "github.com/pydio/cells/common/micro/registry/nats"
)

var (
	t1 time.Time
)

// RootCmd represents the base command when called without any subcommands.
var RootCmd = &cobra.Command{
	Use:   "cells-ctl",
	Short: "Pydio Cells Control",
	Long: `
Pydio Cells Control allows you to interact with the micro services directly with a simple CLI. 
Most actions shall better be manually performed using the web frontend or scripted using the Cells Client.
`,

	PersistentPreRun: func(cmd *cobra.Command, args []string) {

		// Add a timestamp to log current command processing duration
		t1 = time.Now()

		handleRegistry()

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

	flags := RootCmd.PersistentFlags()
	flags.String("registry", "nats", "Registry used to manage services")

	viper.BindPFlag("registry", flags.Lookup("registry"))
}

func handleRegistry() {

	switch viper.Get("registry") {
	case "nats":
		natsregistry.Enable()
	default:
		log.Fatal("registry not supported")
	}
}
