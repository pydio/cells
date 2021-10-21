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
	"os"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	service "github.com/pydio/cells/common/service/proto"
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

  Please, note that the login is case sensitive. You can create 2 distinct users with login  'User' and 'user'. 
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
			return fmt.Errorf("Provide at least a user login")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		ctx := context.Background()

		if userCreatePassword == "" {
			prompt := promptui.Prompt{Label: "Please provide a password", Mask: '*', Validate: notEmpty}
			pwd, e := prompt.Run()
			if e != nil {
				cmd.Println(e)
				return
			}
			userCreatePassword = pwd
		}

		// Create user
		r := service.ResourcePolicyAction_READ
		w := service.ResourcePolicyAction_WRITE
		allow := service.ResourcePolicy_allow
		policies := []*service.ResourcePolicy{
			{Action: r, Effect: allow, Subject: "profile:standard"},
			{Action: w, Effect: allow, Subject: "user:" + userCreateLogin},
			{Action: w, Effect: allow, Subject: "profile:admin"},
		}

		newUser := &idm.User{
			Login:      userCreateLogin,
			Password:   userCreatePassword,
			Policies:   policies,
			Attributes: map[string]string{"profile": common.PydioProfileStandard},
		}

		userClient := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())
		sQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: userCreateLogin})
		st, e := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*any.Any{sQ}}})
		if e != nil {
			cmd.Println(promptui.IconBad + e.Error())
			return
		}
		exists := false
		defer st.Close()
		for {
			_, e := st.Recv()
			if e != nil {
				break
			}
			exists = true
		}
		if exists {
			cmd.Println(promptui.IconBad + " User with login " + userCreateLogin + " already exists!")
			return
		}

		response, err := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: newUser})
		if err != nil {
			cmd.Println(err.Error())
			return
		}
		u := response.GetUser()

		cmd.Println("Successfully inserted user " + userCreateLogin)

		// Create corresponding role with correct policies
		newRole := idm.Role{
			Uuid:     u.Uuid,
			Policies: policies,
			UserRole: true,
			Label:    "User " + u.Login + " role",
		}

		roleClient := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
		if _, err := roleClient.CreateRole(context.Background(), &idm.CreateRoleRequest{
			Role: &newRole,
		}); err != nil {
			cmd.Println(err.Error())
			return
		}

		cmd.Println("Successfully inserted associated role with UUID " + newRole.Uuid)

	},
}

func init() {
	userCreateCmd.Flags().StringVarP(&userCreateLogin, "username", "u", "", "Login of the new user")
	userCreateCmd.Flags().StringVarP(&userCreatePassword, "password", "p", "", "Password of the new user")

	UserCmd.AddCommand(userCreateCmd)
}
