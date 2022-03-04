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
	"github.com/pydio/cells/v4/common/runtime"
	"os"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/spf13/cobra"
)

// serviceStartCmd represents the stop command
var serviceStartCmd = &cobra.Command{
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

		reg.Start(&mockService{})

		return nil
	},
}

var _ registry.Service = (*mockService)(nil)

type mockService struct {
}

func (s mockService) ID() string {
	return "pydio.grpc.config"
}

func (s mockService) Name() string {
	return "pydio.grpc.config"
}

func (s mockService) Version() string {
	return ""
}

func (s mockService) Nodes() []registry.Node {
	return []registry.Node{}
}

func (s mockService) Tags() []string {
	return []string{}
}

func (s mockService) Metadata() map[string]string {
	return map[string]string{}
}

func (s mockService) Start() error {
	return nil
}

func (s mockService) Stop() error {
	return nil
}

func (s mockService) IsGeneric() bool {
	return false
}

func (s mockService) IsGRPC() bool {
	return true
}

func (s mockService) IsREST() bool {
	return false
}

func (s mockService) As(i interface{}) bool {
	return false
}

func init() {
	addRegistryFlags(serviceStartCmd.Flags())

	serviceCmd.AddCommand(serviceStartCmd)
}
