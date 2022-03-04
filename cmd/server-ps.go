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
	"fmt"
	"os"

	"github.com/spf13/cobra"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

// serverPsCmd represents the ps command of a server
var serverPsCmd = &cobra.Command{
	Use:   "ps",
	Short: "List all available services and their statuses",
	Long: `
DESCRIPTION

  List all available services and their statuses

  Use this command to list all running services on this machine.
  Services fall into main categories (GENERIC, GRPC, REST, API) and are then organized by tags (broker, data, idm, etc.)

EXAMPLE

  Use the --tags/-t flag to limit display to one specific tag, use lowercase for tags.

  $ ` + os.Args[0] + ` ps -t=broker
  Will result:
	- pydio.grpc.activity   [X]
	- pydio.grpc.chat       [X]
	- pydio.grpc.mailer     [X]
	- pydio.api.websocket   [X]
	- pydio.rest.activity   [X]
	- pydio.rest.frontlogs  [X]
	- pydio.rest.mailer     [X]

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		ctx = servicecontext.WithRegistry(cmd.Context(), reg)

		nodes, err := reg.List(registry.WithType(pb.ItemType_NODE))
		if err != nil {
			return err
		}

		for _, node := range nodes {
			var srv registry.Node
			if node.As(&srv) {
				fmt.Println(node.Name(), node.(registry.Node).Address(), node.(registry.Node).Metadata())
				for _, endpoint := range srv.Endpoints() {
					fmt.Println("- ", endpoint)
				}
			} else {
				fmt.Println("Node unrecognized ", node.Name())
			}
		}

		return nil
	},
}

func init() {
	addExternalCmdRegistryFlags(serverPsCmd.Flags())

	serverCmd.AddCommand(serverPsCmd)
}
