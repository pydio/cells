/*
 * Copyright (c) 2018-2021. Abstrium SAS <team (at) pydio.com>
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
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var CleanCmd = &cobra.Command{
	Use: "clean",
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		bindViperFlags(cmd.Flags(), map[string]string{})

		viper.SetDefault("registry", "grpc://:8000")
		viper.SetDefault("broker", "grpc://:8003")

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		initConfig()
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
	Short: "Housekeeping commands",
	Long:  "Collection of tools for purging Cells internal data (activities, logs, etc)",
}

func init() {
	AdminCmd.AddCommand(CleanCmd)
}
