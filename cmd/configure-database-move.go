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
	"fmt"
	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/spf13/cobra"
	"log"
)

var (
	dbMoveDryRun bool
)

// configDatabaseListCmd lists all database connections.
var configDatabaseMoveCmd = &cobra.Command{
	Use:   "move",
	Short: "Move service data from one database to another",
	Long: `
DESCRIPTION

  Migrate existing data to a new storage type
`,
	RunE: func(cmd *cobra.Command, args []string) error {

		ss, e := configDatabaseServicesWithStorage()
		if e != nil {
			log.Fatal(e.Error())
		}
		type flatOptions struct {
			*service.StorageOptions
			serviceName    string
			serviceOptions *service.ServiceOptions
		}
		var migratorsOptions []*flatOptions

		for _, s := range ss {
			for _, sOpt := range s.Options().Storages {
				if sOpt.Migrator != nil {
					migratorsOptions = append(migratorsOptions, &flatOptions{
						StorageOptions: sOpt,
						serviceName:    s.Name(),
						serviceOptions: s.Options(),
					})
				}
			}
		}

		var services []string
		for _, m := range migratorsOptions {
			services = append(services, m.serviceName+" ("+m.StorageKey+")")
		}
		pl := &promptui.Select{
			Label: "Which service do you want to migrate?",
			Items: services,
		}
		serviceIndex, serviceName, er := pl.Run()
		if er != nil {
			return er
		}

		// List all databases value
		dd := configDatabaseList()
		var drivers []string
		for _, driver := range dd {
			drivers = append(drivers, fmt.Sprintf("%s - %s", driver.driver, driver.dsn))
		}
		dl := &promptui.Select{
			Label: "Select storage source",
			Items: drivers,
		}
		fromIndex, _, er := dl.Run()
		if er != nil {
			return er
		}
		from := dd[fromIndex]

		dl.Label = "Select storage target"
		toIndex, _, er := dl.Run()
		if er != nil {
			return er
		}
		to := dd[toIndex]

		cmd.Printf("Migrate service %s from %s to %s\n", serviceName, from.driver, to.driver)
		sOptions := migratorsOptions[serviceIndex]
		prefix := sOptions.Prefix(sOptions.serviceOptions)
		fromDao, e := initDAO(from.driver, from.dsn, prefix)
		if e != nil {
			return e
		}
		toDao, e := initDAO(to.driver, to.dsn, prefix)
		if e != nil {
			return e
		}

		if dbMoveDryRun {
			cmd.Println("Running migration in dry-run mode - Nothing will be modified")
		} else {
			cmd.Println("Running migration in real mode - Data will be copied to target")
		}
		if result, e := sOptions.Migrator(fromDao, toDao, dbMoveDryRun); e != nil {
			return e
		} else {
			for name, count := range result {
				cmd.Printf("Copied %d %s\n", count, name)
			}
		}

		return nil
	},
}

func initDAO(driver, dsn, prefix string) (dao.DAO, error) {
	var d dao.DAO
	var e error
	switch driver {
	case boltdb.Driver:
		d, e = boltdb.NewDAO(driver, dsn, prefix)
	case bleve.Driver:
		d, e = bleve.NewDAO(driver, dsn, prefix)
	case mongodb.Driver:
		d, e = mongodb.NewDAO(driver, dsn, prefix)
	default:
		return nil, fmt.Errorf("unsupported driver type")
	}
	if e != nil {
		return nil, e
	}
	if e := d.Init(configx.New()); e != nil {
		return nil, e
	}
	return d, nil
}

func init() {
	configDatabaseMoveCmd.Flags().BoolVar(&dbMoveDryRun, "dry-run", true, "Enable/disable dry-run mode")
	configDatabaseCmd.AddCommand(configDatabaseMoveCmd)
}
