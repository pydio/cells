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
	"io"
	"log"
	"os"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	clientgrpc "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
)

var (
	searchAclOffset int
	searchAclLimit  int
)

var searchAclCmd = &cobra.Command{
	Use:   "search",
	Short: "List current ACLs",
	Long: `
DESCRIPTION

  List ACLs currently stored in the ACL microservice.

EXAMPLES

  1. List all ACLs that give READ access
  $ ` + os.Args[0] + ` admin acl search -a "READ"

  2. List all ACLs for root group  
  $ ` + os.Args[0] + ` admin acl search -r "ROOT_GROUP"

  3. List all ACLs of a given node 
  $ ` + os.Args[0] + ` admin acl search -n "53a65cc3-e407-4fcc-9230-5630ff054659"

`,
	Run: func(cmd *cobra.Command, args []string) {

		client := idm.NewACLServiceClient(clientgrpc.ResolveConn(cmd.Context(), common.ServiceAclGRPC))

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
			cmd.Help()
			fmt.Println("")
			log.Fatal("Wrong arguments: please provide at least one of --action, --role_id, --workspace_id or --node_id")
			return
		}

		stream, err := client.SearchACL(cmd.Context(), &idm.SearchACLRequest{
			Query: &service.Query{
				SubQueries: []*anypb.Any{query},
				Limit:      int64(searchAclLimit),
				Offset:     int64(searchAclOffset),
			},
		})

		if err != nil {
			log.Fatal(err)
		}

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Id", "Action", "Node_ID", "Role_ID", "Workspace_ID"})

		res := 0
		for {
			response, err := stream.Recv()
			if err != nil {
				if err != io.EOF {
					log.Fatal(err)
				}
				break
			}
			res++

			table.Append([]string{response.ACL.ID, response.ACL.Action.String(), response.ACL.NodeID, response.ACL.RoleID, response.ACL.WorkspaceID})
		}

		if res > 0 {
			table.Render()

			msg := fmt.Sprintf("Showing %d result", res)
			if res > 1 {
				msg += "s"
			}
			if searchAclOffset > 0 {
				msg += fmt.Sprintf(" at offset %d", searchAclOffset)
			}
			if res == searchAclLimit {
				msg += " (Max. row number limit has been hit)"
			}
			cmd.Println(msg)
			cmd.Println(" ")
		} else {
			cmd.Println("No results")
		}
	},
}

func init() {
	searchAclCmd.Flags().StringArrayVarP(&actions, "action", "a", []string{}, "Action value")
	searchAclCmd.Flags().StringArrayVarP(&roleIDs, "role_id", "r", []string{}, "RoleIDs")
	searchAclCmd.Flags().StringArrayVarP(&workspaceIDs, "workspace_id", "w", []string{}, "WorkspaceIDs")
	searchAclCmd.Flags().StringArrayVarP(&nodeIDs, "node_id", "n", []string{}, "NodeIDs")
	searchAclCmd.Flags().IntVarP(&searchAclOffset, "offset", "o", 0, "Add an offset to the query when necessary")
	searchAclCmd.Flags().IntVarP(&searchAclLimit, "limit", "l", 100, "Max. number of returned rows, 0 for unlimited")

	AclCmd.AddCommand(searchAclCmd)
}
