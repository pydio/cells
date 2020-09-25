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
	"fmt"
	"log"
	"os"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
)

var (
	metaReadUUID string
)

// readCmd represents the read command
var metaReadCmd = &cobra.Command{
	Use:   "read",
	Short: "Display existing metadata for a given node",
	Long: `Display existing metadata for a given node.

EXAMPLE
=======
$ ` + os.Args[0] + ` meta read --uuid=244f072d-d9a1-11e7-950b-685b35ac60e5
+-------------------------------+---------------------------------------------------------------------------------------------------------------+
|             NAME              |                                                     VALUE                                                     |
+-------------------------------+---------------------------------------------------------------------------------------------------------------+
| pydio:meta-data-source-name   | "pydiods1"                                                                                                    |
| ImageDimensions               | {"Height":200,"Width":200}                                                                                    |
| is_image                      | true                                                                                                          |
| readable_dimension            | "200px X 200px"                                                                                               |
| pydio:meta-data-source-path   | "download.png"                                                                                                |
| pydio:meta-object-service-url | "127.0.0.1:9001/pydiods1"                                                                                     |
| ImageThumbnails               | {"Processing":false,"thumbnails":[{"format":"jpg","size":256,"url":""},{"format":"jpg","size":512,"url":""}]} |
| image_width                   |                                                                                                           200 |
| name                          | "download.png"                                                                                                |
| image_height                  |                                                                                                           200 |
+-------------------------------+---------------------------------------------------------------------------------------------------------------+

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if metaReadUUID == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())

		response, err := client.ReadNode(context.Background(), &tree.ReadNodeRequest{
			Node: &tree.Node{
				Uuid: metaReadUUID,
			},
		})

		if err != nil {
			log.Fatal("Could not open a stream", err)
		}

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{"Name", "Value"})

		for key, value := range response.Node.MetaStore {

			if err != nil {
				break
			}

			table.Append([]string{key, value})
		}

		table.Render()
	},
}

func init() {
	metaReadCmd.Flags().StringVarP(&metaReadUUID, "uuid", "u", "", "Uuid of the node")

	MetaCmd.AddCommand(metaReadCmd)
}
