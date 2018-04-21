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
	"fmt"

	"github.com/spf13/cobra"
)

// metaCmd represents the meta command
var metaCmd = &cobra.Command{
	Use:   "meta",
	Short: "Manage metadata micro-service",
	Long: `Manage metadata micro-service.

Metadata are stored as simple key/values and attached to a node UUID.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("meta called")
	},
}

func init() {
	RootCmd.AddCommand(metaCmd)
}
