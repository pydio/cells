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
	"os"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

// serverStartCmd represents the start command of a server
var serverStartCmd = &cobra.Command{
	Use:   "start",
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

		reg.Start(&node{
			id:   "testgrpc2",
			name: "testgrpc2",
			addr: ":0",
			metadata: map[string]string{
				"type": "grpc",
			},
		})

		return nil
	},
}

var _ registry.Server = (*node)(nil)

type node struct {
	id       string
	name     string
	addr     string
	metadata map[string]string
}

func (n *node) ID() string {
	return n.id
}
func (n *node) Name() string {
	return n.name
}

func (n *node) Address() []string {
	return []string{n.addr}
}

func (n *node) Server() {
}

func (n *node) Metadata() map[string]string {
	return n.metadata
}

func (n *node) As(interface{}) bool {
	return false
}

func init() {
	addRegistryFlags(serverStartCmd.Flags())

	serverCmd.AddCommand(serverStartCmd)
}
