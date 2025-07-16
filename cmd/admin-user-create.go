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
	"os"
	"path"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
)

var (
	userCreateLogin    string
	userCreatePassword string
)

// userCreateCmd represents the create command
var userCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a user",
	Long: `
DESCRIPTION

  Create a new user.

  Please, note that the login is case sensitive. You can create 2 distinct users with login 'User' and 'user'. 
  You can also create a user in a given group by entering a full path (see examples below). 

  If not provided with the -p flag, password is prompted by the command line.

EXAMPLES

  1. Create a user with a password
  $ ` + os.Args[0] + ` admin user create -u 'user' -p 'a password'

  2. Create a user with a prompt for password
  $ ` + os.Args[0] + ` admin user create -u 'user'

  3. Create a user inside a group
  $ ` + os.Args[0] + ` admin user create -u "/group/user" -p "new-password"

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if userCreateLogin == "" {
			return errors.New("Provide at least a user login")
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		if userCreatePassword == "" {
			prompt := promptui.Prompt{Label: "Please provide a password", Mask: '*', Validate: notEmpty}
			pwd, e := prompt.Run()
			if e != nil {
				return e
			}
			userCreatePassword = pwd
		}

		groupPath, login := path.Split(userCreateLogin)
		if groupPath == "/" || groupPath == "." {
			groupPath = ""
		}

		// Create user
		policies := permissions.NewResourcePoliciesBuilder().WithStandardUserPolicies().Policies()

		newUser := &idm.User{
			Login:      login,
			GroupPath:  groupPath,
			Password:   userCreatePassword,
			Policies:   policies,
			Attributes: map[string]string{idm.UserAttrProfile: common.PydioProfileStandard},
		}
		ctx := cmd.Context()
		userClient := idmc.UserServiceClient(ctx)
		sQ, _ := anypb.New(&idm.UserSingleQuery{Login: login})
		st, e := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{sQ}}})
		if e != nil {
			return e
		}
		exists := false
		for {
			_, e := st.Recv()
			if e != nil {
				break
			}
			exists = true
		}
		if exists {
			cmd.Println(promptui.IconBad + " User with login " + login + " already exists!")
			return nil
		}

		response, err := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: newUser})
		if err != nil {
			cmd.Println(err.Error())
			return nil
		}
		u := response.GetUser()

		cmd.Println("Successfully inserted user " + login)

		// Create corresponding role with correct policies
		newRole := idm.Role{
			Uuid:     u.Uuid,
			Policies: policies,
			UserRole: true,
			Label:    "User " + u.Login + " role",
		}

		if _, err := idmc.RoleServiceClient(ctx).CreateRole(ctx, &idm.CreateRoleRequest{
			Role: &newRole,
		}); err != nil {
			cmd.Println(err.Error())
			return nil
		}

		cmd.Println("Successfully inserted associated role with UUID " + newRole.Uuid)
		return nil
	},
}

func init() {
	userCreateCmd.Flags().StringVarP(&userCreateLogin, "username", "u", "", "Login of the new user")
	userCreateCmd.Flags().StringVarP(&userCreatePassword, "password", "p", "", "Password of the new user")

	UserCmd.AddCommand(userCreateCmd)
}
