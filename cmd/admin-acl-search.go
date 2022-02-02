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
	"log"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
)

var searchAclCmd = &cobra.Command{
	Use:   "search",
	Short: "List current ACLs",
	Long: `
DESCRIPTION

  List ACLs currently stored in the ACL microservice.

`,
	Run: func(cmd *cobra.Command, args []string) {
		client := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))

		var aclActions []*idm.ACLAction
		for _, action := range actions {
			aclActions = append(aclActions, &idm.ACLAction{
				Name:  action,
				Value: "1",
			})
		}

		query, _ := anypb.New(&idm.ACLSingleQuery{
			Actions:      aclActions,
			RoleIDs:      roleIDs,
			WorkspaceIDs: workspaceIDs,
			NodeIDs:      nodeIDs,
		})

		// Exit if query is empty
		if len(query.Value) == 0 {
			return
		}

		stream, err := client.SearchACL(context.Background(), &idm.SearchACLRequest{
			Query: &service.Query{
				SubQueries: []*anypb.Any{query},
			},
		})

		if err != nil {
			log.Fatal(err)
		}

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Id", "Action", "Node_ID", "Role_ID", "Workspace_ID"})

		for {
			response, e := stream.Recv()

			if e != nil {
				break
			}

			table.Append([]string{response.ACL.ID, response.ACL.Action.String(), response.ACL.NodeID, response.ACL.RoleID, response.ACL.WorkspaceID})
		}
		table.Render()
	},
}

func init() {
	searchAclCmd.Flags().StringArrayVarP(&actions, "action", "a", []string{}, "Action value")
	searchAclCmd.Flags().StringArrayVarP(&roleIDs, "role_id", "r", []string{}, "RoleIDs")
	searchAclCmd.Flags().StringArrayVarP(&workspaceIDs, "workspace_id", "w", []string{}, "WorkspaceIDs")
	searchAclCmd.Flags().StringArrayVarP(&nodeIDs, "node_id", "n", []string{}, "NodeIDs")

	AclCmd.AddCommand(searchAclCmd)
}
