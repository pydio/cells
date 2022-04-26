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

	"github.com/pkg/errors"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

// serviceStopCmd represents the stop command
var serviceStopCmd = &cobra.Command{
	Use:   "stop",
	Short: "Stop a service by name",
	Long: `
DESCRIPTION

  TODO

EXAMPLE

  $ ` + os.Args[0] + ` service stop pydio.grpc.search

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return errors.Wrap(err, "open registry")
		}
		item, err := reg.Get(args[0])
		if err != nil {
			return errors.Wrap(err, "get item")
		}
		fmt.Println("Found Item", item.ID(), item.Name())
		var srv registry.Service
		if item.As(&srv) {
			//return srv.Stop()
			return reg.Stop(srv)
		} else {
			return fmt.Errorf("item " + args[0] + " is not a registry.Service")
		}
	},
}

func init() {
	addExternalCmdRegistryFlags(serviceStopCmd.Flags())

	serviceCmd.AddCommand(serviceStopCmd)
}
