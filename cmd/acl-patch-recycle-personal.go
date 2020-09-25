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

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

var (
	patchRecycleRoot string
)

// createCmd represents the create command
var patchRecyclePersonalCmd = &cobra.Command{
	Use:   "patch-recycle-personal",
	Short: "Patches the recycle bins for the personal folder",
	Long:  `Patches the recycle bins for the personal folder`,
	RunE: func(cmd *cobra.Command, args []string) error {

		ctx := context.Background()

		treeClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())
		stream, e := treeClient.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: patchRecycleRoot}})
		if e != nil {
			return e
		}

		aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())

		defer stream.Close()
		for {
			resp, er := stream.Recv()
			if er != nil {
				break
			}
			if resp == nil || resp.Node == nil || resp.Node.IsLeaf() {
				continue
			}
			newACL := &idm.ACL{
				NodeID: resp.Node.Uuid,
				Action: permissions.AclRecycleRoot,
			}

			cmd.Println(resp.GetNode().Path)
			aclClient.CreateACL(ctx, &idm.CreateACLRequest{
				ACL: newACL,
			})
		}

		return nil
	},
}

func init() {
	patchRecyclePersonalCmd.Flags().StringVar(&patchRecycleRoot, "path", "personal", "Full path to browse. All existing children will be flagged with the recycle_root ACL.")
	AclCmd.AddCommand(patchRecyclePersonalCmd)
}
