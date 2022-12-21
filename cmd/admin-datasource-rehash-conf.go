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
	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/spf13/cobra"
	"os"
)

var dsRehashConfCmd = &cobra.Command{
	Use:   "conf",
	Short: "Tag a datasource with current hashing algorithm after successful rehash",
	Long: `
DESCRIPTION

  Once a datasource has been rehashed, use this command to flag it so that updated sync client can communicate with it.

EXAMPLES

  1. To trigger the tagging of "pydiods1" datasource:
  $ ` + os.Args[0] + ` admin datasource rehash conf --datasource=pydiods1 --username=admin

`,
	Run: func(cmd *cobra.Command, args []string) {
		if rehashDsName == "" || rehashUserName == "" {
			cmd.Println("Please provide at least a datasource name (--datasource) and an admin user name")
			cmd.Help()
			return
		}

		var ds *object.DataSource
		if er := config.Get("services", "pydio.grpc.data.sync."+rehashDsName).Scan(&ds); er != nil {
			log.Fatal(er.Error())
		}
		if ds.StorageConfiguration == nil {
			ds.StorageConfiguration = map[string]string{}
		}
		ds.StorageConfiguration[object.StorageKeyHashingVersion] = object.CurrentHashingVersion
		if er := config.Set(ds, "services", "pydio.grpc.data.sync."+rehashDsName); er != nil {
			log.Fatal(er.Error())
		}
		if er := config.Save(rehashUserName, "Flagging datasource "+rehashDsName+" with new hashing version"); er != nil {
			log.Fatal(er.Error())
		}
		cmd.Println(promptui.IconGood + " [SUCCESS] Successfully updated datasource configuration")
	},
}

func init() {
	dsRehashConfCmd.PersistentFlags().StringVarP(&rehashDsName, "datasource", "d", "pydiods1", "Name of datasource to process")
	dsRehashConfCmd.PersistentFlags().StringVarP(&rehashUserName, "username", "u", "", "Username under which the job will be executed (generally admin)")
	dsRehashCmd.AddCommand(dsRehashConfCmd)
}
