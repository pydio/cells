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

	"github.com/manifoldco/promptui"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/spf13/cobra"
)

var (
	userPwdLogin string
	userPwd      string
)

var userSetPwdCmd = &cobra.Command{
	Use:   "set-pwd",
	Short: "Change user password",
	Long: fmt.Sprintf(`Set the password of a given user. 

Directly use --password (or -p) to provide a new password, or leave empty to be prompted.

EXAMPLE
=======
$ %s user set-pwd -u 'USER_LOGIN' -p 'NEW_PASSWORD'

`,
		os.Args[0],
	),
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if userPwdLogin == "" {
			return fmt.Errorf("Missing arguments")
		}
		if userPwd == "" {
			p := promptui.Prompt{
				Label: "Provide a new password",
				Validate: func(s string) error {
					if s == "" {
						return fmt.Errorf("cannot use empty password")
					}
					return nil
				},
				Mask: '*',
			}
			firstPwd, e := p.Run()
			if e != nil {
				return e
			}
			c := promptui.Prompt{
				Label: "Please confirm password",
				Validate: func(s string) error {
					if s != "" && s != firstPwd {
						return fmt.Errorf("password does not match")
					}
					return nil
				},
				Mask: '*',
			}
			userPwd, e = c.Run()
			if e != nil {
				return e
			}
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

		users, err := searchUser(context.Background(), client, userPwdLogin)
		if err != nil {
			fmt.Printf("Cannot list users for login %s: %s", userPwdLogin, err.Error())
		}

		for _, user := range users {
			user.Password = userPwd
			if _, err := client.CreateUser(context.Background(), &idm.CreateUserRequest{
				User: user,
			}); err != nil {
				fmt.Printf("could not update password for [%s], skipping and continuing.\n Error message: %s", user.Login, err.Error())
				log.Println(err)
			} else {
				fmt.Printf("user %s password was successfully updated\n", user.Login)
			}
		}
	},
}

func init() {
	userSetPwdCmd.Flags().StringVarP(&userPwdLogin, "username", "u", "", "Login of the user to update")
	userSetPwdCmd.Flags().StringVarP(&userPwd, "password", "p", "", "New password")

	UserCmd.AddCommand(userSetPwdCmd)
}
