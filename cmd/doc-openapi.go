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

	"github.com/pydio/cells/common/utils/docs"
	"github.com/spf13/cobra"
)

var openApiTargetFolder string

// docDepsCmd shows dependencies between services.
var docOpenApiCmd = &cobra.Command{
	Use:   "openapi",
	Short: "Generate docs for OpenAPI",
	Long:  `Generates a markdown documentation of rest APIS using the internal OpenAPI spec`,
	Run: func(cmd *cobra.Command, args []string) {

		err := docs.GenOpenAPIDocs(openApiTargetFolder)
		if err != nil {
			log.Fatal(err)
		}

	},
}

func init() {

	docOpenApiCmd.Flags().StringVarP(&openApiTargetFolder, "path", "p", "./", "Path to output folder")
	docCmd.AddCommand(docOpenApiCmd)
}
