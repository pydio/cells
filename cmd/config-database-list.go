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
	"log"

	"github.com/olekukonko/tablewriter"
	"github.com/pydio/cells/common/config"
	"github.com/spf13/cobra"
)

// ConfigDatabaseListCmd permits configuration of a new database connection.
var ConfigDatabaseListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all database connections",
	Long: `
This command llists all databases connections from all servers registered with cells.
`,
	Run: func(cmd *cobra.Command, args []string) {

		cfg := config.Default().(*config.Config)

		var m map[string]map[string]string
		if err := cfg.UnmarshalKey("databases", &m); err != nil {
			log.Fatal(err)
		}

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"ID", "DSN", "Driver"})

		for id, db := range m {
			driver, ok := db["driver"]
			if !ok {
				continue
			}

			dsn, ok := db["dsn"]
			if !ok {
				continue
			}

			table.Append([]string{id, dsn, driver})
		}

		table.SetAlignment(tablewriter.ALIGN_LEFT)
		table.Render()

	},
}

func init() {
	ConfigDatabaseCmd.AddCommand(ConfigDatabaseListCmd)
}
