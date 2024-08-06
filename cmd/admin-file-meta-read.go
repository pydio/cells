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
	"os"

	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/proto/tree"
)

var (
	metaReadUUID string
)

// readCmd represents the read command
var metaReadCmd = &cobra.Command{
	Use:   "meta-read",
	Short: "Display existing metadata for a given node",
	Long: `
DESCRIPTION

  Display existing metadata for a given node.

EXAMPLE

  $ ` + os.Args[0] + ` admin file meta-read --uuid=244f072d-d9a1-11e7-950b-685b35ac60e5
  returns: 
	+-------------------------------+--------------------------------------------------------------------------+
	|             NAME              |                                 VALUE                                    |
	+-------------------------------+--------------------------------------------------------------------------+
	| pydio:meta-data-source-name   | "pydiods1"                                                               |
	| ImageDimensions               | {"Height":200,"Width":200}                                               |
	| is_image                      | true                                                                     |
	| readable_dimension            | "200px X 200px"                                                          |
	| pydio:meta-data-source-path   | "download.png"                                                           |
	| pydio:meta-object-service-url | "127.0.0.1:9001/pydiods1"                                                |
	| ImageThumbnails               | {"Processing":false,"thumbnails":[{"format":"jpg","size":256,"url":""}]} |
	| image_width                   | 200                                                                      |
	| name                          | "download.png"                                                           |
	| image_height                  | 200                                                                      |
	+-------------------------------+--------------------------------------------------------------------------+

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if metaReadUUID == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		client := treec.ServiceNodeProviderClient(ctx, common.ServiceMeta)

		response, err := client.ReadNode(cmd.Context(), &tree.ReadNodeRequest{
			Node: &tree.Node{
				Uuid: metaReadUUID,
			},
		})
		if err != nil {
			return err
		}

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Name", "Value"})

		for key, value := range response.Node.MetaStore {
			table.Append([]string{key, value})
		}

		cmd.Println("Listing meta for node " + promptui.Styler(promptui.FGUnderline)(response.GetNode().GetUuid()))

		table.Render()
		return nil
	},
}

func init() {
	metaReadCmd.Flags().StringVarP(&metaReadUUID, "uuid", "u", "", "UUID of the node")

	FileCmd.AddCommand(metaReadCmd)
}
