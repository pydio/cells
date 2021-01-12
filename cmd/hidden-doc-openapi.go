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

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/utils/docs"
)

var openApiTargetFolder string

// docDepsCmd shows dependencies between services.
var docOpenApiCmd = &cobra.Command{
	Use:   "openapi",
	Short: "Generate docs for OpenAPI",
	Long:  `Generates a markdown documentation of rest APIS using the internal OpenAPI spec`,
	Run: func(cmd *cobra.Command, args []string) {

		docs.ApiDocsGeneratedBy = common.PackageLabel + " v" + common.Version().String()
		err := docs.GenOpenAPIDocs(openApiTargetFolder)
		if err != nil {
			log.Fatal(err)
		}

	},
}

func init() {

	docOpenApiCmd.Flags().StringVarP(&openApiTargetFolder, "path", "p", "./", "Path to output folder")
	docOpenApiCmd.Flags().StringVarP(&docs.ApiDocsMenuName, "menu", "m", "menu-admin-guide-v7", "Pydio Docs menu name")
	docOpenApiCmd.Flags().StringVarP(&docs.ApiDocsOutputRootId, "root", "r", "1_cells_api", "Pydio Docs root markdown file")
	docOpenApiCmd.Flags().StringVarP(&docs.ApiDocsOutputRootTitle, "title", "t", "REST Api", "Pydio Docs root markdown title")
	docOpenApiCmd.Flags().IntVarP(&docs.ApiDocsOutputRootWeight, "weight", "w", 1, "Pydio Docs root menu weight")
	DocCmd.AddCommand(docOpenApiCmd)
}
