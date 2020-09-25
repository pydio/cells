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

	"github.com/micro/go-log"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/registry"
)

// docDepsCmd shows dependencies between services.
var docDepsCmd = &cobra.Command{
	Use:   "deps",
	Short: "Show dependencies between services",
	Long:  `Display a tree of dependencies between services`,
	Run: func(cmd *cobra.Command, args []string) {

		services, e := registry.ListServices()
		if e != nil {
			log.Fatal(e)
		}
		for _, s := range services {
			fmt.Println(s.Name())
			listDeps(s, "")
		}

	},
}

// List dependencies recursively. Ignore nats.
func listDeps(service registry.Service, sep string) {
	for _, dep := range service.GetDependencies() {
		var sub string
		if sep == "" {
			sub = "   |> "
		} else {
			sub = "    " + sep
		}
		fmt.Println(sub + dep.Name())
		listDeps(dep, sub)
	}
}

func init() {
	DocCmd.AddCommand(docDepsCmd)
}
