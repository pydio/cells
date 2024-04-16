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
	"log"
	"os"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/proto/idm"
)

var (
	userUnlockLogin string
)

var userUnlockCmd = &cobra.Command{
	Use:   "unlock",
	Short: "Unlock User",
	Long: fmt.Sprintf(`
DESCRIPTION

  Unlock a given user.
  This may be handy if admin is locked out of the interface.

EXAMPLE

  $ %s admin user unlock -u LOGIN

`, os.Args[0]),
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if userUnlockLogin == "" {
			return fmt.Errorf("Missing arguments")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := idmc.UserServiceClient(ctx)

		users, err := searchUser(context.Background(), client, userUnlockLogin)
		if err != nil {
			fmt.Printf("Cannot list users for login %s: %s", userUnlockLogin, err.Error())
		}

		for _, user := range users {
			delete(user.Attributes, "locks")
			delete(user.Attributes, "failedConnections")
			if _, err := client.CreateUser(context.Background(), &idm.CreateUserRequest{
				User: user,
			}); err != nil {
				fmt.Printf("could not unlock user [%s], skipping.\n Error message: %s", user.Login, err.Error())
				log.Println(err)
			} else {
				fmt.Printf("Successfully unlocked user %s\n", user.Login)
			}
			break
		}
	},
}

func init() {
	userUnlockCmd.Flags().StringVarP(&userUnlockLogin, "username", "u", "", "Login of the user to unlock")
	UserCmd.AddCommand(userUnlockCmd)
}
