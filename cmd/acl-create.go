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

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
)

var createAclCmd = &cobra.Command{
	Use:   "create",
	Short: "Create an Access Control",
	Long: `Create an Access Control in the dedicated micro service

Use this command to manually grant a permission on a given node for a given role.
`,
	Run: func(cmd *cobra.Command, args []string) {

		client := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())

		response, err := client.CreateACL(context.Background(), &idm.CreateACLRequest{
			ACL: &idm.ACL{
				Action: &idm.ACLAction{
					Name:  action,
					Value: value,
				},
				RoleID:      roleID,
				WorkspaceID: workspaceID,
				NodeID:      nodeID,
			}})

		if err != nil {
			fmt.Println("Error while creating ACL", err.Error())
			return
		}

		fmt.Println("Successfully created ACL")
		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Id", "Action", "Node_ID", "Role_ID", "Workspace_ID"})
		table.Append([]string{response.ACL.ID, response.ACL.Action.String(), response.ACL.NodeID, response.ACL.RoleID, response.ACL.WorkspaceID})
		table.Render()
	},
}

func init() {
	createAclCmd.Flags().StringVarP(&action, "action", "a", "", "Action")
	createAclCmd.Flags().StringVarP(&value, "actionVal", "v", "", "Action value")
	createAclCmd.Flags().StringVarP(&roleID, "role_id", "r", "", "RoleIDs")
	createAclCmd.Flags().StringVarP(&workspaceID, "workspace_id", "w", "", "WorkspaceIDs")
	createAclCmd.Flags().StringVarP(&nodeID, "node_id", "n", "", "NodeIDs")

	AclCmd.AddCommand(createAclCmd)
}
