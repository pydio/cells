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
	"github.com/pydio/cells/common/proto/idm"
	"github.com/spf13/cobra"
)

var (
	source      string
	user        string
	serviceName string
	recursive   bool

	READ  = &idm.ACLAction{Name: "read", Value: "1"}
	WRITE = &idm.ACLAction{Name: "write", Value: "1"}
	DENY  = &idm.ACLAction{Name: "deny", Value: "1"}
)

// dataCmd represents the data command
var dataCmd = &cobra.Command{
	Use:   "data",
	Short: "Commands for managing indexed data",
	Long: `Commands for managing indexed data.

Data are indexed in the various data sources you may have defined, and aggregated into a unique tree by
the tree service. This command allows you to CRUD either directly the index of a given datasource, or query
directly the aggregated tree. By default, it queries the tree (service is pydio.grpc.data.tree), to query a datasource
directly, use --source=datasourcename (will point to service pydio.grpc.data.index.datasourcename)
In the first case (tree), folders paths are always prefixed with the datasource name. In the second case (datasource),
paths is the real path in the datasource.

See 'data list --help' for examples.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	dataCmd.PersistentFlags().StringVar(&source, "source", "", "Source where the data resides")

	RootCmd.AddCommand(dataCmd)
}
