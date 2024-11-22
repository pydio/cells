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
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/config"
)

// updateConfigCmd updates a configuration parameter both in the pydio.json file and in the database.
var updateConfigCmd = &cobra.Command{
	Use:   "set",
	Short: "Store a configuration",
	Long: `
DESCRIPTION

  Store a configuration item in both the pydio.json file and in the database.

SYNTAX

  Configuration items are represented by three parameters passed as arguments:
  - serviceName: name of the corresponding service
  - configName: name of the parameter
  - configValue: json-encoded value of the parameter you want to set/change

EXAMPLES

  Change the port of micro.web service (rest api)
  $ ` + os.Args[0] + ` admin config set micro.web port 8083

  Json parameter value
  $ ` + os.Args[0] + ` admin config set pydio.grpc.yourservice configName '{"key":"value"}'

`,
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 3 {
			return errors.New("Requires at least three arguments, please see 'pydio config set --help'")
		}

		// IsValidService ?
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		id := args[0]
		path := args[1]
		data := args[2]

		config.Set(ctx, data, "services", id, path)

		if err := config.Save(ctx, "cli", fmt.Sprintf("Set by path %s/%s", id, path)); err == nil {
			cmd.Println(promptui.IconGood + " Config set")
		} else {
			log.Fatal(err)
		}
	},
	PostRun: func(cmd *cobra.Command, args []string) {
		cmd.Println("Delaying exit to make sure write operations are committed.")
		<-time.After(1 * time.Second)
	},
}

func init() {
	ConfigCmd.AddCommand(updateConfigCmd)
}
