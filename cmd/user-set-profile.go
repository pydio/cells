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
	userProfileLogin  string
	userTargetProfile string
	knownProfiles     = []string{
		common.PYDIO_PROFILE_ADMIN,
		common.PYDIO_PROFILE_STANDARD,
		common.PYDIO_PROFILE_SHARED,
		common.PYDIO_PROFILE_ANON,
	}
)

var userSetProfileCmd = &cobra.Command{
	Use:   "set-profile",
	Short: "Set profile",
	Long: fmt.Sprintf(`Set the profile of a given user


Valid profiles are one of: %s, %s, %s or %s.
Installation specific profiles are not yet supported by this CLI.

*WARNING*: please remember that user with admin profile have 
full control over your app via the web front end. So think twice beforew 

EXAMPLE
=======
$ %s user set-profile -u 'USER_LOGIN' --profile '%s'

`,
		common.PYDIO_PROFILE_ADMIN,
		common.PYDIO_PROFILE_STANDARD,
		common.PYDIO_PROFILE_SHARED,
		common.PYDIO_PROFILE_ANON,
		os.Args[0],
		common.PYDIO_PROFILE_STANDARD,
	),
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if userProfileLogin == "" {
			return fmt.Errorf("Please provide a valid username (login)")
		}

		if userTargetProfile != "" {
			isKnown := false
			for _, prof := range knownProfiles {
				if userTargetProfile == prof {
					isKnown = true
					break
				}
			}

			if !isKnown {
				return fmt.Errorf("Unknown profile [%s], cannot proceed", userTargetProfile)
			}
		} else {
			p := promptui.Select{
				Label: "Select a profile for this user",
				Items: knownProfiles,
			}
			c, _, _ := p.Run()
			userTargetProfile = knownProfiles[c]
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

		users, err := searchUser(context.Background(), client, userProfileLogin)
		if err != nil {
			fmt.Printf("Cannot list users for login %s: %s", userProfileLogin, err.Error())
		}

		for _, user := range users {
			if user.Attributes == nil {
				user.Attributes = make(map[string]string, 1)
			}
			user.Attributes["profile"] = userTargetProfile
			if _, err := client.CreateUser(context.Background(), &idm.CreateUserRequest{
				User: user,
			}); err != nil {
				fmt.Printf("could not update profile for [%s], skipping and continuing.\n Error message: %s", user.Login, err.Error())
				log.Println(err)
			} else {
				fmt.Printf("user %s profile was successfully updated\n", user.Login)
			}
		}
	},
}

func init() {
	userSetProfileCmd.Flags().StringVarP(&userProfileLogin, "username", "u", "", "Login of the user to update")
	userSetProfileCmd.Flags().StringVarP(&userTargetProfile, "profile", "p", "", "New profile")

	UserCmd.AddCommand(userSetProfileCmd)
}
