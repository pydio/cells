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
	"strings"

	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/proto/idm"
	service2 "github.com/pydio/cells/v5/common/proto/service"
)

var UserCmd = &cobra.Command{
	Use:   "user",
	Short: "Manage users",
	Long: `
DESCRIPTION

  Manage users from the command line by calling the dedicated services.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	AdminCmd.AddCommand(UserCmd)
}

/* Package protected utility methods that are used by the various user subcommands */

func searchUser(ctx context.Context, cli idm.UserServiceClient, login string) ([]*idm.User, error) {

	singleQ := &idm.UserSingleQuery{Login: login}
	query, _ := anypb.New(singleQ)

	mainQuery := &service2.Query{SubQueries: []*anypb.Any{query}}

	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{Query: mainQuery})
	if err != nil {
		return nil, err
	}

	users := []*idm.User{}

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

func deleteUser(ctx context.Context, login string) error {

	singleQ := &idm.UserSingleQuery{}
	if strings.HasSuffix(login, "%2F") || strings.HasSuffix(login, "/") {
		// log.Logger(ctx).Debug("Received User.Delete API request (GROUP)", zap.String("login", login))
		singleQ.GroupPath = login
		singleQ.Recursive = true
	} else {
		// log.Logger(ctx).Debug("Received User.Delete API request (LOGIN)", zap.String("login", login))
		singleQ.Login = login
	}
	query, _ := anypb.New(singleQ)
	mainQuery := &service2.Query{SubQueries: []*anypb.Any{query}}
	cli := idmc.UserServiceClient(ctx)

	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{Query: mainQuery})
	if err != nil {
		return err
	}
	// Search first to check policies
	for {
		response, e := stream.Recv()
		if e != nil {
			break
		}
		if response == nil {
			continue
		}
		// if !s.MatchPolicies(ctx, response.User.Uuid, response.User.Policies, service2.ResourcePolicyAction_WRITE) {
		// 	msg := fmt.Sprintf("forbidden action: you are not allowed to delete user %s", login)
		// 	log.Auditer(ctx).Error( msg, log.GetAuditId(common.AuditUserDelete))
		// 	return  errors.Forbidden(common.ServiceUser, msg)
		// }
		break
	}

	// Now delete user or group
	_, e := cli.DeleteUser(ctx, &idm.DeleteUserRequest{Query: mainQuery})
	if e != nil {
		return e
	}
	// log.Auditer(ctx).Info(
	// 	fmt.Sprintf("%d users have been deleted", n.RowsDeleted),
	// 	log.GetAuditId(common.AuditUserDelete),
	// )
	return nil
}
