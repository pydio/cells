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
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

// listCmd represents the list command
var dataListCmd = &cobra.Command{
	Use:   "list",
	Short: "List data indexed in Pydio",
	Long: `List data indexed in Pydio.

Lists data from either the tree service (all data sources aggregated) or directly from a datasource index (using
the --source flag).

EXAMPLES
========
Let's say you have one datasource named pydiods1 containing one file image.png

List all data aggregated by the tree
$ ./pydioctl data list
+----------+------+---------------------+
|   NAME   | TYPE |        UUID         |
+----------+------+---------------------+
| pydiods1 |    0 | DATASOURCE:pydiods1 |
+----------+------+---------------------+

$ ./pydioctl data list --path=pydiods1
+--------------+------+--------------------------------------+
|     NAME     | TYPE |                 UUID                 |
+--------------+------+--------------------------------------+
| image.png    |    1 | 244f072d-d9a1-11e7-950b-685b35ac60e5 |
+--------------+------+--------------------------------------+

List all data for a given data source
$ ./pydioctl data list --source=pydiods1
+--------------+------+--------------------------------------+
|     NAME     | TYPE |                 UUID                 |
+--------------+------+--------------------------------------+
| image.png    |    1 | 244f072d-d9a1-11e7-950b-685b35ac60e5 |
+--------------+------+--------------------------------------+

`,
	Run: func(cmd *cobra.Command, args []string) {
		table := tablewriter.NewWriter(os.Stdout)

		ctx := context.Background()
		if user != "" {

			// In user mode, we use acls and roles
			roles := permissions.GetRolesForUser(ctx, &idm.User{Uuid: user, Roles: []*idm.Role{{Uuid: user}}}, false)
			log.Println(roles)

			aclsDeny := permissions.GetACLsForRoles(ctx, roles, DENY)
			aclsRead := permissions.GetACLsForRoles(ctx, roles, READ)
			aclsWrite := permissions.GetACLsForRoles(ctx, roles, WRITE)
			log.Println(aclsRead)

			accessList := permissions.NewAccessList(roles)
			accessList.Append(aclsRead)
			accessList.Append(aclsDeny)
			accessList.Append(aclsWrite)
			accessList.Flatten(ctx)

			workspaces := permissions.GetWorkspacesForACLs(ctx, accessList)

			serviceName := common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_TREE
			client := tree.NewNodeProviderClient(serviceName, defaults.NewClient())

			if path == "" {
				// If the path is empty, we just render a list of workspaces
				table.SetHeader([]string{"Name", "UUID"})
				for _, workspace := range workspaces {
					for _, nodeUUID := range workspace.GetRootUUIDs() {
						table.Append([]string{workspace.GetLabel(), nodeUUID})
					}
				}

			} else {
				path = strings.TrimLeft(path, "/")
				list := strings.Split(path, "/")

				label := strings.Trim(list[0], "/")
				path = filepath.Join(list[1:]...)

				// Check if the workspace belongs to the user list
				for _, workspace := range workspaces {
					name := workspace.GetLabel()

					if label == name {

						for _, nodeUUID := range workspace.GetRootUUIDs() {

							// Retrieve the details of the root nodes
							response, err := client.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUUID}})
							if err != nil {
								log.Fatal("Could not read a tree node", err)
							}

							// Sending a request with the path retrieved
							path = filepath.Join(response.Node.Path, path)

							log.Println("We have a path ", path)

							stream, err := client.ListNodes(context.Background(), &tree.ListNodesRequest{
								Node:      &tree.Node{Path: path},
								Recursive: recursive,
								//	FilterType: tree.NodeType_UNKNOWN,
								// Limit: -1,
							})
							if err != nil {
								log.Fatal("Could not open a stream", err)
							}

							if recursive {
								table.SetHeader([]string{"Path", "Type", "UUID"})
							} else {
								table.SetHeader([]string{"Name", "Type", "UUID"})
							}

							for {
								response, err := stream.Recv()

								if err != nil {
									break
								}

								log.Println("We have a response", response)

								if recursive {
									table.Append([]string{response.Node.GetPath(), fmt.Sprintf("%d", response.Node.Type), response.Node.GetUuid()})
								} else {
									var name string
									response.Node.GetMeta("name", &name)
									table.Append([]string{name, fmt.Sprintf("%d", response.Node.Type), response.Node.GetUuid()})
								}

							}
							// close the stream
							if err := stream.Close(); err != nil {
								fmt.Println("stream close err:", err)
							}
						}
					}
				}

			}
		} else {

			// In admin mode, we bypass user roles and acls settings
			client := tree.NewNodeProviderClient(serviceName, defaults.NewClient())
			if path == "" {
				path = "/"
			}

			t := time.Now()
			stream, err := client.ListNodes(context.Background(), &tree.ListNodesRequest{
				Node: &tree.Node{
					Path: path,
				},
				Recursive: recursive,
			})
			fmt.Println("time ", time.Since(t))

			if err != nil {
				log.Fatal("Could not open a stream", err)
			}

			if recursive {
				table.SetHeader([]string{"Path", "Type", "UUID"})
			} else {
				table.SetHeader([]string{"Name", "Type", "UUID"})
			}

			for {
				response, err := stream.Recv()

				if err != nil {
					break
				}

				if recursive {
					table.Append([]string{response.Node.GetPath(), fmt.Sprintf("%d", response.Node.Type), response.Node.GetUuid()})
				} else {
					var name string
					response.Node.GetMeta("name", &name)
					table.Append([]string{name, fmt.Sprintf("%d", response.Node.Type), response.Node.GetUuid()})
				}

			}
			// close the stream
			if err := stream.Close(); err != nil {
				fmt.Println("stream close err:", err)
			}
		}

		table.Render()
	},
}

func init() {
	dataListCmd.Flags().StringVarP(&path, "path", "p", "", "Path to the data")
	dataListCmd.Flags().StringVarP(&uuid, "uuid", "u", "", "UUID of the data")
	dataListCmd.Flags().BoolVarP(&recursive, "recursive", "r", false, "Print all the nodes recursively")
	dataListCmd.Flags().StringVar(&path, "user", "", "Do the listing with the context of a user's permissions")

	dataCmd.AddCommand(dataListCmd)
}
