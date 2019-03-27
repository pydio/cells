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

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
)

var versionListUUID string

// versionListCmd represents the list command
var versionListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all versions for a given node",
	Long: `List all versions for a given node.

Versions are stored inside the default datasource under the "versions" bucket.
`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if versionListUUID == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {

		client := tree.NewNodeVersionerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_VERSIONS, defaults.NewClient())

		versionStream, err := client.ListVersions(context.Background(), &tree.ListVersionsRequest{Node: &tree.Node{Uuid: versionListUUID}})
		if err != nil {
			log.Fatalln("cannot list versions", err.Error())
			return
		}

		for {
			vResp, vE := versionStream.Recv()
			if vE != nil {
				log.Fatalln("cannot list versions", vE.Error())
				break
			}
			if vResp == nil {
				continue
			}

			cmd.Println("Received version: " + vResp.Version.Uuid)
			// log.Logger(context.Background()).Debug("Received version: " + vResp.Version.Uuid)
		}
	},
}

func init() {
	versionListCmd.Flags().StringVarP(&versionListUUID, "uuid", "u", "", "Uuid of the node")

	dataVersionCmd.AddCommand(versionListCmd)
}
