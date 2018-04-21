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
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/olekukonko/tablewriter"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/defaults"
)

var roleSearchUUID []string

// searchCmd represents the search command
var roleSearchCmd = &cobra.Command{
	Use:   "search",
	Short: "List roles",
	Long: `List all roles stored in the service.
	
EXAMPLES
========
$ pydioctl role search -u "d4f5c8c0*"

# To list all roles  
$ pydioctl role search -u "*"	
	`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if len(roleSearchUUID) == 0 {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())

		query, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
			Uuid: roleSearchUUID,
		})

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{"ID", "Name"})

		if stream, err := client.SearchRole(context.Background(), &idm.SearchRoleRequest{
			Query: &service.Query{
				SubQueries: []*any.Any{query},
			},
		}); err != nil {
			log.Println(err)
		} else {
			defer stream.Close()

			for {
				response, err := stream.Recv()

				if err != nil {
					break
				}

				table.Append([]string{response.Role.Uuid, response.Role.Label})
			}
		}

		// Workaround the stdout to log wrapper issue to insure the table is correctly rendered
		cmd.Println(" ")
		table.Render()
		xFactor := time.Duration(table.NumLines() * 50)
		<-time.After(xFactor * time.Millisecond)
		cmd.Println(" ")

	},
}

func init() {
	roleSearchCmd.Flags().StringArrayVarP(&roleSearchUUID, "uuid", "u", []string{}, "Select a role by Uuid (will list all roles if empty)")

	roleCmd.AddCommand(roleSearchCmd)
}
