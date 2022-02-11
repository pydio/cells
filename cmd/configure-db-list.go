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
	"strings"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/discovery/install/lib"
)

type configDatabase struct {
	driver   string
	dsn      string
	services []string
}

func configDatabaseList() (dd []configDatabase) {

	m := config.Get("databases").Map()

	for id, v := range m {
		//if id == defaultDatabaseID {
		//	continue
		//}

		db, ok := v.(map[string]interface{})
		if !ok {
			continue
		}

		driver, ok := db["driver"]
		if !ok {
			continue
		}

		dsn, ok := db["dsn"]
		if !ok {
			continue
		}

		var services []string
		/*
			// TODO V4
			if s, err := registry.GetService(id); err == nil && s != nil {
				services = append(services, id)
			}
		*/

		for sid, vs := range m {
			dbid, ok := vs.(string)
			if !ok {
				continue
			}

			if dbid == id {
				services = append(services, sid)
			}
		}

		dd = append(dd, configDatabase{
			dsn:      dsn.(string),
			driver:   driver.(string),
			services: services,
		})
	}

	ss, e := lib.ListServicesWithStorage()
	if e != nil {
		log.Fatal(e.Error())
	}

	for _, s := range ss {
		for _, sOpt := range s.Options().Storages {
			if sOpt.DefaultDriver != nil {
				driver, dsn := sOpt.DefaultDriver()
				skip := false
				// Exclude already registered
				for _, d := range dd {
					if d.driver == driver && d.dsn == dsn {
						skip = true
						break
					}
				}
				if skip {
					continue
				}
				dd = append(dd, configDatabase{
					driver: driver,
					dsn:    dsn,
				})
			}
		}
	}

	return
}

// configDatabaseListCmd lists all database connections.
var configDatabaseListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all database connections",
	Long: `
DESCRIPTION

  List all database connections from all servers registered with cells.
`,
	Run: func(cmd *cobra.Command, args []string) {

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Driver", "DSN", "Services"})

		// List all databases value
		dd := configDatabaseList()
		for _, d := range dd {
			table.Append([]string{d.driver, d.dsn, strings.Join(d.services, ",")})
		}
		table.SetAlignment(tablewriter.ALIGN_LEFT)
		table.Render()

	},
}

func init() {
	configDatabaseCmd.AddCommand(configDatabaseListCmd)
}
