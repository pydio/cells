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
	"github.com/pydio/cells/v4/common/config"
	uuid2 "github.com/pydio/cells/v4/common/utils/uuid"
	"strings"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/discovery/install/lib"
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
	RunE: func(cmd *cobra.Command, args []string) error {

		installConfig := lib.GenerateDefaultConfig()

		_, dbType, e := (&promptui.Select{
			Label: "Which type of DB do you want to add?",
			Items: []string{"SQL", "NoSQL"},
		}).Run()
		if e != nil {
			return e
		}
		if dbType == "SQL" {
			if _, err := promptDB(installConfig); err != nil {
				return err
			}

			cmd.Println("\033[1m## Performing Installation\033[0m")
			if err := lib.Install(context.Background(), installConfig, lib.InstallDb, func(event *lib.InstallProgressEvent) {
				cmd.Println(promptui.IconGood + " " + event.Message)
			}); err != nil {
				return err
			}
		} else {
			if err := promptDocumentsDSN(installConfig); err != nil {
				return err
			}
			cmd.Println("\033[1m## Performing Installation\033[0m")
			var driver, dsn string
			if strings.HasPrefix(installConfig.DocumentsDSN, "mongodb://") {
				driver = "mongodb"
				dsn = installConfig.DocumentsDSN
			} else if strings.HasPrefix(installConfig.DocumentsDSN, "boltdb") {
				driver = "boltdb"
				dsn = strings.TrimPrefix(installConfig.DocumentsDSN, "boltdb://")
			} else if strings.HasPrefix(installConfig.DocumentsDSN, "bleve") {
				driver = "bleve"
				dsn = strings.TrimPrefix(installConfig.DocumentsDSN, "bleve://")
			}
			dbKey := driver + "-" + strings.Split(uuid2.New(), "-")[0]
			if er := config.SetDatabase(dbKey, driver, dsn); er != nil {
				return er
			}
			if driver == "mongodb" {
				_, e := (&promptui.Prompt{
					Label:     "Do you wish to use this storage for all services supporting MongoDB driver",
					IsConfirm: true,
					Default:   "Y",
				}).Run()
				if e == nil {
					ss, e := configDatabaseServicesWithStorage()
					if e != nil {
						return e
					}
					for _, s := range ss {
						for _, storage := range s.Options().Storages {
							var supports bool
							for _, supported := range storage.SupportedDrivers {
								if supported == "mongodb" {
									supports = true
									break
								}
							}
							if supports {
								cmd.Println("Using this db for " + s.Name() + "/" + storage.StorageKey)
								if er := config.Set(dbKey, "services", s.Name(), storage.StorageKey); er != nil {
									return er
								}
							}
						}
					}
				}
			}
			if er := config.Save("cli", "Adding new NoSQL database"); er != nil {
				return er
			}
		}

		cmd.Println("*************************************************************")
		cmd.Println(" Config has been updated, please restart now!")
		cmd.Println("**************************************************************")

		return nil
	},
}

func init() {
	configDatabaseCmd.AddCommand(configDatabaseAddCmd)
}
