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
	"os"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
)

var (
	metaPutUUID string
	metaPutKey  string
	metaPutVal  string
)

var metaPutCmd = &cobra.Command{
	Use:   "meta-put",
	Short: "Create or update a metadata entry for a node.",
	Long: `
DESCRIPTION

  Create or update a metadata entry for a node.
  For a given node Uuid, metadata are key/values of string/json-encoded strings.

EXAMPLE

  $ ` + os.Args[0] + ` admin files meta-put --uuid=NODE_UUID --key=metaname --value='{"key":"value"}'

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if metaPutUUID == "" || metaPutKey == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		client := tree.NewNodeReceiverClient(common.ServiceGrpcNamespace_+common.ServiceMeta, defaults.NewClient())

		_, err := client.UpdateNode(context.Background(), &tree.UpdateNodeRequest{
			To: &tree.Node{
				Uuid:      metaPutUUID,
				MetaStore: map[string]string{metaPutKey: metaPutVal},
			},
		})
		if err == nil {
			cmd.Println("Successfully updated meta")
		} else {
			return err
		}
		return nil
	},
}

func init() {
	metaPutCmd.Flags().StringVarP(&metaPutUUID, "uuid", "u", "", "Uuid of the node to update")
	metaPutCmd.Flags().StringVarP(&metaPutKey, "key", "k", "", "Name of the metadata")
	metaPutCmd.Flags().StringVarP(&metaPutVal, "val", "v", "", "*JSON-encoded* string representing the value. Strings must be quoted, eg. '\"custom-value\"'")

	FilesCmd.AddCommand(metaPutCmd)
}
