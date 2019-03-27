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

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/proto/idm"
	service2 "github.com/pydio/cells/common/service/proto"
)

// userCmd represents the user command
var adminCmd = &cobra.Command{
	Use:   "admin",
	Short: "Administrative tools",
	Long: `These tools may be helpful for admins, particularly if they are locked
out of the web interface. These commands are also found in cells-ctl binary.

`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	RootCmd.AddCommand(adminCmd)
}

/* Package protected utility methods that are used by the various user subcommands */

func searchUser(ctx context.Context, cli idm.UserServiceClient, login string) ([]*idm.User, error) {

	singleQ := &idm.UserSingleQuery{Login: login}
	query, _ := ptypes.MarshalAny(singleQ)

	mainQuery := &service2.Query{SubQueries: []*any.Any{query}}

	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{Query: mainQuery})
	if err != nil {
		return nil, err
	}

	users := []*idm.User{}

	defer stream.Close()
	for {
		response, e := stream.Recv()
		if e != nil {
			break
		}
		if response == nil {
			continue
		}

		currUser := response.GetUser()
		if currUser.IsGroup {
			continue
		}

		if len(users) >= 50 {
			fmt.Println("Maximum of users that can be edited at a time reached. Truncating the list. Please refine you search.")
			break
		}
		users = append(users, currUser)
	}
	return users, nil
}
