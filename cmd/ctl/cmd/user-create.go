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

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
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
$ pydioctl user create -u '/group/user' -p 'a password'
$ pydioctl user create -u 'user' -p 'a password'

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if userCreateLogin == "" || userCreatePassword == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

		if _, err := client.CreateUser(context.Background(), &idm.CreateUserRequest{
			User: &idm.User{
				Login:    userCreateLogin,
				Password: userCreatePassword,
			},
		}); err != nil {
			log.Println(err)
		}
	},
}

func init() {
	userCreateCmd.Flags().StringVarP(&userCreateLogin, "username", "u", "", "Login of the new user")
	userCreateCmd.Flags().StringVarP(&userCreatePassword, "password", "p", "", "Password of the new user")

	userCmd.AddCommand(userCreateCmd)
}
