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
	"os"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/discovery/install/lib"
)

// configDatabaseAddCmd adds database connection to the configuration.
var configDatabaseAddCmd = &cobra.Command{
	Use:   "add",
	Short: "Add a database connection to the configuration",
	Long: `
DESCRIPTION

  Add a new database connection to the configuration.
  To assign the database connection to a service, you need to use the config database set command.
`,
	Run: func(cmd *cobra.Command, args []string) {

		installConfig := lib.GenerateDefaultConfig()
		if _, err := promptDB(installConfig); err != nil {
			cmd.Println(err)
			os.Exit(1)
		}

		cmd.Println("\033[1m## Performing Installation\033[0m")
		if err := lib.Install(context.Background(), installConfig, lib.INSTALL_DB, func(event *lib.InstallProgressEvent) {
			cmd.Println(promptui.IconGood + " " + event.Message)
		}); err != nil {
			cmd.Println(err)
			os.Exit(1)
		}

		cmd.Println("*************************************************************")
		cmd.Println(" Config has been updated, please restart now!")
		cmd.Println("**************************************************************")

	},
}

func init() {
	configDatabaseCmd.AddCommand(configDatabaseAddCmd)
}
