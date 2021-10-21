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
	"os"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/olekukonko/tablewriter"
	defaults "github.com/pydio/cells/common/micro"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
)

var userSearchLogin string

var userSearchCmd = &cobra.Command{
	Use:   "search",
	Short: "List all users or search them by login",
	Long: `
DESCRIPTION

  List users stored in the Pydio Cells user repository.

EXAMPLES

  1. Search a specific user
  $ ` + os.Args[0] + ` admin user search --login "user"

  2. List all users (default --login is "*") 
  $ ` + os.Args[0] + ` admin user search

`,

	RunE: func(cmd *cobra.Command, args []string) error {
		client := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())

		if userSearchLogin == "*" {
			userSearchLogin = ""
		}

		query, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
			Login: userSearchLogin,
		})

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Login", "Name", "Is Group", "Profile", "Path", "UUID"}) // "Roles",

		stream, err := client.SearchUser(context.Background(), &idm.SearchUserRequest{
			Query: &service.Query{
				SubQueries: []*any.Any{query},
			},
		})
		if err != nil {
			return err
		}

		defer stream.Close()

		for {
			response, err := stream.Recv()

			if err != nil {
				break
			}

			if response.User.Uuid == "ROOT_GROUP" {
				// do not display root group
				continue
			}

			var id, isGroup string
			if response.User.IsGroup {
				isGroup = "  X  "
				id = response.User.GroupLabel
			} else {
				isGroup = ""
				id = response.User.Login
			}

			prof, ok := response.User.Attributes["profile"]
			if !ok && !response.User.IsGroup {
				prof = "standard"
			}
			name := response.User.Attributes["displayName"]

			table.Append([]string{id, name, isGroup, prof, response.User.GroupPath, response.User.Uuid}) // roles,
		}
		cmd.Println(" ")

		table.Render()
		cmd.Println(" ")

		return nil
	},
}

func init() {
	userSearchCmd.Flags().StringVarP(&userSearchLogin, "login", "l", "", "Select a user by login (will list all users and groups if empty)")
	UserCmd.AddCommand(userSearchCmd)
}
