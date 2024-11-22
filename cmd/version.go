/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"runtime/debug"
	"text/template"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common"
	runtime2 "github.com/pydio/cells/v5/common/runtime"
)

var cellsVersionTpl = `{{.PackageLabel}}
 Version: 	{{.Version}}
 Built: 	{{.BuildTime}}
 Git commit: 	{{.GitCommit}}
 OS/Arch: 	{{.OS}}/{{.Arch}}
 Go version: 	{{.GoVersion}}
`

var (
	format string
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print version information",
	Long: `
DESCRIPTION

  Print version information.

  You can format the output with a go template using the --format flag.
  Typically, to only output a parsable version, call:

    $ ` + os.Args[0] + ` version -f '{{.Version}}'
 
  As reference, known attributes are:
   - PackageLabel
   - Version
   - BuildTime
   - GitCommit
   - OS
   - Arch
   - GoVersion
	`,
	Run: func(cmd *cobra.Command, args []string) {

		cv := common.MakeCellsVersion()
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

func binaryInfo() (i runtime2.InfoGroup) {
	cv := common.MakeCellsVersion()
	i.Name = "Binary"
	i.Pairs = append(i.Pairs,
		runtime2.InfoPair{Key: "Package", Value: cv.PackageLabel},
		runtime2.InfoPair{Key: "Version", Value: cv.Version},
		runtime2.InfoPair{Key: "BuildTime", Value: cv.BuildTime},
		runtime2.InfoPair{Key: "Git Commit", Value: cv.GitCommit},
		runtime2.InfoPair{Key: "Go Version", Value: cv.GoVersion},
		runtime2.InfoPair{Key: "OS/arch", Value: cv.OS + "/" + cv.Arch},
	)
	return
}

func buildInfo() (i runtime2.InfoGroup) {
	i.Name = "Build Settings"
	if info, ok := debug.ReadBuildInfo(); ok {
		for _, s := range info.Settings {
			if s.Value == "" {
				continue
			}
			i.Pairs = append(i.Pairs, runtime2.InfoPair{Key: s.Key, Value: s.Value})
		}
	}
	return
}

func init() {
	RootCmd.AddCommand(versionCmd)
	versionCmd.Flags().StringVarP(&format, "format", "f", "", "Format the output using the given Go template")
}
