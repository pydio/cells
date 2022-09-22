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
	"os"
	"path"

	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
)

var userSearchLogin string
var userSearchOffset int
var userSearchLimit int

var userSearchCmd = &cobra.Command{
	Use:   "search",
	Short: "List all users or search them by login",
	Long: `
DESCRIPTION

  List users stored in the Pydio Cells user repository.

EXAMPLES

  1. Search a specific user
  $ ` + os.Args[0] + ` admin user search --user "alice"

  2. List all users (default --user is "*") 
  $ ` + os.Args[0] + ` admin user search

  3. List users with a pattern 
  $ ` + os.Args[0] + ` admin user search -u "a*"

`,

	RunE: func(cmd *cobra.Command, args []string) error {
		client := idm.NewUserServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceUser))

		if userSearchLogin == "*" {
			userSearchLogin = ""
		}

		query, _ := anypb.New(&idm.UserSingleQuery{
			Login: userSearchLogin,
		})

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Name", "Is Group", "Profile", "Path", "UUID"})

		stream, err := client.SearchUser(context.Background(), &idm.SearchUserRequest{
			Query: &service.Query{
				SubQueries: []*anypb.Any{query},
				Limit:      int64(userSearchLimit),
				Offset:     int64(userSearchOffset),
			},
		})
		if err != nil {
			return err
		}

		currNb := 0
		for {
			response, err := stream.Recv()
			if err != nil {
				break
			}

			prof, ok := response.User.Attributes["profile"]
			if !ok && !response.User.IsGroup {
				prof = "standard"
			}

			// var id, name, isGroup string
			// if response.User.IsGroup {
			// 	isGroup = "  X  "
			// 	id = path.Base(response.User.GroupPath)
			// 	name = response.User.GroupLabel
			// } else {
			// 	isGroup = ""
			// 	id = response.User.Login
			// 	name = response.User.Attributes["displayName"]

			// }
			// table.Append([]string{id, name, isGroup, prof, response.User.GroupPath, response.User.Uuid}) // roles,

			var label, isGroup string
			if response.User.IsGroup {
				isGroup = "  X  "
				label = response.User.GroupLabel
				if label == "" {
					label = path.Base(response.User.GroupPath)
				}
			} else {
				isGroup = ""
				label = response.User.Login
				if dname := response.User.Attributes["displayName"]; dname != "" {
					label += " (" + dname + ")"
				}
			}
			table.Append([]string{label, isGroup, prof, response.User.GroupPath, response.User.Uuid})

			currNb++
			if userSearchLimit > 0 && userSearchLimit == currNb {
				break
			}
		}
		table.Render()

		if currNb == 0 {
			cmd.Printf("No result found\n")
		} else {
			msg := fmt.Sprintf("Showing %d result", currNb)
			if currNb > 1 {
				msg += "s"
			}
			if userSearchOffset > 0 {
				msg += fmt.Sprintf(" at offset %d", userSearchOffset)
			}
			if userSearchLimit == currNb {
				msg += " (Max. row number limit has been hit)"
			}
			cmd.Println(msg)
		}

		cmd.Println(" ")
		return nil
	},
}

func init() {
	userSearchCmd.Flags().StringVarP(&userSearchLogin, "user", "u", "", "Select a user by login (list all users and groups if empty)")
	userSearchCmd.Flags().IntVarP(&userSearchOffset, "offset", "o", 0, "Add an offset to the query when necessary")
	userSearchCmd.Flags().IntVarP(&userSearchLimit, "limit", "l", 100, "Max. number of returned rows, 0 for unlimited")
	UserCmd.AddCommand(userSearchCmd)
}
