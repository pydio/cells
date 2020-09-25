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
	"github.com/spf13/cobra"
)

var (
// dsSource string
// dsUser        string
// dsServiceName string
// recursive   bool

// READ  = &idm.ACLAction{Name: "read", Value: "1"}
// WRITE = &idm.ACLAction{Name: "write", Value: "1"}
// DENY  = &idm.ACLAction{Name: "deny", Value: "1"}
)

var DataCmd = &cobra.Command{
	Use:   "data",
	Short: "Directly interact with a datasource",
	Long: `Commands for managing indexed data.

Data are indexed in the various data sources you may have defined, and aggregated into a unique tree by
the tree service. This command allows you among others to launch a full re-synchronisation of a given datasource.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	RootCmd.AddCommand(DataCmd)
}
