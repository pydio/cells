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

	p "github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var userLogin string

// userDeleteCmd represents the delete command
var userDeleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a user from the backend",
	Long: `Delete a role in backend

*WARNING* Policy checks are not yet implemented for the CLI. 
You might corrupt your existing user and group repository,  
So please use with extra care. Also, remember that login are case sensitive. 

EXAMPLE
=======
$ ` + os.Args[0] + ` user delete -u '<user login>'

	`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if len(userLogin) == 0 {
			return fmt.Errorf("missing argument: please provide a user id")
			// return errors.BadRequest(common.SERVICE_USER, "missing argument: please provide a user id")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		if confirmDeletion(cmd, userLogin) {
			err := deleteUser(context.Background(), userLogin)
			if err != nil {
				cmd.Printf("could not delete %s: %s", userLogin, err.Error())
			}
		}
	},
}

func confirmDeletion(cmd *cobra.Command, login string) bool {

	q := fmt.Sprintf("You are about to definitively remove user [%s], are you sure you want to proceed?", login)
	confirm := p.Prompt{Label: q, IsConfirm: true}
	// Always returns an error if the end user does not confirm
	_, e := confirm.Run()
	return e == nil
}

func init() {
	userDeleteCmd.Flags().StringVarP(&userLogin, "username", "u", "", "Login(s) of the group(s) or user(s) to delete")

	UserCmd.AddCommand(userDeleteCmd)
}
