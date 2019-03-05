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
	"fmt"
	"log"
	"sort"

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
		table.SetHeader([]string{"DSN", "Driver"})

		var skeys []string
		for k := range m {
			skeys = append(skeys, k)
		}

		sort.Strings(skeys)

		for _, sk := range skeys {
			var ckeys []string
			for k := range m[sk] {
				ckeys = append(ckeys, k)
			}
			sort.Strings(ckeys)
			for _, ck := range ckeys {
				table.Append([]string{sk, ck, fmt.Sprintf("%v", m[sk][ck])})
			}
		}

		table.SetAlignment(tablewriter.ALIGN_LEFT)
		table.Render()

	},
}

func init() {
	ConfigDatabaseCmd.AddCommand(ConfigDatabaseAddCmd)
}
