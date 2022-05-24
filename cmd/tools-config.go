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
	"math"
	"os"

	"github.com/pydio/cells/v4/common"

	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/v4/common/config"
	"github.com/spf13/cobra"
)

var importConfigCmd = &cobra.Command{
	Use:   "import-config",
	Short: "Import a config into a new location",
	Long: `
DESCRIPTION

  Import config tool for Pydio Cells.
`,
	RunE: func(cmd *cobra.Command, args []string) error {

		// Choose the location of the target config
		m := config.Get("databases").Map()

		var ids []string
		var items []string
		for id, v := range m {
			db, ok := v.(map[string]interface{})
			if !ok {
				continue
			}

			ids = append(ids, id)

			fmt.Println(db)
			items = append(items, db["driver"].(string)+" - "+db["dsn"].(string))
		}

		selector := promptui.Select{
			Label: "Choose the location of the next configuration",
			Items: items,
		}

		i, _, err := selector.Run()
		if err != nil {
			cmd.Println("Wrong database connection")
			os.Exit(1)
		}

		defaultData := config.Get().Get()
		vaultData := config.Vault().Get()
		versions, _ := config.RevisionsStore.List(0, math.MaxUint64)

		fmt.Println(versions)

		db := m[ids[i]].(map[string]interface{})
		cellsViper.Set("config", db["driver"])

		if _, _, er := initConfig(cmd.Context(), false); er != nil {
			return er
		}

		config.Set(defaultData, "")
		config.Vault().Set(vaultData)
		for _, version := range versions {
			config.RevisionsStore.Put(version)
		}

		if err := config.Save(common.PydioSystemUsername, "Import done"); err != nil {
			return err
		}

		return nil
	},
}

func init() {
	ToolsCmd.AddCommand(importConfigCmd)
}
