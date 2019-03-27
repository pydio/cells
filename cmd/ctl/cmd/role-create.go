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

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/spf13/cobra"
)

var (
	roleCreateUUID  string
	roleCreateLabel string
)

// createCmd represents the create command
var roleCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a role",
	Long: `Create a role in backend


`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if roleCreateUUID == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())

		if _, err := client.CreateRole(context.Background(), &idm.CreateRoleRequest{
			Role: &idm.Role{
				Uuid:  roleCreateUUID,
				Label: roleCreateLabel,
			},
		}); err != nil {
			log.Println(err)
		}
	},
}

func init() {
	roleCreateCmd.Flags().StringVarP(&roleCreateUUID, "uuid", "u", "", "Uuid of the new role")
	roleCreateCmd.Flags().StringVarP(&roleCreateLabel, "label", "l", "", "Label of the new role")

	roleCmd.AddCommand(roleCreateCmd)
}
