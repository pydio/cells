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
	 "os"
	 "context"
	 
	 "github.com/spf13/cobra"
 
	 "github.com/pydio/cells/common"
	 defaults "github.com/pydio/cells/common/micro"
	 "github.com/pydio/cells/common/proto/tree"
	// service "github.com/pydio/cells/common/service/proto"
 )
 
 var lsCmd = &cobra.Command{
	 Use:   "ls",
	 Short: "List files",
	 Long: `List ACLs currently stored in the acl micro-service.
 
 Use the flags to search ACLs by a given facet : node_id, role_id, workspace_id or action.
 `,
	 Run: func(cmd *cobra.Command, args []string) {
		 client := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())

		 // List all children and move them all
		streamer, err := client.ListNodes(context.Background(), &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}})
		if err != nil {
			cmd.Println(err)
			os.Exit(1)
		}

		cmd.Println("Starting to list nodes")

		defer streamer.Close()
		for {
			node, err := streamer.Recv()
			if err != nil {
				break
			}

			cmd.Println(node)
		 }
	 },
 }
 
 func init() {
	 RootCmd.AddCommand(lsCmd)
 }
 