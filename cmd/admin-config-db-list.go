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
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/discovery/install/lib"
)

type configDatabase struct {
	id       string
	driver   string
	dsn      string
	services []configDbService
}

type configDbService struct {
	storageKey  string
	serviceName string
}

func configDatabaseList() (dd []*configDatabase) {

	m := config.Get(ctx, "databases").Map()

	for id, v := range m {

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

		var services []configDbService
		for sid, vs := range m {
			dbid, ok := vs.(string)
			if !ok {
				continue
			}

			if dbid == id {
				services = append(services, configDbService{serviceName: sid, storageKey: "storage"})
			}
		}

		dd = append(dd, &configDatabase{
			id:       id,
			dsn:      dsn.(string),
			driver:   driver.(string),
			services: services,
		})
	}

	ss, e := lib.ListServicesWithStorage()
	if e != nil {
		log.Fatal(e.Error())
	}

	_ = ss
	/*
		// TODO
		for _, s := range ss {
			var defaultDriver string
			for _, sOpt := range s.Options().StorageOptions.SupportedDrivers {

				if sOpt.DefaultDriver != nil {
					driver, dsn := sOpt.DefaultDriver()
					defaultDriver = driver
					skip := false
					// Exclude already registered
					for _, d := range dd {
						if d.driver == driver && d.dsn == dsn {
							d.services = append(d.services, configDbService{serviceName: s.Name(), storageKey: sOpt.StorageKey})
							skip = true
							break
						}
					}
					if skip {
						continue
					}
					dd = append(dd, &configDatabase{
						driver:   driver,
						dsn:      dsn,
						services: []configDbService{{serviceName: s.Name(), storageKey: sOpt.StorageKey}},
					})
				}
				for _, supported := range sOpt.SupportedDrivers {
					if supported == defaultDriver {
						continue
					}
					for _, d := range dd {
						if d.driver == supported {
							d.services = append(d.services, configDbService{serviceName: s.Name(), storageKey: sOpt.StorageKey})
						}
					}
				}
			}
		}

	*/

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
		table.SetHeader([]string{"Driver", "DSN", "Possible Services"})

		// List all databases value
		dd := configDatabaseList()
		for _, d := range dd {
			var ss []string
			for _, s := range d.services {
				ss = append(ss, s.serviceName+" ("+s.storageKey+")")
			}
			table.Append([]string{d.driver, d.dsn, strings.Join(ss, "\n")})
		}
		table.SetAlignment(tablewriter.ALIGN_LEFT)
		table.Render()

	},
}

func init() {
	configDatabaseCmd.AddCommand(configDatabaseListCmd)
}
