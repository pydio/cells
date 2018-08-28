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
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
)

type singleCounter struct {
	msgNb    int
	stringNb int
}

type projectCounter struct {
	ppath          string
	singleCounters map[string]*singleCounter
}

func newProjectCounter(projectPath string) *projectCounter {
	var pc projectCounter
	pc.ppath = projectPath
	pc.singleCounters = make(map[string]*singleCounter, 3)
	pc.singleCounters["go"] = &singleCounter{}
	pc.singleCounters["react"] = &singleCounter{}
	pc.singleCounters["manifest"] = &singleCounter{}
	return &pc
}

var (
	projectPaths []string
	counters     map[string]*projectCounter
)

// i18nCount evaluates the number of Strings that compose the label corpus of Pydio Cells.
var i18nCount = &cobra.Command{
	Use:   "count",
	Short: "Count all Strings that are internationalised in the Pydio Cells code.",
	Long: `Count all Strings that are internationalised in the Pydio Cells code.

Internationalised Strings are referenced in Pydio Cells code via Map[string]string in vanilla json files.
There are 3 types of Strings that are internationalised:

In Go code:
- Json files are nested in the various packages in lang/box subfolders and are used via github.com/nicksnyder/go-i18n library

In Javascript code (for the front):
- For the EndUser UI in ReactJS, json files are nested in the i18n subfolder and used via the MessageHash mechanism
- Strings that reside within the manifest.xml, are used on the back end side and are to be translated before being 
sent to the front end resides in the i18n/conf sub folder.

### Example

Use the --project-paths/-p flag to give path to at least one project root folder.

$` + os.Args[0] + ` i18n count -p $GOPATH/src/github.com/pydio/cells-enterprise -p $GOPATH/src/github.com/pydio/cells
`,
	Run: func(cmd *cobra.Command, args []string) {

		if len(projectPaths) == 0 {
			cmd.Print("Please provide the path to at least one project to be analysed.\n\nSee full help below:\n\n")
			cmd.Help()
			return
		}

		counters = make(map[string]*projectCounter, len(projectPaths))

		// Counting for each project
		for _, dir := range projectPaths {
			fmt.Printf("counting i18n strings for %s\n", dir)

			counters[dir] = newProjectCounter(dir)

			// TODO enhance filtering out skipped folders
			vendorDir := "vendor"

			err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", dir, err)
					return err
				}
				if info.IsDir() {
					// skipped folder
					if info.Name() == vendorDir {
						fmt.Printf("skipped folder: %+v \n", path)
						return filepath.SkipDir
					}

					// go-i18n folders
					if strings.HasSuffix(path, "/lang/box") {
						// fmt.Printf("found go-i18n folder at %q\n", path)
						return countGoStrings(cmd, dir, path+"/en-us.all.json")
					}

					// react i18n folders
					if strings.HasSuffix(path, "/i18n") {
						return countJsStrings(cmd, dir, "react", path+"/en.json")
					}

					// manifest i18n folders
					if strings.HasSuffix(path, "/i18n/conf") {
						return countJsStrings(cmd, dir, "manifest", path+"/en.json")
					}
				}

				// fmt.Printf("visited file: %q\n", path)
				return nil
			})

			if err != nil {
				fmt.Printf("error walking the project at path %q: %v\n", dir, err)
				return
			}
		}
		printResult(cmd)
	},
}

func init() {
	i18nCount.Flags().StringArrayVarP(&projectPaths, "project-paths", "p", []string{}, "Root path of the project to analyse")

	i18n.AddCommand(i18nCount)
}

// Local methods
func printResult(cmd *cobra.Command) {
	var total singleCounter

	cmd.Println("\nResults\n-------\n")
	var i int
	for _, projectCounter := range counters {
		i++
		cmd.Printf("#%d - Project at %s:\n", i, projectCounter.ppath)

		var total2 singleCounter

		for k, sc := range projectCounter.singleCounters {
			cmd.Printf("\t - %s: %d words in %d messages\n", k, sc.stringNb, sc.msgNb)
			total.msgNb += sc.msgNb
			total2.msgNb += sc.msgNb
			total.stringNb += sc.stringNb
			total2.stringNb += sc.stringNb
		}
		cmd.Printf("  Sub Total: %d words in %d messages\n", total2.stringNb, total2.msgNb)
		cmd.Println()
	}
	cmd.Printf("Total: scanned %d projects, found %d words in %d messages\n", i, total.stringNb, total.msgNb)
}

func countGoStrings(cmd *cobra.Command, projectId, fpath string) error {
	if _, err := os.Stat(fpath); err != nil {
		if os.IsNotExist(err) {
			cmd.Printf("Warning: missing default version of i18n json file at %s\n", fpath) // file does not exist
		} else {
			cmd.Printf("Warning: could not stat version of i18n json file at %s: %s\n", fpath, err.Error) // other unexpected error
		}
		return nil
	}

	var values map[string]map[string]string
	jfile, _ := ioutil.ReadFile(fpath)
	err := json.Unmarshal([]byte(string(jfile)), &values)

	counters[projectId].singleCounters["go"].msgNb += len(values)
	for _, msgMap := range values {
		token := strings.Split(msgMap["other"], " ")
		counters[projectId].singleCounters["go"].stringNb += len(token)
	}
	return err
}

func countJsStrings(cmd *cobra.Command, projectId, ftype, fpath string) error {
	if _, err := os.Stat(fpath); err != nil {
		if os.IsNotExist(err) {
			cmd.Printf("Warning: missing default version of i18n json file at %s\n", fpath) // file does not exist
		} else {
			cmd.Printf("Warning: could not stat version of i18n json file at %s: %s\n", fpath, err.Error) // other unexpected error
		}
		return nil
	}

	var values map[string]string
	// file existence at fpath has already been checked
	jfile, _ := ioutil.ReadFile(fpath)
	err := json.Unmarshal([]byte(string(jfile)), &values)

	counters[projectId].singleCounters[ftype].msgNb += len(values)
	for _, msg := range values {
		token := strings.Split(msg, " ")
		counters[projectId].singleCounters[ftype].stringNb += len(token)
	}
	return err
}
