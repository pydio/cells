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
	Long: `Create a user in the backend

Please, note that login are case sensitive: 
you can create 2 distinct users with login  'User' and 'user'. 

You can also create a user in a given group by entering a full path to the user
(see examples below). 

EXAMPLE
=======
$ ` + os.Args[0] + ` user create -u '/group/user' -p 'a password'
$ ` + os.Args[0] + ` user create -u 'user' -p 'a password'

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if userCreateLogin == "" || userCreatePassword == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		ctx := context.Background()

		// Create user
		r := service.ResourcePolicyAction_READ
		w := service.ResourcePolicyAction_WRITE
		allow := service.ResourcePolicy_allow
		policies := []*service.ResourcePolicy{
			&service.ResourcePolicy{Action: r, Effect: allow, Subject: "profile:standard"},
			&service.ResourcePolicy{Action: w, Effect: allow, Subject: "user:" + userCreateLogin},
			&service.ResourcePolicy{Action: w, Effect: allow, Subject: "profile:admin"},
		}

		newUser := &idm.User{
			Login:      userCreateLogin,
			Password:   userCreatePassword,
			Policies:   policies,
			Attributes: map[string]string{"profile": common.PYDIO_PROFILE_STANDARD},
		}

		userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		response, err := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: newUser})
		if err != nil {
			cmd.Println(err.Error())
			return
		}
		u := response.GetUser()

		// Create corresponding role with correct policies
		newRole := idm.Role{
			Uuid:     u.Uuid,
			Policies: policies,
			UserRole: true,
			Label:    "User " + u.Login + " role",
		}

		roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
		if _, err := roleClient.CreateRole(context.Background(), &idm.CreateRoleRequest{
			Role: &newRole,
		}); err != nil {
			cmd.Println(err.Error())
			return
		}
	},
}

func init() {
	userCreateCmd.Flags().StringVarP(&userCreateLogin, "username", "u", "", "Login of the new user")
	userCreateCmd.Flags().StringVarP(&userCreatePassword, "password", "p", "", "Password of the new user")

	UserCmd.AddCommand(userCreateCmd)
}
