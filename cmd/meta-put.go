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

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/spf13/cobra"
)

var (
	metaPutUUID string
	metaPutKey  string
	metaPutVal  string
)

var metaPutCmd = &cobra.Command{
	Use:   "put",
	Short: "Create or update a metadata entry for a node.",
	Long: `Create or update a metadata entry for a node.

For a given node Uuid, metadata are key/values of string/json-encoded strings.

EXAMPLE
=======
$ ` + os.Args[0] + ` meta put --uuid=NODE_UUID --key=metaname --value='{"key":"value"}'

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if metaPutUUID == "" || metaPutKey == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())

		response, err := client.UpdateNode(context.Background(), &tree.UpdateNodeRequest{
			To: &tree.Node{
				Uuid:      metaPutUUID,
				MetaStore: map[string]string{metaPutKey: metaPutVal},
			},
		})
		log.Println(response, err)
	},
}

func init() {
	metaPutCmd.Flags().StringVarP(&metaPutUUID, "uuid", "u", "", "Uuid of the node to update (use 'pydioctl data list' or 'pydioctl data read')")
	metaPutCmd.Flags().StringVarP(&metaPutKey, "key", "k", "", "Name of the metadata")
	metaPutCmd.Flags().StringVarP(&metaPutVal, "val", "v", "", "Json-encoded string representing the value")

	MetaCmd.AddCommand(metaPutCmd)
}
