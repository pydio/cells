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
	"runtime"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Display the current version of this software",
	Run: func(cmd *cobra.Command, args []string) {

		var t time.Time
		if common.BuildStamp != "" {
			t, _ = time.Parse("2006-01-02T15:04:05", common.BuildStamp)
		} else {
			t = time.Now()
		}

		fmt.Println("")
		fmt.Println("    " + fmt.Sprintf("%s %s", common.PackageLabel, common.Version().String()))
		fmt.Println("    " + fmt.Sprintf("Published on %s", t.Format(time.RFC822Z)))
		fmt.Println("    " + fmt.Sprintf("Revision number %s", common.BuildRevision))
		fmt.Println("    " + fmt.Sprintf("Os (%s) Arch (%s)", runtime.GOOS, runtime.GOARCH))
		fmt.Println("    " + fmt.Sprintf("Go Version (%s) ", runtime.Version()))
		fmt.Println("")

	},
}

func init() {
	RootCmd.AddCommand(versionCmd)
}
