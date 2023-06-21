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
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

var (
	dryRun           bool
	patchRecycleRoot string
)

var patchRecyclePersonalCmd = &cobra.Command{
	Use:   "patch-recycle-personal",
	Short: "Patch the recycle bin of the personal folders",
	Long: `
DESCRIPTION

  Patch the recycle bin of the personal folders. 
  This command looks for personal/<username> folders and creates a recycle_root ACL on them.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		cmd.SetOut(color.Output)

		ctx := cmd.Context()

		treeClient := tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(ctx, common.ServiceTree, longGrpcCallTimeout()))
		stream, e := treeClient.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: patchRecycleRoot}})
		if e != nil {
			return e
		}

		aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))

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

			query, _ := anypb.New(&idm.ACLSingleQuery{
				Actions: []*idm.ACLAction{permissions.AclRecycleRoot},
				NodeIDs: []string{resp.Node.Uuid},
			})

			streamSearch, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
				Query: &service.Query{
					SubQueries: []*anypb.Any{query},
				},
			})

			if err != nil {
				return err
			}

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
				color.White(" + " + resp.GetNode().Path + " already has correct ACL - skipping")
				continue
			}

			if !dryRun {
				if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{
					ACL: newACL,
				}); e != nil {
					color.Green(" + " + resp.GetNode().Path + " failed apply ACL " + e.Error())
				} else {
					color.Green(" + " + resp.GetNode().Path + " applied ACL")
				}
			} else {
				color.Green(" + " + resp.GetNode().Path + " should apply ACL (but dryRun mode is set)")
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
