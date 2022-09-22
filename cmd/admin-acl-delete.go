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
	"fmt"
	"io"
	"log"

	p "github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
)

var deleteAclForce bool

var deleteAclCmd = &cobra.Command{
	Use:   "delete",
	Short: "Remove one or more ACLs",
	Long: `
DESCRIPTION
  
  Remove one or more ACLs by querying the ACL API.
  Flags allow you to query the gRPC service and delete the resulting ACLs.

  *WARNING* ACLs are the corner stone of Pydio Cells system: 
  you might corrupt your instance by removing some of them.  
  So please use with extra care: insure that you know what 
  you are doing and have a valid backup. 

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

		if len(query.Value) == 0 {
			return
		}

		if deleteAclForce || confirmAclDeletion(cmd, client, query) {
			if response, err := client.DeleteACL(context.Background(), &idm.DeleteACLRequest{
				Query: &service.Query{
					SubQueries: []*anypb.Any{query},
				},
			}); err != nil {
				fmt.Println(err)
				return
			} else {
				fmt.Printf("Successfully deleted ACL - [%v]\n", response.RowsDeleted)
				return
			}
		}
	},
}

func confirmAclDeletion(cmd *cobra.Command, client idm.ACLServiceClient, query *anypb.Any) bool {

	stream, err := client.SearchACL(cmd.Context(), &idm.SearchACLRequest{
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
		response, err := stream.Recv()
		if err != nil {
			if err != io.EOF {
				log.Fatal(err)
			}
			break
		}
		table.Append([]string{response.ACL.ID, response.ACL.Action.String(), response.ACL.NodeID, response.ACL.RoleID, response.ACL.WorkspaceID})
	}
	table.Render()

	q := "You are about to definitively remove the above listed ACLs, are you sure you want to proceed"
	confirm := p.Prompt{Label: q, IsConfirm: true}
	// Always returns an error if the end user does not confirm
	_, e := confirm.Run()
	return e == nil
}

func init() {
	deleteAclCmd.Flags().StringArrayVarP(&actions, "action", "a", []string{}, "Action Name")
	deleteAclCmd.Flags().StringArrayVarP(&roleIDs, "role_id", "r", []string{}, "RoleIDs")
	deleteAclCmd.Flags().StringArrayVarP(&workspaceIDs, "workspace_id", "w", []string{}, "WorkspaceIDs")
	deleteAclCmd.Flags().StringArrayVarP(&nodeIDs, "node_id", "n", []string{}, "NodeIDs")
	deleteAclCmd.Flags().BoolVarP(&deleteAclForce, "force", "f", false, "DANGER: force deletion of found ACLs without user confirmation")

	AclCmd.AddCommand(deleteAclCmd)
}
