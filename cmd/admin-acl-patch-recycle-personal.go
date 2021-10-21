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
	"context"

	"github.com/fatih/color"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

var (
	dryRun           bool
	patchRecycleRoot string
)

// createCmd represents the create command
var patchRecyclePersonalCmd = &cobra.Command{
	Use:   "patch-recycle-personal",
	Short: "Patches the recycle bins for the personal folder",
	Long: `
DESCRIPTION

  Patch the recycle bins for the personal folder. 
  Look for personal/<username> folders and create a recycle_root ACL on them.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		cmd.SetOutput(color.Output)

		ctx := context.Background()

		treeClient := tree.NewNodeProviderClient(common.ServiceGrpcNamespace_+common.ServiceTree, defaults.NewClient())
		stream, e := treeClient.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: patchRecycleRoot}})
		if e != nil {
			return e
		}

		aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())

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

			query, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
				Actions: []*idm.ACLAction{permissions.AclRecycleRoot},
				NodeIDs: []string{resp.Node.Uuid},
			})

			streamSearch, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
				Query: &service.Query{
					SubQueries: []*any.Any{query},
				},
			})

			if err != nil {
				return err
			}

			defer streamSearch.Close()

			found := false
			for {
				_, err := streamSearch.Recv()
				if err != nil {
					break
				}

				found = true
				break
			}

			if found {
				color.White("  " + resp.GetNode().Path)
				continue
			}

			color.Green("+ " + resp.GetNode().Path)

			if !dryRun {
				aclClient.CreateACL(ctx, &idm.CreateACLRequest{
					ACL: newACL,
				})
			}
		}

		return nil
	},
}

func init() {
	patchRecyclePersonalCmd.Flags().StringVar(&patchRecycleRoot, "path", "personal", "Full path to browse. All existing children will be flagged with the recycle_root ACL.")
	patchRecyclePersonalCmd.Flags().BoolVar(&dryRun, "dry-run", true, "Run as a dry-run")
	AclCmd.AddCommand(patchRecyclePersonalCmd)
}
