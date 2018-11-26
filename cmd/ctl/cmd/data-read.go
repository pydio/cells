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
	"context"
	"log"
	"os"

	"github.com/olekukonko/tablewriter"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/micro"
	"github.com/spf13/cobra"
)

// readCmd represents the read command
var dataReadCmd = &cobra.Command{
	Use:   "read",
	Short: "Reads information about an indexed node",
	Long: `Reads information about an indexed node.

This will grab all information for a given node in indexed. If going through the tree service, it will also
compute metadata stored for this node.
`,
	Run: func(cmd *cobra.Command, args []string) {

		client := tree.NewNodeProviderClient(serviceName, defaults.NewClient())

		var response *tree.ReadNodeResponse
		var err error

		if uuid != "" {
			response, err = client.ReadNode(context.Background(), &tree.ReadNodeRequest{
				Node: &tree.Node{
					Uuid: uuid,
				},
			})

		} else {
			response, err = client.ReadNode(context.Background(), &tree.ReadNodeRequest{
				Node: &tree.Node{
					Path: path,
				},
			})
		}

		if err != nil {
			log.Fatal(err)
		}

		if response == nil {
			cmd.Help()
			os.Exit(1)
		}

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{"Name", "Path", "UUID"})

		var name string
		response.Node.GetMeta("name", &name)
		table.Append([]string{name, response.Node.GetPath(), response.Node.GetUuid()})

		table.Render()
	},
}

func init() {
	dataReadCmd.Flags().StringVarP(&path, "path", "p", "", "Path to the data")
	dataReadCmd.Flags().StringVarP(&uuid, "uuid", "u", "", "UUID of the data")

	dataCmd.AddCommand(dataReadCmd)
}
