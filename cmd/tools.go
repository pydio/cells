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

import "github.com/spf13/cobra"

// ToolsCmd are tools that do not need a running Cells instance
var ToolsCmd = &cobra.Command{
	Use:    "tools",
	Short:  "Additional tools",
	Hidden: true,
	Long: `
DESCRIPTION

  Various commands that do not require a running Cells instance.
`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags())
		ctx, er := initManagerContext(cmd.Context())
		cmd.SetContext(ctx)
		return er
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	RootCmd.AddCommand(ToolsCmd)
}
