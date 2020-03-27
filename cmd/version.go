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
	"os"
	"runtime"
	"text/template"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
)

type CellsVersion struct {
	CellsEdition    string
	Version         string
	PublicationTime string
	BuildRevision   string
	OS              string
	Arch            string
	GoVersion       string
}

var cellsVersionTpl = `Pydio Cells {{.CellsEdition}} Edition
	Version: {{.Version}}
	Published on : {{.PublicationTime}}
	Git commit : {{.BuildRevision}}
	OS/Arch : {{.OS}}/{{.Arch}}
	Go version : {{.GoVersion}}
`

var (
	format string
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

		cv := &CellsVersion{
			CellsEdition:    "Home",
			Version:         common.Version().String(),
			BuildRevision:   common.BuildRevision,
			PublicationTime: t.Format(time.RFC822Z),
			OS:              runtime.GOOS,
			Arch:            runtime.GOARCH,
			GoVersion:       runtime.Version(),
		}

		var runningTmpl string

		if format != "" {
			runningTmpl = format
		} else {
			// Default version template
			runningTmpl = cellsVersionTpl
		}

		tmpl, err := template.New("cells").Parse(runningTmpl)
		if err != nil {
			log.Fatalln("failed to parse template", err)
		}
		if err = tmpl.Execute(os.Stdout, cv); err != nil {
			log.Fatalln("could not execute template", err)
		}

	},
}

func init() {
	RootCmd.AddCommand(versionCmd)
	versionCmd.Flags().StringVarP(&format, "format", "f", "", "use template values to customize the output")
}
