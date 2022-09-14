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
	"runtime"
	"runtime/debug"
	"text/template"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	runtime2 "github.com/pydio/cells/v4/common/runtime"
)

// CellsVersion contains version information for the current running binary
type CellsVersion struct {
	//Distribution string
	PackageLabel string
	Version      string
	BuildTime    string
	GitCommit    string
	OS           string
	Arch         string
	GoVersion    string
}

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

		var t time.Time
		if common.BuildStamp != "" {
			t, _ = time.Parse("2006-01-02T15:04:05", common.BuildStamp)
		} else {
			t = time.Now()
		}

		cv := &CellsVersion{
			PackageLabel: common.PackageLabel,
			Version:      common.Version().String(),
			BuildTime:    t.Format(time.RFC822Z),
			GitCommit:    common.BuildRevision,
			OS:           runtime.GOOS,
			Arch:         runtime.GOARCH,
			GoVersion:    runtime.Version(),
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

func binaryInfo() (i runtime2.InfoGroup) {
	i.Name = "Binary"
	var t time.Time
	if common.BuildStamp != "" {
		t, _ = time.Parse("2006-01-02T15:04:05", common.BuildStamp)
	} else {
		t = time.Now()
	}
	i.Pairs = append(i.Pairs,
		runtime2.InfoPair{Key: "Package", Value: common.PackageLabel},
		runtime2.InfoPair{Key: "Version", Value: common.Version().String()},
		runtime2.InfoPair{Key: "BuildTime", Value: t.Format(time.RFC822Z)},
		runtime2.InfoPair{Key: "Git Commit", Value: common.BuildRevision},
		runtime2.InfoPair{Key: "Go Version", Value: runtime.Version()},
		runtime2.InfoPair{Key: "OS/arch", Value: runtime.GOOS + "/" + runtime.GOARCH},
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
