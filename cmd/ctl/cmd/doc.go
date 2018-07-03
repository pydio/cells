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
	"log"

	"github.com/pydio/cells/common/utils"
	"github.com/spf13/cobra"
)

var docPath string

// versionCmd represents the versioning command
var docCmd = &cobra.Command{
	Use:   "doc",
	Short: "Generate ReST documentation for this command",
	Long: `Generate ReStructuredText documentation for the Pydio Cells Command Line Interface.

Provide a target folder where to put the generated files.

Note: this command is currently broken due to a dependency issue introduced by 
github.com/spf13/cobra/doc and the vendor/github.com/cpuguy83/go-md2man/md2man/roff.go 
`,
	Run: func(cmd *cobra.Command, args []string) {
		if docPath == "" {
			log.Fatal("Cannot get path flag")
		} else {
			err := utils.GenMarkdownTree(RootCmd, docPath)
			if err != nil {
				log.Fatal(err)
			}
		}
	},
}

func init() {
	docCmd.Flags().StringVarP(&docPath, "path", "p", "", "Target folder where to put the files")

	RootCmd.AddCommand(docCmd)
}
