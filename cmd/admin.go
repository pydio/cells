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
	"path/filepath"
	"strings"
	"text/template"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"

	_ "embed"
)

var (
	//go:embed start-cmd.yaml
	cmdYaml             string
	adminCmdGRPCTimeout string
)

func longGrpcCallTimeout() grpc.Option {
	var d time.Duration
	var e error
	d = 60 * time.Minute
	if adminCmdGRPCTimeout != "" {
		d, e = time.ParseDuration(adminCmdGRPCTimeout)
	}
	if e != nil {
		fmt.Printf("Warning, cannot parse grpc timeout (%v), a golang duration is expected(10m, 2h, etc).\nUsing default 60m\n", e)
	}
	return grpc.WithCallTimeout(d)
}

// AdminCmd groups the data manipulation commands
// The sub-commands are connecting via gRPC to a **running** Cells instance.
var AdminCmd = &cobra.Command{
	Use:   "admin",
	Short: "Direct Read/Write access to Cells data",
	Long: `
DESCRIPTION

  Set of commands with direct access to Cells data.
	
  These commands require a running Cells instance. They connect directly to low-level services
  using gRPC connections. They are not authenticated.
`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {

		// TODO - Should do better with the runtime
		bindViperFlags(cmd.Flags())

		ctx := runtime.MultiContextManager().RootContext(cmd.Context())

		bootstrap, err := manager.NewBootstrap(ctx)
		if err != nil {
			return err
		}

		// Optionally fully override the template based on arguments
		if yaml := runtime.GetString(runtime.KeyBootstrapYAML); yaml != "" {
			if err := bootstrap.RegisterTemplate(ctx, "yaml", yaml); err != nil {
				return err
			}
		} else if file := runtime.GetString(runtime.KeyBootstrapFile); file != "" {
			b, err := os.ReadFile(file)
			if err != nil {
				return err
			}

			if err := bootstrap.RegisterTemplate(ctx, strings.TrimPrefix(filepath.Ext(file), "."), string(b)); err != nil {
				return err
			}
		} else {
			tmpl := template.New("bootstrap").Delims("{{{{", "}}}}")
			if _, err := tmpl.Parse(cmdYaml); err != nil {
				return err
			}

			var b strings.Builder
			if err := tmpl.Execute(&b, nil); err != nil {
				return err
			}

			if err := bootstrap.RegisterTemplate(ctx, "yaml", b.String()); err != nil {
				return err
			}
		}

		mgr, err := manager.NewManager(ctx, runtime.NsCmd)
		if err != nil {
			return err
		}

		if err := mgr.Bootstrap(bootstrap.String()); err != nil {
			return err
		}

		ctx = mgr.Context()
		cmd.SetContext(ctx)

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	// Registry / Broker Flags
	// addExternalCmdRegistryFlags(AdminCmd.PersistentFlags())
	AdminCmd.PersistentFlags().StringVarP(&adminCmdGRPCTimeout, "grpc_client_timeout", "", "60m", "Default timeout for long-running GRPC calls, expressed as a golang duration")
	RootCmd.AddCommand(AdminCmd)
}
