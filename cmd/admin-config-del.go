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
	"os"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/config"
)

// delConfigCmd deletes a configuration
var delConfigCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a configuration item",
	Long: `
DESCRIPTION

  Delete a configuration item. It will be removed from both the pydio.json file and the database.

SYNTAX

  Configuration Item is represented by two parameters that you must pass as arguments:
  - serviceName: name of the corresponding service
  - configName: name of the parameter you want to delete

EXAMPLE

  Delete the port entry for the micro.web service (rest api)
  $ ` + os.Args[0] + ` admin config delete micro.web port

`,
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) != 2 {
			return errors.New("requires two arguments")
		}

		// IsValidService ?
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		ctx := cmd.Context()
		id := args[0]
		path := args[1]

		config.Del(ctx, "services", id, path)

		err := config.Save(ctx, "cli", fmt.Sprintf("Delete by path %s/%s", id, path))
		if err != nil {
			cmd.Println(err)
			return
		}

		cmd.Println("Deleted")
	},
	PostRun: func(cmd *cobra.Command, args []string) {
		cmd.Println("Delaying exit to make sure write operations are committed.")
		<-time.After(1 * time.Second)
	},
}

func init() {
	ConfigCmd.AddCommand(delConfigCmd)
}
