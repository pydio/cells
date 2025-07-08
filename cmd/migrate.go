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
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"

	_ "embed"
)

var (
	migrateContextName string

	//go:embed migrate-bootstrap.yaml
	migrateBootstrapYAML string
)

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Migrate current context",
	Long: `
DESCRIPTION
  
  Migrate current context

EXAMPLES

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		bindViperFlags(cmd.Flags(), map[string]string{
			runtime.KeyFork:              runtime.KeyForkLegacy,
			runtime.KeyInstallYamlLegacy: runtime.KeyInstallYaml,
			runtime.KeyInstallJsonLegacy: runtime.KeyInstallJson,
			runtime.KeyInstallCliLegacy:  runtime.KeyInstallCli,
		})

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		ctx := propagator.With(cmd.Context(), runtime.MultiContextKey, migrateContextName)

		m, err := manager.NewManager(ctx, runtime.NsMain, log.Logger(runtime.WithServiceName(ctx, "pydio.server.manager")))
		if err != nil {
			return err
		}

		if err := m.Bootstrap(migrateBootstrapYAML); err != nil {
			return err
		}

		ctx = m.Context()

		cli := service.NewMigrateServiceClient(grpc.ResolveConn(ctx, common.ServiceInstallGRPC))
		resp, err := cli.Migrate(ctx, &service.MigrateRequest{Version: common.Version().String()})
		if err != nil || !resp.Success {
			return err
		}

		return nil
	},
}

func init() {
	migrateCmd.Flags().StringVar(&migrateContextName, "name", "", "name of the context to migrate")
	RootCmd.AddCommand(migrateCmd)
}
