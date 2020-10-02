// +build dev

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
	"context"
	"fmt"

	"github.com/fatih/color"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/test"
	"github.com/spf13/cobra"
)

var (
	conformanceTestServiceName string
)

// ConfigCmd represents the config command
var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Run conformance tests",
	Long:  "Launch conformance tests on a running instance. Provide a test name to run with --service or -s parameter.",
	Run: func(cmd *cobra.Command, args []string) {
		if conformanceTestServiceName == "" {
			cmd.Help()
			return
		}
		c := test.NewTesterClient(conformanceTestServiceName, defaults.NewClient())
		fmt.Println("")
		if response, e := c.Run(context.Background(), &test.RunTestsRequest{}); e != nil {
			fmt.Println("Error while running tests, did you start the server?", e)
		} else {
			pass := true
			for _, res := range response.Results {
				var status string
				if res.Pass {
					status = "\u2713"
					color.Green(status + " " + res.Name)
				} else {
					status = "\u2717"
					pass = false
					color.Red(status + " " + res.Name)
				}
				for _, msg := range res.Messages {
					fmt.Println("  | " + msg)
				}
				fmt.Println("")
			}
			if !pass {
				color.Red("=> One or more tests failed!")
			} else {
				color.Green("=> All tests passed succesfully!")
			}
			fmt.Println("")
		}
	},
}

func init() {
	testCmd.Flags().StringVarP(&conformanceTestServiceName, "service", "s", "", "Select test to run")
	RootCmd.AddCommand(testCmd)
}
