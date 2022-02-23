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
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/config/etcd"
	configregistry "github.com/pydio/cells/v4/common/registry/config"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	clientv3 "go.etcd.io/etcd/client/v3"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"log"
	"time"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
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

		etcdconn, err := clientv3.New(clientv3.Config{
			Endpoints:   []string{"http://0.0.0.0:2379"},
			DialTimeout: 2 * time.Second,
		})
		if err != nil {
			log.Fatal("could not start etcd", zap.Error(err))
		}

		regStore := etcd.NewSource(cmd.Context(), etcdconn, "registry", configregistry.WithJSONItem())
		reg := configregistry.NewConfigRegistry(regStore, false)

		conn, err := grpc.Dial("cells:///", clientgrpc.DialOptionsForRegistry(reg)...)
		if err != nil {
			log.Fatal(err)
		}

		ctx = clientcontext.WithClientConn(ctx, conn)
		ctx = servercontext.WithRegistry(ctx, reg)

		client := idm.NewACLServiceClient(clientgrpc.GetClientConnFromCtx(ctx, common.ServiceAcl))

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
			response, err := stream.Recv()

			if err != nil {
				log.Fatal(err)
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
