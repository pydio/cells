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
	"log"
	"sort"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/config"
)

var listConfigCmd = &cobra.Command{
	Use:   "list",
	Short: "List all configurations",
	Long: `
DESCRIPTION

  Display all configuration items registered by the application.
  Configuration items are listed as truple [serviceName, configName, configValue]. The configuration value is json encoded.

`,
	Run: func(cmd *cobra.Command, args []string) {

		var m map[string]interface{}
		if err := config.Get(cmd.Context(), "").Scan(&m); err != nil {
			log.Fatal(err)
		}

		table := tablewriter.NewWriter(cmd.OutOrStdout())

		var skeys []string
		for k := range m {
			skeys = append(skeys, k)
		}

		sort.Strings(skeys)

		for _, sk := range skeys {
			displayMap(table, m[sk], sk)
		}

		table.SetAlignment(tablewriter.ALIGN_LEFT)
		table.Render()
	},
}

func displayMap(table *tablewriter.Table, m interface{}, val ...string) {
	switch v := m.(type) {
	case string:
		table.Append(append(val, v))
	case map[string]interface{}:
		var ckeys []string

		for k := range v {
			ckeys = append(ckeys, k)
		}

		sort.Strings(ckeys)
		for _, ck := range ckeys {
			displayMap(table, v[ck], append(val, ck)...)
		}
	}
}

func init() {
	ConfigCmd.AddCommand(listConfigCmd)
}
